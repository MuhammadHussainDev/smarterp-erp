from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'tenants', views.TenantViewSet)
router.register(r'subscription-plans', views.SubscriptionPlanViewSet)
router.register(r'tenant-subscriptions', views.TenantSubscriptionViewSet)

urlpatterns = router.urls
