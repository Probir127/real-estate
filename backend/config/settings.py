"""
Django Settings — Real Estate API
"""
from pathlib import Path
from datetime import timedelta
from decouple import config
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent

# Security
SECRET_KEY = config('SECRET_KEY', default='change-me-in-production')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,.onrender.com,testserver').split(',')

if not DEBUG and SECRET_KEY == 'change-me-in-production':
    raise ImproperlyConfigured('SECRET_KEY must be configured when DEBUG=False.')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'django_extensions',

    # Local apps
    'accounts',
    'properties',
    'favorites',
    'inquiries',
    'chatbot',
    'payments',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',       # Serve static files efficiently on Render
    'corsheaders.middleware.CorsMiddleware',            # Must be before CommonMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database configuration.
# Prefer Postgres when explicitly configured (Render / production), but fall back to
# SQLite so local and CI/test environments can run without a local Postgres server.
import dj_database_url

DB_URL = config('DATABASE_URL', default='')
USE_SQLITE = config('USE_SQLITE', default=(not DB_URL), cast=bool)

if DB_URL:
    DATABASES = {
        'default': dj_database_url.config(default=DB_URL, conn_max_age=600, conn_health_checks=True)
    }
elif USE_SQLITE:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='realestate_db'),
            'USER': config('DB_USER', default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default='password'),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='5432'),
            'OPTIONS': {
                'connect_timeout': 10,
            },
        }
    }

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# Password Validators
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static & Media Files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static'] if (BASE_DIR / 'static').exists() else []
MEDIA_URL = config('MEDIA_URL', default='/media/')
MEDIA_ROOT = BASE_DIR / config('MEDIA_ROOT', default='media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ─────────────────────────────────────────────────────────
# Django REST Framework
# ─────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_THROTTLE_CLASSES': [],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '10000/day',
        'user': '100000/day',
        'login': '100/minute',
        'register': '1000/hour',
        'inquiry': '1000/day',
    },
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',   # For file uploads
        'rest_framework.parsers.FormParser',
    ],
    'EXCEPTION_HANDLER': 'config.exceptions.custom_exception_handler',
}

# ─────────────────────────────────────────────────────────
# SimpleJWT Configuration
# ─────────────────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(
        minutes=config('JWT_ACCESS_TOKEN_LIFETIME_MINUTES', default=60, cast=int)
    ),
    'REFRESH_TOKEN_LIFETIME': timedelta(
        days=config('JWT_REFRESH_TOKEN_LIFETIME_DAYS', default=7, cast=int)
    ),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# ─────────────────────────────────────────────────────────
# CORS Configuration
# ─────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5173,http://127.0.0.1:5173'
).split(',')
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ['DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT']
CORS_ALLOW_HEADERS = [
    'accept', 'accept-encoding', 'authorization', 'content-type',
    'dnt', 'origin', 'user-agent', 'x-csrftoken', 'x-requested-with',
]

# SSLCommerz subscription checkout. Keep these values server-side.
SSLCOMMERZ_STORE_ID = config('SSLCOMMERZ_STORE_ID', default='')
SSLCOMMERZ_STORE_PASSWORD = config('SSLCOMMERZ_STORE_PASSWORD', default='')
SSLCOMMERZ_IS_SANDBOX = config('SSLCOMMERZ_IS_SANDBOX', default=True, cast=bool)
SSLCOMMERZ_SUCCESS_URL = config('SSLCOMMERZ_SUCCESS_URL', default='')
SSLCOMMERZ_FAIL_URL = config('SSLCOMMERZ_FAIL_URL', default='')
SSLCOMMERZ_CANCEL_URL = config('SSLCOMMERZ_CANCEL_URL', default='')
SSLCOMMERZ_IPN_URL = config('SSLCOMMERZ_IPN_URL', default='')
FRONTEND_APP_URL = config('FRONTEND_APP_URL', default='http://localhost:5173').rstrip('/')

# ─────────────────────────────────────────────────────────
# Security Headers
# ─────────────────────────────────────────────────────────
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=not DEBUG, cast=bool)
SECURE_HSTS_SECONDS = config('SECURE_HSTS_SECONDS', default=31536000 if not DEBUG else 0, cast=int)
SECURE_HSTS_INCLUDE_SUBDOMAINS = config(
    'SECURE_HSTS_INCLUDE_SUBDOMAINS', default=not DEBUG, cast=bool
)
SECURE_HSTS_PRELOAD = config('SECURE_HSTS_PRELOAD', default=not DEBUG, cast=bool)
SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=not DEBUG, cast=bool)
CSRF_COOKIE_SECURE = config('CSRF_COOKIE_SECURE', default=not DEBUG, cast=bool)

# Admin bootstrap is only available locally unless explicitly protected.
ADMIN_SETUP_TOKEN = config('ADMIN_SETUP_TOKEN', default='')
ADMIN_SETUP_EMAIL = config('ADMIN_SETUP_EMAIL', default='admin@zennor.com')
ADMIN_SETUP_PASSWORD = config('ADMIN_SETUP_PASSWORD', default='')

# In production, also set:
# SECURE_SSL_REDIRECT = True
# SECURE_HSTS_SECONDS = 31536000
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# SECURE_HSTS_PRELOAD = True
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True

# ─────────────────────────────────────────────────────────
# File Upload Security
# ─────────────────────────────────────────────────────────
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024   # 5 MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB per image

# ─────────────────────────────────────────────────────────
# Hugging Face AI Chatbot Integration
# ─────────────────────────────────────────────────────────
HUGGINGFACE_API_KEY = config('HUGGINGFACE_API_KEY', default='')
HUGGINGFACE_MODEL = config('HUGGINGFACE_MODEL', default='meta-llama/Llama-3.1-8B-Instruct')
