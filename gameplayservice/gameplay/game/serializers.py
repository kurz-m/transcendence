from rest_framework import serializers
from game.models import Game, Score


class GameSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'game_date', 'game_type']


class ScoreSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Score
        fields = ['opponent', 'own_score', 'opponent_score', 'win', 'game_type', 'game_id']

        read_only_fields = ['user', 'created_date']