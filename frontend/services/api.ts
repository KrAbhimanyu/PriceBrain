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

// ============ Phase 6: Autonomous Commerce Intelligence Platform ============

// Missions Service
export const missionService = {
  getAll: (params?: Record<string, unknown>) => api.get('/missions', { params }),
  getById: (id: string) => api.get(`/missions/${id}`),
  create: (data: Record<string, unknown>) => api.post('/missions', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/missions/${id}`, data),
  delete: (id: string) => api.delete(`/missions/${id}`),
  updateProgress: (id: string) => api.post(`/missions/${id}/progress`),
  generateFromGoal: (id: string, goal: string) => api.post(`/missions/${id}/generate`, { goal }),
  // Tasks
  getTasks: (missionId: string) => api.get(`/missions/${missionId}/tasks`),
  createTask: (missionId: string, data: Record<string, unknown>) => api.post(`/missions/${missionId}/tasks`, data),
  createTasks: (missionId: string, tasks: Record<string, unknown>[]) => api.post(`/missions/${missionId}/tasks/bulk`, { tasks }),
  updateTask: (taskId: string, data: Record<string, unknown>) => api.patch(`/missions/tasks/${taskId}`, data),
  deleteTask: (taskId: string) => api.delete(`/missions/tasks/${taskId}`),
  reorderTasks: (missionId: string, taskIds: string[]) => api.post(`/missions/${missionId}/tasks/reorder`, { taskIds }),
  // Budget
  getBudget: (missionId: string) => api.get(`/missions/${missionId}/budget`),
  createBudget: (missionId: string, data: Record<string, unknown>) => api.post(`/missions/${missionId}/budget`, data),
  updateBudget: (allocationId: string, data: Record<string, unknown>) => api.patch(`/missions/budget/${allocationId}`, data),
};

// Workflows Service
export const workflowService = {
  getAll: (params?: Record<string, unknown>) => api.get('/workflows', { params }),
  getTemplates: () => api.get('/workflows/templates'),
  getById: (id: string) => api.get(`/workflows/${id}`),
  create: (data: Record<string, unknown>) => api.post('/workflows', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/workflows/${id}`, data),
  delete: (id: string) => api.delete(`/workflows/${id}`),
  trigger: (id: string, data?: Record<string, unknown>) => api.post(`/workflows/${id}/trigger`, data || {}),
  // Instances
  getInstances: (params?: Record<string, unknown>) => api.get('/workflows/instances/mine', { params }),
  getInstance: (id: string) => api.get(`/workflows/instances/${id}`),
  pauseInstance: (id: string) => api.post(`/workflows/instances/${id}/pause`),
  resumeInstance: (id: string) => api.post(`/workflows/instances/${id}/resume`),
  cancelInstance: (id: string) => api.post(`/workflows/instances/${id}/cancel`),
  getInstanceLogs: (id: string) => api.get(`/workflows/instances/${id}/logs`),
};

// Approvals Service
export const approvalService = {
  getAll: (params?: Record<string, unknown>) => api.get('/approvals', { params }),
  getPending: () => api.get('/approvals/pending'),
  getStats: () => api.get('/approvals/stats'),
  getById: (id: string) => api.get(`/approvals/${id}`),
  create: (data: Record<string, unknown>) => api.post('/approvals', data),
  approve: (id: string, notes?: string) => api.post(`/approvals/${id}/approve`, { notes }),
  reject: (id: string, reason: string) => api.post(`/approvals/${id}/reject`, { reason }),
  cancel: (id: string) => api.post(`/approvals/${id}/cancel`),
};

// Policies Service
export const policyService = {
  getAll: (params?: Record<string, unknown>) => api.get('/policies', { params }),
  getActive: () => api.get('/policies/active'),
  getStats: () => api.get('/policies/stats'),
  getById: (id: string) => api.get(`/policies/${id}`),
  create: (data: Record<string, unknown>) => api.post('/policies', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/policies/${id}`, data),
  delete: (id: string) => api.delete(`/policies/${id}`),
  toggle: (id: string) => api.post(`/policies/${id}/toggle`),
  evaluate: (context: Record<string, unknown>) => api.post('/policies/evaluate', { context }),
  createDefaults: () => api.post('/policies/defaults'),
};

// Automation Service
export const automationService = {
  getAll: (params?: Record<string, unknown>) => api.get('/automation', { params }),
  getActive: () => api.get('/automation/active'),
  getStats: () => api.get('/automation/stats'),
  getById: (id: string) => api.get(`/automation/${id}`),
  create: (data: Record<string, unknown>) => api.post('/automation', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/automation/${id}`, data),
  delete: (id: string) => api.delete(`/automation/${id}`),
  toggle: (id: string) => api.post(`/automation/${id}/toggle`),
  trigger: (id: string, data?: Record<string, unknown>) => api.post(`/automation/${id}/trigger`, data || {}),
  getExecutions: (id: string) => api.get(`/automation/${id}/executions`),
  getExecution: (id: string) => api.get(`/automation/executions/${id}`),
};

