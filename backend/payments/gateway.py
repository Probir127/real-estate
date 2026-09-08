import requests
from django.conf import settings


PLANS = {
    'agent': {'monthly': 2500, 'yearly': 25000},
    'agency': {'monthly': 9500, 'yearly': 95000},
    'developer': {'monthly': 35000, 'yearly': 350000},
}


def initiate_checkout(order, user):
    if not settings.SSLCOMMERZ_STORE_ID or not settings.SSLCOMMERZ_STORE_PASSWORD:
        raise RuntimeError('SSLCommerz credentials are not configured.')
    base_url = (
        'https://sandbox.sslcommerz.com'
        if settings.SSLCOMMERZ_IS_SANDBOX
        else 'https://securepay.sslcommerz.com'
    )
    payload = {
        'store_id': settings.SSLCOMMERZ_STORE_ID,
        'store_passwd': settings.SSLCOMMERZ_STORE_PASSWORD,
        'total_amount': str(order.amount),
        'currency': order.currency,
        'tran_id': str(order.transaction_id),
        'success_url': settings.SSLCOMMERZ_SUCCESS_URL,
        'fail_url': settings.SSLCOMMERZ_FAIL_URL,
        'cancel_url': settings.SSLCOMMERZ_CANCEL_URL,
        'ipn_url': settings.SSLCOMMERZ_IPN_URL,
        'cus_name': user.full_name,
        'cus_email': user.email,
        'cus_phone': user.phone or '01700000000',
        'product_name': f'Zennor {order.get_plan_display()} subscription',
        'product_category': 'subscription',
        'product_profile': 'general',
        'shipping_method': 'NO',
        'num_of_item': 1,
    }
    response = requests.post(f'{base_url}/gwprocess/v4/api.php', data=payload, timeout=15)
    response.raise_for_status()
    data = response.json()
    if data.get('status') != 'SUCCESS' or not data.get('GatewayPageURL'):
        raise RuntimeError(data.get('failedreason') or 'SSLCommerz could not start checkout.')
    return data


def validate_transaction(payload):
    if not settings.SSLCOMMERZ_STORE_ID or not settings.SSLCOMMERZ_STORE_PASSWORD:
        raise RuntimeError('SSLCommerz credentials are not configured.')
    base_url = (
        'https://sandbox.sslcommerz.com'
        if settings.SSLCOMMERZ_IS_SANDBOX
        else 'https://securepay.sslcommerz.com'
    )
    response = requests.get(
        f'{base_url}/validator/api/validationserverAPI.php',
        params={
            'val_id': payload.get('val_id'),
            'store_id': settings.SSLCOMMERZ_STORE_ID,
            'store_passwd': settings.SSLCOMMERZ_STORE_PASSWORD,
            'format': 'json',
        },
        timeout=15,
    )
    response.raise_for_status()
    return response.json()
