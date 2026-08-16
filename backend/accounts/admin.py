from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'full_name', 'is_agent', 'is_staff', 'is_active', 'date_joined']
    list_filter = ['is_agent', 'is_staff', 'is_active']
    search_fields = ['email', 'full_name', 'phone']
    ordering = ['-date_joined']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'phone', 'avatar', 'bio')}),
        ('Roles & Permissions', {'fields': ('is_agent', 'is_staff', 'is_superuser', 'is_active', 'groups', 'user_permissions')}),
        ('Dates', {'fields': ('date_joined', 'last_login')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password1', 'password2', 'is_agent', 'is_staff'),
        }),
    )
    readonly_fields = ['date_joined', 'last_login']
