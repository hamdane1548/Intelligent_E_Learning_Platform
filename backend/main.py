from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from auth import get_db
from database import engine, Base
import models
from routes import users, courses, quiz, dashboard, contact, chat

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmartLearn AI API",
    description="Backend de la plateforme e-learning intelligente",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(courses.router)
app.include_router(quiz.router)
app.include_router(dashboard.router)
app.include_router(contact.router)
app.include_router(chat.router)

@app.get("/")
def home():
    return {"message": "SmartLearn AI Backend is running"}


@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        raise HTTPException(status_code=503, detail="Database connection failed")

    return {"message": "Database connected successfully"}