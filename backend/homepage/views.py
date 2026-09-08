from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import HomepageContent, SiteContent


class HomepageContentView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        content = HomepageContent.objects.filter(key='default').first()
        return Response({
            'content': content.content if content else {},
            'updated_at': content.updated_at if content else None,
        })


class SiteContentView(APIView):
    """Return one published content document by key.

    Content is public because it only contains presentation data. Admins
    control publication with ``is_active`` in Django admin.
    """

    permission_classes = [AllowAny]

    def get(self, request, key):
        content = SiteContent.objects.filter(key=key, is_active=True).first()
        return Response({
            'key': key,
            'content': content.content if content else {},
            'updated_at': content.updated_at if content else None,
        })
