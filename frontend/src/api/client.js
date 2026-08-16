/**
 * Axios API Client
 *
 * - Base URL from environment variable VITE_API_BASE_URL
 * - Attaches JWT access token from localStorage to every request
 * - Intercepts 401 responses → auto-refreshes token → retries original request
 * - On refresh failure → clears auth state and redirects to /login
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Attach the access token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// Handle 401 Unauthorized → try to refresh token → retry original request
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until the token refresh resolves
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // No refresh token — force logout
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        api.defaults.headers.common.Authorization = `Bearer ${access}`;
        processQueue(null, access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function clearAuth() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login/', data),
  register: (data) => api.post('/auth/register/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  refreshToken: (refresh) => api.post('/auth/refresh/', { refresh }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => api.post('/auth/change-password/', data),
};

// ─── Properties API ──────────────────────────────────────────────────────────
export const propertiesApi = {
  list: (params) => api.get('/properties/', { params }),
  getFeatured: () => api.get('/properties/featured/'),
  getById: (id) => api.get(`/properties/${id}/`),
  create: (data) => api.post('/properties/', data),
  update: (id, data) => api.patch(`/properties/${id}/`, data),
  delete: (id) => api.delete(`/properties/${id}/`),
  getMyListings: () => api.get('/properties/my-listings/'),
  uploadImage: (propertyId, formData) =>
    api.post(`/properties/${propertyId}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (imageId) => api.delete(`/properties/images/${imageId}/`),
};

// ─── Favorites API ───────────────────────────────────────────────────────────
export const favoritesApi = {
  list: () => api.get('/favorites/'),
  add: (propertyId) => api.post('/favorites/', { property_id: propertyId }),
  remove: (favoriteId) => api.delete(`/favorites/${favoriteId}/`),
};

// ─── Inquiries API ───────────────────────────────────────────────────────────
export const inquiriesApi = {
  send: (data) => api.post('/inquiries/', data),
  getReceived: (params) => api.get('/inquiries/received/', { params }),
  markRead: (id) => api.patch(`/inquiries/${id}/read/`),
};

export default api;
