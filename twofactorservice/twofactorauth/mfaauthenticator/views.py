from django.shortcuts import render
from rest_framework import permissions, viewsets
from mfaauthenticator.models import Players
from mfaauthenticator.serializer import PlayerSerializer
from mfaauthenticator.permission import IsOwnerAndNotDelete

# Create your views here.
class PlayerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows players to be view and edited
    """
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerAndNotDelete]

    def get_queryset(self):
        user = self.request.user
        return Players.objects.filter(user=user)
