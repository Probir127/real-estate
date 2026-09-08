from django.test import TestCase
from rest_framework.test import APIClient

from .models import SiteContent


class SiteContentApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_missing_content_returns_safe_empty_document(self):
        response = self.client.get("/api/homepage/navigation/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["content"], {})

    def test_active_content_is_public(self):
        SiteContent.objects.create(
            key="navigation",
            content={"brand": {"name": "Managed Zennor"}},
        )
        response = self.client.get("/api/homepage/navigation/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json()["content"]["brand"]["name"],
            "Managed Zennor",
        )
        response = self.client.get("/api/content/navigation/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["content"]["brand"]["name"], "Managed Zennor")

    def test_inactive_content_is_not_published(self):
        SiteContent.objects.create(
            key="footer",
            content={"motto": "Do not show"},
            is_active=False,
        )
        response = self.client.get("/api/homepage/footer/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["content"], {})
