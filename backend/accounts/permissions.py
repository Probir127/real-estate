"""
Custom DRF permissions used across all apps.

IsAgent    — user must be authenticated AND have is_agent=True
IsOwner    — user must be authenticated AND own the object (obj.agent == request.user)
IsReadOnly — only safe HTTP methods (GET, HEAD, OPTIONS) are allowed
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAgent(BasePermission):
    """
    Allow access only to authenticated users who are agents.
    Used for: creating properties, viewing own inquiries.
    """
    message = "Only registered agents can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_agent
        )


class IsOwnerOrReadOnly(BasePermission):
    """
    Object-level permission.
    - Read (GET/HEAD/OPTIONS): allowed for everyone
    - Write (PUT/PATCH/DELETE): only the owner (obj.agent == request.user)
    """
    message = "You do not have permission to modify this resource."

    def has_object_permission(self, request, view, obj):
        # Safe methods are always allowed (public read)
        if request.method in SAFE_METHODS:
            return True
        # Check ownership — properties use `agent` FK
        return obj.agent == request.user


class IsOwner(BasePermission):
    """
    Object-level permission — only the owner can access (read or write).
    Used for favorites (user owns them).
    """
    message = "You do not have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsAgentOrReadOnly(BasePermission):
    """
    Allow agents to write, everyone to read.
    Used as view-level permission on PropertyViewSet.
    """
    message = "Only agents can create or modify listings."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_agent
        )
