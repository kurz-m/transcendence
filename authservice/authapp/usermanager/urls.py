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
from django.conf.urls.static import static
from django.urls import include, path
from remoteauth.views import callbackCode, authorizeCall, loggedIn, logOut, mfaLogin
from rest_framework.routers import DefaultRouter

class CustomRouter(DefaultRouter):
    def __init__(self):
        super().__init__()
        self.trailing_slash = '/?'

router = CustomRouter()
router.register(r'player', views.PlayerViewSet, basename='players')
router.register(r'users', views.UserViewSet, basename='users')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/login', authorizeCall.as_view(), name='auth-authorizeRequest'),
    path('api/auth/mfalogin', mfaLogin.as_view(), name='auth-mfa-login'),
    path('api/auth/logout', logOut.as_view(), name='auth-logout'),
    path('api/auth/callback', callbackCode.as_view(), name='auth-callback'),
    path('api/auth/loggedin', loggedIn.as_view(), name='auth-loggedin'),
]
