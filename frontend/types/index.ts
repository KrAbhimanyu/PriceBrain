export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: ProductImage[];
  brand: Brand;
  category: Category;
  retailerPrices: RetailerPrice[];
  specifications: Specification[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isFeatured: boolean;
  isActive: boolean;
  lowestPrice?: number;
  priceChangePercentage?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  parentId?: string;
  children?: Category[];
  isActive: boolean;
  productCount?: number;
}

export interface RetailerPrice {
  id: string;
  productId: string;
  retailer: Retailer;
  price: number;
  originalPrice: number;
  currency: string;
  affiliateUrl: string;
  inStock: boolean;
  lastUpdated: Date;
}

export interface Retailer {
  id: string;
  name: string;
  slug: string;
  logo: string;
  url: string;
  affiliateId?: string;
  isActive: boolean;
}

export interface Specification {
  key: string;
  value: string;
  displayKey: string;
  displayValue: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  retailerId: string;
  prices: PricePoint[];
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  priceChange: number;
  priceChangePercentage: number;
}

export interface PricePoint {
  date: string;
  price: number;
  retailerId: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  product: Product;
  targetPrice?: number;
  priceAlert: boolean;
  createdAt: Date;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'relevance' | 'newest';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  products: Product[];
  totalCount: number;
  page: number;
  totalPages: number;
  facets: SearchFacets;
}

export interface SearchFacets {
  brands: FacetItem[];
  categories: FacetItem[];
  retailers: FacetItem[];
  priceRanges: FacetItem[];
  ratings: FacetItem[];
}

export interface FacetItem {
  value: string;
  label: string;
  count: number;
}

export interface CompareProduct {
  product: Product;
  lowestPrice: RetailerPrice;
  specifications: Specification[];
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderValue?: number;
  maximumDiscount?: number;
  expiresAt: Date;
  isVerified: boolean;
  retailer: Retailer;
  productIds?: string[];
  categories?: string[];
  usageCount: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  isVerified: boolean;
  helpfulCount: number;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'price_drop' | 'wishlist_update' | 'system' | 'promotion';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalSearches: number;
  totalClicks: number;
  revenue: number;
  topProducts: Product[];
  topCategories: Category[];
  recentSearches: string[];
  searchTrend: TrendData[];
}

export interface TrendData {
  date: string;
  value: number;
}

export interface AIRecommendation {
  id: string;
  product: Product;
  reason: string;
  confidence: number;
  type: 'similar' | 'trending' | 'bestseller' | 'personalized';
}

export interface AffiliateClick {
  id: string;
  productId: string;
  retailerId: string;
  userId?: string;
  affiliateUrl: string;
  clickedAt: Date;
}

