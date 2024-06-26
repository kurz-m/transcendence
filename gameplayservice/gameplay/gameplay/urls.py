"""
URL configuration for gameplay project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from rest_framework.routers import DefaultRouter
from game.views import GameViewSet, ScoreViewSet

class CustomRouter(DefaultRouter):
    def __init__(self):
        super().__init__()
        self.trailing_slash = '/?'

router = CustomRouter()
router.register(r'game', GameViewSet, basename='game')
router.register(r'score', ScoreViewSet, basename='score')

urlpatterns = [
    path('api-game/', include(router.urls)),
    path('api-game/user_games/<user_id>', ScoreViewSet.as_view({'get': 'user_games'}), name='user_games'),
]
