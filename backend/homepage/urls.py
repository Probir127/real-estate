from django.urls import path

from .views import HomepageContentView, SiteContentView

urlpatterns = [
    path('', HomepageContentView.as_view(), name='homepage-content'),
    path('<str:key>/', SiteContentView.as_view(), name='site-content'),
]
