import uuid
from django.db import models


class ActivityLog(models.Model):
    """
    Append-only audit log. NEVER mutate existing rows — only INSERT.
    Tracks all significant user actions on items.
    """

    class ActionType(models.TextChoices):
        CREATED_ITEM = "CREATED_ITEM", "Created Item"
        UPDATED_ITEM = "UPDATED_ITEM", "Updated Item"
        DELETED_ITEM = "DELETED_ITEM", "Deleted Item"
        VIEWED_ITEM = "VIEWED_ITEM", "Viewed Item"
        ARCHIVED_ITEM = "ARCHIVED_ITEM", "Archived Item"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="activity_logs",
    )
    item = models.ForeignKey(
        "items.Item",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activity_logs",
    )
    action_type = models.CharField(max_length=30, choices=ActionType.choices, db_index=True)
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "activity_logs"
        ordering = ["-timestamp"]
        # Safety: prevent accidental bulk updates
        default_permissions = ("add", "view")

    def __str__(self):
        return f"{self.user} — {self.action_type} at {self.timestamp}"

    def save(self, *args, **kwargs):
        """Guard: only allow INSERT, never UPDATE."""
        if self.pk and ActivityLog.objects.filter(pk=self.pk).exists():
            raise PermissionError("ActivityLog entries are immutable.")
        super().save(*args, **kwargs)
