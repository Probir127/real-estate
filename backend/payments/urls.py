from django.urls import path

from .views import (
    CreateCheckoutView,
    PaymentOrderListView,
    payment_cancel,
    payment_fail,
    payment_ipn,
    payment_success,
)

urlpatterns = [
    path('checkout/', CreateCheckoutView.as_view(), name='payment_checkout'),
    path('orders/', PaymentOrderListView.as_view(), name='payment_orders'),
    path('success/', payment_success, name='payment_success'),
    path('fail/', payment_fail, name='payment_fail'),
    path('cancel/', payment_cancel, name='payment_cancel'),
    path('ipn/', payment_ipn, name='payment_ipn'),
]
