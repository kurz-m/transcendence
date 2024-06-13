import os
import pyotp
import qrcode
from datetime import datetime
from mfaauthenticator.models import Players
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils.http import urlencode
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.http import HttpResponse, Http404, HttpResponseBadRequest
from mfaauthenticator.permission import IsOwnerAndNotDelete
from django.contrib.auth.models import User

class ServeMedia(APIView):
    permission_classes = [IsAuthenticated, IsOwnerAndNotDelete]

    def get(self, request, filename):
        file_path = os.path.join(settings.MEDIA_ROOT, filename)
        if os.path.exists(file_path):
            with open(file_path, 'rb') as f:
                return HttpResponse(f.read(), content_type='image/jpeg')
        else:
            raise Http404


def generate_qr_code_png(url, filename):
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save(filename)


def generate_jwt_token(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def generate_secret_key():
    return pyotp.random_base32()


def generate_qrcode_url(username, mfa_secret_key, filename):
    params = {
        'secret': mfa_secret_key,
        'issuer': 'Transcendence',
        'algorithm': 'SHA1',
        'digits': 6,
        'period': 30,
        'label': username
    }
    url = 'otpauth://totp/{}?{}'.format(username, urlencode(params))
    generate_qr_code_png(url, f"./media/{filename}")
    return url


def verify_token(user, token):
    player = Players.objects.filter(user=user).first()
    secret_key = player.mfa_secret_key
    totp = pyotp.TOTP(secret_key)
    return totp.verify(token)


class EnableMFA(APIView):
    permission_classes = [IsAuthenticated, IsOwnerAndNotDelete]

    def post(self, request):
        user = request.user
        player = Players.objects.filter(user=user).first()
        mfa_secret_key = generate_secret_key()
        player.mfa_secret_key = mfa_secret_key
        player.save()
        current_datetime = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"mfa_qr-{player.user.username}-{current_datetime}.png"
        mfa_qr_url = generate_qrcode_url(player.user.username, player.mfa_secret_key, filename)
        qr_image_path = f"../media/{filename}"
        api_media_url = request.build_absolute_uri('/api-mfa/media/' + qr_image_path)
        api_media_url = api_media_url.replace('http://', 'https://')
        return Response({'mfa_qrimage_url': api_media_url})


class DisableMFA(APIView):
    permission_classes = [IsAuthenticated, IsOwnerAndNotDelete]

    def put(self, request):
        user = request.user
        player = Players.objects.filter(user=user).first()
        if not player:
            return HttpResponseBadRequest("cannot disable 2FA: not logged in")
        player.mfa_secret_key = ""
        player.save()
        return Response({'detail': 'Successful operation. 2FA disabled'})


class VerifyMFA(APIView):
    
    def post(self, request):
        token = request.data.get('token')
        user_id = request.data.get('user_id')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
        player = Players.objects.filter(user=user).first()
        is_valid = verify_token(user, token=token)
        if is_valid:
            return Response({'detail': '2FA verified Successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Bad request. Invalid or missing 2FA code.'}, status=status.HTTP_400_BAD_REQUEST)
