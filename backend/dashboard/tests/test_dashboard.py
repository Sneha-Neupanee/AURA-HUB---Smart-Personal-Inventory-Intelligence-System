from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from activities.models import ActivityLog
from items.models import Item
from users.models import User


class DashboardAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.dashboard_url = reverse("dashboard-summary")
        self.item_list_url = reverse("item-list")

        self.password = "StrongPass123!"
        self.user = User.objects.create_user(
            username="dashuser",
            email="dash@example.com",
            password=self.password,
        )

    def _authenticate(self):
        login_response = self.client.post(
            reverse("auth-login"),
            {"username": self.user.username, "password": self.password},
            format="json",
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}"
        )

    def _create_item_via_api(self, name, status_value):
        payload = {
            "name": name,
            "category": "Electronics",
            "description": "Dashboard test item",
            "value": "100.00",
            "status": status_value,
        }
        response = self.client.post(self.item_list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return response

    def test_dashboard_endpoint_returns_correct_aggregated_stats(self):
        self._authenticate()
        self._create_item_via_api("Item Active 1", Item.Status.ACTIVE)
        self._create_item_via_api("Item Active 2", Item.Status.ACTIVE)
        self._create_item_via_api("Item Archived", Item.Status.ARCHIVED)

        response = self.client.get(self.dashboard_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_items"], 3)
        self.assertEqual(response.data["active_items"], 2)
        self.assertEqual(response.data["archived_items"], 1)

    def test_response_includes_expected_keys(self):
        self._authenticate()
        response = self.client.get(self.dashboard_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected_keys = {
            "total_items",
            "active_items",
            "archived_items",
            "recent_activities",
        }
        self.assertTrue(expected_keys.issubset(response.data.keys()))

    def test_endpoint_requires_authentication(self):
        response = self.client.get(self.dashboard_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_response_format_is_valid_json(self):
        self._authenticate()
        response = self.client.get(self.dashboard_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)
        self.assertIsInstance(response.data["recent_activities"], list)

    def test_values_match_actual_db_state(self):
        self._authenticate()
        self._create_item_via_api("DB Active", Item.Status.ACTIVE)
        self._create_item_via_api("DB Archived", Item.Status.ARCHIVED)
        disposed_item = Item.objects.create(
            user=self.user,
            name="DB Disposed",
            category="Electronics",
            description="Excluded from summary",
            value="50.00",
            status=Item.Status.DISPOSED,
        )
        ActivityLog.objects.create(
            user=self.user,
            item=disposed_item,
            action_type=ActivityLog.ActionType.CREATED_ITEM,
            metadata={"source": "manual-test"},
        )

        response = self.client.get(self.dashboard_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected_total = (
            Item.objects.filter(user=self.user)
            .exclude(status=Item.Status.DISPOSED)
            .count()
        )
        expected_active = Item.objects.filter(
            user=self.user, status=Item.Status.ACTIVE
        ).count()
        expected_archived = Item.objects.filter(
            user=self.user, status=Item.Status.ARCHIVED
        ).count()

        self.assertEqual(response.data["total_items"], expected_total)
        self.assertEqual(response.data["active_items"], expected_active)
        self.assertEqual(response.data["archived_items"], expected_archived)
