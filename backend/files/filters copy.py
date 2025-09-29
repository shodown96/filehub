import django_filters
from django.db.models import Q
from files.models import File


class FileFilter(django_filters.FilterSet):
    # Search by filename (case-insensitive partial match)
    search = django_filters.CharFilter(
        field_name="original_filename",
        lookup_expr="icontains",
        help_text="Search files by filename",
    )

    # Filter by file type (exact match)
    file_type = django_filters.CharFilter(
        field_name="file_type",
        lookup_expr="iexact",
        help_text="Filter by file type (e.g., 'pdf', 'jpg')",
    )

    # Size range filters
    min_size = django_filters.NumberFilter(
        field_name="size", lookup_expr="gte", help_text="Minimum file size in bytes"
    )

    max_size = django_filters.NumberFilter(
        field_name="size", lookup_expr="lte", help_text="Maximum file size in bytes"
    )

    # Date filters
    uploaded_after = django_filters.DateTimeFilter(
        field_name="uploaded_at",
        lookup_expr="gte",
        help_text="Files uploaded after this date (ISO format: 2024-01-01T00:00:00Z)",
    )

    uploaded_before = django_filters.DateTimeFilter(
        field_name="uploaded_at",
        lookup_expr="lte",
        help_text="Files uploaded before this date",
    )

    # Date range filter (alternative approach)
    uploaded_at = django_filters.DateFromToRangeFilter(
        field_name="uploaded_at",
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
            Q(original_filename__icontains=value) | Q(file_type__icontains=value)
        )

    class Meta:
        model = File
        fields = [
            "search",
            "file_type",
            "min_size",
            "max_size",
            "uploaded_after",
            "uploaded_before",
        ]
