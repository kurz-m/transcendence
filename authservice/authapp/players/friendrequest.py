from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from players.models import FriendRequest, Players, User
from players.serializers import FriendRequestCreateSerializer, FriendRequestSerializer
from rest_framework.views import APIView
from django.core.exceptions import ValidationError
from django.http import HttpResponse


class FriendRequestSendView(APIView):
    serializer_class = FriendRequestCreateSerializer
    permission_classes = [IsAuthenticated]

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

        if FriendRequest.objects.filter(sender=sender, receiver=receiver).exists():
            return HttpResponse('Friend request is already sent.', status=status.HTTP_400_BAD_REQUEST)
        serializer.save(sender=sender)
        return Response(serializer.data, status=status.HTTP_201_CREATED)