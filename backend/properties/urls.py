from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, PropertyImageDeleteView

router = DefaultRouter()
router.register(r'', PropertyViewSet, basename='property')

urlpatterns = [
    path('', include(router.urls)),
    # Image delete: DELETE /api/properties/images/<pk>/
    path('images/<int:pk>/', PropertyImageDeleteView.as_view(), name='property-image-delete'),
]
