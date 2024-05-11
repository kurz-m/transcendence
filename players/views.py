from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets
from players.serializers import GroupSerializer, UserSerializer, PlayerSerializer
from players.models import Players
from rest_framework.response import Response


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited
    """
    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupSerializer
    # permission_classes = [permissions.IsAuthenticated]


class PlayerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows players to be view and edited
    """
    queryset = Players.objects.all().order_by('-user__date_joined')
    serializer_class = PlayerSerializer

    def retrieve_player(self, request, pk=None):
        player = self.get_object()
        serializer = self.get_serializer(player)
        return Response(serializer.data)
