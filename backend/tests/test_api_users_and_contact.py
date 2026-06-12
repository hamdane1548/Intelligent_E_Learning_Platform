import unittest

from tests.support import APITestCase


class UserAndContactApiTests(APITestCase):
    def test_home_test_db_contact_and_about_endpoints(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['message'], 'SmartLearn AI Backend is running')

        response = self.client.get('/test-db')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['message'], 'Database connected successfully')

        response = self.client.post(
            '/contact/',
            json={
                'nom': 'Alice',
                'email': 'alice@example.com',
                'sujet': 'Support',
                'message': 'I would like more details about the platform.',
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])

        response = self.client.get('/contact/about')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['projet'], 'SmartLearn AI')

    def test_create_user_and_login_success(self):
        payload = {
            'nom': 'Alice',
            'email': 'alice@example.com',
            'password': 'secret123',
            'role': 'etudiant',
        }

        create_response = self.client.post('/users/', json=payload)
        self.assertEqual(create_response.status_code, 200)
        self.assertEqual(create_response.json()['email'], payload['email'])

        login_response = self.client.post(
            '/users/login',
            json={'email': payload['email'], 'password': payload['password']},
        )
        self.assertEqual(login_response.status_code, 200)
        self.assertEqual(login_response.json()['token_type'], 'bearer')
        self.assertEqual(login_response.json()['user']['email'], payload['email'])
        self.assertTrue(login_response.json()['access_token'])

    def test_create_user_rejects_duplicate_email_and_login_rejects_bad_password(self):
        payload = {
            'nom': 'Bob',
            'email': 'bob@example.com',
            'password': 'secret123',
            'role': 'etudiant',
        }

        first_response = self.client.post('/users/', json=payload)
        self.assertEqual(first_response.status_code, 200)

        duplicate_response = self.client.post('/users/', json=payload)
        self.assertEqual(duplicate_response.status_code, 400)
        self.assertIn('detail', duplicate_response.json())

        login_response = self.client.post(
            '/users/login',
            json={'email': payload['email'], 'password': 'wrong-password'},
        )
        self.assertEqual(login_response.status_code, 401)
        self.assertIn('detail', login_response.json())

    def test_get_users_is_admin_only(self):
        admin = self.create_user('admin@example.com', role='admin', nom='Admin User')
        student = self.create_user('student@example.com', role='etudiant', nom='Student User')

        forbidden_response = self.client.get('/users/', headers=self.auth_headers(student))
        self.assertEqual(forbidden_response.status_code, 403)

        success_response = self.client.get('/users/', headers=self.auth_headers(admin))
        self.assertEqual(success_response.status_code, 200)
        self.assertEqual(len(success_response.json()), 2)

    def test_me_and_profile_update_endpoints_cover_success_and_invalid_token(self):
        user = self.create_user('learner@example.com', role='etudiant', nom='Learner')
        self.create_user('taken@example.com', role='etudiant', nom='Taken')

        me_response = self.client.get('/users/me', headers=self.auth_headers(user))
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.json()['email'], 'learner@example.com')

        update_response = self.client.put(
            '/users/me',
            headers=self.auth_headers(user),
            json={'nom': 'Learner Updated', 'email': 'updated@example.com'},
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.json()['nom'], 'Learner Updated')
        self.assertEqual(update_response.json()['email'], 'updated@example.com')
        user.email = 'updated@example.com'

        duplicate_response = self.client.put(
            '/users/me',
            headers=self.auth_headers(user),
            json={'nom': 'Learner Updated', 'email': 'taken@example.com'},
        )
        self.assertEqual(duplicate_response.status_code, 400)
        self.assertIn('detail', duplicate_response.json())

        invalid_token_response = self.client.get(
            '/users/me',
            headers={'Authorization': 'Bearer invalid-token'},
        )
        self.assertEqual(invalid_token_response.status_code, 401)
        self.assertIn('detail', invalid_token_response.json())

    def test_update_password_success_and_common_error_cases(self):
        user = self.create_user('secure@example.com', role='etudiant', password='secret123')
        headers = self.auth_headers(user)

        wrong_current_response = self.client.put(
            '/users/me/password',
            headers=headers,
            json={'current_password': 'wrong-password', 'new_password': 'newsecret456'},
        )
        self.assertEqual(wrong_current_response.status_code, 400)
        self.assertIn('detail', wrong_current_response.json())

        short_password_response = self.client.put(
            '/users/me/password',
            headers=headers,
            json={'current_password': 'secret123', 'new_password': '123'},
        )
        self.assertEqual(short_password_response.status_code, 400)
        self.assertIn('detail', short_password_response.json())

        success_response = self.client.put(
            '/users/me/password',
            headers=headers,
            json={'current_password': 'secret123', 'new_password': 'newsecret456'},
        )
        self.assertEqual(success_response.status_code, 200)
        self.assertIn('message', success_response.json())

        old_login_response = self.client.post(
            '/users/login',
            json={'email': 'secure@example.com', 'password': 'secret123'},
        )
        self.assertEqual(old_login_response.status_code, 401)

        new_login_response = self.client.post(
            '/users/login',
            json={'email': 'secure@example.com', 'password': 'newsecret456'},
        )
        self.assertEqual(new_login_response.status_code, 200)


if __name__ == '__main__':
    unittest.main()
