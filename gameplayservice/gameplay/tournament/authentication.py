import requests
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User

class RemoteJWTAUthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        auth_service_url = 'http://authservice:8000/api/auth/token/verify'

        try:
            response = requests.post(auth_service_url, data={'token': token})
            response.raise_for_status()
            data = response.json()
            user_id = data.get('user_id')
            user_info_url = f'http://authservice:8000/users/{user_id}/'
            user_response = user_response = requests.get(user_info_url, headers={'Authorization': f'Bearer {token}'})
            user_response.raise_for_status()
            user_data = user_response.json()
            user = User.objects.create_user(username=user_data['username'], email=user_data['email'])
            return (user, token)
        except requests.RequestException as e:
            raise AuthenticationFailed('Token validation failed', code='token_not_valid') from e