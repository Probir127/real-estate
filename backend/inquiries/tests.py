from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from properties.models import Property
from inquiries.models import Inquiry

User = get_user_model()


class InquiriesAPITests(APITestCase):
    def setUp(self):
        self.agent = User.objects.create_user(
            email='agent@realestate.com',
            password='Password123!',
            full_name='Agent Name',
            is_agent=True
        )
        self.buyer = User.objects.create_user(
            email='buyer@realestate.com',
            password='Password123!',
            full_name='Buyer Name',
            is_agent=False
        )

        self.property = Property.objects.create(
            title='Uttara Modern Flat',
            description='3BR flat in Uttara Sector 3.',
            price=18000000,
            property_type='apartment',
            listing_type='sale',
            status='active',
            address='Sector 3, Uttara',
            city='Uttara',
            state='Dhaka',
            bedrooms=3,
            bathrooms=3,
            area_sqft=1800,
            is_published=True,
            agent=self.agent
        )

        self.create_url = reverse('inquiry-create')
        self.received_url = reverse('inquiry-list')

    def test_anonymous_user_can_submit_inquiry(self):
        data = {
            'property_id': self.property.id,
            'name': 'Visitor Name',
            'email': 'visitor@example.com',
            'phone': '+8801733333333',
            'message': 'Hello, I would like to book a property view.',
        }
        response = self.client.post(self.create_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertTrue(Inquiry.objects.filter(email='visitor@example.com', agent=self.agent).exists())

    def test_agent_view_received_inquiries(self):
        Inquiry.objects.create(
            property=self.property,
            agent=self.agent,
            name='Visitor Name',
            email='visitor@example.com',
            message='First inquiry'
        )

        # Authenticate as agent
        self.client.force_authenticate(user=self.agent)
        response = self.client.get(self.received_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Visitor Name')

    def test_mark_inquiry_read(self):
        inquiry = Inquiry.objects.create(
            property=self.property,
            agent=self.agent,
            name='Buyer',
            email='buyer@example.com',
            message='Is this available?',
            is_read=False
        )

        self.client.force_authenticate(user=self.agent)
        mark_url = reverse('inquiry-mark-read', kwargs={'pk': inquiry.pk})
        response = self.client.patch(mark_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        inquiry.refresh_from_db()
        self.assertTrue(inquiry.is_read)

    def test_non_agent_cannot_access_received_inquiries(self):
        self.client.force_authenticate(user=self.buyer)
        response = self.client.get(self.received_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
