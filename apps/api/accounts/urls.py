from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, auth_views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'roles', views.RoleViewSet)
router.register(r'user-roles', views.UserRoleViewSet)

urlpatterns = router.urls + [
    path('auth/login/', auth_views.login, name='auth-login'),
    path('auth/register/', auth_views.register, name='auth-register'),
    path('auth/refresh/', auth_views.refresh_token, name='auth-refresh'),
    path('auth/me/', auth_views.me, name='auth-me'),
    path('dashboard/stats/', auth_views.dashboard_stats, name='dashboard-stats'),
]
