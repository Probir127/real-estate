from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch, MagicMock
from properties.models import Property
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatbotAPITests(APITestCase):
    def setUp(self):
        self.chat_url = reverse('chatbot-message')
        self.agent = User.objects.create_user(
            email='agent@zennor.bd',
            password='Password123!',
            full_name='Zennor Agent',
            is_agent=True
        )
        self.property = Property.objects.create(
            title='Gulshan Luxury Duplex',
            description='Prime location duplex.',
            price=92500000,
            property_type='duplex',
            listing_type='sale',
            status='active',
            address='Road 41, Gulshan 2',
            city='Gulshan',
            state='Dhaka',
            bedrooms=4,
            bathrooms=5,
            area_sqft=4200,
            is_featured=True,
            is_published=True,
            agent=self.agent
        )

    def test_chatbot_validation_error_on_empty_payload(self):
        response = self.client.post(self.chat_url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('urllib.request.urlopen')
    def test_chatbot_successful_response(self, mock_urlopen):
        # Mock HF API response
        mock_response = MagicMock()
        mock_response.read.return_value = b'{"choices": [{"message": {"content": "Hello! I am Zennor AI. How can I help you find a home?"}}]}'
        mock_response.__enter__.return_value = mock_response
        mock_urlopen.return_value = mock_response

        response = self.client.post(self.chat_url, {
            'message': 'Hello, tell me about Gulshan duplexes.'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('Zennor AI', response.data['reply'])
        self.assertIn('suggested_properties', response.data)

    def test_chatbot_fallback_handling(self):
        # Without mocking, if network times out or mock fails, fallback generates a safe response
        response = self.client.post(self.chat_url, {
            'message': 'Tell me about mortgage and loan'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertTrue(len(response.data['reply']) > 0)
