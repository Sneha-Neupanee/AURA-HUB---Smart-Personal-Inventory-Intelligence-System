from activities.models import ActivityLog


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
    return ActivityLog.objects.create(
        user=user,
        action_type=action_type,
        item=item,
        metadata=metadata or {},
    )
