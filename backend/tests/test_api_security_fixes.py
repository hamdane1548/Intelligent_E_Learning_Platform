import os
import unittest

from tests.support import APITestCase


class PasswordHashingTests(unittest.TestCase):
    """Vérifie le vrai backend bcrypt (les tests API utilisent un faux hash)."""

    def test_real_bcrypt_hash_and_verify_roundtrip(self):
        from auth import pwd_context

        hashed = pwd_context.hash('secret123')
        self.assertTrue(pwd_context.verify('secret123', hashed))
        self.assertFalse(pwd_context.verify('wrong-password', hashed))


class SignupRoleRestrictionTests(APITestCase):
    def test_signup_rejects_admin_role_without_admin_token(self):
        response = self.client.post(
            '/users/',
            json={
                'nom': 'Mallory',
                'email': 'mallory@example.com',
                'password': 'secret123',
                'role': 'admin',
            },
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn('detail', response.json())

    def test_signup_rejects_admin_role_with_non_admin_token(self):
        student = self.create_user('student@example.com', role='etudiant')

        response = self.client.post(
            '/users/',
            headers=self.auth_headers(student),
            json={
                'nom': 'Mallory',
                'email': 'mallory@example.com',
                'password': 'secret123',
                'role': 'admin',
            },
        )
        self.assertEqual(response.status_code, 403)

    def test_admin_can_create_admin_account(self):
        admin = self.create_user('admin@example.com', role='admin')

        response = self.client.post(
            '/users/',
            headers=self.auth_headers(admin),
            json={
                'nom': 'Second Admin',
                'email': 'admin2@example.com',
                'password': 'secret123',
                'role': 'admin',
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['role'], 'admin')

    def test_signup_rejects_unknown_role(self):
        response = self.client.post(
            '/users/',
            json={
                'nom': 'Weird',
                'email': 'weird@example.com',
                'password': 'secret123',
                'role': 'superuser',
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('detail', response.json())


class PasswordChangeBodyTests(APITestCase):
    def test_update_password_accepts_json_body(self):
        user = self.create_user('secure@example.com', role='etudiant', password='secret123')

        response = self.client.put(
            '/users/me/password',
            headers=self.auth_headers(user),
            json={'current_password': 'secret123', 'new_password': 'newsecret456'},
        )
        self.assertEqual(response.status_code, 200)

        login_response = self.client.post(
            '/users/login',
            json={'email': 'secure@example.com', 'password': 'newsecret456'},
        )
        self.assertEqual(login_response.status_code, 200)

    def test_update_password_rejects_query_params(self):
        user = self.create_user('secure@example.com', role='etudiant', password='secret123')

        response = self.client.put(
            '/users/me/password',
            headers=self.auth_headers(user),
            params={'current_password': 'secret123', 'new_password': 'newsecret456'},
        )
        self.assertEqual(response.status_code, 422)


class QuizQuestionVisibilityTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.teacher = self.create_user('teacher@example.com', role='enseignant')
        self.student = self.create_user('student@example.com', role='etudiant')
        course = self.create_course(teacher_id=self.teacher.id, pdf_path='course.pdf')
        self.quiz = self.create_quiz(course_id=course.id)
        self.create_question(quiz_id=self.quiz.id, correct_answer='A')

    def test_questions_require_authentication(self):
        response = self.client.get(f'/quiz/{self.quiz.id}/questions')
        self.assertEqual(response.status_code, 401)

    def test_students_do_not_receive_correct_answer(self):
        response = self.client.get(
            f'/quiz/{self.quiz.id}/questions',
            headers=self.auth_headers(self.student),
        )
        self.assertEqual(response.status_code, 200)
        questions = response.json()
        self.assertEqual(len(questions), 1)
        self.assertIsNone(questions[0].get('correct_answer'))

    def test_teachers_still_receive_correct_answer(self):
        response = self.client.get(
            f'/quiz/{self.quiz.id}/questions',
            headers=self.auth_headers(self.teacher),
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()[0]['correct_answer'], 'A')


class EndpointAuthenticationTests(APITestCase):
    def test_dashboard_stats_requires_authentication(self):
        response = self.client.get('/dashboard/stats')
        self.assertEqual(response.status_code, 401)

        user = self.create_user('any@example.com', role='etudiant')
        response = self.client.get('/dashboard/stats', headers=self.auth_headers(user))
        self.assertEqual(response.status_code, 200)

    def test_courses_list_requires_authentication(self):
        response = self.client.get('/courses/')
        self.assertEqual(response.status_code, 401)

        user = self.create_user('any@example.com', role='etudiant')
        response = self.client.get('/courses/', headers=self.auth_headers(user))
        self.assertEqual(response.status_code, 200)

    def test_extract_text_requires_teacher_or_admin(self):
        teacher = self.create_user('teacher@example.com', role='enseignant')
        student = self.create_user('student@example.com', role='etudiant')
        course = self.create_course(teacher_id=teacher.id, pdf_path='course.pdf')

        response = self.client.get(f'/courses/{course.id}/extract-text')
        self.assertEqual(response.status_code, 401)

        response = self.client.get(
            f'/courses/{course.id}/extract-text',
            headers=self.auth_headers(student),
        )
        self.assertEqual(response.status_code, 403)


class UploadFilenameSanitizationTests(APITestCase):
    def test_upload_pdf_strips_path_traversal_from_filename(self):
        teacher = self.create_user('teacher@example.com', role='enseignant')
        course = self.create_course(teacher_id=teacher.id)

        response = self.client.post(
            f'/courses/{course.id}/upload-pdf',
            headers=self.auth_headers(teacher),
            files={'file': ('../../../evil.pdf', self.make_pdf_bytes(), 'application/pdf')},
        )
        self.assertEqual(response.status_code, 200)

        pdf_path = response.json()['pdf_path']
        self.assertNotIn('..', pdf_path)
        real_upload_dir = os.path.realpath(self.upload_dir)
        self.assertTrue(
            os.path.realpath(pdf_path).startswith(real_upload_dir + os.sep),
            f'{pdf_path} escapes upload dir {real_upload_dir}',
        )


if __name__ == '__main__':
    unittest.main()
