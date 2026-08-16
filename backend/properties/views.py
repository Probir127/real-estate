"""
Views for the properties app.

PropertyViewSet     — full CRUD, search, filter, pagination
FeaturedProperties  — GET /api/properties/featured/
PropertyImageUpload — POST /api/properties/<id>/images/
AgentProperties     — GET /api/properties/my-listings/
"""
from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend

from .models import Property, PropertyImage
from .serializers import (
    PropertyListSerializer,
    PropertyDetailSerializer,
    PropertyImageSerializer,
)
from .filters import PropertyFilter
from accounts.permissions import IsAgentOrReadOnly, IsOwnerOrReadOnly


class PropertyViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for properties.

    List/Retrieve:  Public (anyone can view published listings)
    Create:         JWT + IsAgent
    Update/Delete:  JWT + IsOwner (must be the listing's agent)

    Filtering:  ?property_type=house&city=NYC&min_price=200000&max_price=800000
    Searching:  ?search=Brooklyn (searches title, description, city, address)
    Ordering:   ?ordering=-price or ?ordering=created_at
    Pagination: 12 per page, ?page=2
    """
    queryset = Property.objects.filter(
        is_published=True
    ).select_related('agent').prefetch_related('images').order_by('-created_at')

    permission_classes = [IsAgentOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PropertyFilter
    search_fields = ['title', 'description', 'city', 'address', 'state']
    ordering_fields = ['price', 'created_at', 'area_sqft', 'bedrooms']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Use lightweight serializer for list views, full serializer otherwise."""
        if self.action == 'list':
            return PropertyListSerializer
        return PropertyDetailSerializer

    def get_permissions(self):
        """
        Granular permission per action:
        - list, retrieve, featured, search → public
        - create → must be authenticated agent
        - update, partial_update, destroy → must be owner
        """
        if self.action in ['list', 'retrieve', 'featured']:
            return [AllowAny()]
        elif self.action == 'create':
            return [IsAuthenticated(), IsAgentOrReadOnly()]
        else:
            return [IsAuthenticated(), IsOwnerOrReadOnly()]

    def get_queryset(self):
        if self.action == 'my_listings':
            if self.request.user.is_authenticated and self.request.user.is_agent:
                return Property.objects.filter(agent=self.request.user).select_related('agent').prefetch_related('images').order_by('-created_at')
            return Property.objects.none()
        elif self.action in ['retrieve', 'update', 'partial_update', 'destroy', 'upload_image']:
            return Property.objects.all().select_related('agent').prefetch_related('images')
        return Property.objects.filter(is_published=True).select_related('agent').prefetch_related('images').order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(agent=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_object_permissions(request, instance)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_object_permissions(request, instance)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def featured(self, request):
        """GET /api/properties/featured/ — Returns up to 6 featured published listings."""
        queryset = Property.objects.filter(
            is_featured=True, is_published=True
        ).select_related('agent').prefetch_related('images').order_by('-created_at')[:6]
        serializer = PropertyListSerializer(queryset, many=True, context={'request': request})
        return Response({'results': serializer.data})

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_listings(self, request):
        """GET /api/properties/my-listings/ — Agent sees all their own listings (incl. unpublished)."""
        if not request.user.is_agent:
            return Response(
                {'message': 'Only agents can view listings.'},
                status=status.HTTP_403_FORBIDDEN
            )
        queryset = Property.objects.filter(
            agent=request.user
        ).select_related('agent').prefetch_related('images').order_by('-created_at')
        serializer = PropertyDetailSerializer(queryset, many=True, context={'request': request})
        return Response({'results': serializer.data})

    @action(
        detail=True, methods=['post'],
        permission_classes=[IsAuthenticated],
        parser_classes=[MultiPartParser, FormParser],
        url_path='images'
    )
    def upload_image(self, request, pk=None):
        """
        POST /api/properties/<id>/images/
        Upload one or more images for a property.
        Must be the property's owner.
        Form data: image (file), alt_text (str, optional), is_primary (bool, optional)
        """
        property_obj = self.get_object()
        if property_obj.agent != request.user:
            return Response(
                {'message': 'Only the listing agent can upload images.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = PropertyImageSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(property=property_obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PropertyImageDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/properties/images/<image_id>/
    Removes an image — only the property owner can delete.
    """
    queryset = PropertyImage.objects.all()
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.property.agent != request.user:
            return Response(
                {'message': 'Only the listing agent can delete images.'},
                status=status.HTTP_403_FORBIDDEN
            )
        instance.image.delete(save=False)  # Delete file from disk
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
