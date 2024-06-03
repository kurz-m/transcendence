from rest_framework import permissions
from players.models import Players

class IsOwnerAndNotDelete(permissions.BasePermission):
    """
    Custom permission to allow only owners of an object to get, edit,
    but never allow deletion.
    """
    def has_object_permission(self, request, view, obj):
        if request.method == 'DELETE':
            return False

        if request.method in ('GET'):
            if obj.user == request.user:
                return True

            player = Players.objects.get(user=request.user)
            return player.friends.filter(id=obj.id).exists()
        
        if request.method in ('PUT'):
            if obj.user == request.user:
                return True
    
        return False


class IsOwnerAndNotDeleteUsers(permissions.BasePermission):
    """
    Custom permission to allow only owners of an object to get, edit,
    but never allow deletion.
    """
    def has_object_permission(self, request, view, obj):
        if request.method == 'DELETE':
            return False

        if request.method in ('GET'):
            if obj == request.user:
                return True

            player = Players.objects.get(user=request.user)
            return player.friends.filter(id=obj.id).exists()
        
        if request.method in ('PUT'):
            if obj == request.user:
                return True
    
        return False


class IsOwnerAndNotDeleteFriends(permissions.BasePermission):
    """
    Custom permission to allow only owners of an object to get, edit,
    but never allow deletion.
    """
    def has_object_permission(self, request, view, obj):
        return obj.sender == request.user