export interface ScraperJob {
  id: string;
  retailerId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  itemsProcessed: number;
  errors: string[];
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// ============ Phase 6: Autonomous Commerce Intelligence Platform ============

// Mission Types
export type MissionType =
  | 'wedding' | 'vacation' | 'study_abroad' | 'first_job' | 'home_office'
  | 'gaming_setup' | 'photography_studio' | 'fitness_journey' | 'home_renovation'
  | 'baby_preparation' | 'business_launch' | 'festival_planning' | 'custom';

export type MissionStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
export type MissionPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'waiting_approval' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Mission {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: MissionType;
  status: MissionStatus;
  priority: MissionPriority;
  targetBudget?: number;
  currentSpent?: number;
  startDate?: string;
  endDate?: string;
  targetDate?: string;
  progress: number;
  metadata?: Record<string, any>;
  tasks?: MissionTask[];
  createdAt: string;
  updatedAt: string;
}

export interface MissionTask {
  id: string;
  missionId: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  category?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedCost?: number;
  actualCost?: number;
  assignedAgent?: string;
  dependencies?: string[];
  tags?: string[];
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MissionBudgetAllocation {
  id: string;
  missionId: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Workflow Types
export interface Workflow {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  type: string;
  version: number;
  isTemplate: boolean;
  isActive: boolean;
  triggerConfig: Record<string, any>;
  stepsConfig: Record<string, any>;
  errorHandling?: Record<string, any>;
  timeoutSeconds?: number;
  retryConfig?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  missionId?: string;
  userId: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  currentStep?: string;
  context?: Record<string, any>;
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  workflow?: Workflow;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecutionLog {
  id: string;
  instanceId: string;
  stepName: string;
  stepOrder: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

// Approval Types
export type ApprovalType =
  | 'purchase' | 'subscription' | 'reminder' | 'tracking' | 'sharing'
  | 'automation_create' | 'automation_modify' | 'automation_delete'
  | 'cart_create' | 'plan_share' | 'plugin_install';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';

export interface Approval {
  id: string;
  userId: string;
  missionId?: string;
  workflowInstanceId?: string;
  type: ApprovalType;
  title: string;
  description?: string;
  actionData: Record<string, any>;
  status: ApprovalStatus;
  priority: 'low' | 'medium' | 'high';
  requiresVerification?: boolean;
  verificationMethod?: string;
  approvedAt?: string;
  rejectedAt?: string;
  expiresAt?: string;
  approverNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Policy Types
export type PolicyType =
  | 'budget' | 'brand_preference' | 'seller_trust' | 'rating_threshold'
  | 'product_preference' | 'eco_friendly' | 'approval_required' | 'notification_preference';

export interface Policy {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: PolicyType;
  conditions: Record<string, any>;
  actions?: Record<string, any>[];
  priority: number;
  isActive: boolean;
  isSystem: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  violatedPolicies: Policy[];
  suggestions: string[];
  actions: Record<string, any>[];
}

// Automation Types
export type AutomationRuleType =
  | 'price_tracking' | 'coupon_discovery' | 'warranty_tracking' | 'subscription_renewal'
  | 'product_recall' | 'inventory_monitoring' | 'accessory_suggestion' | 'upgrade_planning'
  | 'deal_monitoring' | 'festival_preparation' | 'stock_alert' | 'price_drop_alert';

export type AutomationStatus = 'active' | 'paused' | 'disabled';

export interface AutomationRule {
  id: string;
  userId: string;
  missionId?: string;
  name: string;
  description?: string;
  type: AutomationRuleType;
  status: AutomationStatus;
  triggerConfig: Record<string, any>;
  actionConfig: Record<string, any>;
  conditions?: Record<string, any>[];
  scheduleConfig?: Record<string, any>;
  lastTriggeredAt?: string;
  triggerCount: number;
  successCount: number;
  failureCount: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  triggerData?: Record<string, any>;
  resultData?: Record<string, any>;
  errorMessage?: string;
  executedAt?: string;
  completedAt?: string;
  createdAt: string;
}

// Plugin Types
export type PluginCategory = 'finance' | 'healthcare' | 'insurance' | 'education' | 'travel' | 'restaurant' | 'real_estate' | 'custom';
export type PluginStatus = 'active' | 'disabled' | 'error' | 'update_available';

export interface Plugin {
  id: string;
  name: string;
  slug: string;
  description?: string;
  version: string;
  author?: string;
  category: PluginCategory;
  icon?: string;
  homepageUrl?: string;
  documentationUrl?: string;
  isOfficial: boolean;
  isPremium: boolean;
  price?: number;
  rating?: number;
  downloadCount: number;
  isActive: boolean;
  isVerified: boolean;
  manifest: Record<string, any>;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPlugin {
  id: string;
  userId: string;
  pluginId: string;
  version: string;
  status: PluginStatus;
  config?: Record<string, any>;
  lastUsedAt?: string;
  plugin?: Plugin;
  createdAt: string;
  updatedAt: string;
}

// Monitoring Types
export interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  targetPrice?: number;
  currentPrice?: number;
  priceChangePercentage?: number;
  alertType: 'price_drop' | 'price_increase' | 'back_in_stock' | 'out_of_stock' | 'price_target_reached';
  isTriggered: boolean;
  triggeredAt?: string;
  notificationSent: boolean;
  product?: Product;
  createdAt: string;
  updatedAt: string;
}

export interface WarrantyTracking {
  id: string;
  userId: string;
  productId?: string;
  productName: string;
  purchaseDate: string;
  warrantyMonths: number;
  warrantyEndDate: string;
  reminderDaysBefore: number;
  reminderSent: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryTracking {
  id: string;
  userId: string;
  orderId?: string;
  retailer?: string;
  productName: string;
  trackingNumber?: string;
  status: 'pending' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

// Decision Engine Types
export interface DecisionResult {
  decision: string;
  confidence: number;
  reasoning: string;
  factors: {
    name: string;
    weight: number;
    value: string | number;
  }[];
  recommendations?: string[];
  warnings?: string[];
  metadata: Record<string, any>;
}

// Execution & Audit Types
export type ExecutionType = 'mission' | 'workflow' | 'automation' | 'approval' | 'policy';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ExecutionLog {
  id: string;
  userId: string;
  missionId?: string;
  workflowInstanceId?: string;
  automationRuleId?: string;
  executionType: ExecutionType;
  action: string;
  status: 'success' | 'failure' | 'pending' | 'cancelled';
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  errorMessage?: string;
  riskLevel: RiskLevel;
  approvalId?: string;
  executionTimeMs?: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Dashboard Data
export interface MissionDashboardData {
  activeMissions: number;
  completedMissions: number;
  pendingApprovals: number;
  activeAutomations: number;
  priceAlerts: { active: number; triggered: number };
  warranties: { total: number; expiringSoon: number };
  executions: {
    total: number;
    success: number;
    failure: number;
    avgExecutionTime: number;
  };
}
