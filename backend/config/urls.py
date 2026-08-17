"""
Root URL configuration — Real Estate API

All API routes are prefixed with /api/
Django admin is at /admin/
Media files are served in development only.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = "PrestigeRealty Control Center"
admin.site.site_title = "PrestigeRealty Admin"
admin.site.index_title = "Real Estate Platform Administration"

from django.http import JsonResponse

def root_api_status(request):
    return JsonResponse({
        "status": "online",
        "name": "PrestigeRealty API",
        "version": "1.0.0",
        "admin": "/admin/",
        "endpoints": {
            "properties": "/api/properties/",
            "auth": "/api/auth/",
            "favorites": "/api/favorites/",
            "inquiries": "/api/inquiries/"
        }
    })

urlpatterns = [
    path('', root_api_status, name='root_status'),
    path('admin/', admin.site.urls),

    # Auth endpoints: /api/auth/register/, /api/auth/login/, etc.
    path('api/auth/', include('accounts.urls')),

    # Properties: /api/properties/, /api/properties/<id>/, /api/properties/featured/
    path('api/properties/', include('properties.urls')),

    # Favorites: /api/favorites/, /api/favorites/<id>/
    path('api/favorites/', include('favorites.urls')),

    # Inquiries: /api/inquiries/, /api/inquiries/received/, /api/inquiries/<id>/read/
    path('api/inquiries/', include('inquiries.urls')),
]

from django.urls import re_path
from django.views.static import serve

# Serve media files (uploaded images) in both development and production container environments
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
