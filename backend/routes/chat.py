from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import rag_service
from auth import get_current_user, get_db
from models import Course, User
from schemas import ChatRequest, ChatResponse

router = APIRouter(
    prefix="/courses",
    tags=["Assistant IA"]
)


@router.post("/{course_id}/chat", response_model=ChatResponse)
def chat_with_course(
    course_id: int,
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Cours introuvable")

    if not course.pdf_path:
        raise HTTPException(status_code=400, detail="Ce cours n'a pas encore de PDF")

    try:
        rag_service.ensure_indexed(course, db)
        result = rag_service.answer_question(
            course,
            request.question,
            [message.model_dump() for message in request.history],
            db,
        )
    except rag_service.RagUnavailableError:
        raise HTTPException(
            status_code=503,
            detail=(
                "Assistant IA indisponible. Vérifie qu'Ollama est lancé et que "
                "les modèles llama3 et nomic-embed-text sont installés."
            ),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError:
        raise HTTPException(status_code=400, detail="Impossible de lire le PDF du cours")

    return result