// Plugins Service
export const pluginService = {
  getAll: (params?: Record<string, unknown>) => api.get('/plugins', { params }),
  getCategories: () => api.get('/plugins/categories'),
  getBySlug: (slug: string) => api.get(`/plugins/slug/${slug}`),
  getById: (id: string) => api.get(`/plugins/${id}`),
  install: (pluginId: string, config?: Record<string, unknown>) => api.post('/plugins/install', { pluginId, config }),
  getInstalled: () => api.get('/plugins/installed/mine'),
  getActive: () => api.get('/plugins/active/mine'),
  updateInstalled: (id: string, data: Record<string, unknown>) => api.patch(`/plugins/installed/${id}`, data),
  uninstall: (id: string) => api.delete(`/plugins/installed/${id}`),
  execute: (id: string, action: string, params?: Record<string, unknown>) =>
    api.post(`/plugins/${id}/execute`, { action, params }),
};

// Monitoring Service
export const monitoringService = {
  // Metrics
  recordMetric: (data: Record<string, unknown>) => api.post('/monitoring/metrics', data),
  getMetrics: (params?: Record<string, unknown>) => api.get('/monitoring/metrics', { params }),
  getMetricSummary: (type: string, days?: number) =>
    api.get('/monitoring/metrics/summary', { params: { type, days } }),
  // Price Alerts
  getPriceAlerts: (activeOnly?: boolean) =>
    api.get('/monitoring/price-alerts', { params: { activeOnly } }),
  createPriceAlert: (data: Record<string, unknown>) => api.post('/monitoring/price-alerts', data),
  updatePriceAlert: (id: string, data: Record<string, unknown>) =>
    api.patch(`/monitoring/price-alerts/${id}`, data),
  deletePriceAlert: (id: string) => api.delete(`/monitoring/price-alerts/${id}`),
  // Warranties
  getWarranties: () => api.get('/monitoring/warranties'),
  getExpiringWarranties: (days?: number) =>
    api.get('/monitoring/warranties/expiring', { params: { days } }),
  createWarranty: (data: Record<string, unknown>) => api.post('/monitoring/warranties', data),
  updateWarranty: (id: string, data: Record<string, unknown>) =>
    api.patch(`/monitoring/warranties/${id}`, data),
  deleteWarranty: (id: string) => api.delete(`/monitoring/warranties/${id}`),
  // Deliveries
  getDeliveries: () => api.get('/monitoring/deliveries'),
  createDelivery: (data: Record<string, unknown>) => api.post('/monitoring/deliveries', data),
  updateDelivery: (id: string, data: Record<string, unknown>) =>
    api.patch(`/monitoring/deliveries/${id}`, data),
  deleteDelivery: (id: string) => api.delete(`/monitoring/deliveries/${id}`),
  // Dashboard
  getDashboard: () => api.get('/monitoring/dashboard'),
};

// Decision Service
export const decisionService = {
  evaluateProduct: (data: Record<string, unknown>) => api.post('/decision/product', data),
  evaluatePurchase: (data: Record<string, unknown>) => api.post('/decision/purchase', data),
  compareProducts: (data: Record<string, unknown>) => api.post('/decision/compare', data),
  generateRecommendations: (data: Record<string, unknown>) => api.post('/decision/recommend', data),
  getDecisions: (params?: Record<string, unknown>) => api.get('/decision/decisions', { params }),
  recordAgentMetric: (data: Record<string, unknown>) => api.post('/decision/metrics/agent', data),
  getAgentMetrics: (agentId: string, params?: Record<string, unknown>) =>
    api.get(`/decision/metrics/agent/${agentId}`, { params }),
  getAgentStats: (agentId: string) => api.get(`/decision/metrics/agent/${agentId}/stats`),
};

// Execution Service
export const executionService = {
  getLogs: (params?: Record<string, unknown>) => api.get('/execution/logs', { params }),
  getStats: (days?: number) => api.get('/execution/stats', { params: { days } }),
  getAuditLogs: (params?: Record<string, unknown>) => api.get('/execution/audit', { params }),
};

// ============ Phase 7: AI Commerce Operating System ============

