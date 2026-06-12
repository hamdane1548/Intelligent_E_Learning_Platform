import unittest
from unittest.mock import mock_open, patch

from tests.support import APITestCase


class CoursesQuizAndDashboardApiTests(APITestCase):
    def test_create_and_list_courses_uses_authenticated_teacher(self):
        student = self.create_user('student@example.com', role='etudiant')
        teacher = self.create_user('teacher@example.com', role='enseignant')

        forbidden_response = self.client.post(
            '/courses/',
            headers=self.auth_headers(student),
            json={'title': 'AI Basics', 'description': 'Intro to AI', 'teacher_id': 999},
        )
        self.assertEqual(forbidden_response.status_code, 403)

        success_response = self.client.post(
            '/courses/',
            headers=self.auth_headers(teacher),
            json={'title': 'AI Basics', 'description': 'Intro to AI', 'teacher_id': 999},
        )
        self.assertEqual(success_response.status_code, 200)
        self.assertEqual(success_response.json()['title'], 'AI Basics')
        self.assertEqual(success_response.json()['teacher_id'], teacher.id)

        list_response = self.client.get('/courses/')
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()), 1)

    def test_upload_pdf_rejects_non_pdf_and_accepts_valid_pdf(self):
        teacher = self.create_user('teacher@example.com', role='enseignant')
        course = self.create_course(teacher_id=teacher.id)

        invalid_response = self.client.post(
            f'/courses/{course.id}/upload-pdf',
            headers=self.auth_headers(teacher),
            files={'file': ('notes.txt', b'plain text', 'text/plain')},
        )
        self.assertEqual(invalid_response.status_code, 400)
        self.assertIn('detail', invalid_response.json())

        with patch('routes.courses.os.path.exists', return_value=True),              patch('routes.courses.open', mock_open()) as mocked_open,              patch('routes.courses.shutil.copyfileobj') as mocked_copy:
            valid_response = self.client.post(
                f'/courses/{course.id}/upload-pdf',
                headers=self.auth_headers(teacher),
                files={'file': ('lesson.pdf', self.make_pdf_bytes(), 'application/pdf')},
            )

        self.assertEqual(valid_response.status_code, 200)
        self.assertTrue(valid_response.json()['pdf_path'].endswith('lesson.pdf'))
        mocked_open.assert_called_once()
        mocked_copy.assert_called_once()

    def test_extract_text_and_generate_summary_cover_success_and_error_cases(self):
        teacher = self.create_user('teacher@example.com', role='enseignant')
        course_without_pdf = self.create_course(title='No PDF', teacher_id=teacher.id, pdf_path=None)
        course_with_pdf = self.create_course(title='Data Science', teacher_id=teacher.id, pdf_path='course.pdf')

        missing_response = self.client.get('/courses/99999/extract-text')
        self.assertEqual(missing_response.status_code, 404)

        no_pdf_response = self.client.get(f'/courses/{course_without_pdf.id}/extract-text')
        self.assertEqual(no_pdf_response.status_code, 400)

        summary_without_pdf = self.client.post(
            f'/courses/{course_without_pdf.id}/generate-summary',
            headers=self.auth_headers(teacher),
        )
        self.assertEqual(summary_without_pdf.status_code, 400)

        extracted_text = (
            'Adaptive learning systems improve outcomes by tailoring every lesson to the learner profile. '
            'Teachers can review platform analytics to adjust the pace of each course module. '
            'Students build confidence through summaries that highlight the most relevant concepts.'
        )

        with patch('routes.courses.extract_text_from_pdf', return_value=extracted_text):
            extract_response = self.client.get(f'/courses/{course_with_pdf.id}/extract-text')
            self.assertEqual(extract_response.status_code, 200)
            self.assertIn('Adaptive learning systems', extract_response.json()['text_preview'])

            summary_response = self.client.post(
                f'/courses/{course_with_pdf.id}/generate-summary',
                headers=self.auth_headers(teacher),
            )
            self.assertEqual(summary_response.status_code, 200)
            self.assertTrue(summary_response.json()['summary'])
            self.assertIn('Adaptive learning systems', summary_response.json()['summary'])

        with patch('routes.courses.extract_text_from_pdf', return_value='   '):
            empty_response = self.client.post(
                f'/courses/{course_with_pdf.id}/generate-summary',
                headers=self.auth_headers(teacher),
            )
            self.assertEqual(empty_response.status_code, 400)
            self.assertIn('detail', empty_response.json())

    def test_generate_quiz_list_questions_and_submit_successfully(self):
        teacher = self.create_user('teacher@example.com', role='enseignant')
        student = self.create_user('student@example.com', role='etudiant')
        course = self.create_course(title='Machine Learning', teacher_id=teacher.id, pdf_path='course.pdf')

        extracted_text = (
            'Machine learning courses explain how algorithms discover patterns from detailed examples and feedback. '
            'Teachers use assessment data to refine each lesson and reinforce difficult concepts. '
            'Students gain confidence by reviewing summaries and quizzes after every module.'
        )

        with patch('routes.quiz.extract_text_from_pdf', return_value=extracted_text):
            generate_response = self.client.post(
                f'/quiz/generate/{course.id}',
                headers=self.auth_headers(teacher),
            )

        self.assertEqual(generate_response.status_code, 200)
        quiz_id = generate_response.json()['id']

        list_response = self.client.get('/quiz/')
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()), 1)

        questions_response = self.client.get(f'/quiz/{quiz_id}/questions')
        self.assertEqual(questions_response.status_code, 200)
        questions = questions_response.json()
        self.assertGreaterEqual(len(questions), 1)

        answers = [
            {'question_id': question['id'], 'answer': 'A' if index == 0 else 'B'}
            for index, question in enumerate(questions)
        ]
        submit_response = self.client.post(
            f'/quiz/{quiz_id}/submit',
            headers=self.auth_headers(student),
            json={'student_id': 999, 'answers': answers},
        )
        self.assertEqual(submit_response.status_code, 200)
        self.assertEqual(submit_response.json()['student_id'], student.id)
        self.assertEqual(submit_response.json()['quiz_id'], quiz_id)
        self.assertEqual(submit_response.json()['score'], 1)
        self.assertEqual(submit_response.json()['total_questions'], len(questions))

    def test_quiz_error_and_results_authorization_paths(self):
        admin = self.create_user('admin@example.com', role='admin')
        teacher = self.create_user('teacher@example.com', role='enseignant')
        student_one = self.create_user('student1@example.com', role='etudiant')
        student_two = self.create_user('student2@example.com', role='etudiant')
        course_without_pdf = self.create_course(title='No PDF', teacher_id=teacher.id, pdf_path=None)
        course_with_pdf = self.create_course(title='Networks', teacher_id=teacher.id, pdf_path='course.pdf')

        missing_course_response = self.client.post(
            '/quiz/generate/99999',
            headers=self.auth_headers(teacher),
        )
        self.assertEqual(missing_course_response.status_code, 404)

        no_pdf_response = self.client.post(
            f'/quiz/generate/{course_without_pdf.id}',
            headers=self.auth_headers(teacher),
        )
        self.assertEqual(no_pdf_response.status_code, 400)

        with patch('routes.quiz.extract_text_from_pdf', return_value='Short sentence only.'):
            generation_failure = self.client.post(
                f'/quiz/generate/{course_with_pdf.id}',
                headers=self.auth_headers(teacher),
            )
        self.assertEqual(generation_failure.status_code, 400)
        self.assertIn('detail', generation_failure.json())

        missing_quiz_response = self.client.get('/quiz/99999/questions')
        self.assertEqual(missing_quiz_response.status_code, 404)

        empty_quiz = self.create_quiz(course_id=course_with_pdf.id, title='Empty Quiz')
        empty_submit_response = self.client.post(
            f'/quiz/{empty_quiz.id}/submit',
            headers=self.auth_headers(student_one),
            json={'student_id': student_one.id, 'answers': []},
        )
        self.assertEqual(empty_submit_response.status_code, 400)
        self.assertIn('detail', empty_submit_response.json())

        quiz = self.create_quiz(course_id=course_with_pdf.id, title='Authorized Quiz')
        self.create_question(quiz_id=quiz.id)
        self.create_result(student_id=student_one.id, quiz_id=quiz.id, score=1, total_questions=1)

        own_results_response = self.client.get(
            f'/quiz/results/student/{student_one.id}',
            headers=self.auth_headers(student_one),
        )
        self.assertEqual(own_results_response.status_code, 200)
        self.assertEqual(len(own_results_response.json()), 1)

        forbidden_results_response = self.client.get(
            f'/quiz/results/student/{student_one.id}',
            headers=self.auth_headers(student_two),
        )
        self.assertEqual(forbidden_results_response.status_code, 403)

        teacher_results_response = self.client.get(
            f'/quiz/results/student/{student_one.id}',
            headers=self.auth_headers(teacher),
        )
        self.assertEqual(teacher_results_response.status_code, 200)
        self.assertEqual(len(teacher_results_response.json()), 1)

        all_results_response = self.client.get('/quiz/results/all', headers=self.auth_headers(admin))
        self.assertEqual(all_results_response.status_code, 200)
        self.assertEqual(len(all_results_response.json()), 1)

    def test_dashboard_stats_aggregates_counts_and_average_score(self):
        self.create_user('admin@example.com', role='admin')
        teacher = self.create_user('teacher@example.com', role='enseignant')
        student = self.create_user('student@example.com', role='etudiant')

        course = self.create_course(title='Statistics', teacher_id=teacher.id, pdf_path='stats.pdf')
        quiz = self.create_quiz(course_id=course.id, title='Statistics Quiz')
        self.create_result(student_id=student.id, quiz_id=quiz.id, score=1, total_questions=2)
        self.create_result(student_id=student.id, quiz_id=quiz.id, score=2, total_questions=2)

        response = self.client.get('/dashboard/stats')
        self.assertEqual(response.status_code, 200)

        body = response.json()
        self.assertEqual(body['users']['total'], 3)
        self.assertEqual(body['users']['students'], 1)
        self.assertEqual(body['users']['teachers'], 1)
        self.assertEqual(body['users']['admins'], 1)
        self.assertEqual(body['courses']['total'], 1)
        self.assertEqual(body['quizzes']['total'], 1)
        self.assertEqual(body['quizzes']['results'], 2)
        self.assertEqual(body['quizzes']['average_score_percent'], 75.0)


if __name__ == '__main__':
    unittest.main()
