from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'accounts', views.AccountViewSet)
router.register(r'journal-entries', views.JournalEntryViewSet)
router.register(r'journal-entry-lines', views.JournalEntryLineViewSet)
router.register(r'budgets', views.BudgetViewSet)
router.register(r'tax-rates', views.TaxRateViewSet)

urlpatterns = router.urls
