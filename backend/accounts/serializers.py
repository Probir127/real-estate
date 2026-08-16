"""
Serializers for accounts app.
Handles: registration, login, profile view/update, password change.
All passwords are write-only and never returned in responses.
"""
import bleach
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends the default JWT serializer to include user info in the token response.
    Returns: access, refresh, user_id, email, full_name, is_agent.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        # Append extra user info alongside the tokens
        data['user_id'] = self.user.id
        data['email'] = self.user.email
        data['full_name'] = self.user.full_name
        data['is_agent'] = self.user.is_agent
        data['is_staff'] = self.user.is_staff
        data['is_superuser'] = self.user.is_superuser
        return data


class RegisterSerializer(serializers.ModelSerializer):
    """
    Registration serializer.
    - password is write-only and validated against Django's password validators
    - password2 is a confirmation field — not stored
    - email is normalized and checked for uniqueness at the serializer level
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label='Confirm Password'
    )

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone', 'is_agent', 'password', 'password2']
        extra_kwargs = {
            'email': {'required': True},
            'full_name': {'required': True},
        }

    def validate_full_name(self, value):
        """Sanitize full_name to prevent XSS."""
        return bleach.clean(value.strip())

    def validate_email(self, value):
        """Ensure email is lowercase and unique (case-insensitive)."""
        email = value.lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate(self, attrs):
        """Object-level validation: ensure passwords match."""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Read/update profile. Password is excluded entirely.
    Avatar upload is handled via multipart.
    """
    email = serializers.EmailField(read_only=True)   # Email cannot be changed
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'phone',
            'is_agent', 'avatar', 'avatar_url', 'bio', 'date_joined'
        ]
        extra_kwargs = {
            'avatar': {'write_only': True, 'required': False},
            'date_joined': {'read_only': True},
        }

    def get_avatar_url(self, obj):
        """Return absolute URL for avatar if it exists."""
        if obj.avatar:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None

    def validate_full_name(self, value):
        return bleach.clean(value.strip())

    def validate_bio(self, value):
        return bleach.clean(value.strip())

    def validate_avatar(self, value):
        """
        Validate uploaded avatar:
        - Must be jpeg, png, or webp
        - Must be under 5 MB
        """
        from django.conf import settings
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


class ChangePasswordSerializer(serializers.Serializer):
    """
    Allows authenticated users to change their own password.
    Requires the current password for verification.
    """
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    new_password2 = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "New passwords do not match."})
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
