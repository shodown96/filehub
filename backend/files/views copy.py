import math

from common.exceptions import BadRequestError
from common.response import CreatedResponse, EmptyResponse, SuccessResponse
from common.utils import format_bytes
from django.db.models import Count, F, Q, Sum
from files.models import File
from files.serializers import FileSerializer
from rest_framework import views, viewsets

# Create your views here.


class FileSavingsAPIView(views.APIView):
    http_method_names = ["get"]

    # def get_storage_stats():
    #     result = EntryFile.objects.annotate(
    #         reference_count=Count('entries')
    #     ).aggregate(
    #         actual_space=Sum('size'),
    #         would_be_space=Sum(F('size') * F('reference_count')),
    #         total_files=Count('id'),
    #         total_entries=Sum('reference_count')
    #     )

    #     actual_space = result['actual_space'] or 0
    #     would_be_space = result['would_be_space'] or 0
    #     space_saved = would_be_space - actual_space

    #     savings_percentage = (space_saved / would_be_space * 100) if would_be_space > 0 else 0
    #     deduplication_ratio = (result['total_entries'] / result['total_files']) if result['total_files'] > 0 else 0

    #     return {
    #         'actual_space': format_bytes(actual_space),
    #         'space_saved': format_bytes(space_saved),
    #         'would_be_space': format_bytes(would_be_space),
    #         'savings_percentage': f"{savings_percentage:.1f}%",
    #         'deduplication_ratio': f"{deduplication_ratio:.1f}",
    #         'total_files': result['total_files'],
    #         'total_entries': result['total_entries']
    #     }

    def get_storage_stats(self):
        stats = File.objects.aggregate(
            actual_space=Sum("size"),
            would_be_space=Sum(F("size") * F("upload_count")),
            total_files=Count("id"),
        )

        actual_space = stats["actual_space"] or 0
        would_be_space = stats["would_be_space"] or 0
        space_saved = would_be_space - actual_space

        savings_percentage = (
            (space_saved / would_be_space * 100) if would_be_space > 0 else 0
        )

        return {
            "actual_space": format_bytes(actual_space),
            "space_saved": format_bytes(space_saved),
            "would_be_space": format_bytes(would_be_space),
            "savings_percentage": f"{savings_percentage:.1f}%",
            "total_files": stats["total_files"],
        }

    def get(self, request, *args, **kwargs):
        data = self.get_storage_stats()
        return SuccessResponse(data).send()


class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    http_method_names = ["get", "post", "delete"]

    def list(self, request, *args, **kwargs):
        # Filters
        search = request.query_params.get("search")
        file_type = request.query_params.get("file_type")
        max_size = request.query_params.get("max_size")
        min_size = request.query_params.get("min_size")
        uploaded_at = request.query_params.get("uploaded_at")

        # Pagination
        page_size = request.query_params.get("page_size", 10)
        page = request.query_params.get("page", 1)

        if file_type or max_size or min_size or uploaded_at:
            qs = self.queryset.filter(
                Q(size__gte=min_size)
                | Q(size__lte=max_size)
                | Q(file_type=file_type)
                | Q(uploaded_at=uploaded_at)
                | Q(original_filename__icontains=search)
            )
            start = (page - 1) * page_size
            end = start + page_size
            paginated_qs = qs[start:end]
            serializer = self.serializer_class(instance=paginated_qs, many=True)
            headers = self.get_success_headers(paginated_qs)
            total = self.queryset.count()
            data = {
                "items": serializer.data,
                "page": page,
                "total": total,
                "total_pages": math.ceil(total / page_size),
            }
            return SuccessResponse(data, None, headers).send()

        start = (page - 1) * page_size
        end = start + page_size
        paginated_qs = self.queryset[start:end]
        headers = self.get_success_headers(paginated_qs)
        total = self.queryset.count()
        serializer = self.serializer_class(instance=paginated_qs, many=True)
        data = {
            "items": serializer.data,
            "page": page,
            "total": self.queryset.count(),
            "total_pages": math.ceil(total / page_size),
        }
        return SuccessResponse(serializer.data, None, headers).send()

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get("file")
        if not file_obj:
            raise BadRequestError()

        data = {
            "file": file_obj,
            "original_filename": file_obj.name,
            "file_type": file_obj.content_type,
            "size": file_obj.size,
        }

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return CreatedResponse(serializer.data, None, headers).send()
        # return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return EmptyResponse().send()
