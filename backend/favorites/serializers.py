from rest_framework import serializers
from .models import Favorite
from properties.models import Property
from properties.serializers import PropertyListSerializer


class FavoriteSerializer(serializers.ModelSerializer):
    """
    Serializer for saved/favorited properties.
    - property_id (write) — the ID of the property to favorite
    - property_detail (read) — full property card data returned in responses
    """
    property_detail = PropertyListSerializer(source='property', read_only=True)
    property_id = serializers.PrimaryKeyRelatedField(
        source='property',
        queryset=Property.objects.filter(is_published=True),
        write_only=True
    )

    class Meta:
        model = Favorite
        fields = ['id', 'property_id', 'property_detail', 'created_at']
        read_only_fields = ['created_at']

    def validate(self, attrs):
        """Prevent duplicates at the serializer level (DB unique_together is the final guard)."""
        user = self.context['request'].user
        property_obj = attrs['property']
        if Favorite.objects.filter(user=user, property=property_obj).exists():
            raise serializers.ValidationError("You have already saved this property.")
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
