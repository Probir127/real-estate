"""
Django-filter FilterSet for Property model.
Enables: /api/properties/?city=NYC&min_price=100000&max_price=500000&bedrooms=3
"""
import django_filters
from .models import Property


class PropertyFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    min_area = django_filters.NumberFilter(field_name='area_sqft', lookup_expr='gte')
    max_area = django_filters.NumberFilter(field_name='area_sqft', lookup_expr='lte')
    min_bedrooms = django_filters.NumberFilter(field_name='bedrooms', lookup_expr='gte')
    city = django_filters.CharFilter(lookup_expr='icontains')
    state = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Property
        fields = [
            'property_type',
            'listing_type',
            'status',
            'city',
            'state',
            'bedrooms',
            'bathrooms',
            'is_featured',
        ]
