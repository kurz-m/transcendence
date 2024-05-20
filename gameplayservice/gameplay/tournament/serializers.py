from rest_framework import serializers
from tournament.models import Tournaments, Participants


class TournamentSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Tournaments
        fields = ['tournament_date', 'tournament_name']


class ParticipantsSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Participants
        fields = ['tournament', 'player_name', 'score']