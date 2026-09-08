from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
import requests
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .gateway import PLANS, initiate_checkout, validate_transaction
from .models import PaymentOrder
from .serializers import PaymentOrderCreateSerializer, PaymentOrderSerializer


class CreateCheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PaymentOrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan = serializer.validated_data['plan']
        cycle = serializer.validated_data['billing_cycle']
        order = PaymentOrder.objects.create(
            user=request.user,
            plan=plan,
            billing_cycle=cycle,
            amount=Decimal(PLANS[plan][cycle]),
        )
        try:
            gateway_data = initiate_checkout(order, request.user)
        except (RuntimeError, OSError, requests.RequestException) as exc:
            order.status = 'failed'
            order.gateway_payload = {'error': str(exc)}
            order.save(update_fields=('status', 'gateway_payload', 'updated_at'))
            return Response({'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        order.gateway_payload = {'session': gateway_data.get('sessionkey')}
        order.save(update_fields=('gateway_payload', 'updated_at'))
        return Response({
            'order': PaymentOrderSerializer(order).data,
            'checkout_url': gateway_data['GatewayPageURL'],
        }, status=status.HTTP_201_CREATED)


class PaymentOrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = PaymentOrder.objects.filter(user=request.user)
        return Response(PaymentOrderSerializer(orders, many=True).data)


def _complete_payment(payload):
    transaction_id = payload.get('tran_id')
    if not transaction_id:
        return False
    with transaction.atomic():
        order = PaymentOrder.objects.select_for_update().filter(transaction_id=transaction_id).first()
        if not order or order.status == 'paid':
            return False
        try:
            validation = validate_transaction(payload)
        except (RuntimeError, OSError, requests.RequestException, ValueError):
            return False
        valid = validation.get('status') in ('VALID', 'VALIDATED')
        valid_amount = Decimal(str(validation.get('amount', '0'))) == order.amount
        valid_currency = validation.get('currency') == order.currency
        valid_transaction = validation.get('tran_id') == transaction_id
        if not (valid and valid_amount and valid_currency and valid_transaction):
            order.status = 'failed'
            order.gateway_payload = {
                'status': validation.get('status'),
                'tran_id': validation.get('tran_id'),
                'val_id': validation.get('val_id'),
                'currency': validation.get('currency'),
            }
            order.save(update_fields=('status', 'gateway_payload', 'updated_at'))
            return False
        order.status = 'paid'
        order.gateway_transaction_id = validation.get('bank_tran_id', '')
        order.gateway_payload = {
            'status': validation.get('status'),
            'tran_id': validation.get('tran_id'),
            'val_id': validation.get('val_id'),
            'bank_tran_id': validation.get('bank_tran_id'),
            'currency': validation.get('currency'),
        }
        order.save(update_fields=('status', 'gateway_transaction_id', 'gateway_payload', 'updated_at'))
        return True


@csrf_exempt
def payment_success(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'POST required.'}, status=405)
    paid = _complete_payment(request.POST)
    return redirect(f'{settings.FRONTEND_APP_URL}/billing/{("success" if paid else "failed")}')


@csrf_exempt
def payment_ipn(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'POST required.'}, status=405)
    return JsonResponse({'received': _complete_payment(request.POST)}, status=200)


@csrf_exempt
def payment_fail(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'POST required.'}, status=405)
    transaction_id = request.POST.get('tran_id')
    PaymentOrder.objects.filter(transaction_id=transaction_id, status='pending').update(status='failed')
    return redirect(f'{settings.FRONTEND_APP_URL}/billing/failed')


@csrf_exempt
def payment_cancel(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'POST required.'}, status=405)
    transaction_id = request.POST.get('tran_id')
    PaymentOrder.objects.filter(transaction_id=transaction_id, status='pending').update(status='cancelled')
    return redirect(f'{settings.FRONTEND_APP_URL}/billing/cancelled')
