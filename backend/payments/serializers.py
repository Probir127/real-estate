from rest_framework import serializers

from .models import PaymentOrder


class PaymentOrderCreateSerializer(serializers.Serializer):
    plan = serializers.ChoiceField(choices=['agent', 'agency', 'developer'])
    billing_cycle = serializers.ChoiceField(choices=['monthly', 'yearly'])


class PaymentOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentOrder
        fields = ('id', 'plan', 'billing_cycle', 'amount', 'currency', 'transaction_id', 'status', 'created_at')
