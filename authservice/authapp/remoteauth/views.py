import os
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseRedirect, JsonResponse
from players.models import Players
from django.contrib.auth.models import User
from remoteauth.utils import authorize
from django.contrib.auth import login
from players.serializers import PlayerSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import redirect


def get_user_info(access_token):
    url = 'https://api.intra.42.fr/v2/me'
    header = {'Authorization': f'Bearer {access_token}'}

    response = requests.get(url, headers=header)

    if response.status_code == 200:
        user_info = response.json()
        player = create_player_from_user_info(user_info=user_info)
        return player
    else:
        print(f"Request failed with status code {response.status_code}")
        return None


def create_player_from_user_info(user_info):
    username = user_info.get('login', '')
    first_name = user_info.get('first_name', '')
    last_name = user_info.get('last_name', '')
    email = user_info.get('email', '')
    profile_img_uri = user_info.get('image', {}).get('link', '')
    forty_two_student = True

    existing_user = User.objects.filter(username=username).first() or User.objects.filter(email=email).first()

    if existing_user:
        player = Players.objects.filter(user=existing_user).first()
        return player
    else:
        user = User.objects.create_user(username=username, first_name=first_name, last_name=last_name, email=email)
        player = Players.objects.create(user=user, profile_img_uri=profile_img_uri, forty_two_student=forty_two_student)
        return player


class authorizeCall(APIView):
    def get(self, request, format=None):
        return Response({'location': authorize()}, status=status.HTTP_200_OK)


class callbackCode(APIView):
    def get(self, request, format=None):
        code = request.GET.get('code', None)
        state = request.GET.get('state', None)
        if 'code' in request.GET and 'state' in request.GET:
            if state != os.getenv("STATE"):
                return HttpResponseBadRequest("Invalid state parameter")
            print("Code:", code)
            token_url = 'https://api.intra.42.fr/oauth/token'
            data = {
                'grant_type': 'authorization_code',
                'client_id': os.getenv("CLIENT_ID"),
                'client_secret': os.getenv("CLIENT_SECRET"),
                'code': code,
                'redirect_uri': os.getenv("REDIRECT_URI"),
            }
            print(data)
            response = requests.post(token_url, data=data)
            if response.status_code == 200:
                access_token = response.json().get('access_token')
                player = get_user_info(access_token=access_token)
                refresh = RefreshToken.for_user(player.user)
                if player and player.two_factor is False:
                    oauth_response = HttpResponse("oauth")
                    # response = redirect('/dashboard')
                    oauth_response.set_cookie('access_token', refresh.access_token, httponly=True, secure=False)
                    oauth_response.set_cookie('user', player.user, httponly=True, secure=False)
                    oauth_response.set_cookie('2fa', player.two_factor, httponly=True, secure=False)
                    oauth_response.set_cookie('user-id', player.user.id, httponly=True, secure=False)
                    player.online_status = True
                    player.save()
                    # serializer = PlayerSerializer(player, context={'request': request})
                    # response_data = {
                    #     'refresh': str(refresh),
                    #     'access': str(refresh.access_token),
                    #     'player_data': serializer.data
                    # }
                    return oauth_response
                # elif player and player.two_factor is True:
                #     return Response({'message': 'MFA Enabled', 'refresh': str(refresh), 'access': str(refresh.access_token)})
            else:
                return Response({'message': 'Failed to Obtain Access Token'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'Missing code or state parameter'}, status=status.HTTP_400_BAD_REQUEST)
