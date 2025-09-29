from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EntryViewSet, FileSavingsAPIView

router = DefaultRouter()
router.register(r'files', EntryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('files/savings', FileSavingsAPIView.as_view())
] 