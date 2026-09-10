"""
Custom authentication backend for case-insensitive email lookup
and flexible login handling (e.g. entering username prefix or trimmed email).
"""
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class CaseInsensitiveEmailBackend(ModelBackend):
    """
    Allows authentication with email case-insensitively,
    and supports entering username prefix (e.g. 'admin' for 'admin@zennor.bd').
    """
    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        login_id = email or username or kwargs.get('email') or kwargs.get('username')
        if not login_id or not password:
            return None
        login_id = str(login_id).strip()

        # 1. Try exact email (case-insensitive)
        user = User.objects.filter(email__iexact=login_id).first()

        # 2. Try prefix if no '@' was provided (e.g. 'admin' -> 'admin@zennor.bd')
        if not user and '@' not in login_id:
            user = User.objects.filter(email__istartswith=f"{login_id}@").first()

        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
