"""
URL configuration for twofactorauth project.

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
from mfaauthenticator import views
from django.urls import path, include
from rest_framework import routers
from django.conf import settings
from django.conf.urls.static import static
from mfaauthenticator.mfa import ServeMedia
from mfaauthenticator.mfa import EnableMFA, UpdateMFA, VerifyMFA, DisableMFA

router = routers.DefaultRouter()
router.register(r'player', views.PlayerViewSet)

urlpatterns = [
    path('api-mfa/', include(router.urls)),
    path('admin/', admin.site.urls),
    path('api-mfa/enable', EnableMFA.as_view(), name='enable_mfa'),
    path('api-mfa/disable', DisableMFA.as_view(), name='disable_mfa'),
    path('api-mfa/update', UpdateMFA.as_view(), name='update_mfa'),
    path('api-mfa/verify', VerifyMFA.as_view(), name='verify_mfa'),
    path('api-mfa/media/<path:filename>', ServeMedia.as_view(), name='serve_media'),
]

if not settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
