# 🏡 Prestige Realty — Full-Stack Real Estate Platform

A production-ready, decoupled real estate platform built with **Django REST Framework** (backend) and **React + Vite** (frontend). Features JWT authentication, property CRUD, favorites, agent inquiries, rate limiting, and a premium dark luxury UI.

---

## 📁 Project Structure

```
realestate/
├── backend/          # Django REST API (Python)
│   ├── config/       # Settings, URLs, exceptions, wsgi
│   ├── accounts/     # Custom user model, JWT auth
│   ├── properties/   # Property listings + images
│   ├── favorites/    # Saved properties per user
│   ├── inquiries/    # Contact agent form
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/         # React + Vite SPA
    ├── src/
    │   ├── api/      # Axios client with JWT interceptors
    │   ├── components/   # Navbar, PropertyCard, Pagination, ...
    │   ├── context/      # AuthContext (JWT state)
    │   ├── pages/        # All page components
    │   └── utils/        # helpers.js
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 14+

---

### Backend Setup

```bash
cd backend

# 1. Create & activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
copy .env.example .env
# Edit .env — set DB_PASSWORD, SECRET_KEY, etc.

# 4. Create PostgreSQL database
# In psql: CREATE DATABASE realestate_db;

# 5. Run migrations
python manage.py migrate

# 6. Create superuser (admin)
python manage.py createsuperuser

# 7. Start development server
python manage.py runserver
```

Backend runs at: **http://localhost:8000**
Admin panel: **http://localhost:8000/admin/**

---

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

> **Note:** The Vite dev proxy forwards all `/api` and `/media` requests to `http://localhost:8000`, so no CORS issues in development.

---

## 🔐 API Endpoints

### Authentication — `/api/auth/`

| Method | Endpoint | Description | Auth | Rate Limit |
|--------|----------|-------------|------|------------|
| POST | `/auth/register/` | Create account | No | 10/hour |
| POST | `/auth/login/` | Get JWT tokens | No | 5/minute |
| POST | `/auth/refresh/` | Refresh access token | No | — |
| POST | `/auth/logout/` | Blacklist refresh token | Yes | — |
| GET/PATCH | `/auth/profile/` | View/update profile | Yes | — |
| POST | `/auth/change-password/` | Change password | Yes | — |

### Properties — `/api/properties/`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/properties/` | List (filter, search, paginate) | No |
| GET | `/properties/featured/` | Featured listings | No |
| GET | `/properties/{id}/` | Property detail | No |
| POST | `/properties/` | Create listing | Agent only |
| PATCH | `/properties/{id}/` | Update listing | Owner only |
| DELETE | `/properties/{id}/` | Delete listing | Owner only |
| GET | `/properties/my-listings/` | Agent's own listings | Agent |
| POST | `/properties/{id}/images/` | Upload image | Owner |
| DELETE | `/properties/images/{id}/` | Delete image | Owner |

### Favorites — `/api/favorites/`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/favorites/` | List saved properties | Yes |
| POST | `/favorites/` | Save a property | Yes |
| DELETE | `/favorites/{id}/` | Remove saved property | Yes |

### Inquiries — `/api/inquiries/`

| Method | Endpoint | Description | Auth | Rate Limit |
|--------|----------|-------------|------|------------|
| POST | `/inquiries/` | Send inquiry to agent | No | 20/day |
| GET | `/inquiries/received/` | Agent's received inquiries | Agent | — |
| PATCH | `/inquiries/{id}/read/` | Mark inquiry as read | Agent | — |

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| **JWT Authentication** | SimpleJWT — access (60 min) + refresh (7 days) |
| **Token Blacklisting** | Logout invalidates refresh tokens |
| **Rate Limiting** | Login: 5/min · Register: 10/hr · Inquiries: 20/day |
| **XSS Prevention** | `bleach.clean()` on all user text inputs |
| **Image Validation** | MIME type + size check (JPEG/PNG/WebP, max 5 MB) |
| **Permission System** | `IsAgent`, `IsOwner`, `IsAgentOrReadOnly` |
| **CORS** | Whitelist-only (`corsheaders`) |
| **Security Headers** | `SECURE_CONTENT_TYPE_NOSNIFF`, `X_FRAME_OPTIONS=DENY` |
| **Password Validation** | Django's built-in validators (min 8 chars) |
| **Consistent Errors** | Custom exception handler — uniform JSON shape |

---

## 🌐 Frontend Pages & Routes

| Route | Component | Access |
|-------|-----------|--------|
| `/` | HomePage | Public |
| `/properties` | PropertiesPage | Public |
| `/properties/:id` | PropertyDetailPage | Public |
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/favorites` | FavoritesPage | Auth required |
| `/profile` | ProfilePage | Auth required |
| `/dashboard` | DashboardPage | Agent only |
| `/properties/new` | PropertyFormPage | Agent only |
| `/properties/:id/edit` | PropertyFormPage | Agent only |
| `*` | NotFoundPage | Public |

---

## ⚙️ Environment Variables

### Backend (`.env`)
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=realestate_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:5173

JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

MEDIA_URL=/media/
MEDIA_ROOT=media/
```

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 🏗️ Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Set a strong `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Enable `SECURE_SSL_REDIRECT=True`
- [ ] Enable `SECURE_HSTS_SECONDS=31536000`
- [ ] Set `SESSION_COOKIE_SECURE=True` and `CSRF_COOKIE_SECURE=True`
- [ ] Serve media files with Nginx
- [ ] Run `python manage.py collectstatic`
- [ ] Use Gunicorn/uWSGI as WSGI server
- [ ] Use `npm run build` for frontend static files

---

## 🧪 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 5.2, Django REST Framework 3.16 |
| Auth | SimpleJWT 5.5 (JWT + token blacklisting) |
| Database | PostgreSQL (psycopg2) |
| Filtering | django-filter |
| Security | bleach, corsheaders |
| Frontend | React 19, Vite 8 |
| Routing | React Router DOM v7 |
| HTTP Client | Axios (with JWT interceptors) |
| Animations | Framer Motion |
| Icons | React Icons (Font Awesome) |
| Notifications | React Hot Toast |
| Fonts | Google Fonts (Playfair Display + Inter) |
