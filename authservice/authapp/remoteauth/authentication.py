import requests
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from rest_framework.response import Response
from players.models import Players

class RemoteJWTAUthentication(BaseAuthentication):
    def authenticate(self, request):        
        token = request.COOKIES.get('access_token')
        if not token:
            return None
        auth_service_url = 'http://jwtservice:8000/api-jwt/token/verify'

        try:
            response = requests.post(auth_service_url, data={'token': token})
            response.raise_for_status()
            data = response.json()
            user_id = data.get('user_id')
            user = User.objects.get(id=user_id)
            return (user, token)
        except requests.RequestException as e:
            raise AuthenticationFailed('Token validation failed', code='token_not_valid') from e