import os
from dotenv import load_dotenv


load_dotenv()

TOKEN_URL = "https://api.intra.42.fr/oauth/token"


def authorize():
    client_id = os.getenv("CLIENT_ID")
    redirect_uri = os.getenv("REDIRECT_URI")
    scope = "public"
    state = os.getenv("STATE")
    authorize_url = f"https://api.intra.42.fr/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope={scope}&state={state}"
    return authorize_url
    # response = requests.post(
    #     TOKEN_URL,
    #     data={
    #         'grant_type': 'client_credentials',
    #         'client_id': uid,
    #         'client_secret': secret,
    #     }
    # )
    # response_data = response.json()
    # if 'access_token' in response_data:
    #     access_token = response_data['access_token']
    #     print("access_token: {1}", access_token)
    # else:
    #     print("Failed to obtain access token:", response_data.get('error_description', 'Unknown error'))
