import uuid

from django.conf import settings
from django.db import models


class PaymentOrder(models.Model):
    PLAN_CHOICES = (
        ('agent', 'Agent'),
        ('agency', 'Agency'),
        ('developer', 'Developer'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='payment_orders')
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES)
    billing_cycle = models.CharField(max_length=10, choices=(('monthly', 'Monthly'), ('yearly', 'Yearly')))
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='BDT')
    transaction_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    gateway_transaction_id = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')
    gateway_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.plan} / {self.user.email} / {self.status}'
