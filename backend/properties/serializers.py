"""
Serializers for the properties app.

PropertyImageSerializer  — handles single image with absolute URL
AgentSerializer          — minimal agent info embedded in property responses
PropertyListSerializer   — lightweight serializer for list views (fast)
PropertyDetailSerializer — full serializer for detail/write operations
"""
import bleach
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Property, PropertyImage

User = get_user_model()


class PropertyImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'image_url', 'alt_text', 'is_primary']
        extra_kwargs = {'image': {'write_only': True}}

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.external_url:
            return obj.external_url
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

    def validate_image(self, value):
        allowed_types = getattr(settings, 'ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/webp'])
        max_size = getattr(settings, 'MAX_IMAGE_SIZE', 5 * 1024 * 1024)
        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                f"Invalid image type. Allowed: {', '.join(allowed_types)}"
            )
        if value.size > max_size:
            raise serializers.ValidationError(
                f"Image size must be under {max_size // (1024*1024)} MB."
            )
        return value


class AgentSerializer(serializers.ModelSerializer):
    """Minimal agent info embedded in property responses."""
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'phone', 'avatar_url']

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar:
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None


class PropertyListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for property list pages.
    Only returns what the card UI needs — avoids n+1 by selecting primary image.
    """
    primary_image_url = serializers.SerializerMethodField()
    agent_name = serializers.CharField(source='agent.full_name', read_only=True)
    listing_type_display = serializers.CharField(source='get_listing_type_display', read_only=True)
    property_type_display = serializers.CharField(source='get_property_type_display', read_only=True)
    is_favorited = serializers.SerializerMethodField()
    favorite_id = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'price', 'listing_type', 'listing_type_display',
            'property_type', 'property_type_display',
            'city', 'state', 'address',
            'bedrooms', 'bathrooms', 'area_sqft',
            'is_featured', 'status',
            'primary_image_url', 'agent_name',
            'is_favorited', 'favorite_id', 'created_at',
        ]

    def get_primary_image_url(self, obj):
        request = self.context.get('request')
        img = obj.primary_image
        if img:
            if img.external_url:
                return img.external_url
            if img.image:
                return request.build_absolute_uri(img.image.url) if request else img.image.url
        return None

    def get_is_favorited(self, obj):
        """Returns True if the requesting user has favorited this property."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False

    def get_favorite_id(self, obj):
        """Returns the Favorite record ID so the frontend can call DELETE /api/favorites/{id}/."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            fav = obj.favorited_by.filter(user=request.user).first()
            return fav.id if fav else None
        return None


class PropertyDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer for property detail view and create/update operations.
    Images are nested read-only; upload images via the /images/ sub-endpoint.
    """
    images = PropertyImageSerializer(many=True, read_only=True)
    agent = AgentSerializer(read_only=True)
    listing_type_display = serializers.CharField(source='get_listing_type_display', read_only=True)
    property_type_display = serializers.CharField(source='get_property_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    features_list = serializers.ReadOnlyField()
    is_favorited = serializers.SerializerMethodField()
    favorite_id = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'description', 'price',
            'property_type', 'property_type_display',
            'listing_type', 'listing_type_display',
            'status', 'status_display',
            'address', 'city', 'state', 'zip_code',
            'latitude', 'longitude',
            'bedrooms', 'bathrooms', 'area_sqft', 'garage', 'year_built',
            'features', 'features_list',
            'is_featured', 'is_published',
            'agent', 'images',
            'is_favorited', 'favorite_id',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['agent', 'created_at', 'updated_at']

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False

    def get_favorite_id(self, obj):
        """Returns the Favorite record ID for the authenticated user, enabling correct DELETE."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            fav = obj.favorited_by.filter(user=request.user).first()
            return fav.id if fav else None
        return None

    def validate_title(self, value):
        return bleach.clean(value.strip())

    def validate_description(self, value):
        return bleach.clean(value.strip())

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value

    def validate_address(self, value):
        return bleach.clean(value.strip())

    def create(self, validated_data):
        """Automatically assign the agent from the request user."""
        validated_data['agent'] = self.context['request'].user
        return super().create(validated_data)
