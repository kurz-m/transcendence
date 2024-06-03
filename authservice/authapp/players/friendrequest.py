from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from players.models import FriendRequest, Players, User
from players.serializers import FriendRequestCreateSerializer, FriendRequestSerializer, AcceptFriendRequestSerializer
from rest_framework.views import APIView
from django.core.exceptions import ValidationError
from django.http import HttpResponse
from rest_framework import permissions
from players.permission import IsOwnerAndNotDeleteFriends


class FriendRequestSendView(APIView):
    serializer_class = FriendRequestCreateSerializer
    permission_classes = [IsAuthenticated, IsOwnerAndNotDeleteFriends]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        receiver_username = serializer.validated_data['receiver']
        sender_user = self.request.user

        try:
            sender = Players.objects.get(user=sender_user)
        except Players.DoesNotExist:
            return HttpResponse('Sender is not a player', status=status.HTTP_400_BAD_REQUEST)
        
        try:
            receiver_user = User.objects.get(username=receiver_username)
            receiver = Players.objects.get(user=receiver_user)
        except Players.DoesNotExist:
            return HttpResponse('Receiver is not a player', status=status.HTTP_400_BAD_REQUEST)
        
        if sender_user.id == receiver_user.id:
            return HttpResponse('Cannot send request to yourself.', status=status.HTTP_400_BAD_REQUEST)

        if FriendRequest.objects.filter(sender=sender, receiver=receiver).exists():
            return HttpResponse('Friend request is already sent.', status=status.HTTP_400_BAD_REQUEST)
        serializer.save(sender=sender)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AcceptFriendRequestView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerAndNotDeleteFriends]

    def post(self, request):
        serializer = AcceptFriendRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request_id = serializer.validated_data['request_id']

        try:
            friend_request = FriendRequest.objects.get(id=request_id, receiver__user=request.user)
        except FriendRequest.DoesNotExist:
            return HttpResponse('Friend request not found or not authorized', status=status.HTTP_400_BAD_REQUEST)

        sender = friend_request.sender
        receiver = friend_request.receiver
        sender.add_friend(receiver)
        friend_request.delete()

        return Response({'message': 'Friend request accepted'}, status=status.HTTP_200_OK)


class FriendRequestsAPIView(APIView):
    """
    API endpoint that allows to list friend requests received by a player.
    """
    permission_classes = [IsAuthenticated, IsOwnerAndNotDeleteFriends]

    def get(self, request):
        user = request.user
        try:
            player = Players.objects.get(user=user)
        except Players.DoesNotExist:
            return Response({'error': 'Player not found'}, status=status.HTTP_404_NOT_FOUND)

        friend_requests = FriendRequest.objects.filter(receiver=player)
        serializer = FriendRequestSerializer(friend_requests, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)