from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

router = DefaultRouter()
router.register(r'accounts', views.AccountViewSet)
router.register(r'journal-entries', views.JournalEntryViewSet)
router.register(r'journal-entry-lines', views.JournalEntryLineViewSet)
router.register(r'budgets', views.BudgetViewSet)
router.register(r'tax-rates', views.TaxRateViewSet)
router.register(r'reports', views.ReportViewSet, basename='reports')

urlpatterns = [
    path('', include(router.urls)),
    path('reports/sales-summary/', views.FrontendReportViewSet.as_view({'get': 'sales_summary'})),
    path('reports/purchase-summary/', views.FrontendReportViewSet.as_view({'get': 'purchase_summary'})),
    path('reports/inventory-valuation/', views.FrontendReportViewSet.as_view({'get': 'inventory_valuation'})),
    path('reports/customer-analysis/', views.FrontendReportViewSet.as_view({'get': 'customer_analysis'})),
    path('reports/employee-summary/', views.FrontendReportViewSet.as_view({'get': 'employee_summary'})),
    path('reports/financial-summary/', views.FrontendReportViewSet.as_view({'get': 'financial_summary'})),
]
