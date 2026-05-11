from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from items.models import Item
from users.models import User


class ItemAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.list_url = reverse("item-list")

        self.password = "StrongPass123!"
        self.user = User.objects.create_user(
            username="itemowner",
            email="itemowner@example.com",
            password=self.password,
        )
        self.other_user = User.objects.create_user(
            username="otherowner",
            email="otherowner@example.com",
            password="OtherStrongPass123!",
        )

    def _authenticate(self, user=None, password=None):
        login_response = self.client.post(
            reverse("auth-login"),
            {
                "username": (user or self.user).username,
                "password": password or self.password,
            },
            format="json",
        )
        token = login_response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def _create_item_for_user(self, user, **kwargs):
        return Item.objects.create(
            user=user,
            name=kwargs.get("name", "Laptop"),
            category=kwargs.get("category", "Electronics"),
            description=kwargs.get("description", "Work machine"),
            value=kwargs.get("value", "1500.00"),
            status=kwargs.get("status", Item.Status.ACTIVE),
        )

    def test_authenticated_user_can_create_item(self):
        self._authenticate()
        payload = {
            "name": "Phone",
            "category": "Electronics",
            "description": "Primary mobile",
            "value": "900.00",
            "status": Item.Status.ACTIVE,
        }

        response = self.client.post(self.list_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Item.objects.filter(user=self.user, name="Phone").exists())

    def test_unauthenticated_user_cannot_create_item(self):
        payload = {
            "name": "Watch",
            "category": "Wearables",
            "description": "Fitness tracker",
            "value": "250.00",
            "status": Item.Status.ACTIVE,
        }

        response = self.client.post(self.list_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_can_retrieve_list_of_items(self):
        self._create_item_for_user(self.user, name="Camera")
        self._authenticate()

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["name"], "Camera")

    def test_user_can_update_item(self):
        item = self._create_item_for_user(self.user, name="Tablet")
        self._authenticate()
        detail_url = reverse("item-detail", kwargs={"pk": item.pk})

        response = self.client.patch(
            detail_url,
            {"name": "Tablet Pro", "value": "650.00"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertEqual(item.name, "Tablet Pro")

    def test_soft_delete_works_status_changes_not_db_deletion(self):
        item = self._create_item_for_user(self.user, name="Old Monitor")
        self._authenticate()
        detail_url = reverse("item-detail", kwargs={"pk": item.pk})

        response = self.client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        item.refresh_from_db()
        self.assertEqual(item.status, Item.Status.DISPOSED)
        self.assertTrue(Item.objects.filter(pk=item.pk).exists())

    def test_deleted_items_do_not_appear_in_active_list(self):
        active_item = self._create_item_for_user(self.user, name="Router")
        disposed_item = self._create_item_for_user(
            self.user,
            name="Broken Router",
            status=Item.Status.DISPOSED,
        )
        self._authenticate()

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [row["name"] for row in response.data["results"]]
        self.assertIn(active_item.name, names)
        self.assertNotIn(disposed_item.name, names)

    def test_user_cannot_access_other_users_items(self):
        foreign_item = self._create_item_for_user(self.other_user, name="Private Item")
        self._authenticate()
        detail_url = reverse("item-detail", kwargs={"pk": foreign_item.pk})

        response = self.client.get(detail_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
