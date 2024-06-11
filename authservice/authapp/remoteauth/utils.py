import os
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from cryptography.fernet import Fernet
import base64

class ServeMedia(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, filename):
        file_path = os.path.join(settings.MEDIA_ROOT, filename)
        if os.path.exists(file_path):
            with open(file_path, 'rb') as f:
                return HttpResponse(f.read(), content_type='image/jpeg')
        else:
            raise Http404


def authorize():
    client_id = os.getenv("CLIENT_ID")
    redirect_uri = os.getenv("REDIRECT_URI")
    scope = "public"
    state = os.getenv("STATE")
    authorize_url = f"https://api.intra.42.fr/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope={scope}&state={state}"
    return authorize_url


def encrypt_token(token, key):
    fernet = Fernet(key)
    encrypted_token = fernet.encrypt(token.encode())
    return encrypted_token.decode()

def decrypt_token(encrypted_token, key):
    fernet = Fernet(key)
    decrypted_token = fernet.decrypt(encrypted_token.encode())
    return decrypted_token.decode()

def generate_key():
    return base64.urlsafe_b64encode(os.urandom(32))
