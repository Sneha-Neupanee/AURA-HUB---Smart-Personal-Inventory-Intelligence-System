from rest_framework import generics, permissions
from rest_framework.response import Response
from django.db.models import Count

from items.models import Item
from activities.models import ActivityLog
from activities.serializers import ActivityLogSerializer


class DashboardSummaryView(generics.GenericAPIView):
    """
    GET /dashboard/summary/
    Returns aggregated stats for the authenticated user's inventory.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Aggregate item counts in a single query
        item_stats = (
            Item.objects.filter(user=user)
            .exclude(status=Item.Status.DISPOSED)
            .values("status")
            .annotate(count=Count("id"))
        )

        status_map = {row["status"]: row["count"] for row in item_stats}

        total_items = sum(status_map.values())
        active_items = status_map.get(Item.Status.ACTIVE, 0)
        archived_items = status_map.get(Item.Status.ARCHIVED, 0)

        # Recent 10 activities
        recent_logs = (
            ActivityLog.objects.filter(user=user)
            .select_related("item")
            .order_by("-timestamp")[:10]
        )

        return Response(
            {
                "total_items": total_items,
                "active_items": active_items,
                "archived_items": archived_items,
                "recent_activities": ActivityLogSerializer(recent_logs, many=True).data,
            }
        )
