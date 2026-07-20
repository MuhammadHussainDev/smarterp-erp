from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationViewSet.as_view({'get': 'list'})),
    path('read/', views.NotificationViewSet.as_view({'delete': 'clear_read'})),
    path('unread-count/', views.NotificationViewSet.as_view({'get': 'unread_count'})),
    path('mark-all-read/', views.NotificationViewSet.as_view({'post': 'mark_all_read'})),
    path('<uuid:pk>/', views.NotificationViewSet.as_view({
        'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'
    })),
    path('<uuid:pk>/read/', views.NotificationViewSet.as_view({'patch': 'mark_read'})),
]
