from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routes import users, courses, quiz, dashboard, contact

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

@app.get("/")
def home():
    return {"message": "SmartLearn AI Backend is running"}


@app.get("/test-db")
def test_db():
    return {"message": "Database connected successfully"}