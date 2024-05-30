from django.contrib.auth.models import Group, User
from rest_framework import serializers
from jwtapp.models import Players


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email']

class PlayerSerializer(serializers.HyperlinkedModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Players
        fields = ['id', 'user', 'profile_img_uri', 'two_factor', 'online_status', 'friends']
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create(**user_data)
        player = Players.objects.create(user=user, **validated_data)
        return player