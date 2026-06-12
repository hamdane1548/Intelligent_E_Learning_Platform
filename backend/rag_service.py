"""Assistant RAG : indexation des PDF de cours et réponses ancrées dans leur contenu.

Les chunks et leurs embeddings vivent dans la table course_chunks ; la recherche
est un cosinus brute-force en Python (quelques dizaines de chunks par cours).
Contrairement aux résumés/quiz, pas de fallback heuristique : si l'IA est
indisponible, RagUnavailableError remonte et la route répond 503.
"""

import json
import math
import re

from sqlalchemy.orm import Session

import ai_service
from models import Course, CourseChunk
from pdf_utils import extract_text_from_pdf

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
TOP_K = 4
MAX_HISTORY_MESSAGES = 6
SOURCE_PREVIEW_CHARS = 160


class RagUnavailableError(Exception):
    """Le service d'embedding ou le LLM est injoignable."""


def chunk_text(text: str) -> list[str]:
    text = re.sub(r"\s+", " ", text).strip()

    if not text:
        return []
    if len(text) <= CHUNK_SIZE:
        return [text]

    # Les PDF mal extraits peuvent n'avoir aucune ponctuation : on borne
    # chaque "phrase" à CHUNK_SIZE avant l'assemblage.
    sentences = []
    for sentence in re.split(r"(?<=[.!?]) +", text):
        while len(sentence) > CHUNK_SIZE:
            sentences.append(sentence[:CHUNK_SIZE])
            sentence = sentence[CHUNK_SIZE:]
        if sentence:
            sentences.append(sentence)

    chunks = []
    current = ""

    for sentence in sentences:
        if current and len(current) + len(sentence) + 1 > CHUNK_SIZE:
            chunks.append(current.strip())
            current = current[-CHUNK_OVERLAP:] + " " + sentence
        else:
            current = f"{current} {sentence}".strip()

    if current.strip():
        chunks.append(current.strip())

    return chunks


def _embed(texts: list[str]) -> list[list[float]]:
    try:
        return ai_service._embed(texts)
    except Exception as exc:
        raise RagUnavailableError(str(exc)) from exc


def index_course(course_id: int, text: str, db: Session) -> int:
    chunks = chunk_text(text)

    if not chunks:
        raise ValueError("Aucun texte à indexer")

    vectors = _embed(chunks)

    db.query(CourseChunk).filter(CourseChunk.course_id == course_id).delete()

    for index, (content, vector) in enumerate(zip(chunks, vectors)):
        db.add(CourseChunk(
            course_id=course_id,
            chunk_index=index,
            content=content,
            embedding=json.dumps(vector),
        ))

    db.commit()

    return len(chunks)


def ensure_indexed(course: Course, db: Session) -> None:
    count = db.query(CourseChunk).filter(CourseChunk.course_id == course.id).count()

    if count:
        return

    text = extract_text_from_pdf(course.pdf_path)

    if not text.strip():
        raise ValueError("Impossible d'extraire le texte du PDF")

    index_course(course.id, text, db)


def _cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))

    if not norm_a or not norm_b:
        return 0.0

    return dot / (norm_a * norm_b)


def answer_question(
    course: Course,
    question: str,
    history: list[dict],
    db: Session,
    top_k: int = TOP_K,
) -> dict:
    question_vector = _embed([question])[0]

    chunks = (
        db.query(CourseChunk)
        .filter(CourseChunk.course_id == course.id)
        .all()
    )

    scored = sorted(
        chunks,
        key=lambda chunk: _cosine(question_vector, json.loads(chunk.embedding)),
        reverse=True,
    )[:top_k]

    context = "\n\n".join(
        f"[Extrait {i + 1}]\n{chunk.content}" for i, chunk in enumerate(scored)
    )

    history_lines = []
    for message in history[-MAX_HISTORY_MESSAGES:]:
        speaker = "Étudiant" if message.get("role") == "user" else "Assistant"
        history_lines.append(f"{speaker} : {message.get('content', '')}")
    history_block = "\n".join(history_lines)

    prompt = (
        f"Tu es l'assistant pédagogique du cours « {course.title} ». Réponds en "
        "français à la question en t'appuyant UNIQUEMENT sur les extraits du cours "
        "ci-dessous. Si la réponse ne se trouve pas dans les extraits, dis clairement "
        "que le cours ne couvre pas ce point. Sois concis et pédagogique.\n\n"
        f"--- EXTRAITS DU COURS ---\n{context}\n"
    )

    if history_block:
        prompt += f"\n--- CONVERSATION PRÉCÉDENTE ---\n{history_block}\n"

    prompt += f"\n--- QUESTION ---\n{question}"

    try:
        answer = ai_service._chat(prompt).strip()
    except Exception as exc:
        raise RagUnavailableError(str(exc)) from exc

    return {
        "answer": answer,
        "sources": [chunk.content[:SOURCE_PREVIEW_CHARS] for chunk in scored],
    }
