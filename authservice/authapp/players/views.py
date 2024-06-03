from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets
from players.serializers import UserSerializer, PlayerSerializer, FriendRequestSerializer
from players.models import Players
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from players.permission import IsOwnerAndNotDelete, IsOwnerAndNotDeleteUsers


class UserViewSet(viewsets.ModelViewSet):
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
        player = Players.objects.get(user=user)

        friends_ids = player.friends.values_list('id', flat=True)
        ids_to_view = list(friends_ids) + [player.id]
        return Players.objects.filter(id__in=ids_to_view).order_by('-user__date_joined')



class FriendsApiView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, username=None):
        if username:
            try:
                friend = Players.objects.get(user__username=username)
            except Players.DoesNotExist:
                return Response({'error': 'Friend not found'}, status=status.HTTP_404_NOT_FOUND)
            
            if friend in Players.objects.get(user=request.user).friends.all():
                return Response({'error': 'You are not friend with the user.'}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = PlayerSerializer(friend, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            user_player = Players.objects.get(user=request.user)
            friends = user_player.friends.all()
            serializer = PlayerSerializer(friends, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, username):
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