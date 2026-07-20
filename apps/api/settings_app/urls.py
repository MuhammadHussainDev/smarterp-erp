from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

router = DefaultRouter()
router.register(r'branches', views.BranchViewSet)
router.register(r'departments', views.DepartmentViewSet)

company_list = views.CompanyViewSet.as_view({'get': 'list', 'post': 'create'})
company_detail = views.CompanyViewSet.as_view({
    'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'
})
company_current = views.CompanyViewSet.as_view({'get': 'current', 'patch': 'current', 'post': 'current'})

urlpatterns = [
    path('current/', company_current),
    path('', company_list),
    path('<uuid:pk>/', company_detail),
    path('', include(router.urls)),
]
