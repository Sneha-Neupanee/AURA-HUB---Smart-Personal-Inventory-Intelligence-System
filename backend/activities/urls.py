from django.urls import path
from .views import ActivityLogListView, RecentActivityView

urlpatterns = [
    path("activities/", ActivityLogListView.as_view(), name="activity-list"),
    path("activities/recent/", RecentActivityView.as_view(), name="activity-recent"),
]
