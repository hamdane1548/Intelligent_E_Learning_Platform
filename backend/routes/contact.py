from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/contact", tags=["Contact"])


class ContactMessage(BaseModel):
    nom: str
    email: str
    sujet: str
    message: str


# Page Contact
@router.post("/")
def send_contact(data: ContactMessage):
    return {"success": True, "message": "Message envoyé avec succès !"}


# Page About
@router.get("/about")
def get_about():
    return {
        "projet": "SmartLearn AI",
        "description": "Plateforme e-learning intelligente avec IA intégrée",
        "version": "1.0.0"
    }