// Kernel Service
export const kernelService = {
  getHealth: () => api.get('/kernel/health'),
  getMetrics: () => api.get('/kernel/metrics'),
  getAgents: (params?: Record<string, unknown>) => api.get('/kernel/agents', { params }),
  getAgent: (id: string) => api.get(`/kernel/agents/${id}`),
  createAgent: (data: Record<string, unknown>) => api.post('/kernel/agents', data),
  updateAgent: (id: string, data: Record<string, unknown>) => api.patch(`/kernel/agents/${id}`, data),
  deleteAgent: (id: string) => api.delete(`/kernel/agents/${id}`),
  startAgent: (id: string, data?: Record<string, unknown>) => api.post(`/kernel/agents/${id}/start`, data || {}),
  getInstances: (params?: Record<string, unknown>) => api.get('/kernel/instances/mine', { params }),
  getInstance: (id: string) => api.get(`/kernel/instances/${id}`),
  pauseInstance: (id: string) => api.post(`/kernel/instances/${id}/pause`),
  resumeInstance: (id: string) => api.post(`/kernel/instances/${id}/resume`),
  cancelInstance: (id: string) => api.post(`/kernel/instances/${id}/cancel`),
};

// Event Mesh Service
export const eventService = {
  publish: (data: Record<string, unknown>) => api.post('/events', data),
  getEvents: (params?: Record<string, unknown>) => api.get('/events', { params }),
  getEvent: (id: string) => api.get(`/events/${id}`),
  replayEvent: (id: string) => api.post(`/events/${id}/replay`),
  getStats: (days?: number) => api.get('/events/stats', { params: { days } }),
  getSubscriptions: () => api.get('/events/subscriptions/mine'),
  createSubscription: (data: Record<string, unknown>) => api.post('/events/subscriptions', data),
  updateSubscription: (id: string, data: Record<string, unknown>) => api.patch(`/events/subscriptions/${id}`, data),
  deleteSubscription: (id: string) => api.delete(`/events/subscriptions/${id}`),
};

// Tool Bus Service
export const toolService = {
  getTools: (params?: Record<string, unknown>) => api.get('/tools', { params }),
  getTool: (id: string) => api.get(`/tools/${id}`),
  createTool: (data: Record<string, unknown>) => api.post('/tools', data),
  updateTool: (id: string, data: Record<string, unknown>) => api.patch(`/tools/${id}`, data),
  deleteTool: (id: string) => api.delete(`/tools/${id}`),
  invoke: (name: string, data: Record<string, unknown>) => api.post(`/tools/invoke/${name}`, data),
  getInvocations: (params?: Record<string, unknown>) => api.get('/tools/invocations/mine', { params }),
  getInvocation: (id: string) => api.get(`/tools/invocations/${id}`),
  getCategories: () => api.get('/tools/categories'),
};

// Marketplace Service
export const marketplaceService = {
  getListings: (params?: Record<string, unknown>) => api.get('/marketplace/agents', { params }),
  getListing: (id: string) => api.get(`/marketplace/agents/${id}`),
  createListing: (data: Record<string, unknown>) => api.post('/marketplace/agents', data),
  updateListing: (id: string, data: Record<string, unknown>) => api.patch(`/marketplace/agents/${id}`, data),
  deleteListing: (id: string) => api.delete(`/marketplace/agents/${id}`),
  getFeatured: () => api.get('/marketplace/agents/featured'),
  getCategories: () => api.get('/marketplace/agents/categories'),
  getReviews: (id: string) => api.get(`/marketplace/agents/${id}/reviews`),
  createReview: (id: string, data: Record<string, unknown>) => api.post(`/marketplace/agents/${id}/reviews`, data),
  install: (data: Record<string, unknown>) => api.post('/marketplace/agents/install', data),
  getInstallations: (params?: Record<string, unknown>) => api.get('/marketplace/agents/installations/mine', { params }),
  updateInstallation: (id: string, data: Record<string, unknown>) => api.patch(`/marketplace/agents/installations/${id}`, data),
  uninstall: (id: string) => api.delete(`/marketplace/agents/installations/${id}`),
};

