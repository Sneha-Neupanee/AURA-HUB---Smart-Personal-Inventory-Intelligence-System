from rest_framework import serializers
from .models import Item


class ItemSerializer(serializers.ModelSerializer):
    """Full item serializer — for create, retrieve, update."""

    class Meta:
        model = Item
        fields = [
            "id", "name", "category", "description",
            "value", "status", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ItemListSerializer(serializers.ModelSerializer):
    """Lightweight list serializer — omits description for performance."""

    class Meta:
        model = Item
        fields = ["id", "name", "category", "value", "status", "created_at"]
