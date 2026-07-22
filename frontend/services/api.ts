import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { config } from '@/config';
import { ApiResponse } from '@/types';

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (axiosConfig: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(config.auth.tokenKey) : null;
    if (token && axiosConfig.headers) {
      axiosConfig.headers.Authorization = `Bearer ${token}`;
    }
    return axiosConfig;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem(config.auth.refreshTokenKey);
        if (refreshToken) {
          const response = await axios.post(`${config.api.baseUrl}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          localStorage.setItem(config.auth.tokenKey, accessToken);
          localStorage.setItem(config.auth.refreshTokenKey, newRefreshToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem(config.auth.tokenKey);
        localStorage.removeItem(config.auth.refreshTokenKey);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: Partial<{ name: string; phone: string; avatar: string }>) =>
    api.patch('/auth/profile', data),
};

export const productService = {
  getAll: (params?: Record<string, unknown>) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getBySlug: (slug: string) => api.get(`/products/slug/${slug}`),
  getTrending: (limit?: number) => api.get('/products/trending', { params: { limit } }),
  getFeatured: (limit?: number) => api.get('/products/featured', { params: { limit } }),
  getDeals: (params?: Record<string, unknown>) => api.get('/products/deals', { params }),
  getPriceHistory: (productId: string) => api.get(`/products/${productId}/price-history`),
};

export const searchService = {
  search: (params: Record<string, unknown>) => api.get('/search', { params }),
  autocomplete: (query: string) => api.get('/search/autocomplete', { params: { q: query } }),
  suggestions: (query: string) => api.get('/search/suggestions', { params: { q: query } }),
  trending: () => api.get('/search/trending'),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  getBySlug: (slug: string) => api.get(`/categories/slug/${slug}`),
  getFeatured: () => api.get('/categories/featured'),
};

export const brandService = {
  getAll: (params?: Record<string, unknown>) => api.get('/brands', { params }),
  getById: (id: string) => api.get(`/brands/${id}`),
  getBySlug: (slug: string) => api.get(`/brands/slug/${slug}`),
  getFeatured: () => api.get('/brands/featured'),
};

export const wishlistService = {
  getAll: () => api.get('/wishlist'),
  add: (productId: string, targetPrice?: number) =>
    api.post('/wishlist', { productId, targetPrice }),
  remove: (id: string) => api.delete(`/wishlist/${id}`),
  update: (id: string, data: { targetPrice?: number; priceAlert?: boolean }) =>
    api.patch(`/wishlist/${id}`, data),
  check: (productId: string) => api.get(`/wishlist/check/${productId}`),
};

export const compareService = {
  compare: (productIds: string[]) => api.post('/compare', { productIds }),
  getSpecifications: (productId: string) => api.get(`/compare/specs/${productId}`),
};

export const affiliateService = {
  generateLink: (productId: string, retailerId: string) =>
    api.post('/affiliate/generate', { productId, retailerId }),
  redirect: (clickId: string) => api.get(`/affiliate/redirect/${clickId}`),
  track: (productId: string, retailerId: string) =>
    api.post('/affiliate/track', { productId, retailerId }),
};

export const couponService = {
  getAll: (params?: Record<string, unknown>) => api.get('/coupons', { params }),
  getById: (id: string) => api.get(`/coupons/${id}`),
  getByCode: (code: string) => api.get(`/coupons/code/${code}`),
  verify: (code: string, productId?: string) =>
    api.post('/coupons/verify', { code, productId }),
};

export const userService = {
  getNotifications: (params?: Record<string, unknown>) =>
    api.get('/users/notifications', { params }),
  markNotificationRead: (id: string) =>
    api.patch(`/users/notifications/${id}/read`),
  markAllNotificationsRead: () =>
    api.patch('/users/notifications/read-all'),
  getSettings: () => api.get('/users/settings'),
  updateSettings: (data: Record<string, unknown>) =>
    api.patch('/users/settings', data),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getProducts: (params?: Record<string, unknown>) =>
    api.get('/admin/products', { params }),
  createProduct: (data: Record<string, unknown>) =>
    api.post('/admin/products', data),
  updateProduct: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  getRetailers: (params?: Record<string, unknown>) =>
    api.get('/admin/retailers', { params }),
  getScraperStatus: () => api.get('/admin/scrapers/status'),
  triggerScraper: (retailerId: string) =>
    api.post(`/admin/scrapers/${retailerId}/trigger`),
};
