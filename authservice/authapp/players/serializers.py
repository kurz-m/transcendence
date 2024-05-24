from django.contrib.auth.models import Group, User
from rest_framework import serializers
from players.models import Players, FriendRequest


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email']


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']


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


class FriendRequestSerializer(serializers.ModelSerializer):
    sender = PlayerSerializer(read_only=True)
    receiver = PlayerSerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ['receiver']

class FriendRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendRequest
        fields = ['receiver']
