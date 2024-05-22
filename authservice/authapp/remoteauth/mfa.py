import os
import pyotp
import qrcode
from datetime import datetime
from players.models import Players
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils.http import urlencode
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.http import HttpResponse, Http404


class ServeMedia(APIView):
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
        api_media_url = request.build_absolute_uri('/api/media/' + qr_image_path)
        return Response({'secret_key': mfa_secret_key, 'mfa_qr_url': mfa_qr_url, 'mfa_qrimage_url': api_media_url})


class UpdateMFA(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        player = Players.objects.filter(user=user).first()
        new_secret_key = generate_secret_key()
        player.mfa_secret_key = new_secret_key
        player.save()
        mfa_qr_url = generate_qrcode_url(player.user.username, player.mfa_secret_key)

        return Response({'secret_key': new_secret_key, 'mfa_qr_url': mfa_qr_url})


class DisableMFA(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        player = Players.objects.filter(user=user).first()
        player.mfa_secret_key = ""
        player.two_factor = False
        player.save()
        return Response({'message': 'MFA disabled successfully.'})


class VerifyMFA(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        token = request.data.get('token')
        user = request.user
        player = Players.objects.filter(user=user).first()
        is_valid = verify_token(user, token=token)
        if is_valid:
            player.two_factor = True
            player.save()
            refresh = RefreshToken.for_user(player.user)
            oauth_response = HttpResponse("oauth")
            oauth_response.set_cookie('access_token', refresh.access_token, httponly=True, secure=True)
            oauth_response.set_cookie('user', player.user, httponly=False, secure=True)
            oauth_response.set_cookie('2fa', player.two_factor, httponly=False, secure=True)
            oauth_response.set_cookie('user-id', player.user.id, httponly=False, secure=True)
            return oauth_response
        else:
            return Response({'message': 'Invalid MFA token'}, status=status.HTTP_400_BAD_REQUEST)
