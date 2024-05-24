from django.contrib.auth.models import User
from rest_framework import permissions, viewsets
from jwtapp.serializers import UserSerializer, PlayerSerializer
from jwtapp.models import Players
from rest_framework.response import Response


# Create your views here.
class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class PlayerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows players to be view and edited
    """
    queryset = Players.objects.all().order_by('-user__date_joined')
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticated]
