from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

router = DefaultRouter()
router.register(r'payrolls', views.PayrollViewSet)
router.register(r'payroll-items', views.PayrollItemViewSet)
router.register(r'benefits', views.BenefitViewSet)
router.register(r'employee-benefits', views.EmployeeBenefitViewSet)
router.register(r'performance-reviews', views.PerformanceReviewViewSet)
router.register(r'trainings', views.TrainingViewSet)
router.register(r'employee-trainings', views.EmployeeTrainingViewSet)

payroll_list = views.PayrollViewSet.as_view({'get': 'list', 'post': 'create'})
payroll_detail = views.PayrollViewSet.as_view({
    'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'
})
payroll_status = views.PayrollViewSet.as_view({'patch': 'status'})
items_update = views.PayrollItemViewSet.as_view({'patch': 'partial_update'})
training_list = views.TrainingViewSet.as_view({'get': 'list', 'post': 'create'})
training_enrollments = views.TrainingViewSet.as_view({'get': 'enrollments'})
training_enroll = views.TrainingViewSet.as_view({'post': 'enroll'})
reviews_list = views.PerformanceReviewViewSet.as_view({'get': 'list', 'post': 'create'})
benefits_list = views.BenefitViewSet.as_view({'get': 'list', 'post': 'create'})
benefits_assign = views.BenefitViewSet.as_view({'post': 'assign'})

urlpatterns = [
    path('', payroll_list),
    path('<uuid:pk>/', payroll_detail),
    path('<uuid:pk>/status/', payroll_status),
    path('items/', views.PayrollItemViewSet.as_view({'get': 'list'})),
    path('items/<uuid:pk>/', items_update),
    path('training/', training_list),
    path('training/enrollments/', training_enrollments),
    path('training/enroll/', training_enroll),
    path('reviews/', reviews_list),
    path('benefits/', benefits_list),
    path('benefits/assign/', benefits_assign),
    path('', include(router.urls)),
]
