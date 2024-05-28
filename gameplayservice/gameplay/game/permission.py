from rest_framework import permissions

class IsOwnerAndNotDelete(permissions.BasePermission):
    """
    Custom permission to allow only owners of an object to get, edit,
    but never allow deletion.
    """
    def has_object_permission(self, request, view, obj):
        # if request.method in permissions.SAFE_METHODS:
        #     return True
        
        if request.method == 'DELETE':
            return False

        return obj.user == request.user
