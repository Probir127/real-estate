"""
Property models.

Property     — main listing (linked to an agent user)
PropertyImage — multiple images per property (one marked is_primary)
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Property(models.Model):

    class PropertyType(models.TextChoices):
        HOUSE = 'house', 'House'
        APARTMENT = 'apartment', 'Apartment'
        CONDO = 'condo', 'Condo'
        TOWNHOUSE = 'townhouse', 'Townhouse'
        LAND = 'land', 'Land'
        COMMERCIAL = 'commercial', 'Commercial'
        VILLA = 'villa', 'Villa'

    class ListingType(models.TextChoices):
        SALE = 'sale', 'For Sale'
        RENT = 'rent', 'For Rent'

    class StatusChoice(models.TextChoices):
        ACTIVE = 'active', 'Active'
        PENDING = 'pending', 'Pending'
        SOLD = 'sold', 'Sold'
        RENTED = 'rented', 'Rented'

    # Core fields
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(
        max_digits=14, decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    property_type = models.CharField(
        max_length=20, choices=PropertyType.choices, default=PropertyType.HOUSE
    )
    listing_type = models.CharField(
        max_length=10, choices=ListingType.choices, default=ListingType.SALE
    )
    status = models.CharField(
        max_length=10, choices=StatusChoice.choices, default=StatusChoice.ACTIVE
    )

    # Location
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

    # Details
    bedrooms = models.PositiveSmallIntegerField(default=0)
    bathrooms = models.PositiveSmallIntegerField(default=0)
    area_sqft = models.PositiveIntegerField(default=0)
    garage = models.PositiveSmallIntegerField(default=0)
    year_built = models.PositiveSmallIntegerField(null=True, blank=True)

    # Features (stored as comma-separated for simplicity)
    features = models.TextField(blank=True, help_text="Comma-separated: 'Pool, Garden, Gym'")

    # Relationships
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='properties',
        limit_choices_to={'is_agent': True}
    )

    # Flags
    is_featured = models.BooleanField(default=False, db_index=True)
    is_published = models.BooleanField(default=True, db_index=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Property'
        verbose_name_plural = 'Properties'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['city', 'property_type']),
            models.Index(fields=['price', 'is_published']),
            models.Index(fields=['is_featured', 'is_published']),
        ]

    def __str__(self):
        return f"{self.title} — {self.city} ({self.get_listing_type_display()})"

    @property
    def primary_image(self):
        # Use prefetched in-memory images cache if available to avoid N+1 query overhead
        if hasattr(self, '_prefetched_objects_cache') and 'images' in self._prefetched_objects_cache:
            images = self._prefetched_objects_cache['images']
            primary = next((img for img in images if img.is_primary), None)
            return primary or (images[0] if images else None)
        img = self.images.filter(is_primary=True).first()
        if not img:
            img = self.images.first()
        return img

    @property
    def features_list(self):
        if self.features:
            return [f.strip() for f in self.features.split(',') if f.strip()]
        return []


def property_image_upload_path(instance, filename):
    """Organise images into per-property folders: media/properties/<id>/<filename>"""
    return f"properties/{instance.property.id}/{filename}"


class PropertyImage(models.Model):
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name='images'
    )
    image = models.ImageField(upload_to=property_image_upload_path, blank=True, null=True)
    external_url = models.URLField(max_length=500, blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Property Image'
        verbose_name_plural = 'Property Images'
        ordering = ['-is_primary', 'uploaded_at']

    def __str__(self):
        return f"Image for {self.property.title} ({'Primary' if self.is_primary else 'Secondary'})"

    def save(self, *args, **kwargs):
        """Ensure only one primary image per property."""
        if self.is_primary:
            PropertyImage.objects.filter(
                property=self.property, is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)
