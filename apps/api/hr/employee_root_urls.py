from django.urls import path
from . import views

urlpatterns = [
    path('employees/', views.EmployeeViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('employees/<uuid:pk>/', views.EmployeeViewSet.as_view({
        'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'
    })),
]
