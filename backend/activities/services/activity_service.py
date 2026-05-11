from activities.models import ActivityLog


def _create_activity_log(user, action_type: str, item=None, metadata: dict = None) -> ActivityLog:
    return ActivityLog.objects.create(
        user=user,
        action_type=action_type,
        item=item,
        metadata=metadata or {},
    )


def log_action(user, action_type: str, item=None, metadata: dict = None) -> ActivityLog:
    """
    Create a new ActivityLog entry. This is the ONLY way to create logs.
    NEVER call ActivityLog.objects.update() — logs are append-only.

    Args:
        user: The User performing the action.
        action_type: One of ActivityLog.ActionType choices.
        item: Optional Item FK.
        metadata: Optional JSON payload with contextual details.
    Returns:
        The created ActivityLog instance.
    """
    return _create_activity_log(
        user=user,
        action_type=action_type,
        item=item,
        metadata=metadata,
    )


def log_action_async(user, action_type: str, item=None, metadata: dict = None) -> ActivityLog:
    """
    Best-effort async logging with safe sync fallback.
    If Celery/Redis is unavailable, log synchronously.
    """
    payload = metadata or {}
    item_id = str(item.id) if item else None
    try:
        from activities.tasks import async_activity_log_task

        async_activity_log_task.delay(
            str(user.id),
            action_type,
            item_id,
            payload,
        )
        return None
    except Exception:
        return _create_activity_log(
            user=user,
            action_type=action_type,
            item=item,
            metadata=payload,
        )
