from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from properties.models import Property
from favorites.models import Favorite

User = get_user_model()


class FavoritesAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='user@realestate.com',
            password='Password123!',
            full_name='Regular User'
        )
        self.agent = User.objects.create_user(
            email='agent@realestate.com',
            password='Password123!',
            is_agent=True
        )

        self.property = Property.objects.create(
            title='Dhanmondi Penthouse',
            description='Luxury penthouse.',
            price=45000000,
            property_type='apartment',
            listing_type='sale',
            status='active',
            address='Road 27, Dhanmondi',
            city='Dhanmondi',
            state='Dhaka',
            bedrooms=4,
            bathrooms=4,
            area_sqft=3500,
            is_published=True,
            agent=self.agent
        )

        self.fav_list_create_url = reverse('favorite-list-create')

    def test_unauthenticated_user_cannot_access_favorites(self):
        response = self.client.get(self.fav_list_create_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_add_and_list_favorite(self):
        self.client.force_authenticate(user=self.user)

        # Add to favorites
        response = self.client.post(self.fav_list_create_url, {'property_id': self.property.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        fav_id = response.data['id']

        # List favorites
        response = self.client.get(self.fav_list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['property_detail']['title'], 'Dhanmondi Penthouse')

        # Remove favorite
        delete_url = reverse('favorite-delete', kwargs={'pk': fav_id})
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Favorite.objects.filter(pk=fav_id).exists())

    def test_duplicate_favorite_prevention(self):
        self.client.force_authenticate(user=self.user)
        Favorite.objects.create(user=self.user, property=self.property)

        # Attempt to add same property again
        response = self.client.post(self.fav_list_create_url, {'property_id': self.property.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
