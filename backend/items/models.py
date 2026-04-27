from django.db import models
from core.models import BaseModel


class Item(BaseModel):
    """
    Core inventory item model. Soft-delete via status=disposed.
    """

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        ARCHIVED = "archived", "Archived"
        DISPOSED = "disposed", "Disposed"

    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="items",
    )
    name = models.CharField(max_length=255, db_index=True)
    category = models.CharField(max_length=100, db_index=True)
    description = models.TextField(blank=True, default="")
    value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.ACTIVE, db_index=True
    )

    class Meta:
        db_table = "items"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "created_at"], name="idx_item_user_created"),
            models.Index(fields=["category"], name="idx_item_category"),
        ]

    def __str__(self):
        return f"{self.name} ({self.status})"
