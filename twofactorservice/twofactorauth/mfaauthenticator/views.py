from django.shortcuts import render
from rest_framework import permissions, viewsets
from mfaauthenticator.models import Players
from mfaauthenticator.serializer import PlayerSerializer

# Create your views here.
class PlayerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows players to be view and edited
    """
    queryset = Players.objects.all().order_by('-user__date_joined')
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticated]