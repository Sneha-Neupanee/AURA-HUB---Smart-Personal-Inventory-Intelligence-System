from items.models import Item
from activities.services.activity_service import log_action
from activities.models import ActivityLog


def create_item(user, validated_data: dict) -> Item:
    """
    Create a new item and log CREATED_ITEM activity.
    All item creation MUST go through this service.
    """
    item = Item.objects.create(user=user, **validated_data)
    log_action(
        user=user,
        action_type=ActivityLog.ActionType.CREATED_ITEM,
        item=item,
        metadata={"name": item.name, "category": item.category},
    )
    return item


def update_item(item: Item, validated_data: dict, user) -> Item:
    """
    Update item fields and log UPDATED_ITEM activity.
    All item updates MUST go through this service.
    """
    changed_fields = {}
    for attr, value in validated_data.items():
        old_value = getattr(item, attr)
        if old_value != value:
            changed_fields[attr] = {"from": str(old_value), "to": str(value)}
        setattr(item, attr, value)

    # Handle ARCHIVED_ITEM separately
    if "status" in validated_data and validated_data["status"] == Item.Status.ARCHIVED:
        action = ActivityLog.ActionType.ARCHIVED_ITEM
    else:
        action = ActivityLog.ActionType.UPDATED_ITEM

    item.save()
    log_action(
        user=user,
        action_type=action,
        item=item,
        metadata={"changed_fields": changed_fields},
    )
    return item


def delete_item(item: Item, user) -> Item:
    """
    Soft-delete: sets status to DISPOSED and logs DELETED_ITEM.
    Items are NEVER hard-deleted.
    """
    item.status = Item.Status.DISPOSED
    item.save(update_fields=["status", "updated_at"])
    log_action(
        user=user,
        action_type=ActivityLog.ActionType.DELETED_ITEM,
        item=item,
        metadata={"name": item.name},
    )
    return item
