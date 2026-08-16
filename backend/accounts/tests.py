from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AccountsAPITests(APITestCase):
    def setUp(self):
        self.register_url = reverse('auth-register')
        self.login_url = reverse('auth-login')
        self.logout_url = reverse('auth-logout')
        self.profile_url = reverse('auth-profile')
        self.change_password_url = reverse('auth-change-password')
        self.setup_admin_url = reverse('auth-setup-admin')

        self.user_data = {
            'email': 'agent@example.com',
            'full_name': 'Agent Smith',
            'phone': '+8801711111111',
            'is_agent': True,
            'password': 'StrongPassword123!',
            'password2': 'StrongPassword123!',
        }

    def test_user_registration_success(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['user']['email'], 'agent@example.com')
        self.assertTrue(User.objects.filter(email='agent@example.com').exists())

    def test_registration_password_mismatch(self):
        data = self.user_data.copy()
        data['password2'] = 'DifferentPassword123!'
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_duplicate_email(self):
        User.objects.create_user(email='agent@example.com', password='Password123!')
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data['errors'])

    def test_login_success(self):
        user = User.objects.create_user(email='agent@example.com', password='StrongPassword123!', full_name='Agent Smith')
        response = self.client.post(self.login_url, {
            'email': 'agent@example.com',
            'password': 'StrongPassword123!',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['email'], 'agent@example.com')

    def test_login_invalid_credentials(self):
        User.objects.create_user(email='agent@example.com', password='StrongPassword123!')
        response = self.client.post(self.login_url, {
            'email': 'agent@example.com',
            'password': 'WrongPassword!',
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_retrieve_and_update(self):
        user = User.objects.create_user(email='user@example.com', password='Password123!', full_name='Original Name')
        self.client.force_authenticate(user=user)

        # GET Profile
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'Original Name')

        # PATCH Profile
        response = self.client.patch(self.profile_url, {'full_name': 'Updated Name', 'phone': '+8801822222222'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.full_name, 'Updated Name')
        self.assertEqual(user.phone, '+8801822222222')

    def test_change_password(self):
        user = User.objects.create_user(email='pass@example.com', password='OldPassword123!')
        self.client.force_authenticate(user=user)

        response = self.client.post(self.change_password_url, {
            'old_password': 'OldPassword123!',
            'new_password': 'NewPassword123!',
            'new_password2': 'NewPassword123!',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password('NewPassword123!'))

    def test_setup_admin_view(self):
        response = self.client.get(self.setup_admin_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        admin_user = User.objects.get(email='admin@realestate.com')
        self.assertTrue(admin_user.is_superuser)
        self.assertTrue(admin_user.is_staff)
