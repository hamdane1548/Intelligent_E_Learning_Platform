"""Service IA : résumés de cours et génération de quiz via un LLM.

Parle à n'importe quel endpoint compatible OpenAI (Ollama local par défaut).
Toute défaillance du LLM dégrade silencieusement vers les heuristiques
historiques — les fonctions publiques renvoient (résultat, ai_generated).
"""

import json
import os
import random
import re

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

AI_BASE_URL = os.getenv("AI_BASE_URL", "http://localhost:11434/v1")
AI_MODEL = os.getenv("AI_MODEL", "llama3")
AI_TIMEOUT = float(os.getenv("AI_TIMEOUT", "120"))
AI_API_KEY = os.getenv("AI_API_KEY", "ollama")
EMBED_MODEL = os.getenv("EMBED_MODEL", "nomic-embed-text")

MAX_INPUT_CHARS = 6000

_client = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(base_url=AI_BASE_URL, api_key=AI_API_KEY, timeout=AI_TIMEOUT)
    return _client


def _chat(prompt: str, json_mode: bool = False) -> str:
    kwargs = {}
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    response = _get_client().chat.completions.create(
        model=AI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        **kwargs,
    )
    return response.choices[0].message.content or ""


def _embed(texts: list[str]) -> list[list[float]]:
    response = _get_client().embeddings.create(model=EMBED_MODEL, input=texts)
    return [item.embedding for item in response.data]


def _truncate(text: str) -> str:
    text = text.strip()
    if len(text) > MAX_INPUT_CHARS:
        return text[:MAX_INPUT_CHARS]
    return text


def generate_summary(text: str) -> tuple[str, bool]:
    text = _truncate(text)

    prompt = (
        "Tu es un assistant pédagogique. Rédige un résumé clair et structuré "
        "du cours suivant, en français, en 4 à 6 phrases. Réponds uniquement "
        "avec le résumé, sans introduction ni commentaire.\n\n"
        f"--- CONTENU DU COURS ---\n{text}"
    )

    try:
        summary = _strip_preamble(_chat(prompt).strip())
        if summary:
            return summary, True
    except Exception:
        pass

    return _fallback_summary(text), False


def _strip_preamble(summary: str) -> str:
    """Retire les préambules conversationnels ("Voici un résumé... :")
    que les modèles ajoutent malgré les consignes."""
    lines = summary.split("\n")

    while lines and (
        not lines[0].strip()
        or (lines[0].strip().endswith(":") and len(lines[0]) < 120)
    ):
        lines.pop(0)

    return "\n".join(lines).strip() or summary


def generate_quiz_questions(text: str, num_questions: int = 5) -> tuple[list[dict], bool]:
    text = _truncate(text)

    prompt = (
        "Tu es un assistant pédagogique. À partir du cours ci-dessous, génère "
        f"exactement {num_questions} questions à choix multiples en français.\n"
        "Réponds UNIQUEMENT avec un objet JSON valide de la forme :\n"
        '{"questions": [{"question": "...", "option_a": "...", "option_b": "...", '
        '"option_c": "...", "option_d": "...", "correct_answer": "A"}]}\n'
        "Règles : une seule bonne réponse par question (correct_answer est A, B, C ou D), "
        "les mauvaises réponses doivent être plausibles, les questions doivent porter "
        "sur le contenu du cours.\n\n"
        f"--- CONTENU DU COURS ---\n{text}"
    )

    for attempt in range(2):
        try:
            raw = _chat(prompt, json_mode=True)
        except Exception:
            break

        questions = _parse_questions(raw, num_questions)

        # Premier essai : on exige le compte demandé ; au second, un résultat
        # partiel vaut mieux que le fallback.
        if questions and (attempt == 1 or len(questions) >= num_questions):
            return [_shuffle_options(q) for q in questions], True

    return _fallback_questions(text, num_questions), False


def _parse_questions(raw: str, num_questions: int) -> list[dict]:
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw)

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return []

    items = data.get("questions") if isinstance(data, dict) else data
    if not isinstance(items, list):
        return []

    questions = []
    option_keys = ("option_a", "option_b", "option_c", "option_d")

    for item in items:
        if not isinstance(item, dict):
            return []

        question_text = str(item.get("question", "")).strip()
        options = [str(item.get(key, "")).strip() for key in option_keys]
        correct = str(item.get("correct_answer", "")).strip().upper()

        if not question_text or not all(options) or correct not in {"A", "B", "C", "D"}:
            return []

        questions.append({
            "question": question_text,
            "option_a": options[0],
            "option_b": options[1],
            "option_c": options[2],
            "option_d": options[3],
            "correct_answer": correct,
        })

        if len(questions) >= num_questions:
            break

    return questions


def _shuffle_options(question: dict) -> dict:
    """Mélange les options pour répartir la bonne réponse sur A-D.

    Les LLM placent souvent la bonne réponse en premier ; sans mélange,
    répondre toujours A suffirait à réussir le quiz.
    """
    letters = ["a", "b", "c", "d"]
    texts = [question[f"option_{letter}"] for letter in letters]
    correct_text = question[f"option_{question['correct_answer'].lower()}"]

    random.shuffle(texts)

    shuffled = dict(question)
    for letter, text in zip(letters, texts):
        shuffled[f"option_{letter}"] = text
    shuffled["correct_answer"] = letters[texts.index(correct_text)].upper()

    return shuffled


def _fallback_summary(text: str, max_sentences: int = 5) -> str:
    text = re.sub(r"\s+", " ", text.replace("\n", " "))
    sentences = re.split(r"(?<=[.!?]) +", text)

    important_sentences = [s for s in sentences if len(s.split()) > 8][:max_sentences]

    if not important_sentences:
        return "Résumé non disponible. Le texte du PDF est trop court ou mal extrait."

    return " ".join(important_sentences)


def _fallback_questions(text: str, max_questions: int = 5) -> list[dict]:
    text = re.sub(r"\s+", " ", text.replace("\n", " ")).strip()
    sentences = re.split(r"(?<=[.!?]) +", text)

    questions = []
    for sentence in sentences:
        words = sentence.split()
        if len(words) < 10:
            continue

        questions.append({
            "question": f"Quel est le sujet principal de cette phrase : « {sentence[:120]}... » ?",
            "option_a": words[0],
            "option_b": "Une base de données",
            "option_c": "Un réseau informatique",
            "option_d": "Un système d’exploitation",
            "correct_answer": "A",
        })

        if len(questions) >= max_questions:
            break

    return questions
