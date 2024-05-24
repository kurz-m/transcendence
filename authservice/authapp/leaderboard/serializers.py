from leaderboard.models import Leaderboard
from rest_framework import serializers


class LeaderboardSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Leaderboard
        fields = ['game_name', 'score', 'game_played_date']
