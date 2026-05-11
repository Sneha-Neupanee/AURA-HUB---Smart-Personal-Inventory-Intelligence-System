from rest_framework import generics, permissions, viewsets

from .models import ActivityLog
from .serializers import ActivityLogSerializer


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only activities endpoint with list/retrieve."""
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            ActivityLog.objects.filter(user=self.request.user)
            .select_related("item", "user")
            .order_by("-timestamp")
        )


class RecentActivityView(generics.ListAPIView):
    """GET /activities/recent/ — last 10 activities for current user."""
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # No pagination for recent feed

    def get_queryset(self):
        return (
            ActivityLog.objects.filter(user=self.request.user)
            .select_related("item", "user")
            .order_by("-timestamp")[:10]
        )
