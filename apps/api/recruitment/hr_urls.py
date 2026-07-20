from django.urls import path
from . import views

urlpatterns = [
    path('recruitment/', views.RecruitmentViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('recruitment/<uuid:pk>/', views.RecruitmentViewSet.as_view({
        'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'
    })),
]
