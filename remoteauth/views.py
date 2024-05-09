from rest_framework.views import APIView
import os
from dotenv import load_dotenv
import requests
from django.http import HttpResponseBadRequest, HttpResponseRedirect
from players.models import Players
from django.contrib.auth.models import User

load_dotenv()


def get_user_info(access_token):
    url = 'https://api.intra.42.fr/v2/me'
    header = {'Authorization': f'Bearer {access_token}'}

    response = requests.get(url, headers=header)

    if response.status_code == 200:
        print("I reached here")
        user_info = response.json()
        create_player_from_user_info(user_info=user_info)
        print(user_info)
        return True
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
    
    user = User.objects.create_user(username=username, first_name=first_name, last_name=last_name, email=email)
    player = Players.objects.create(user=user, profile_img_uri=profile_img_uri, forty_two_student=forty_two_student)
    return player

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
                'redirect_uri': "http://localhost:8000/api/auth/callback",
            }
            response = requests.post(token_url, data=data)
            if response.status_code == 200:
                access_token = response.json().get('access_token')
                print("access token: ", access_token)
                if get_user_info(access_token=access_token) is True:
                    return HttpResponseRedirect("http://127.0.01:8000/admin")
                else:
                    return HttpResponseRedirect("http://127.0.01:8000/error")
            else:
                return HttpResponseBadRequest("Failed to obtain access token")
        else:
            print("Code not found")
            return HttpResponseBadRequest("Missing 'code' or 'state' parameter")
