from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets
from players.serializers import UserSerializer, PlayerSerializer, FriendRequestSerializer
from players.models import Players
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from players.permission import IsOwnerAndNotDelete, IsOwnerAndNotDeleteUsers, IsOwnerAndFriends


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerAndNotDeleteUsers]

    def get_queryset(self):
        user = self.request.user
        return User.objects.filter(id=user.id).order_by('-date_joined')


class PlayerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows players to be view and edited
    """
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerAndNotDelete]

    def get_queryset(self):
        user = self.request.user
        return Players.objects.filter(user=user).order_by('-user__date_joined')
    
    def create(self, request, *args, **kwargs):
        return Response({"detail": "Method 'POST' not allowed on this endpoint."},
                        status=status.HTTP_405_METHOD_NOT_ALLOWED)



class FriendsApiView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerAndFriends]

    def get(self, request, username=None):
        if username:
            try:
                friend = Players.objects.get(user__username=username)
            except Players.DoesNotExist:
                return Response({'error': 'Friend not found'}, status=status.HTTP_404_NOT_FOUND)
            
            if friend not in Players.objects.get(user=request.user).friends.all():
                return Response({'error': 'You are not friend with the user.'}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = PlayerSerializer(friend, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            user_player = Players.objects.get(user=request.user)
            friends = user_player.friends.all()
            serializer = PlayerSerializer(friends, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, username=None):
        if username is None:
            return Response({'error': 'Friend username not given.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user_player = Players.objects.get(user=request.user)
            friend_player = Players.objects.get(user__username=username)
        except Players.DoesNotExist:
            return Response({'error': 'Player not found'}, status=status.HTTP_404_NOT_FOUND)

        if friend_player not in user_player.friends.all():
            return Response({'error': 'The specified user is not a friend'}, status=status.HTTP_400_BAD_REQUEST)

        user_player.remove_friend(friend_player)
        friend_player.remove_friend(user_player)
        return Response({'message': 'Friend removed successfully'}, status=status.HTTP_200_OK)