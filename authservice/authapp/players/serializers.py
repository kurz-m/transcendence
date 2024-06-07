from django.contrib.auth.models import Group, User
from rest_framework import serializers
from players.models import Players, FriendRequest


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email']
        read_only_fields = ['username']

    def update(self, instance, validated_data):
        validated_data.pop('username', None)
        return super().update(instance, validated_data)


class PlayerSerializer(serializers.HyperlinkedModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Players
        fields = ['id', 'user', 'profile_img_url', 'two_factor', 'online_status', 'friends']
        extra_kwargs = {
            'url': {'view_name': 'players-detail'},
            'user': {'view_name': 'user-detail'}
        }
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create(**user_data)
        player = Players.objects.create(user=user, **validated_data)
        return player

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        if user_data:
            user_instance = instance.user
            user_serializer = self.fields['user']
            user_data.pop('username', None)
            user_instance = user_serializer.update(user_instance, user_data)

        instance.profile_img_url = validated_data.get('profile_img_url', instance.profile_img_url)
        instance.two_factor = validated_data.get('two_factor', instance.two_factor)
        instance.online_status = validated_data.get('online_status', instance.online_status)
        instance.friends.set(validated_data.get('friends', instance.friends.all()))
        instance.save()
        return instance


class FriendRequestSerializer(serializers.HyperlinkedModelSerializer):
    sender = PlayerSerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'created_at']


class FriendRequestCreateSerializer(serializers.ModelSerializer):
    receiver = serializers.CharField()

    class Meta:
        model = FriendRequest
        fields = ['receiver']

    def validate_receiver(self, value):
        try:
            receiver_user = User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Receiver user does not exist.")
        return receiver_user


class AcceptFriendRequestSerializer(serializers.Serializer):
    request_id = serializers.IntegerField()
