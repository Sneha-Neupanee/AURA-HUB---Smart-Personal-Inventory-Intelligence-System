from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Object-level permission: only the owner of an object may access it.
    Assumes the model has a `user` field.
    """

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
