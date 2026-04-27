from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.permissions import IsOwner
from .models import Item
from .serializers import ItemSerializer, ItemListSerializer
from .filters import ItemFilter
from .services import item_service


class ItemViewSet(viewsets.ModelViewSet):
    """
    Full CRUD ViewSet for Items.
    - list/create/retrieve/update/destroy
    - User-scoped: only shows the authenticated user's items
    - Excludes DISPOSED items from list (they are soft-deleted)
    - All mutations go through the service layer
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ItemFilter
    search_fields = ["name", "category", "description"]
    ordering_fields = ["created_at", "name", "value", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Item.objects.filter(user=self.request.user).exclude(
            status=Item.Status.DISPOSED
        )
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return ItemListSerializer
        return ItemSerializer

    def perform_create(self, serializer):
        # Delegate to service — do NOT call serializer.save() directly
        item = item_service.create_item(
            user=self.request.user,
            validated_data=serializer.validated_data,
        )
        serializer.instance = item

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        instance = item_service.update_item(
            item=instance,
            validated_data=serializer.validated_data,
            user=request.user,
        )
        return Response(ItemSerializer(instance).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        item_service.delete_item(item=instance, user=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
