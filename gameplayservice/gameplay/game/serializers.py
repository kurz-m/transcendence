from rest_framework import serializers
from game.models import Game, Score


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'game_type']

        read_only_fields = ['user',]

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)


class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Score
        fields = ['opponent', 'own_score', 'opponent_score', 'win', 'game_type', 'game_id', 'rank', 'number_of_players', 'created_date']

        read_only_fields = ['user', 'created_date']

    def to_representation(self, instance):
        """Customize the output to exclude microseconds in the datetime string."""
        ret = super().to_representation(instance)
        created_date = instance.created_date
        if created_date:
            created_date = created_date.replace(microsecond=0)
            ret['created_date'] = created_date.strftime("%Y-%m-%d %H:%M:%S")
        return ret