// Enterprise Service
export const enterpriseService = {
  getOrganizations: () => api.get('/enterprise/organizations'),
  getOrganization: (id: string) => api.get(`/enterprise/organizations/${id}`),
  createOrganization: (data: Record<string, unknown>) => api.post('/enterprise/organizations', data),
  updateOrganization: (id: string, data: Record<string, unknown>) => api.patch(`/enterprise/organizations/${id}`, data),
  deleteOrganization: (id: string) => api.delete(`/enterprise/organizations/${id}`),
  getOrgMembers: (orgId: string) => api.get(`/enterprise/organizations/${orgId}/members`),
  addOrgMember: (orgId: string, data: Record<string, unknown>) => api.post(`/enterprise/organizations/${orgId}/members`, data),
  getTeams: (orgId: string) => api.get(`/enterprise/organizations/${orgId}/teams`),
  createTeam: (orgId: string, data: Record<string, unknown>) => api.post(`/enterprise/organizations/${orgId}/teams`, data),
  getProjects: (orgId: string, params?: Record<string, unknown>) => api.get(`/enterprise/organizations/${orgId}/projects`, { params }),
  createProject: (orgId: string, data: Record<string, unknown>) => api.post(`/enterprise/organizations/${orgId}/projects`, data),
};

// ============ Phase 8: AI Organization Operating System ============

// Executive Service
export const executiveService = {
  createChiefAI: (data: Record<string, unknown>) => api.post('/executive/chief-ai', data),
  getChiefAI: (orgId: string) => api.get(`/executive/chief-ai/${orgId}`),
  updateChiefAI: (orgId: string, data: Record<string, unknown>) => api.patch(`/executive/chief-ai/${orgId}`, data),
  getChiefAIPerformance: (orgId: string) => api.get(`/executive/chief-ai/${orgId}/performance`),
  getRecommendations: (orgId: string) => api.get(`/executive/chief-ai/${orgId}/recommendations`),
  createDecision: (data: Record<string, unknown>) => api.post('/executive/decisions', data),
  getDecisions: (orgId: string, params?: Record<string, unknown>) => api.get(`/executive/decisions/${orgId}`, { params }),
  getDecision: (id: string) => api.get(`/executive/decisions/detail/${id}`),
  approveDecision: (id: string) => api.post(`/executive/decisions/${id}/approve`),
  rejectDecision: (id: string, reason: string) => api.post(`/executive/decisions/${id}/reject`, { reason }),
  implementDecision: (id: string) => api.post(`/executive/decisions/${id}/implement`),
  getDecisionAnalytics: (orgId: string) => api.get(`/executive/decisions/${orgId}/analytics`),
};

// Digital Twin Service
export const digitalTwinService = {
  create: (data: Record<string, unknown>) => api.post('/digital-twin', data),
  get: (orgId: string) => api.get(`/digital-twin/${orgId}`),
  update: (orgId: string, data: Record<string, unknown>) => api.patch(`/digital-twin/${orgId}`, data),
  sync: (orgId: string, data: Record<string, unknown>) => api.post(`/digital-twin/${orgId}/sync`, data),
  getStatus: (orgId: string) => api.get(`/digital-twin/${orgId}/status`),
  getComponents: (orgId: string) => api.get(`/digital-twin/${orgId}/components`),
  updateComponent: (orgId: string, type: string, id: string, data: Record<string, unknown>) =>
    api.patch(`/digital-twin/${orgId}/components/${type}/${id}`, data),
  createSnapshot: (orgId: string) => api.post(`/digital-twin/${orgId}/snapshots`),
  getSnapshots: (orgId: string) => api.get(`/digital-twin/${orgId}/snapshots`),
  compareSnapshots: (id1: string, id2: string) => api.get(`/digital-twin/snapshots/compare/${id1}/${id2}`),
};

// Simulation Service
export const simulationService = {
  create: (data: Record<string, unknown>) => api.post('/simulations', data),
  getSimulations: (orgId: string, params?: Record<string, unknown>) => api.get(`/simulations/${orgId}`, { params }),
  getSimulation: (id: string) => api.get(`/simulations/detail/${id}`),
  runSimulation: (id: string) => api.post(`/simulations/${id}/run`),
  updateSimulation: (id: string, data: Record<string, unknown>) => api.patch(`/simulations/${id}`, data),
  approveSimulation: (id: string) => api.post(`/simulations/${id}/approve`),
  addScenario: (id: string, data: Record<string, unknown>) => api.post(`/simulations/${id}/scenarios`, data),
  getScenarios: (id: string) => api.get(`/simulations/${id}/scenarios`),
};

// Monitoring Service
export const orgMonitoringService = {
  getOrganizationMetrics: (orgId: string, params?: Record<string, unknown>) =>
    api.get(`/monitoring/organizations/${orgId}/metrics`, { params }),
  getDepartmentMetrics: (deptId: string, params?: Record<string, unknown>) =>
    api.get(`/monitoring/departments/${deptId}/metrics`, { params }),
  getCollaborationMetrics: (orgId: string) =>
    api.get(`/monitoring/organizations/${orgId}/collaboration`),
};
