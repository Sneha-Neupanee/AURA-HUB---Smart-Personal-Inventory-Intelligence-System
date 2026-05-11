from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from activities.models import ActivityLog
from items.models import Item
from users.models import User


class ActivityAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.activity_list_url = reverse("activity-list")
        self.item_list_url = reverse("item-list")

        self.password = "StrongPass123!"
        self.user = User.objects.create_user(
            username="activityuser",
            email="activity@example.com",
            password=self.password,
        )
        self._authenticate()

    def _authenticate(self):
        login_response = self.client.post(
            reverse("auth-login"),
            {"username": self.user.username, "password": self.password},
            format="json",
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}"
        )

    def _create_item_via_api(self, name="Notebook"):
        payload = {
            "name": name,
            "category": "Stationery",
            "description": "Activity test item",
            "value": "10.00",
            "status": Item.Status.ACTIVE,
        }
        response = self.client.post(self.item_list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return response

    def test_creating_item_generates_activity_log_entry(self):
        before_count = ActivityLog.objects.count()
        self._create_item_via_api(name="Created Item")

        self.assertEqual(ActivityLog.objects.count(), before_count + 1)
        latest = ActivityLog.objects.order_by("-timestamp").first()
        self.assertEqual(latest.action_type, ActivityLog.ActionType.CREATED_ITEM)

    def test_updating_item_generates_activity_log_entry(self):
        create_response = self._create_item_via_api(name="Update Target")
        item_id = create_response.data["id"]
        item_detail_url = reverse("item-detail", kwargs={"pk": item_id})

        response = self.client.patch(
            item_detail_url,
            {"name": "Updated Target"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        latest = ActivityLog.objects.order_by("-timestamp").first()
        self.assertEqual(latest.action_type, ActivityLog.ActionType.UPDATED_ITEM)

    def test_deleting_item_generates_activity_log_entry(self):
        create_response = self._create_item_via_api(name="Delete Target")
        item_id = create_response.data["id"]
        item_detail_url = reverse("item-detail", kwargs={"pk": item_id})

        response = self.client.delete(item_detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        latest = ActivityLog.objects.order_by("-timestamp").first()
        self.assertEqual(latest.action_type, ActivityLog.ActionType.DELETED_ITEM)

    def test_activity_logs_are_append_only_cannot_be_edited_via_api(self):
        self._create_item_via_api(name="Immutable Target")
        latest = ActivityLog.objects.order_by("-timestamp").first()
        patch_url = reverse("activity-list") + f"{latest.id}/"

        response = self.client.patch(
            patch_url,
            {"metadata": {"tampered": True}},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_activity_log_is_linked_to_user_and_item(self):
        self._create_item_via_api(name="Linked Target")
        latest = ActivityLog.objects.order_by("-timestamp").first()

        self.assertEqual(latest.user, self.user)
        self.assertIsNotNone(latest.item)
        self.assertEqual(latest.item.name, "Linked Target")
