from django.contrib import admin

from .models import HomepageContent


@admin.register(HomepageContent)
class HomepageContentAdmin(admin.ModelAdmin):
    list_display = ['key', 'updated_at']
    readonly_fields = ['updated_at']

