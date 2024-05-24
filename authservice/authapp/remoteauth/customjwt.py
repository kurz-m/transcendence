from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.utils.translation import gettext_lazy as _

class CookieAccessCodeAuthentication(BaseAuthentication):
    def authenticate(self, request):
        from rest_framework_simplejwt.authentication import JWTAuthentication
        from rest_framework_simplejwt.exceptions import AuthenticationFailed as JWTAuthenticationFailed
        jwt_authentication = JWTAuthentication()

        access_token = request.COOKIES.get('access_token')
        if not access_token:
            return None

        if access_token:
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
            try:
                user_and_token = jwt_authentication.authenticate(request)
                if user_and_token is None:
                    print("Authentication failed: None returned")
                    return None
                user, token = user_and_token
            except JWTAuthenticationFailed as e:
                print("JWT Authentication Failed:", e)
                return None

            if user is None or token is None:
                print("User or token is None")
                return None
            return user, token
        return None
