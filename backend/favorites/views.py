from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Favorite
from .serializers import FavoriteSerializer


class FavoriteListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/favorites/  — List all of the authenticated user's favorites
    POST /api/favorites/  — Add a property to favorites
    Body: { "property_id": <int> }
    """
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(
            user=self.request.user
        ).select_related('property__agent').prefetch_related('property__images')


class FavoriteDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/favorites/<id>/  — Remove a saved property
    Only the owner of the favorite can delete it.
    """
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(
            {'success': True, 'message': 'Removed from favorites.'},
            status=status.HTTP_200_OK
        )
