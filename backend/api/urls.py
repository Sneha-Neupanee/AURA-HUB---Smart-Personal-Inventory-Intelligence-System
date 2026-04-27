"""
AURA HUB API v1 — Versioned URL Router
All endpoints live under /api/v1/
"""
from django.urls import path, include

urlpatterns = [
    path("", include("users.urls")),
    path("", include("items.urls")),
    path("", include("activities.urls")),
    path("", include("dashboard.urls")),
]
