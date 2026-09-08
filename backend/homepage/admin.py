from django.contrib import admin

from .models import HomepageContent, SiteContent


@admin.register(HomepageContent)
class HomepageContentAdmin(admin.ModelAdmin):
    list_display = ['key', 'updated_at']
    readonly_fields = ['updated_at']


@admin.register(SiteContent)
class SiteContentAdmin(admin.ModelAdmin):
    list_display = ['key', 'is_active', 'updated_at']
    list_filter = ['is_active']
    search_fields = ['key']
    readonly_fields = ['updated_at']
    fieldsets = [
        (None, {'fields': ['key', 'is_active', 'content']}),
        ('Metadata', {'fields': ['updated_at']}),
    ]
