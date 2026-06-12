import json
import unittest
from unittest.mock import patch, MagicMock

from tests.support import APITestCase

import ai_service
import rag_service
from models import CourseChunk


COURSE_TEXT = (
    'Les reseaux de neurones sont des modeles informatiques inspires du cerveau humain. '
    'Chaque neurone artificiel recoit des entrees ponderees et applique une fonction d activation. '
    'La retropropagation ajuste les poids du reseau pour minimiser l erreur de prediction. '
    'Les applications incluent la reconnaissance d images et le traitement du langage naturel.'
)


def fake_vectors(texts):
    """Embedding déterministe : un vecteur simple par texte."""
    return [[float(len(t) % 7 + 1), float(i + 1)] for i, t in enumerate(texts)]


class ChunkTextTests(unittest.TestCase):
    def test_long_text_is_split_into_overlapping_chunks(self):
        sentences = ' '.join(f'Phrase numero {i} avec un contenu pedagogique utile.' for i in range(120))
        chunks = rag_service.chunk_text(sentences)

        self.assertGreater(len(chunks), 1)
        for chunk in chunks:
            self.assertLessEqual(len(chunk), rag_service.CHUNK_SIZE + 300)

        # Tout le contenu doit être couvert
        self.assertIn('Phrase numero 0', chunks[0])
        self.assertIn('Phrase numero 119', chunks[-1])

        # Le chevauchement répète du contenu entre chunks consécutifs
        total = sum(len(c) for c in chunks)
        self.assertGreater(total, len(sentences))

    def test_short_text_is_a_single_chunk(self):
        chunks = rag_service.chunk_text('Un texte court.')
        self.assertEqual(chunks, ['Un texte court.'])


class IndexCourseTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.teacher = self.create_user('teacher@example.com', role='enseignant')
        self.course = self.create_course(teacher_id=self.teacher.id, pdf_path='course.pdf')

    def test_index_course_stores_chunks_with_embeddings(self):
        db = self.session()
        try:
            with patch.object(ai_service, '_embed', side_effect=fake_vectors):
                count = rag_service.index_course(self.course.id, COURSE_TEXT, db)

            chunks = db.query(CourseChunk).filter(CourseChunk.course_id == self.course.id).all()
            self.assertEqual(len(chunks), count)
            self.assertGreaterEqual(count, 1)

            for chunk in chunks:
                vector = json.loads(chunk.embedding)
                self.assertIsInstance(vector, list)
                self.assertTrue(chunk.content)
        finally:
            db.close()

    def test_reindex_replaces_previous_chunks(self):
        db = self.session()
        try:
            with patch.object(ai_service, '_embed', side_effect=fake_vectors):
                rag_service.index_course(self.course.id, COURSE_TEXT, db)
                rag_service.index_course(self.course.id, 'Nouveau contenu du cours.', db)

            chunks = db.query(CourseChunk).filter(CourseChunk.course_id == self.course.id).all()
            self.assertEqual(len(chunks), 1)
            self.assertIn('Nouveau contenu', chunks[0].content)
        finally:
            db.close()

    def test_index_raises_when_embeddings_unavailable(self):
        db = self.session()
        try:
            with self.assertRaises(rag_service.RagUnavailableError):
                rag_service.index_course(self.course.id, COURSE_TEXT, db)
        finally:
            db.close()


class AnswerQuestionTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.teacher = self.create_user('teacher@example.com', role='enseignant')
        self.course = self.create_course(teacher_id=self.teacher.id, pdf_path='course.pdf')

    def add_chunk(self, db, index, content, vector):
        db.add(CourseChunk(
            course_id=self.course.id,
            chunk_index=index,
            content=content,
            embedding=json.dumps(vector),
        ))
        db.commit()

    def test_answer_uses_most_similar_chunks(self):
        db = self.session()
        try:
            self.add_chunk(db, 0, 'La retropropagation ajuste les poids.', [1.0, 0.0])
            self.add_chunk(db, 1, 'Le foot est un sport collectif.', [0.0, 1.0])

            captured = {}

            def capture_chat(prompt, **kwargs):
                captured['prompt'] = prompt
                return 'La rétropropagation ajuste les poids du réseau.'

            with patch.object(ai_service, '_embed', return_value=[[1.0, 0.0]]), \
                    patch.object(ai_service, '_chat', side_effect=capture_chat):
                result = rag_service.answer_question(
                    self.course, 'Comment le réseau apprend-il ?', [], db, top_k=1,
                )

            self.assertIn('rétropropagation', result['answer'])
            self.assertEqual(len(result['sources']), 1)
            self.assertIn('retropropagation', result['sources'][0])
            self.assertIn('retropropagation', captured['prompt'])
            self.assertNotIn('foot', captured['prompt'])
        finally:
            db.close()

    def test_answer_includes_conversation_history(self):
        db = self.session()
        try:
            self.add_chunk(db, 0, 'Contenu du cours.', [1.0, 0.0])

            captured = {}

            def capture_chat(prompt, **kwargs):
                captured['prompt'] = prompt
                return 'Réponse.'

            history = [
                {'role': 'user', 'content': 'Premiere question ?'},
                {'role': 'assistant', 'content': 'Premiere reponse.'},
            ]

            with patch.object(ai_service, '_embed', return_value=[[1.0, 0.0]]), \
                    patch.object(ai_service, '_chat', side_effect=capture_chat):
                rag_service.answer_question(self.course, 'Et ensuite ?', history, db)

            self.assertIn('Premiere question ?', captured['prompt'])
            self.assertIn('Premiere reponse.', captured['prompt'])
        finally:
            db.close()

    def test_answer_raises_when_ai_unavailable(self):
        db = self.session()
        try:
            self.add_chunk(db, 0, 'Contenu.', [1.0, 0.0])

            with self.assertRaises(rag_service.RagUnavailableError):
                rag_service.answer_question(self.course, 'Question ?', [], db)
        finally:
            db.close()


class ChatEndpointTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.teacher = self.create_user('teacher@example.com', role='enseignant')
        self.student = self.create_user('student@example.com', role='etudiant')
        self.course = self.create_course(teacher_id=self.teacher.id, pdf_path='course.pdf')

    def seed_chunk(self):
        db = self.session()
        try:
            db.add(CourseChunk(
                course_id=self.course.id,
                chunk_index=0,
                content='La retropropagation ajuste les poids.',
                embedding=json.dumps([1.0, 0.0]),
            ))
            db.commit()
        finally:
            db.close()

    def test_chat_requires_authentication(self):
        response = self.client.post(
            f'/courses/{self.course.id}/chat',
            json={'question': 'Bonjour ?', 'history': []},
        )
        self.assertEqual(response.status_code, 401)

    def test_chat_returns_answer_and_sources(self):
        self.seed_chunk()

        with patch.object(ai_service, '_embed', return_value=[[1.0, 0.0]]), \
                patch.object(ai_service, '_chat', return_value='Voici la réponse.'):
            response = self.client.post(
                f'/courses/{self.course.id}/chat',
                headers=self.auth_headers(self.student),
                json={'question': 'Comment apprend le réseau ?', 'history': []},
            )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body['answer'], 'Voici la réponse.')
        self.assertGreaterEqual(len(body['sources']), 1)

    def test_chat_lazy_indexes_unindexed_course(self):
        with patch('rag_service.extract_text_from_pdf', return_value=COURSE_TEXT), \
                patch.object(ai_service, '_embed', side_effect=lambda texts: [[1.0, 0.0]] * len(texts)), \
                patch.object(ai_service, '_chat', return_value='Réponse après indexation.'):
            response = self.client.post(
                f'/courses/{self.course.id}/chat',
                headers=self.auth_headers(self.student),
                json={'question': 'Question ?', 'history': []},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['answer'], 'Réponse après indexation.')

        db = self.session()
        try:
            count = db.query(CourseChunk).filter(CourseChunk.course_id == self.course.id).count()
            self.assertGreaterEqual(count, 1)
        finally:
            db.close()

    def test_chat_rejects_course_without_pdf(self):
        course = self.create_course(title='Sans PDF', teacher_id=self.teacher.id, pdf_path=None)

        response = self.client.post(
            f'/courses/{course.id}/chat',
            headers=self.auth_headers(self.student),
            json={'question': 'Question ?', 'history': []},
        )
        self.assertEqual(response.status_code, 400)

    def test_chat_returns_503_when_ai_unavailable(self):
        self.seed_chunk()

        response = self.client.post(
            f'/courses/{self.course.id}/chat',
            headers=self.auth_headers(self.student),
            json={'question': 'Question ?', 'history': []},
        )
        self.assertEqual(response.status_code, 503)
        self.assertIn('detail', response.json())

    def test_chat_unknown_course_returns_404(self):
        response = self.client.post(
            '/courses/99999/chat',
            headers=self.auth_headers(self.student),
            json={'question': 'Question ?', 'history': []},
        )
        self.assertEqual(response.status_code, 404)


class UploadIndexingTests(APITestCase):
    def test_upload_pdf_triggers_indexing(self):
        teacher = self.create_user('teacher@example.com', role='enseignant')
        course = self.create_course(teacher_id=teacher.id)

        with patch('routes.courses.rag_service.index_course', MagicMock(return_value=3)) as indexer:
            response = self.client.post(
                f'/courses/{course.id}/upload-pdf',
                headers=self.auth_headers(teacher),
                files={'file': ('lesson.pdf', self.make_pdf_bytes('Contenu pour indexation.'), 'application/pdf')},
            )

        self.assertEqual(response.status_code, 200)
        indexer.assert_called_once()

    def test_upload_succeeds_even_if_indexing_fails(self):
        teacher = self.create_user('teacher@example.com', role='enseignant')
        course = self.create_course(teacher_id=teacher.id)

        with patch('routes.courses.rag_service.index_course', side_effect=RuntimeError('embed down')):
            response = self.client.post(
                f'/courses/{course.id}/upload-pdf',
                headers=self.auth_headers(teacher),
                files={'file': ('lesson.pdf', self.make_pdf_bytes(), 'application/pdf')},
            )

        self.assertEqual(response.status_code, 200)


if __name__ == '__main__':
    unittest.main()
