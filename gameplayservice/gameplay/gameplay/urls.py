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
from tournament.views import TournamentViewSet, ParticipantViewSet

router = routers.DefaultRouter()
router.register(r'tournament', TournamentViewSet)
router.register(r'participant', ParticipantViewSet)

urlpatterns = [
    path('api-game/', include(router.urls)),
    path('admin/', admin.site.urls),
    # path('api-auth', include('rest_framework.urls', namespace='rest_framework')),
    path('api-game/tournament/<int:pk>', TournamentViewSet.as_view({'get': 'retrieve_tournament'}), name='tournament-detail'),
]
