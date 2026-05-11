from celery import shared_task
from django.core.cache import cache
from django.db.models import Count

from activities.models import ActivityLog
from activities.serializers import ActivityLogSerializer
from items.models import Item
from users.models import User


def _build_dashboard_payload(user):
    item_stats = (
        Item.objects.filter(user=user)
        .exclude(status=Item.Status.DISPOSED)
        .values("status")
        .annotate(count=Count("id"))
    )
    status_map = {row["status"]: row["count"] for row in item_stats}
    recent_logs = (
        ActivityLog.objects.filter(user=user).select_related("item").order_by("-timestamp")[:10]
    )
    return {
        "total_items": sum(status_map.values()),
        "active_items": status_map.get(Item.Status.ACTIVE, 0),
        "archived_items": status_map.get(Item.Status.ARCHIVED, 0),
        "recent_activities": ActivityLogSerializer(recent_logs, many=True).data,
    }


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def async_dashboard_aggregation_task(self, user_id):
    user = User.objects.get(pk=user_id)
    payload = _build_dashboard_payload(user)
    cache.set(f"dashboard:summary:{user_id}", payload, timeout=60)
    return payload
