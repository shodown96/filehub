from rest_framework.pagination import PageNumberPagination


class BasePageNumberPagination(PageNumberPagination):
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data):
        return {
            "items": data,
            "page": self.page.number,
            "total": self.page.paginator.count,
            "total_pages": self.page.paginator.num_pages,
            "page_size": self.page.paginator.per_page,
            "has_next": self.page.has_next(),
            "has_previous": self.page.has_previous(),
        }
