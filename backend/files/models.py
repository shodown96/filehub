import uuid
import os
from django.db import models
from common.models import BaseModel, BaseImmutableModel


def file_upload_path(instance, filename):
    """Generate file path for new file upload"""
    ext = filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join("uploads", filename)


# class File(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     file = models.FileField(upload_to=file_upload_path)
#     original_filename = models.CharField(max_length=255)
#     file_type = models.CharField(max_length=100)
#     size = models.BigIntegerField()
#     uploaded_at = models.DateTimeField(auto_now_add=True)
#     hash = models.CharField(max_length=150, unique=True)
#     upload_count = models.PositiveIntegerField(default=1)

#     class Meta:
#         ordering = ["-uploaded_at"]
#         indexes = [
#             # Core indexes for common queries
#             models.Index(fields=["hash"]),  # Deduplication (critical)
#             models.Index(fields=["uploaded_at"]),  # Ordering + filtering
#             models.Index(fields=["file_type"]),  # Common filter
#             models.Index(fields=["size"]),  # Range queries
#             # Composite indexes for common filter combinations
#             models.Index(fields=["file_type", "uploaded_at"]),  # Very common combo
#             models.Index(fields=["size", "uploaded_at"]),  # Size + date filtering
#         ]

#     def __str__(self):
#         return self.original_filename


# This is better
class File(BaseImmutableModel):
    file = models.FileField(upload_to=file_upload_path)
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    size = models.BigIntegerField()
    hash_value = models.CharField(max_length=150, unique=True)
    hash_type = models.CharField(max_length=50)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            # Core indexes for common queries
            models.Index(fields=["hash_value"]),  # Deduplication (critical)
            models.Index(fields=["created_at"]),  # Ordering + filtering
            models.Index(fields=["file_type"]),  # Common filter
            models.Index(fields=["size"]),  # Range queries
            # Composite indexes for common filter combinations
            models.Index(fields=["file_type", "created_at"]),  # Very common combo
            models.Index(fields=["size", "created_at"]),  # Size + date filtering
        ]

    def __str__(self):
        return self.original_filename


class Entry(BaseModel):
    name = models.CharField(max_length=255, blank=True)
    # description = models.TextField(blank=True)
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name="entries")

    class Meta:
        ordering = ["-created_at"]
        
    def __str__(self):
        return self.name
