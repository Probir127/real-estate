from django.contrib import admin

from .models import PaymentOrder


@admin.register(PaymentOrder)
class PaymentOrderAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'user', 'plan', 'billing_cycle', 'amount', 'status', 'created_at')
    list_filter = ('plan', 'billing_cycle', 'status')
    search_fields = ('user__email', 'user__full_name', 'gateway_transaction_id')
    readonly_fields = ('transaction_id', 'gateway_payload', 'created_at', 'updated_at')
