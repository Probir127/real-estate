/**
 * Axios API Client
 *
 * - Base URL from environment variable VITE_API_BASE_URL
 * - Attaches JWT access token from localStorage to every request
 * - Intercepts 401 responses and refreshes the access token once
 * - Queues concurrent requests while a refresh is in progress
 */
import axios from 'axios';

let rawBase = import.meta.env.VITE_API_BASE_URL || '/api';
if (rawBase.endsWith('/')) rawBase = rawBase.slice(0, -1);
if (rawBase.startsWith('http') && !rawBase.endsWith('/api')) rawBase += '/api';
const API_BASE_URL = rawBase;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

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
    const isAuthRequest = originalRequest?.url?.includes('/auth/');

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      isRefreshing = false;
      processQueue(error);
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
      processQueue(refreshError);
      clearAuth();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

function clearAuth() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}

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

export const propertiesApi = {
  list: (params) => api.get('/properties/', { params }),
  getFeatured: () => api.get('/properties/featured/'),
  featured: () => api.get('/properties/featured/'),
  getById: (id) => api.get(`/properties/${id}/`),
  create: (data) => api.post('/properties/', data),
  update: (id, data) => api.patch(`/properties/${id}/`, data),
  delete: (id) => api.delete(`/properties/${id}/`),
  getMyListings: () => api.get('/properties/my_listings/'),
  uploadImage: (propertyId, formData) =>
    api.post(`/properties/${propertyId}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (imageId) => api.delete(`/properties/images/${imageId}/`),
};

export const homepageApi = {
  getContent: () => api.get('/homepage/'),
};

export const siteContentApi = {
  get: (key) => api.get(`/content/${encodeURIComponent(key)}/`),
};

export const favoritesApi = {
  list: () => api.get('/favorites/'),
  add: (propertyId) => api.post('/favorites/', { property_id: propertyId }),
  remove: (favoriteId) => api.delete(`/favorites/${favoriteId}/`),
};

export const inquiriesApi = {
  send: (data) => api.post('/inquiries/', data),
  getReceived: (params) => api.get('/inquiries/received/', { params }),
  markRead: (id) => api.patch(`/inquiries/${id}/read/`),
};

export const chatApi = {
  sendMessage: (message, messages = []) => api.post('/chat/', { message, messages }),
};

export const paymentsApi = {
  checkout: (plan, billingCycle) => api.post('/payments/checkout/', {
    plan,
    billing_cycle: billingCycle,
  }),
  orders: () => api.get('/payments/orders/'),
};

export default api;
