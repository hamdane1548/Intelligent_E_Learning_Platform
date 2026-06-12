import json
import unittest
from unittest.mock import patch

from tests.support import APITestCase

import ai_service


LONG_TEXT = (
    'Les reseaux de neurones sont des modeles informatiques inspires du cerveau humain qui apprennent. '
    'Chaque neurone artificiel recoit des entrees ponderees et applique une fonction d activation pour produire une sortie. '
    'L apprentissage par retropropagation ajuste les poids du reseau pour minimiser l erreur de prediction globale.'
)

VALID_QUIZ_JSON = json.dumps({
    'questions': [
        {
            'question': 'Quel mecanisme ajuste les poids du reseau ?',
            'option_a': 'La retropropagation',
            'option_b': 'La compilation',
            'option_c': 'Le chiffrement',
            'option_d': 'La pagination',
            'correct_answer': 'A',
        },
        {
            'question': 'De quoi les reseaux de neurones sont-ils inspires ?',
            'option_a': 'Des circuits imprimes',
            'option_b': 'Du cerveau humain',
            'option_c': 'Des moteurs thermiques',
            'option_d': 'Des reseaux routiers',
            'correct_answer': 'B',
        },
    ]
})


class SummaryGenerationTests(unittest.TestCase):
    def test_summary_uses_llm_output(self):
        with patch.object(ai_service, '_chat', return_value='Résumé généré par le modèle.') as chat:
            summary, ai_generated = ai_service.generate_summary(LONG_TEXT)

        self.assertEqual(summary, 'Résumé généré par le modèle.')
        self.assertTrue(ai_generated)
        chat.assert_called_once()

    def test_summary_falls_back_when_llm_unreachable(self):
        with patch.object(ai_service, '_chat', side_effect=ConnectionError('refused')):
            summary, ai_generated = ai_service.generate_summary(LONG_TEXT)

        self.assertFalse(ai_generated)
        self.assertIn('reseaux de neurones', summary)

    def test_summary_falls_back_when_llm_returns_empty(self):
        with patch.object(ai_service, '_chat', return_value='   '):
            summary, ai_generated = ai_service.generate_summary(LONG_TEXT)

        self.assertFalse(ai_generated)
        self.assertTrue(summary)

    def test_summary_strips_conversational_preamble(self):
        with patch.object(ai_service, '_chat', return_value='Voici un résumé clair et structuré du cours :\n\nLe vrai contenu du résumé.'):
            summary, ai_generated = ai_service.generate_summary(LONG_TEXT)

        self.assertTrue(ai_generated)
        self.assertEqual(summary, 'Le vrai contenu du résumé.')

    def test_summary_truncates_long_input(self):
        captured = {}

        def capture(prompt, **kwargs):
            captured['prompt'] = prompt
            return 'Résumé.'

        with patch.object(ai_service, '_chat', side_effect=capture):
            ai_service.generate_summary('mot ' * 20000)

        self.assertLess(len(captured['prompt']), ai_service.MAX_INPUT_CHARS + 2000)


