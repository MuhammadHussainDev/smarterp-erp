from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'employees', views.EmployeeViewSet)
router.register(r'attendance', views.AttendanceViewSet)
router.register(r'leave-types', views.LeaveTypeViewSet)
router.register(r'leave-requests', views.LeaveRequestViewSet)

urlpatterns = router.urls
