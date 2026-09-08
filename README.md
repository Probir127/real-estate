# 🏡 Zennor — Luxury Real Estate Platform

A production-ready, full-stack real estate platform built with **Django REST Framework** (backend) and **React + Vite** (frontend). Features a luxury navy & gold dark UI, Bangladesh BDT currency (Lakh & Crore notation), JWT authentication, property CRUD, sticky sidebar filters, saved properties, agent inquiries, rate limiting, a Three.js space planner, and a custom unified Django Admin Panel.

---

## 🚀 Live Production Deployment (Render)

- 🌐 **Live Website**: [https://real-estate-1-czqc.onrender.com](https://real-estate-1-czqc.onrender.com)
- ⚙️ **Backend API**: [https://real-estate-rcdq.onrender.com](https://real-estate-rcdq.onrender.com)
- 🏰 **Django Luxury Admin Panel**: [https://real-estate-rcdq.onrender.com/admin/](https://real-estate-rcdq.onrender.com/admin/)
- ⚡ **Instant Production Admin Setup Endpoint**: [https://real-estate-rcdq.onrender.com/api/auth/setup-admin/](https://real-estate-rcdq.onrender.com/api/auth/setup-admin/)

---

## 📁 Project Structure

```
realestate/
├── backend/          # Django REST API (Python 3.11)
│   ├── config/       # Settings, URLs, exceptions, wsgi
│   ├── accounts/     # Custom user model, JWT auth, setup-admin endpoint
│   ├── properties/   # Property listings + images + BDT seed script
│   ├── favorites/    # Saved properties per user
│   ├── inquiries/    # Contact agent form
│   ├── static/       # Custom Django Admin CSS (custom_admin.css)
│   ├── templates/    # Admin base_site.html luxury overrides
│   ├── build.sh      # Render build & migration script
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/         # React + Vite SPA
    ├── src/
    │   ├── api/      # Axios client with JWT interceptors & env parsing
    │   ├── components/   # Navbar, PropertyCard, Pagination, ...
    │   ├── context/      # AuthContext (JWT & isAdmin state)
    │   ├── pages/        # HomePage, PropertiesPage, PropertyDetailPage, ...
    │   └── utils/        # helpers.js (BDT Lakh/Crore price formatter)
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

### Dynamic homepage content

Homepage sections can be managed from **Admin → Homepage content** and are served
through `GET /api/homepage/`. The React homepage uses the managed JSON content
when present and keeps its existing design-safe defaults if the endpoint is
temporarily unavailable. Content arrays support `areas`, `tools`, `steps`,
`agents`, `testimonials`, and `stats`; icon values use names such as `chart`,
`calculator`, `search`, `building`, and `handshake`.

### Dynamic site content

All shared and major page copy is also managed from **Admin → Site content**.
Create a record with a stable key (`navigation`, `footer`, `agents`, `pricing`,
`loan`, `valuation`, `sell`, `dashboard`, or `profile`) and paste the page's
JSON document into `content`. It is published when **Is active** is enabled.
The public API is `GET /api/content/<key>/` (the legacy
`/api/homepage/<key>/` route is also available); inactive or missing records return
an empty document and the React client keeps its design-safe defaults. This
allows an admin to update copy, navigation links, pricing tiers, lender data,
agent profiles, valuation areas, and form options without a frontend release.

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
| GET | `/auth/setup-admin/` | Initialize configured admin user & seed DB (local or token-protected) | Setup token | — |

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

### Site content — `/api/content/`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/content/{key}/` | Return the active admin-managed JSON document | No |

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

### Subscription payments — `/api/payments/`

Paid Agent, Agency, and Developer plans use SSLCommerz. The browser never receives
the store credentials: the backend creates a pending order, starts the gateway
session, and validates the returned transaction server-to-server before marking
the order paid.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/payments/checkout/` | Create an order and return the SSLCommerz checkout URL | Yes |
| GET | `/payments/orders/` | List the current user's payment orders | Yes |
| POST | `/payments/success/` | Gateway success callback | SSLCommerz |
| POST | `/payments/fail/` | Gateway failure callback | SSLCommerz |
| POST | `/payments/cancel/` | Gateway cancellation callback | SSLCommerz |
| POST | `/payments/ipn/` | Server-to-server payment notification | SSLCommerz |

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
| `/saved`, `/favorites` | SavedPage | Auth required |
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

ADMIN_SETUP_TOKEN=long-random-bootstrap-token
ADMIN_SETUP_EMAIL=admin@your-domain.com
ADMIN_SETUP_PASSWORD=strong-random-admin-password

JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

MEDIA_URL=/media/
MEDIA_ROOT=media/

SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASSWORD=your-store-password
SSLCOMMERZ_IS_SANDBOX=True
SSLCOMMERZ_SUCCESS_URL=https://api.example.com/api/payments/success/
SSLCOMMERZ_FAIL_URL=https://api.example.com/api/payments/fail/
SSLCOMMERZ_CANCEL_URL=https://api.example.com/api/payments/cancel/
SSLCOMMERZ_IPN_URL=https://api.example.com/api/payments/ipn/
FRONTEND_APP_URL=https://www.example.com
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
- [ ] Confirm the frontend static service is deployed from `frontend/dist` and
  that direct SPA routes such as `/property/9` rewrite to `/index.html`.
- [ ] Verify mobile layouts at 320px, 375px, 768px, and 1024px widths; navigation,
  forms, pricing checkout, maps, and the Three.js viewer include touch-safe
  responsive behavior. Devices without WebGL receive an accessible fallback.

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
