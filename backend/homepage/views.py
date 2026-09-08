from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import HomepageContent


class HomepageContentView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        content = HomepageContent.objects.filter(key='default').first()
        return Response({
            'content': content.content if content else {},
            'updated_at': content.updated_at if content else None,
        })
