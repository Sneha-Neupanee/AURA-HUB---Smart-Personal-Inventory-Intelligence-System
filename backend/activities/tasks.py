from celery import shared_task

from activities.models import ActivityLog
from items.models import Item
from users.models import User


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def async_activity_log_task(self, user_id, action_type, item_id=None, metadata=None):
    user = User.objects.get(pk=user_id)
    item = Item.objects.filter(pk=item_id).first() if item_id else None
    return str(
        ActivityLog.objects.create(
            user=user,
            action_type=action_type,
            item=item,
            metadata=metadata or {},
        ).id
    )
