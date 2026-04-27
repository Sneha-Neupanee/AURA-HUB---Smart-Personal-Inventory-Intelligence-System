from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import RegisterView, CustomTokenObtainPairView, LogoutView, MeView

urlpatterns = [
    # Auth
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    # Profile
    path("users/me/", MeView.as_view(), name="user-me"),
]
