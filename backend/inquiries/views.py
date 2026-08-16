from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Inquiry
from .serializers import InquiryCreateSerializer, InquiryListSerializer
from accounts.permissions import IsAgent
from accounts.throttles import InquiryRateThrottle


class InquiryCreateView(generics.CreateAPIView):
    """
    POST /api/inquiries/
    Anyone (including anonymous visitors) can submit an inquiry.
    Rate-limited to 20/day per IP to prevent spam.
    Auto-assigns the agent from the property's agent field.
    """
    serializer_class = InquiryCreateSerializer
    permission_classes = [AllowAny]
    throttle_classes = [InquiryRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'success': True, 'message': 'Your inquiry has been sent to the agent.'},
            status=status.HTTP_201_CREATED
        )


class AgentInquiryListView(generics.ListAPIView):
    """
    GET /api/inquiries/
    Agents see only their own received inquiries, newest first.
    Supports ?is_read=false to filter unread.
    """
    serializer_class = InquiryListSerializer
    permission_classes = [IsAuthenticated, IsAgent]

    def get_queryset(self):
        queryset = Inquiry.objects.filter(
            agent=self.request.user
        ).select_related('property').order_by('-created_at')
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        return queryset


class MarkInquiryReadView(generics.UpdateAPIView):
    """
    PATCH /api/inquiries/<id>/read/
    Agents can mark an inquiry as read.
    """
    serializer_class = InquiryListSerializer
    permission_classes = [IsAuthenticated, IsAgent]
    http_method_names = ['patch']

    def get_queryset(self):
        return Inquiry.objects.filter(agent=self.request.user)

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_read = True
        instance.save(update_fields=['is_read'])
        return Response(
            {'success': True, 'message': 'Inquiry marked as read.'},
            status=status.HTTP_200_OK
        )
