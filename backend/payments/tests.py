from decimal import Decimal
from unittest.mock import patch

from django.urls import reverse
from rest_framework.test import APITestCase

from accounts.models import User
from .models import PaymentOrder


class PaymentCheckoutTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='agent@example.com',
            password='strong-password-123',
            full_name='Test Agent',
            is_agent=True,
        )
        self.client.force_authenticate(self.user)

    @patch('payments.views.initiate_checkout')
    def test_checkout_creates_pending_order_and_returns_gateway_url(self, initiate):
        initiate.return_value = {
            'status': 'SUCCESS',
            'GatewayPageURL': 'https://sandbox.sslcommerz.com/checkout/test',
            'sessionkey': 'session-key',
        }
        response = self.client.post(
            reverse('payment_checkout'),
            {'plan': 'agent', 'billing_cycle': 'monthly'},
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['checkout_url'], initiate.return_value['GatewayPageURL'])
        order = PaymentOrder.objects.get()
        self.assertEqual(order.amount, Decimal('2500.00'))
        self.assertEqual(order.status, 'pending')

    def test_checkout_rejects_invalid_plan(self):
        response = self.client.post(
            reverse('payment_checkout'),
            {'plan': 'free', 'billing_cycle': 'monthly'},
            format='json',
        )
        self.assertEqual(response.status_code, 400)

    @patch('payments.views.validate_transaction')
    def test_success_callback_marks_order_paid_after_gateway_validation(self, validate):
        order = PaymentOrder.objects.create(
            user=self.user,
            plan='agent',
            billing_cycle='monthly',
            amount=Decimal('2500.00'),
        )
        validate.return_value = {
            'status': 'VALID',
            'amount': '2500.00',
            'currency': 'BDT',
            'tran_id': str(order.transaction_id),
            'bank_tran_id': 'bank-123',
        }
        response = self.client.post(
            reverse('payment_success'),
            {'tran_id': str(order.transaction_id), 'val_id': 'validation-id'},
        )
        self.assertEqual(response.status_code, 302)
        order.refresh_from_db()
        self.assertEqual(order.status, 'paid')
        self.assertEqual(order.gateway_transaction_id, 'bank-123')
