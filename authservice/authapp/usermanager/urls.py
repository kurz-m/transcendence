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
from remoteauth.views import callbackCode, authorizeCall, loggedIn, logOut
from remoteauth.views import ServeMedia
from players.friendrequest import FriendRequestSendView

router = routers.DefaultRouter()
# router.register(r'leaderboard', LeaderboardViewSet)
router.register(r'player', views.PlayerViewSet)
router.register(r'users', views.UserViewSet)

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    # path('api-auth', include('rest_framework.urls', namespace='rest_framework')),
    path('api/auth/login', authorizeCall.as_view(), name='auth-authorizeRequest'),
    path('api/auth/logout', logOut.as_view(), name='auth-logout'),
    path('api/auth/callback', callbackCode.as_view(), name='auth-callback'),
    path('api/auth/loggedin', loggedIn.as_view(), name='auth-loggedin'),
    path('api/media/<path:filename>', ServeMedia.as_view(), name='serve_media'),
    path('api/friends/sendrequest', FriendRequestSendView.as_view(), name='send_friend_request')
]

if not settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
