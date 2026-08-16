from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from properties.models import Property, PropertyImage

User = get_user_model()


class PropertiesAPITests(APITestCase):
    def setUp(self):
        self.agent = User.objects.create_user(
            email='agent@realestate.com',
            password='Password123!',
            full_name='Listing Agent',
            is_agent=True
        )
        self.other_user = User.objects.create_user(
            email='buyer@realestate.com',
            password='Password123!',
            full_name='Buyer User',
            is_agent=False
        )

        self.property1 = Property.objects.create(
            title='Gulshan Luxury Apartment',
            description='Spacious 3BR apartment in Gulshan 1.',
            price=35000000,
            property_type='apartment',
            listing_type='sale',
            status='active',
            address='Road 11, Gulshan 1',
            city='Gulshan',
            state='Dhaka',
            zip_code='1212',
            bedrooms=3,
            bathrooms=3,
            area_sqft=2500,
            is_featured=True,
            is_published=True,
            agent=self.agent
        )

        self.unpublished_property = Property.objects.create(
            title='Draft Penthouse',
            description='Unpublished draft penthouse.',
            price=60000000,
            property_type='house',
            listing_type='sale',
            status='active',
            address='Road 5, Baridhara',
            city='Baridhara',
            state='Dhaka',
            bedrooms=4,
            bathrooms=4,
            area_sqft=4000,
            is_featured=False,
            is_published=False,
            agent=self.agent
        )

        self.list_url = reverse('property-list')
        self.detail_url = reverse('property-detail', kwargs={'pk': self.property1.pk})
        self.featured_url = reverse('property-featured')
        self.my_listings_url = reverse('property-my-listings')

    def test_list_published_properties(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'Gulshan Luxury Apartment')

    def test_retrieve_property_detail(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Gulshan Luxury Apartment')
        self.assertEqual(response.data['agent']['full_name'], 'Listing Agent')

    def test_search_and_filter_properties(self):
        # Filter by city
        response = self.client.get(self.list_url, {'city': 'Gulshan'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

        # Search term
        response = self.client.get(self.list_url, {'search': 'Spacious'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

        # Filter by non-existent city
        response = self.client.get(self.list_url, {'city': 'Sylhet'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)

    def test_create_property_authenticated_agent(self):
        self.client.force_authenticate(user=self.agent)
        data = {
            'title': 'Banani Modern Villa',
            'description': 'Luxury villa in Banani.',
            'price': 50000000,
            'property_type': 'villa',
            'listing_type': 'sale',
            'status': 'active',
            'address': 'Road 27, Banani',
            'city': 'Banani',
            'state': 'Dhaka',
            'bedrooms': 5,
            'bathrooms': 5,
            'area_sqft': 5000,
            'garage': '',
            'year_built': '',
            'latitude': '',
            'longitude': '',
            'is_published': True,
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data['title'], 'Banani Modern Villa')
        self.assertEqual(response.data['garage'], 0)
        self.assertIsNone(response.data['year_built'])

    def test_create_property_non_agent_forbidden(self):
        self.client.force_authenticate(user=self.other_user)
        data = {
            'title': 'Forbidden Villa',
            'price': 10000000,
            'property_type': 'house',
            'city': 'Dhaka',
            'address': 'Street 1',
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_property_owner_success(self):
        self.client.force_authenticate(user=self.agent)
        response = self.client.patch(self.detail_url, {'price': 38000000})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.property1.refresh_from_db()
        self.assertEqual(self.property1.price, 38000000)

    def test_update_property_unauthorized_user_forbidden(self):
        other_agent = User.objects.create_user(email='otheragent@realestate.com', password='Password123!', is_agent=True)
        self.client.force_authenticate(user=other_agent)
        response = self.client.patch(self.detail_url, {'price': 10000000})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_property_owner_success(self):
        self.client.force_authenticate(user=self.agent)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Property.objects.filter(pk=self.property1.pk).exists())

    def test_featured_properties(self):
        response = self.client.get(self.featured_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_my_listings_agent(self):
        self.client.force_authenticate(user=self.agent)
        response = self.client.get(self.my_listings_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Agent sees both published and draft listings (total 2)
        self.assertEqual(len(response.data['results']), 2)
