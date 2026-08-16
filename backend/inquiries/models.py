from django.db import models
from properties.models import Property
from django.conf import settings


class Inquiry(models.Model):
    """
    A contact message sent by a visitor to the listing agent.
    sender_user is optional — allows anonymous inquiries.
    """
    # Sender info (denormalized so anonymous users can also send)
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    message = models.TextField()

    # Relations
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='inquiries'
    )
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_inquiries',
        null=True, blank=True
    )
    # If the inquiry was sent by a logged-in user
    sender_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='sent_inquiries'
    )

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Inquiry'
        verbose_name_plural = 'Inquiries'
        ordering = ['-created_at']

    def __str__(self):
        return f"Inquiry from {self.email} about '{self.property.title}'"
