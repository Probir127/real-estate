"""
Custom DRF permissions used across all apps.

IsAgent    — user must be authenticated AND have is_agent=True
IsOwner    — user must be authenticated AND own the object (obj.agent == request.user)
IsReadOnly — only safe HTTP methods (GET, HEAD, OPTIONS) are allowed
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAgent(BasePermission):
    """
    Allow access only to authenticated users who are agents or staff/superuser.
    Used for: creating properties, viewing own inquiries.
    """
    message = "Only registered agents or administrators can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_agent or request.user.is_staff or request.user.is_superuser)
        )


class IsOwnerOrReadOnly(BasePermission):
    """
    Object-level permission.
    - Read (GET/HEAD/OPTIONS): allowed for everyone
    - Write (PUT/PATCH/DELETE): owner (obj.agent == request.user) or staff/superuser
    """
    message = "You do not have permission to modify this resource."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user
            and request.user.is_authenticated
            and (obj.agent == request.user or request.user.is_staff or request.user.is_superuser)
        )


class IsOwner(BasePermission):
    """
    Object-level permission — only the owner or staff can access.
    Used for favorites.
    """
    message = "You do not have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        return bool(
            request.user
            and request.user.is_authenticated
            and (obj.user == request.user or request.user.is_staff or request.user.is_superuser)
        )


class IsAgentOrReadOnly(BasePermission):
    """
    Allow agents/staff to write, everyone to read.
    Used as view-level permission on PropertyViewSet.
    """
    message = "Only agents or administrators can create or modify listings."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_agent or request.user.is_staff or request.user.is_superuser)
        )
