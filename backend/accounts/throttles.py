"""
Custom throttle classes for specific endpoints.
These are referenced in views via throttle_classes = [...].
Rates are defined in settings.py REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'].
"""
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """5 login attempts per minute per IP — brute-force protection."""
    scope = 'login'


class RegisterRateThrottle(AnonRateThrottle):
    """10 registrations per hour per IP — prevents mass account creation."""
    scope = 'register'


class InquiryRateThrottle(AnonRateThrottle):
    """20 inquiries per day per IP — prevents spam contact forms."""
    scope = 'inquiry'
