from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('tenants.urls')),
    path('api/v1/', include('accounts.urls')),
    path('api/v1/', include('crm.urls')),
    path('api/v1/', include('sales.urls')),
    path('api/v1/', include('purchasing.urls')),
    path('api/v1/', include('inventory.urls')),
    path('api/v1/', include('accounting.urls')),
    path('api/v1/', include('hr.urls')),
    path('api/v1/', include('payroll.urls')),
    path('api/v1/', include('notifications_app.urls')),
    path('api/v1/', include('audit.urls')),
    path('api/v1/', include('recruitment.urls')),
    path('api/v1/', include('ai_app.urls')),
    path('api/v1/', include('settings_app.urls')),
]
