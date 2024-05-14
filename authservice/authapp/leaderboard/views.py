from rest_framework import viewsets
from leaderboard.models import Leaderboard
from leaderboard.serializers import LeaderboardSerializer


# Create your views here.
class LeaderboardViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows leaderboard entries to be viewed or edited
    """
    queryset = Leaderboard.objects.all().order_by('-game_played_date')
    serializer_class = LeaderboardSerializer
