"""
Views for the accounts app.

Endpoints:
  POST /api/auth/register/        — Create account (throttled)
  POST /api/auth/login/           — Obtain JWT pair (throttled)
  POST /api/auth/refresh/         — Refresh access token
  POST /api/auth/logout/          — Blacklist refresh token
  GET  /api/auth/profile/         — Get own profile (JWT required)
  PUT  /api/auth/profile/         — Update own profile (JWT required)
  POST /api/auth/change-password/ — Change password (JWT required)
"""
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
)
from .throttles import LoginRateThrottle, RegisterRateThrottle


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Returns access + refresh tokens plus basic user info.
    Throttled to 5 requests/minute per IP (brute-force protection).
    """
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Creates a new user account.
    Throttled to 10 requests/hour per IP.
    Returns the new user's data (no tokens — user must log in separately).
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    throttle_classes = [RegisterRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'success': True,
                'message': 'Account created successfully. Please log in.',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'is_agent': user.is_agent,
                }
            },
            status=status.HTTP_201_CREATED
        )


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklists the refresh token so it cannot be used again.
    Body: { "refresh": "<refresh_token>" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'success': False, 'message': 'Refresh token is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {'success': True, 'message': 'Successfully logged out.'},
                status=status.HTTP_200_OK
            )
        except TokenError:
            return Response(
                {'success': False, 'message': 'Invalid or expired token.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/auth/profile/ — Retrieve own profile
    PUT  /api/auth/profile/ — Update own profile (supports multipart for avatar)
    PATCH /api/auth/profile/ — Partial update
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Always returns the currently authenticated user."""
        return self.request.user

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True  # Allow partial updates by default
        return super().update(request, *args, **kwargs)


class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Changes password after verifying the current one.
    Requires: { "old_password": "...", "new_password": "...", "new_password2": "..." }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response(
            {'success': True, 'message': 'Password updated successfully.'},
            status=status.HTTP_200_OK
        )
