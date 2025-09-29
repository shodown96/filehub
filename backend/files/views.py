import math

from common.exceptions import BadRequestError
from common.filters import BasePageNumberPagination
from common.response import CreatedResponse, EmptyResponse, SuccessResponse
from common.utils import format_bytes
from django.db.models import Count, F, Q, Sum
from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from files.filters import EntryFilter
from files.models import Entry, File
from files.serializers import EntrySerializer
from rest_framework import status, views, viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

# Create your views here.


class FileSavingsAPIView(views.APIView):
    http_method_names = ["get"]

    def get_storage_stats(self):
        result = File.objects.annotate(reference_count=Count("entries")).aggregate(
            actual_space=Sum("size"),
            would_be_space=Sum(F("size") * F("reference_count")),
            total_files=Count("id"),
            total_entries=Sum("reference_count"),
        )

        actual_space = result["actual_space"] or 0
        would_be_space = result["would_be_space"] or 0
        space_saved = would_be_space - actual_space

        savings_percentage = (
            (space_saved / would_be_space * 100) if would_be_space > 0 else 0
        )
        deduplication_ratio = (
            (result["total_entries"] / result["total_files"])
            if result["total_files"] > 0
            else 0
        )

        return {
            "actual_space": format_bytes(actual_space),
            "space_saved": format_bytes(space_saved),
            "would_be_space": format_bytes(would_be_space),
            "savings_percentage": f"{savings_percentage:.1f}%",
            "deduplication_ratio": f"{deduplication_ratio:.1f}",
            "total_files": result["total_files"],
            "total_entries": result["total_entries"],
        }

    def get(self, request, *args, **kwargs):
        data = self.get_storage_stats()
        return SuccessResponse(data).send()


class EntryViewSet(viewsets.ModelViewSet):
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer
    http_method_names = ["get", "post", "delete"]

    # Django Filter Backend
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = EntryFilter

    # Pagination
    pagination_class = BasePageNumberPagination

    def list(self, request, *args, **kwargs):
        """
        Override list to add custom response format if needed
        """
        # The filtering is automatically handled by django-filter
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return SuccessResponse(self.get_paginated_response(serializer.data)).send()

        serializer = self.get_serializer(queryset, many=True)
        return SuccessResponse(serializer.data).send()

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get("file") or request.FILES.get("file.file")
        if not file_obj:
            raise BadRequestError("No file was uploaded")

        data = {
            "name": request.data.get("name") or file_obj.name,
            "file": {
                "file": file_obj,
                "original_filename": file_obj.name,
                "file_type": file_obj.content_type,
                "size": file_obj.size,
            },
        }

        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            print(serializer.errors)
            raise BadRequestError()
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return CreatedResponse(serializer.data, None, headers).send()
        # return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return EmptyResponse().send()
