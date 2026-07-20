from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('accounts.urls')),
    path('api/v1/', include('tenants.urls')),
    path('api/v1/crm/', include('crm.urls')),
    path('api/v1/sales/', include('sales.urls')),
    path('api/v1/purchasing/', include('purchasing.urls')),
    path('api/v1/inventory/', include('inventory.urls')),
    path('api/v1/warehouse/', include('inventory.urls')),
    path('api/v1/accounting/', include('accounting.urls')),
    path('api/v1/hr/', include('hr.urls')),
    path('api/v1/hr/', include('recruitment.hr_urls')),
    path('api/v1/', include('hr.employee_root_urls')),
    path('api/v1/employee-training/', include('payroll.employee_training_urls')),
    path('api/v1/payroll/', include('payroll.urls')),
    path('api/v1/notifications/', include('notifications_app.urls')),
    path('api/v1/audit/', include('audit.urls')),
    path('api/v1/recruitment/', include('recruitment.urls')),
    path('api/v1/ai/', include('ai_app.urls')),
    path('api/v1/companies/', include('settings_app.urls')),
    path('api/v1/settings/', include('settings_app.urls')),
    path('api/v1/reports/', include('accounting.frontend_report_urls')),
]
