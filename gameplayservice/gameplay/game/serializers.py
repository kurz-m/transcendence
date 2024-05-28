from rest_framework import serializers
from game.models import Game, Score


class GameSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'game_date', 'game_type']

        read_only_fields = ['user',]

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)


class ScoreSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Score
        fields = ['opponent', 'own_score', 'opponent_score', 'win', 'game_type', 'game_id']

        read_only_fields = ['user', 'created_date']