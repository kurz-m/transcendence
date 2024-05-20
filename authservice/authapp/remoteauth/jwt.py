from rest_framework_simplejwt.serializers import TokenVerifySerializer
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.views import APIView
from rest_framework import status
from rest_framework import serializers

class CustomTokenVerifySerializer(TokenVerifySerializer):
    def validate(self, attrs):
        token = attrs.get('token')

        if not token:
            raise serializers.ValidationError('Token is required')

        try:
            access_token = AccessToken(token)
            user_id = access_token.payload['user_id']
        except TokenError:
            raise serializers.ValidationError('Invalid token')

        attrs['user_id'] = user_id
        return attrs

class CustomTokenVerifyView(APIView):
    serializer_class = CustomTokenVerifySerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
