import shutil
import tempfile
import unittest
from unittest.mock import patch

import fitz
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import auth
import main
from database import Base, engine as app_engine
from models import Course, Question, Quiz, QuizResult, User
from routes import courses, dashboard, quiz as quiz_routes, users


class APITestCase(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            'sqlite://',
            connect_args={'check_same_thread': False},
            poolclass=StaticPool,
        )
        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine,
            expire_on_commit=False,
        )
        Base.metadata.create_all(bind=self.engine)

        self.original_upload_dir = courses.UPLOAD_DIR
        self.upload_dir = tempfile.mkdtemp(prefix='smartlearn-tests-')
        courses.UPLOAD_DIR = self.upload_dir

        # Les tests ne doivent jamais appeler un vrai LLM : _chat échoue par
        # défaut, ce qui force le chemin de repli déterministe.
        self._ai_chat_patch = patch(
            'ai_service._chat',
            side_effect=RuntimeError('AI disabled in tests'),
        )
        self._ai_chat_patch.start()

        self._ai_embed_patch = patch(
            'ai_service._embed',
            side_effect=RuntimeError('AI disabled in tests'),
        )
        self._ai_embed_patch.start()

        self.original_auth_hash_password = auth.hash_password
        self.original_auth_verify_password = auth.verify_password
        self.original_users_hash_password = users.hash_password
        self.original_users_verify_password = users.verify_password

        def fake_hash_password(password):
            return f'hashed::{password}'

        def fake_verify_password(plain_password, hashed_password):
            return hashed_password == fake_hash_password(plain_password)

        self.fake_hash_password = fake_hash_password
        auth.hash_password = fake_hash_password
        auth.verify_password = fake_verify_password
        users.hash_password = fake_hash_password
        users.verify_password = fake_verify_password

        def override_db():
            db = self.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        for dependency in [
            users.get_db,
            courses.get_db,
            quiz_routes.get_db,
            dashboard.get_db,
            auth.get_db,
        ]:
            main.app.dependency_overrides[dependency] = override_db

        self.client = TestClient(main.app)

    def tearDown(self):
        self._ai_embed_patch.stop()
        self._ai_chat_patch.stop()
        self.client.close()
        main.app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=self.engine)
        self.engine.dispose()
        app_engine.dispose()

        auth.hash_password = self.original_auth_hash_password
        auth.verify_password = self.original_auth_verify_password
        users.hash_password = self.original_users_hash_password
        users.verify_password = self.original_users_verify_password
        courses.UPLOAD_DIR = self.original_upload_dir
        shutil.rmtree(self.upload_dir, ignore_errors=True)

    def session(self):
        return self.SessionLocal()

    def create_user(self, email, role='etudiant', password='secret123', nom='Test User'):
        db = self.session()
        try:
            user = User(
                nom=nom,
                email=email,
                password=self.fake_hash_password(password),
                role=role,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            return user
        finally:
            db.close()

    def create_course(
        self,
        title='Algorithms 101',
        description='Introductory course',
        teacher_id=1,
        pdf_path=None,
        summary=None,
    ):
        db = self.session()
        try:
            course = Course(
                title=title,
                description=description,
                teacher_id=teacher_id,
                pdf_path=pdf_path,
                summary=summary,
            )
            db.add(course)
            db.commit()
            db.refresh(course)
            return course
        finally:
            db.close()

    def create_quiz(self, course_id, title='Generated Quiz'):
        db = self.session()
        try:
            quiz = Quiz(course_id=course_id, title=title)
            db.add(quiz)
            db.commit()
            db.refresh(quiz)
            return quiz
        finally:
            db.close()

    def create_question(self, quiz_id, question='What is SmartLearn?', correct_answer='A'):
        db = self.session()
        try:
            question_row = Question(
                quiz_id=quiz_id,
                question=question,
                option_a='Correct choice',
                option_b='Distractor 1',
                option_c='Distractor 2',
                option_d='Distractor 3',
                correct_answer=correct_answer,
            )
            db.add(question_row)
            db.commit()
            db.refresh(question_row)
            return question_row
        finally:
            db.close()

    def create_result(self, student_id, quiz_id, score, total_questions):
        db = self.session()
        try:
            result = QuizResult(
                student_id=student_id,
                quiz_id=quiz_id,
                score=score,
                total_questions=total_questions,
            )
            db.add(result)
            db.commit()
            db.refresh(result)
            return result
        finally:
            db.close()

    def auth_headers(self, user):
        token = auth.create_access_token(
            {
                'sub': user.email,
                'user_id': user.id,
                'role': user.role,
            }
        )
        return {'Authorization': f'Bearer {token}'}

    def make_pdf_bytes(self, text='SmartLearn PDF content for tests.'):
        document = fitz.open()
        page = document.new_page()
        page.insert_text((72, 72), text)
        pdf_bytes = document.tobytes()
        document.close()
        return pdf_bytes
