from django.urls import path
from . import views

urlpatterns = [
    path('', views.AuditLogViewSet.as_view({'get': 'list'})),
    path('<uuid:pk>/', views.AuditLogViewSet.as_view({'get': 'retrieve'})),
]
