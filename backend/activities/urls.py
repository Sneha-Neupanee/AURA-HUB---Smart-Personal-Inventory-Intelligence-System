from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ActivityLogViewSet, RecentActivityView

router = DefaultRouter()
router.register(r"activities", ActivityLogViewSet, basename="activity")

urlpatterns = [
    path("activities/recent/", RecentActivityView.as_view(), name="activity-recent"),
    path("", include(router.urls)),
]
