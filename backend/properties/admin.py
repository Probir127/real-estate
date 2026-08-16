from django.contrib import admin
from .models import Property, PropertyImage


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    fields = ['image', 'alt_text', 'is_primary']


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'city', 'price', 'property_type', 'listing_type',
        'status', 'is_featured', 'is_published', 'agent', 'created_at'
    ]
    list_filter = ['property_type', 'listing_type', 'status', 'is_featured', 'is_published', 'city']
    search_fields = ['title', 'city', 'address', 'agent__email']
    ordering = ['-created_at']
    list_editable = ['is_featured', 'is_published']
    inlines = [PropertyImageInline]
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Listing Info', {'fields': ('title', 'description', 'price', 'property_type', 'listing_type', 'status')}),
        ('Location', {'fields': ('address', 'city', 'state', 'zip_code', 'latitude', 'longitude')}),
        ('Details', {'fields': ('bedrooms', 'bathrooms', 'area_sqft', 'garage', 'year_built', 'features')}),
        ('Agent & Flags', {'fields': ('agent', 'is_featured', 'is_published')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ['property', 'is_primary', 'alt_text', 'uploaded_at']
    list_filter = ['is_primary']
