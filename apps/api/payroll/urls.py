from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'payrolls', views.PayrollViewSet)
router.register(r'payroll-items', views.PayrollItemViewSet)
router.register(r'benefits', views.BenefitViewSet)
router.register(r'employee-benefits', views.EmployeeBenefitViewSet)
router.register(r'performance-reviews', views.PerformanceReviewViewSet)
router.register(r'trainings', views.TrainingViewSet)
router.register(r'employee-trainings', views.EmployeeTrainingViewSet)

urlpatterns = router.urls
