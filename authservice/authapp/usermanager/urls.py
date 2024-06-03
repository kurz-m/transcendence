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
from remoteauth.utils import ServeMedia
from players.friendrequest import FriendRequestSendView, AcceptFriendRequestView, FriendRequestsAPIView

router = routers.DefaultRouter()
router.register(r'player', views.PlayerViewSet, basename='players')
router.register(r'users', views.UserViewSet, basename='users')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/login', authorizeCall.as_view(), name='auth-authorizeRequest'),
    path('api/auth/logout', logOut.as_view(), name='auth-logout'),
    path('api/auth/callback', callbackCode.as_view(), name='auth-callback'),
    path('api/auth/loggedin', loggedIn.as_view(), name='auth-loggedin'),
    path('api/media/<path:filename>', ServeMedia.as_view(), name='serve_media'),
    path('api/friends/sendrequest', FriendRequestSendView.as_view(), name='send_friend_request'),
    path('api/friends/acceptrequest', AcceptFriendRequestView.as_view(), name='accept_friend_request'),
    path('api/friends/requests', FriendRequestsAPIView.as_view(), name='list_friend_requests'),
    path('api/friends', views.FriendsApiView.as_view(), name='list_friends'),
    path('api/friends/<str:username>', views.FriendsApiView.as_view(), name='delete_or_get_friend'),
]

if not settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
