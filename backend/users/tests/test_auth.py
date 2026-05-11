from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from users.models import User


class AuthAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse("auth-register")
        self.login_url = reverse("auth-login")
        self.me_url = reverse("user-me")

        self.password = "StrongPass123!"
        self.user = User.objects.create_user(
            username="authuser",
            email="auth@example.com",
            password=self.password,
        )

    def test_user_registration_success_returns_201(self):
        payload = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "NewStrongPass123!",
            "password2": "NewStrongPass123!",
        }

        response = self.client.post(self.register_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertTrue(User.objects.filter(email="newuser@example.com").exists())

    def test_duplicate_user_registration_fails(self):
        payload = {
            "username": "anothername",
            "email": self.user.email,
            "password": "AnotherStrong123!",
            "password2": "AnotherStrong123!",
        }

        response = self.client.post(self.register_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_access_and_refresh_tokens(self):
        payload = {"username": self.user.username, "password": self.password}

        response = self.client.post(self.login_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_fails_with_wrong_password(self):
        payload = {"username": self.user.username, "password": "WrongPass123!"}

        response = self.client.post(self.login_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_protected_endpoint_returns_401_without_token(self):
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_protected_endpoint_works_with_valid_token(self):
        login_response = self.client.post(
            self.login_url,
            {"username": self.user.username, "password": self.password},
            format="json",
        )
        access_token = login_response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)
