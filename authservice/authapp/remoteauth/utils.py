import os


TOKEN_URL = "https://api.intra.42.fr/oauth/token"


def authorize():
    client_id = os.getenv("CLIENT_ID")
    redirect_uri = os.getenv("REDIRECT_URI")
    scope = "public"
    state = os.getenv("STATE")
    authorize_url = f"https://api.intra.42.fr/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope={scope}&state={state}"
    return authorize_url


def serve_media(request, filename):

    file_path = os.path.join(settings.MEDIA_ROOT, filename)
    if os.path.exists(file_path):
        with open(file_path, 'rb') as f:
            return HttpResponse(f.read(), content_type='image/jpeg')
    else:
        raise Http404
