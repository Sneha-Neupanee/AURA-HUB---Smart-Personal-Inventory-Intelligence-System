from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ActivityLogViewSet, RecentActivityView

router = DefaultRouter()
router.register(r"activities", ActivityLogViewSet, basename="activities")

urlpatterns = [
    path("activities/recent/", RecentActivityView.as_view(), name="activity-recent"),
    path(
        "activities/",
        ActivityLogViewSet.as_view({"get": "list", "post": "create"}),
        name="activity-list",
    ),
    path(
        "activities/<uuid:pk>/",
        ActivityLogViewSet.as_view({"get": "retrieve"}),
        name="activity-detail",
    ),
    path("", include(router.urls)),
]
