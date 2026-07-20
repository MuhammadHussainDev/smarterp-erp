from django.urls import path
from . import views

urlpatterns = [
    path('<uuid:pk>/complete/', views.EmployeeTrainingViewSet.as_view({'patch': 'complete'})),
]
