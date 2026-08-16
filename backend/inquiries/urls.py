from django.urls import path
from .views import InquiryCreateView, AgentInquiryListView, MarkInquiryReadView

urlpatterns = [
    path('', InquiryCreateView.as_view(), name='inquiry-create'),
    path('received/', AgentInquiryListView.as_view(), name='inquiry-list'),
    path('<int:pk>/read/', MarkInquiryReadView.as_view(), name='inquiry-mark-read'),
]
