from django.urls import path
from . import views

urlpatterns = [
    path('sales-summary/', views.FrontendReportViewSet.as_view({'get': 'sales_summary'})),
    path('purchase-summary/', views.FrontendReportViewSet.as_view({'get': 'purchase_summary'})),
    path('inventory-valuation/', views.FrontendReportViewSet.as_view({'get': 'inventory_valuation'})),
    path('customer-analysis/', views.FrontendReportViewSet.as_view({'get': 'customer_analysis'})),
    path('employee-summary/', views.FrontendReportViewSet.as_view({'get': 'employee_summary'})),
    path('financial-summary/', views.FrontendReportViewSet.as_view({'get': 'financial_summary'})),
]
