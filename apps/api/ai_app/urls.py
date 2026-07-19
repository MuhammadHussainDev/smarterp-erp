from django.urls import path
from . import views

urlpatterns = [
    path('ai/chat/', views.chat, name='ai-chat'),
    path('ai/insights/', views.insights, name='ai-insights'),
]
