import django_filters
from django.db.models import Q
from files.models import Entry


class EntryFilter(django_filters.FilterSet):
    # Search by filename (case-insensitive partial match)
    search = django_filters.CharFilter(
        field_name="file__original_filename",
        lookup_expr="icontains",
        help_text="Search files by filename",
    )

    # Filter by file type (exact match)
    file_type = django_filters.CharFilter(
        field_name="file__file_type",
        lookup_expr="iexact",
        help_text="Filter by file type (e.g., 'pdf', 'jpg')",
    )

    # Size range filters
    min_size = django_filters.NumberFilter(
        field_name="file__size", lookup_expr="gte", help_text="Minimum file size in bytes"
    )

    max_size = django_filters.NumberFilter(
        field_name="file__size", lookup_expr="lte", help_text="Maximum file size in bytes"
    )

    # Date filters
    uploaded_after = django_filters.DateTimeFilter(
        field_name="file__created_at",
        lookup_expr="gte",
        help_text="Files uploaded after this date (ISO format: 2024-01-01T00:00:00Z)",
    )

    uploaded_before = django_filters.DateTimeFilter(
        field_name="file__created_at",
        lookup_expr="lte",
        help_text="Files uploaded before this date",
    )

    # Date range filter (alternative approach)
    uploaded_at = django_filters.DateFromToRangeFilter(
        field_name="file__created_at",
        help_text="Date range filter (uploaded_at_after and uploaded_at_before)",
    )

    # Custom method filter for complex search
    advanced_search = django_filters.CharFilter(
        method="filter_advanced_search",
        help_text="Search across filename and file type",
    )

    def filter_advanced_search(self, queryset, name, value):
        """Search across multiple fields"""
        return queryset.filter(
            Q(file__original_filename__icontains=value) | Q(file__file_type__icontains=value)
        )

    class Meta:
        model = Entry
        fields = [
            "search",
            "name",
            "file_type",
            "min_size",
            "max_size",
            "uploaded_after",
            "uploaded_before",
        ]
