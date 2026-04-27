from rest_framework import serializers
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    item_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = [
            "id", "action_type", "item", "item_name",
            "user_email", "metadata", "timestamp",
        ]

    def get_item_name(self, obj):
        return obj.item.name if obj.item else None

    def get_user_email(self, obj):
        return obj.user.email
