from django.contrib.auth.models import Group, User
from rest_framework import serializers
# from jwtapp.models import Players


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email']