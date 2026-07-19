from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'recruitments', views.RecruitmentViewSet)

urlpatterns = router.urls
