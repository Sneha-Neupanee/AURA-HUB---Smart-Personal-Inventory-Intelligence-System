import django_filters
from .models import Item


class ItemFilter(django_filters.FilterSet):
    """Filterset for Items — supports status, category, and name search."""
    name = django_filters.CharFilter(lookup_expr="icontains")
    category = django_filters.CharFilter(lookup_expr="iexact")
    status = django_filters.ChoiceFilter(choices=Item.Status.choices)
    min_value = django_filters.NumberFilter(field_name="value", lookup_expr="gte")
    max_value = django_filters.NumberFilter(field_name="value", lookup_expr="lte")

    class Meta:
        model = Item
        fields = ["status", "category", "name", "min_value", "max_value"]
