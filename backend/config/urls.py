"""
Root URL configuration — Real Estate API

All API routes are prefixed with /api/
Django admin is at /admin/
Media files are served in development only.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = "Zennor Control Center"
admin.site.site_title = "Zennor Admin"
admin.site.index_title = "Zennor Real Estate Administration"

from django.http import JsonResponse
from django.shortcuts import redirect

def root_api_status(request):
    return JsonResponse({
        "status": "online",
        "name": "Zennor API",
        "version": "1.0.0",
        "admin": "/admin/",
        "endpoints": {
            "properties": "/api/properties/",
            "auth": "/api/auth/",
            "favorites": "/api/favorites/",
            "inquiries": "/api/inquiries/",
            "chat": "/api/chat/"
        }
    })

def frontend_property_redirect(request, property_id):
    """Keep direct property links usable when opened on the API host."""
    return redirect(f'{settings.FRONTEND_APP_URL}/property/{property_id}/')

urlpatterns = [
    path('', root_api_status, name='root_status'),
    path('admin/', admin.site.urls),
    re_path(r'^property/(?P<property_id>[^/]+)/?$', frontend_property_redirect, name='frontend_property_redirect'),

    # Auth endpoints: /api/auth/register/, /api/auth/login/, etc.
    path('api/auth/', include('accounts.urls')),

    # Properties: /api/properties/, /api/properties/<id>/, /api/properties/featured/
    path('api/properties/', include('properties.urls')),

    # Favorites: /api/favorites/, /api/favorites/<id>/
    path('api/favorites/', include('favorites.urls')),

    # Inquiries: /api/inquiries/, /api/inquiries/received/, /api/inquiries/<id>/read/
    path('api/inquiries/', include('inquiries.urls')),

    # AI Chatbot: /api/chat/ and /api/chatbot/
    path('api/chat/', include('chatbot.urls')),
    path('api/chatbot/', include('chatbot.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/homepage/', include('homepage.urls')),
]

from django.views.static import serve

# Serve media files (uploaded images) in both development and production container environments
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
