from django.contrib import admin
from .models import Inquiry


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'property', 'agent', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['name', 'email', 'property__title', 'agent__email']
    ordering = ['-created_at']
    list_editable = ['is_read']
    readonly_fields = ['created_at', 'sender_user']
