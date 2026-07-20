from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.chat, name='ai-chat'),
    path('predictions/', views.insights, name='ai-predictions'),
    path('suggestions/<str:context>/', views.suggestions, name='ai-suggestions'),
]
