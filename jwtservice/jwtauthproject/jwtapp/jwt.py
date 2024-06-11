import requests
from rest_framework_simplejwt.serializers import TokenVerifySerializer
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.views import APIView
from rest_framework import status
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import HttpResponseBadRequest

class CustomTokenVerifySerializer(TokenVerifySerializer):
    def validate(self, attrs):
        token = attrs.get('token')

        if not token:
            raise serializers.ValidationError('Token is required')

        try:
            access_token = AccessToken(token)
            user_id = access_token.payload['user_id']
            user = User.objects.get(id=user_id)
        except TokenError:
            raise serializers.ValidationError('Invalid token')
        except User.DoesNotExist:
            raise serializers.ValidationError('User does not exist')

        attrs['user'] = user
        return attrs

class CustomTokenVerifyView(APIView):
    serializer_class = CustomTokenVerifySerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        return Response({'user_id': user.id, 'username': user.username}, status=status.HTTP_200_OK)


class GenerateTokenView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        username = request.data.get('username')
        email = request.data.get('email')
        token = request.data.get('oauth_token')
        url = 'https://api.intra.42.fr/v2/me'
        header = {'Authorization': f'Bearer {token}'} 

        try:
            response = requests.get(url, headers=header)
        except requests.exceptions.RequestException as e:
            return HttpResponseBadRequest(f"Failed to verify 42 oauth token: {str(e)}")
        if response.status_code == 200:
            user, created = User.objects.get_or_create(
                id=user_id,
                username=username,
                defaults={'email': email}
            )
            refresh = RefreshToken.for_user(user)
            return Response({"refresh_jwt_token": str(refresh)})
        else:
            return HttpResponseBadRequest("Failed to verify 42 oauth token.")

