from django.contrib.auth.models import Group, User
from rest_framework import serializers
from players.models import Players


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'first_name', 'last_name', 'password', 'email']


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']


class PlayerSerializer(serializers.HyperlinkedModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Players
        fields = ['user', 'profile_img_uri', 'forty_two_student', 'two_factor', 'online_status']
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create(**user_data)
        player = Players.objects.create(user=user, **validated_data)
        return player
