from django.urls import path

from .views import HomepageContentView

urlpatterns = [
    path('', HomepageContentView.as_view(), name='homepage-content'),
]
