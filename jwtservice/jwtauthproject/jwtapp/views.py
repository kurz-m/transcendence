from django.contrib.auth.models import User
from rest_framework import permissions, viewsets
from jwtapp.serializers import UserSerializer
from rest_framework.response import Response


# Create your views here.
class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
