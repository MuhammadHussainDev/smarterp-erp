from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    filterset_fields = ['type', 'is_read']

    def get_queryset(self):
        return super().get_queryset().filter(
            tenant=self.request.user.tenant,
            user=self.request.user,
        )

    @action(detail=True, methods=['patch'], url_path='read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        Notification.objects.filter(
            tenant=request.user.tenant,
            user=self.request.user,
            is_read=False
        ).update(is_read=True)
        return Response({'status': 'ok'})

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        count = Notification.objects.filter(
            tenant=request.user.tenant,
            user=self.request.user,
            is_read=False
        ).count()
        return Response({'count': count})

    @action(detail=False, methods=['delete'], url_path='read')
    def clear_read(self, request):
        Notification.objects.filter(
            tenant=request.user.tenant,
            user=self.request.user,
            is_read=True
        ).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
