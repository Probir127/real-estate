import bleach
from rest_framework import serializers
from .models import Inquiry
from properties.models import Property


class InquiryCreateSerializer(serializers.ModelSerializer):
    """Used by visitors to submit a contact inquiry for a property."""
    property_id = serializers.PrimaryKeyRelatedField(
        source='property',
        queryset=Property.objects.filter(is_published=True)
    )

    class Meta:
        model = Inquiry
        fields = ['id', 'property_id', 'name', 'email', 'phone', 'message', 'created_at']
        read_only_fields = ['created_at']

    def validate_name(self, value):
        return bleach.clean(value.strip())

    def validate_message(self, value):
        return bleach.clean(value.strip())

    def validate_phone(self, value):
        return bleach.clean(value.strip())

    def create(self, validated_data):
        property_obj = validated_data['property']
        validated_data['agent'] = property_obj.agent
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['sender_user'] = request.user
        return super().create(validated_data)


class InquiryListSerializer(serializers.ModelSerializer):
    """Used by agents to see their received inquiries."""
    property_title = serializers.CharField(source='property.title', read_only=True)
    property_id = serializers.IntegerField(source='property.id', read_only=True)

    class Meta:
        model = Inquiry
        fields = [
            'id', 'name', 'email', 'phone', 'message',
            'property_id', 'property_title',
            'is_read', 'created_at'
        ]
        read_only_fields = ['created_at']