class QuizGenerationTests(unittest.TestCase):
    def test_quiz_parses_valid_json(self):
        with patch.object(ai_service, '_chat', return_value=VALID_QUIZ_JSON) as chat:
            questions, ai_generated = ai_service.generate_quiz_questions(LONG_TEXT, num_questions=2)

        self.assertTrue(ai_generated)
        self.assertEqual(len(questions), 2)
        chat.assert_called_once()

    def test_quiz_retries_when_fewer_questions_than_requested_then_accepts_partial(self):
        # llama3 renvoie parfois moins de questions que demandé : on réessaie
        # une fois, puis on accepte un résultat partiel plutôt que le fallback.
        with patch.object(ai_service, '_chat', side_effect=[VALID_QUIZ_JSON, VALID_QUIZ_JSON]) as chat:
            questions, ai_generated = ai_service.generate_quiz_questions(LONG_TEXT, num_questions=5)

        self.assertTrue(ai_generated)
        self.assertEqual(len(questions), 2)
        self.assertEqual(chat.call_count, 2)

        for q in questions:
            self.assertIn(q['correct_answer'], {'A', 'B', 'C', 'D'})
            for key in ('question', 'option_a', 'option_b', 'option_c', 'option_d'):
                self.assertTrue(q[key])

    def test_quiz_shuffle_preserves_correct_option_text(self):
        letters_seen = set()

        for _ in range(20):
            with patch.object(ai_service, '_chat', return_value=VALID_QUIZ_JSON):
                questions, _ = ai_service.generate_quiz_questions(LONG_TEXT, num_questions=2)

            first = questions[0]
            correct_letter = first['correct_answer']
            correct_text = first[f'option_{correct_letter.lower()}']
            self.assertEqual(correct_text, 'La retropropagation')
            letters_seen.add(correct_letter)

        self.assertGreater(len(letters_seen), 1, 'shuffle should vary the correct letter position')

    def test_quiz_parses_json_wrapped_in_code_fence(self):
        fenced = '```json\n' + VALID_QUIZ_JSON + '\n```'
        with patch.object(ai_service, '_chat', return_value=fenced):
            questions, ai_generated = ai_service.generate_quiz_questions(LONG_TEXT, num_questions=2)

        self.assertTrue(ai_generated)
        self.assertEqual(len(questions), 2)

    def test_quiz_retries_once_then_succeeds(self):
        with patch.object(ai_service, '_chat', side_effect=['pas du json', VALID_QUIZ_JSON]) as chat:
            questions, ai_generated = ai_service.generate_quiz_questions(LONG_TEXT)

        self.assertTrue(ai_generated)
        self.assertEqual(len(questions), 2)
        self.assertEqual(chat.call_count, 2)

    def test_quiz_falls_back_after_two_bad_outputs(self):
        with patch.object(ai_service, '_chat', side_effect=['garbage', 'more garbage']) as chat:
            questions, ai_generated = ai_service.generate_quiz_questions(LONG_TEXT)

        self.assertFalse(ai_generated)
        self.assertGreaterEqual(len(questions), 1)
        self.assertEqual(chat.call_count, 2)

    def test_quiz_falls_back_immediately_on_connection_error(self):
        with patch.object(ai_service, '_chat', side_effect=ConnectionError('refused')) as chat:
            questions, ai_generated = ai_service.generate_quiz_questions(LONG_TEXT)

        self.assertFalse(ai_generated)
        self.assertGreaterEqual(len(questions), 1)
        self.assertEqual(chat.call_count, 1)

    def test_quiz_rejects_invalid_correct_answer(self):
        bad = json.dumps({'questions': [{
            'question': 'Q ?',
            'option_a': 'a', 'option_b': 'b', 'option_c': 'c', 'option_d': 'd',
            'correct_answer': 'E',
        }]})
        with patch.object(ai_service, '_chat', return_value=bad) as chat:
            questions, ai_generated = ai_service.generate_quiz_questions(LONG_TEXT)

        self.assertFalse(ai_generated)
        self.assertEqual(chat.call_count, 2)


class AiEndpointTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.teacher = self.create_user('teacher@example.com', role='enseignant')
        self.course = self.create_course(teacher_id=self.teacher.id, pdf_path='course.pdf')

    def test_generate_summary_endpoint_returns_flag_and_persists(self):
        with patch('routes.courses.extract_text_from_pdf', return_value=LONG_TEXT), \
                patch.object(ai_service, 'generate_summary', return_value=('Résumé IA.', True)):
            response = self.client.post(
                f'/courses/{self.course.id}/generate-summary',
                headers=self.auth_headers(self.teacher),
            )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body['ai_generated'])
        self.assertEqual(body['course']['summary'], 'Résumé IA.')

    def test_generate_summary_endpoint_reports_fallback(self):
        with patch('routes.courses.extract_text_from_pdf', return_value=LONG_TEXT):
            response = self.client.post(
                f'/courses/{self.course.id}/generate-summary',
                headers=self.auth_headers(self.teacher),
            )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()['ai_generated'])

    def test_generate_quiz_endpoint_returns_flag_and_persists_questions(self):
        generated = [
            {
                'question': 'Q1 ?',
                'option_a': 'r1', 'option_b': 'x', 'option_c': 'y', 'option_d': 'z',
                'correct_answer': 'A',
            },
            {
                'question': 'Q2 ?',
                'option_a': 'x', 'option_b': 'r2', 'option_c': 'y', 'option_d': 'z',
                'correct_answer': 'B',
            },
        ]

        with patch('routes.quiz.extract_text_from_pdf', return_value=LONG_TEXT), \
                patch.object(ai_service, 'generate_quiz_questions', return_value=(generated, True)):
            response = self.client.post(
                f'/quiz/generate/{self.course.id}',
                headers=self.auth_headers(self.teacher),
            )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body['ai_generated'])
        quiz_id = body['quiz']['id']

        questions_response = self.client.get(
            f'/quiz/{quiz_id}/questions',
            headers=self.auth_headers(self.teacher),
        )
        self.assertEqual(questions_response.status_code, 200)
        questions = questions_response.json()
        self.assertEqual(len(questions), 2)
        self.assertEqual(questions[1]['correct_answer'], 'B')


if __name__ == '__main__':
    unittest.main()
