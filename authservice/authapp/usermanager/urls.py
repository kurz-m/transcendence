"""
URL configuration for usermanager project.

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
from players import views
from django.contrib import admin
from rest_framework import routers
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from leaderboard.views import LeaderboardViewSet
from remoteauth.views import callbackCode, authorizeCall
from remoteauth.mfa import EnableMFA, UpdateMFA, VerifyMFA, DisableMFA
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from remoteauth.mfa import ServeMedia
from remoteauth.jwt import CustomTokenVerifyView

router = routers.DefaultRouter()
# router.register(r'leaderboard', LeaderboardViewSet)
router.register(r'player', views.PlayerViewSet)
router.register(r'users', views.UserViewSet)

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('', include(router.urls)),
    # path('api-auth', include('rest_framework.urls', namespace='rest_framework')),
    path('api/auth/token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/verify', CustomTokenVerifyView.as_view(), name='token_verify'),
    path('api/auth/login', authorizeCall.as_view(), name='auth-authorizeRequest'),
    path('api/auth/callback', callbackCode.as_view(), name='auth-callback'),
    path('api/player/<int:pk>', views.PlayerViewSet.as_view({'get': 'retrieve_player'}), name='player-detail'),
    path('api/mfa/enable', EnableMFA.as_view(), name='enable_mfa'),
    path('api/mfa/disable', DisableMFA.as_view(), name='disable_mfa'),
    path('api/mfa/update', UpdateMFA.as_view(), name='update_mfa'),
    path('api/mfa/verify', VerifyMFA.as_view(), name='verify_mfa'),
    path('api/media/<path:filename>', ServeMedia.as_view(), name='serve_media'),
]

if not settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
