import hashlib
from rest_framework import serializers
from files.models import File, Entry
from common.exceptions import BadRequestError
from common.constants import ErrorMessages


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ["id", "file", "original_filename", "file_type", "size", "created_at"]
        read_only_fields = ["id", "hash_value", "hash_type", "created_at"]

    def create(self, validated_data):
        file = validated_data.get("file")
        # Hash the file to store the exact info about the file
        sha256 = hashlib.sha256()
        for chunk in file.chunks():  # efficient for big files
            sha256.update(chunk)

        hashed = sha256.hexdigest()
        # inject the hash value into the validated_data
        validated_data["hash_value"] = sha256.hexdigest()
        validated_data["hash_type"] = "sha256"

        existing = File.objects.filter(hash_value=hashed).first()
        if existing:
            return existing
            # existing.upload_count += 1
            # existing.save()
            # raise BadRequestError(ErrorMessages.FileAlreadyStored)

        return super().create(validated_data)


class EntrySerializer(serializers.ModelSerializer):
    file = FileSerializer()

    class Meta:
        model = Entry
        fields = "__all__"
        read_only_fields = ["file"]

    def create(self, validated_data):
        file_data = validated_data.pop("file")
        
        # Create file using FileSerializer
        file_serializer = FileSerializer(data=file_data)
        file_serializer.is_valid(raise_exception=True)
        file = file_serializer.save()
        
        entry = Entry.objects.create(file=file, **validated_data)
        return entry
