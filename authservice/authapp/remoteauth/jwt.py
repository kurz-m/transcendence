from rest_framework_simplejwt.serializers import TokenVerifySerializer
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.views import APIView
from rest_framework import status
from rest_framework import serializers
from django.contrib.auth.models import User
from players.models import Players

class CustomTokenVerifySerializer(TokenVerifySerializer):
    def validate(self, attrs):
        token = attrs.get('token')

        if not token:
            raise serializers.ValidationError('Token is required')

        try:
            access_token = AccessToken(token)
            player_id = access_token.payload['player_id']
            player = Players.objects.get(id=player_id)
            user = player.user
        except (TokenError, User.DoesNotExist):
            raise serializers.ValidationError('Invalid token or user does not exist')

        attrs['user'] = user
        return attrs

class CustomTokenVerifyView(APIView):
    serializer_class = CustomTokenVerifySerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        return Response({'player_id': player.id, 'username': user.username}, status=status.HTTP_200_OK)
