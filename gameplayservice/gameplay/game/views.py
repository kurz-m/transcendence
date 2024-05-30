from rest_framework import viewsets
from game.serializers import GameSerializer, ScoreSerializer
from game.models import Game, Score
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import permissions
from django.db.models import Prefetch
from rest_framework import status
from game.permission import IsOwnerAndNotDelete

# Create your views here.
class GameViewSet(viewsets.ModelViewSet):
    """
    API enpoint that allows users to view games.
    """
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerAndNotDelete]

    def get_queryset(self):
        user = self.request.user
        return Game.objects.filter(user=user)

    # @action(detail=False, methods=['get'])
    # def user_games(self, request, user_id=None):
    #     games = Game.objects.filter(score__user_id=user_id).distinct().prefetch_related(
    #         Prefetch('score_set', queryset=Score.objects.filter(user_id=user_id))
    #     )
    #     serializer = self.get_serializer(games, many=True)
    #     return Response(serializer.data)

class ScoreViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to view Score.
    """
    serializer_class = ScoreSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerAndNotDelete]

    def get_queryset(self):
        user = self.request.user
        return Score.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def user_games(self, request, user_id=None):
        scores = Score.objects.filter(user_id=user_id)
        serializer = self.get_serializer(scores, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
