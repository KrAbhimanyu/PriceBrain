export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  sellerVerified?: boolean;
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
// Personalization Types
export interface RecentlyViewedProduct {
  product: Product;
  viewedAt: Date;
}

export interface SmartCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  products: Product[];
  productCount: number;
}

export interface AIRecommendationItem {
  id: string;
  product: Product;
  reason: string;
  confidence: number;
  type: 'similar' | 'trending' | 'bestseller' | 'personalized' | 'price_drop' | 'back_in_stock';
}

export interface ContinueShoppingItem {
  product: Product;
  lastViewed: Date;
  priceChange?: number;
}

export interface SellerDailyGoal {
  id: string;
  type: 'revenue' | 'orders' | 'products' | 'customers';
  target: number;
  current: number;
  progress: number;
  deadline: Date;
}

export interface SellerRevenueCard {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  period: string;
}

export interface SellerBusinessInsight {
  id: string;
  type: 'opportunity' | 'alert' | 'tip' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionUrl?: string;
  createdAt: Date;
}

export interface SellerAISuggestion {
  id: string;
  title: string;
  description: string;
  potentialImpact: string;
  category: 'pricing' | 'inventory' | 'marketing' | 'product';
  actionLabel: string;
}

export interface MarketplaceHealthMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

export interface LiveAlert {
  id: string;
  type: 'scraper' | 'system' | 'user' | 'revenue';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

export interface ExecutiveMetric {
  id: string;
  category: 'revenue' | 'users' | 'products' | 'engagement';
  title: string;
  value: number;
  formattedValue: string;
  change: number;
  changePercent: number;
  trend: TrendData[];
}

// Fashion & AI Stylist Types

export type Gender = 'male' | 'female' | 'unisex';
export type AgeGroup = 'teen' | 'young_adult' | 'adult' | 'middle_aged' | 'senior';
export type Season = 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter';
export type BodyType = 'slim' | 'athletic' | 'average' | 'plus_size';
export type SkinTone = 'fair' | 'wheatish' | 'medium' | 'dark';
export type Occasion = 
  | 'casual' 
  | 'formal' 
  | 'office' 
  | 'wedding' 
  | 'date' 
  | 'party' 
  | 'sports' 
  | 'beach' 
  | 'festival' 
  | 'college' 
  | 'interview'
  | 'date_night'
  | 'reception'
  | 'engagement'
  | 'mehendi'
  | 'ceremony';
export type OutfitCategory = 'best_selling' | 'budget_friendly' | 'mid_range';

export interface UserStyleProfile {
  gender: Gender;
  ageGroup: AgeGroup;
  bodyType: BodyType;
  skinTone: SkinTone;
  preferredColors: string[];
  preferredStyles: string[];
  preferredBrands: string[];
  budget: { min: number; max: number };
  wardrobeItems: WardrobeItem[];
  dislikedItems: string[];
  occasions: Occasion[];
  size: string;
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
  brand?: string;
  imageUrl?: string;
  addedAt: Date;
}

export interface FashionContext {
  userProfile?: Partial<UserStyleProfile>;
  occasion?: Occasion;
  location?: string;
  weather?: {
    temperature: number;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'humid' | 'cold';
  };
  budget?: { min?: number; max?: number };
  gender?: Gender;
  existingItem?: string;
  preferences?: string[];
}

export interface OutfitItem {
  id: string;
  product: Product;
  slot: OutfitSlot;
  price: number;
  originalPrice: number;
  discount: number;
  isPrimary: boolean;
  matchScore: number;
  retailer: Retailer;
}

export type OutfitSlot = 
  | 'top'
  | 'bottom'
  | 'dress'
  | 'outerwear'
  | 'footwear'
  | 'accessory'
  | 'watch'
  | 'jewelry'
  | 'bag'
  | 'belt'
  | 'sunglasses'
  | 'hat'
  | 'scarf'
  | 'perfume'
  | 'socks'
  | 'tie'
  | 'pocket_square';

export interface Outfit {
  id: string;
  name: string;
  description: string;
  category: OutfitCategory;
  occasion: Occasion;
  items: OutfitItem[];
  totalPrice: number;
  originalTotalPrice: number;
  totalDiscount: number;
  aiExplanation: AIOutfitExplanation;
  ratings: OutfitRatings;
  crossSellItems: OutfitItem[];
  isComplete: boolean;
  imageUrl?: string;
  createdAt: Date;
}

export interface AIOutfitExplanation {
  whyItSuits: string;
  colorMatching: string;
  budgetFit: string;
  styleNotes: string;
  trendAlignment: string;
  bodyTypeSuitability: string;
  skinToneRecommendation: string;
  weatherAppropriate: string;
}

export interface OutfitRatings {
  style: number;      // 1-10
  comfort: number;    // 1-10
  trendScore: number; // 1-10
  popularity: number;  // 1-10
  aiConfidence: number; // 1-10
  overall: number;     // 1-10
}

export interface FashionChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: string[];
  context?: FashionContext;
  recommendations?: Outfit[];
  suggestedQuestions?: string[];
}

export interface FashionRecommendationRequest {
  userInput: string;
  context?: FashionContext;
  includeCategories?: OutfitCategory[];
  limit?: number;
  userId?: string;
}

export interface FashionRecommendationResponse {
  success: boolean;
  outfits: Outfit[];
  totalCount: number;
  context: FashionContext;
  suggestedFollowUps: string[];
  missingInfo?: string[];
}

export interface OutfitComparison {
  outfits: Outfit[];
  comparedAspects: ComparisonAspect[];
}

export interface ComparisonAspect {
  name: string;
  values: Record<string, string | number>;
  winner: string;
}

export interface MixMatchSuggestion {
  baseItem: OutfitItem;
  suggestions: {
    item: OutfitItem;
    matchReason: string;
    matchScore: number;
    occasions: Occasion[];
  }[];
}

export interface ColorCombination {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  whyItWorks: string;
  occasions: Occasion[];
}

export interface CelebrityInspiredLook {
  celebrity: string;
  event: string;
  outfitDescription: string;
  similarProducts: Product[];
  howToAchieve: string;
}

export interface SeasonalSuggestion {
  season: Season;
  trendingStyles: string[];
  mustHaveItems: string[];
  colors: string[];
  tips: string[];
}

export interface FestivalOutfitSuggestion {
  festival: string;
  tradition: string;
  outfitDescription: string;
  recommendedItems: string[];
  stylingTips: string[];
}

// AI Command Center Types

export type AICommand = 
  | 'ask_brain'
  | 'ai_chat'
  | 'ai_search'
  | 'ai_voice'
  | 'ai_vision'
  | 'ai_history'
  | 'ai_memory'
  | 'ai_tasks'
  | 'ai_recommendations'
  | 'ai_shopping'
  | 'ai_business'
  | 'ai_automation'
  | 'ai_settings';

export interface AICommandItem {
  id: AICommand;
  label: string;
  icon: string;
  badge?: number;
  description: string;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isArchived: boolean;
  folder?: string;
  tags: string[];
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: string[];
  metadata?: Record<string, unknown>;
}

export interface AIConversationFolder {
  id: string;
  name: string;
  color: string;
  icon: string;
  conversationCount: number;
}

export interface AITask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  estimatedCompletion?: Date;
  agentsWorking?: string[];
  finalReport?: string;
  result?: unknown;
  error?: string;
}

export interface AIMemory {
  id: string;
  key: string;
  value: string;
  category: 'preferences' | 'shopping' | 'brands' | 'budget' | 'context' | 'profile' | 'business';
  confidence: number;
  lastUpdated: Date;
  source: 'explicit' | 'learned' | 'inferred';
}

export interface AIWidget {
  id: string;
  type: AIWidgetType;
  title: string;
  icon: string;
  refreshInterval: number;
  isVisible: boolean;
  order: number;
}

export type AIWidgetType = 
  | 'price_drop'
  | 'trending_products'
  | 'ai_deals'
  | 'flash_sale'
  | 'recently_compared'
  | 'budget_progress'
  | 'wishlist_intelligence'
  | 'todays_recommendations'
  | 'seller_analytics'
  | 'marketplace_health';

export interface PriceDropItem {
  productId: string;
  productName: string;
  productImage: string;
  previousPrice: number;
  currentPrice: number;
  dropPercentage: number;
  retailer: string;
  aiRecommendation: 'buy_now' | 'wait' | 'watch';
  confidenceScore: number;
}

export interface TrendingProduct {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  originalPrice: number;
  discount: number;
  viewCount: number;
  purchaseCount: number;
  aiTrendScore: number;
  category: string;
  isViral: boolean;
}

export interface AIDeal {
  id: string;
  title: string;
  description: string;
  discount: number;
  originalPrice: number;
  currentPrice: number;
  expiresAt: Date;
  productId: string;
  productImage: string;
  retailer: string;
  dealType: 'flash' | 'bundle' | 'cashback' | 'hidden' | 'ai_savings';
  aiSavingsScore: number;
}

export interface FlashSale {
  id: string;
  title: string;
  discount: number;
  originalPrice: number;
  salePrice: number;
  endsAt: Date;
  stockRemaining: number;
  totalStock: number;
  productId: string;
  productImage: string;
  retailer: string;
  aiUrgencyScore: number;
}

export interface BudgetProgress {
  monthlyBudget: number;
  spent: number;
  remaining: number;
  savingsGoal: number;
  currentSavings: number;
  forecastedSpend: number;
  categoryBreakdown: Record<string, number>;
  aiSuggestions: string[];
}

export interface WishlistIntelligence {
  productId: string;
  productName: string;
  productImage: string;
  targetPrice: number;
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  priceChange: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  aiPriority: number;
  bestTimeToBuy: 'now' | 'this_week' | 'this_month' | 'wait';
  priceDropPrediction?: Date;
}

export interface AIMarketplaceHealth {
  activeUsers: number;
  productsTracked: number;
  totalSavings: number;
  conversionRate: number;
  scraperUptime: number;
  priceAccuracy: number;
  trendingCategories: string[];
  healthScore: number;
}

export interface AISellerAnalytics {
  totalRevenue: number;
  revenueChange: number;
  ordersToday: number;
  productsListed: number;
  conversionRate: number;
  averageRating: number;
  lowStockAlerts: number;
  pendingOrders: number;
  topProducts: Array<{ id: string; name: string; sales: number }>;
  aiInsights: string[];
}

// Global Experience Types

export type Language = 
  | 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'mr' | 'gu' | 'pa' 
  | 'ur' | 'ar' | 'fr' | 'de' | 'es' | 'pt' | 'ja' | 'ko' | 'zh' | 'it' | 'ru';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SGD' | 'CAD' | 'AUD' | 'JPY' | 'CNY';

export type Region = 
  | 'india' | 'usa' | 'europe' | 'middle_east' | 'asia' | 'africa' | 'latin_america' | 'oceania';

export type TimeZone = string;

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}

export interface CurrencyInfo {
  code: Currency;
  name: string;
  symbol: string;
  exchangeRate: number;
  lastUpdated: Date;
}

export interface RegionInfo {
  code: Region;
  name: string;
  festivals: string[];
  themes: string[];
  timezone: string;
}

export interface GlobalPreferences {
  language: Language;
  currency: Currency;
  region: Region;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
}

export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  timestamp: Date;
}

// Accessibility Types

export type ContrastMode = 'normal' | 'high' | 'maximum';
export type FontSize = 'small' | 'medium' | 'large' | 'extra_large';
export type LineHeight = 'compact' | 'normal' | 'relaxed';
export type ColorBlindnessMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface AccessibilitySettings {
  highContrast: boolean;
  contrastMode: ContrastMode;
  fontSize: FontSize;
  lineHeight: LineHeight;
  letterSpacing: number;
  dyslexicFont: boolean;
  reducedMotion: boolean;
  colorBlindnessMode: ColorBlindnessMode;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  voiceNavigation: boolean;
  captionsEnabled: boolean;
  focusIndicator: boolean;
  skipLinks: boolean;
}

export interface FontScalingConfig {
  base: number;
  scale: number;
  lineHeight: Record<LineHeight, number>;
  fontSize: Record<FontSize, number>;
}

// AI-SOS Digital Twin Dashboard Types

export interface MarketplaceSimulation {
  buyers: SimulationEntity;
  sellers: SimulationEntity;
  orders: SimulationEntity;
  products: SimulationEntity;
  aiAgents: SimulationEntity;
  deliveries: SimulationEntity;
  sessions: SimulationEntity;
}

export interface SimulationEntity {
  total: number;
  active: number;
  healthy: number;
  warning: number;
  critical: number;
}

export interface RevenueForecast {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  predicted: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  drivers: string[];
  risks: string[];
  opportunities: string[];
}

export interface DemandForecast {
  category: string;
  predictedDemand: number;
  currentDemand: number;
  changePercent: number;
  confidence: number;
  seasonal: boolean;
  festival: boolean;
  trend: 'up' | 'down' | 'stable';
}

export interface RiskIntelligence {
  id: string;
  type: 'fraud' | 'security' | 'inventory' | 'revenue' | 'infrastructure' | 'churn';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  impact: string;
  mitigation: string[];
  detectedAt: Date;
  status: 'active' | 'mitigated' | 'resolved' | 'false_positive';
}

export interface OpportunityIntelligence {
  id: string;
  type: 'product' | 'category' | 'market' | 'seller' | 'marketing' | 'automation';
  title: string;
  description: string;
  revenuePotential: number;
  roi: number;
  confidence: number;
  strategicImportance: 'low' | 'medium' | 'high';
  status: 'discovered' | 'evaluating' | 'approved' | 'implemented';
  createdAt: Date;
}

export interface AISOSHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  activeMissions: number;
  completedMissions: number;
  failedMissions: number;
  avgResponseTime: number;
  lastHealthCheck: Date;
}

export interface ExecutiveMetrics {
  marketplaceHealthScore: number;
  trustScore: number;
  aiPerformance: number;
  totalRevenue: number;
  revenueGrowth: number;
  activeUsers: number;
  activeSellers: number;
  totalProducts: number;
  conversionRate: number;
  avgOrderValue: number;
  customerSatisfaction: number;
}

export interface LiveActivity {
  id: string;
  type: 'order' | 'user' | 'product' | 'ai_agent' | 'delivery';
  action: string;
  location: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  type: 'flash_sale' | 'pricing' | 'marketing' | 'expansion' | 'optimization';
  parameters: Record<string, unknown>;
  estimatedImpact: {
    revenue: number;
    customers: number;
    sellers: number;
    risk: number;
    roi: number;
  };
  status: 'draft' | 'simulating' | 'completed' | 'applied';
}

// Gamification Types

export type BadgeCategory = 'shopping' | 'ai' | 'social' | 'seller' | 'achievement';
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  rewards: {
    points: number;
    cashback?: number;
    badge?: string;
  };
  requirements: string[];
}

export interface UserReward {
  id: string;
  type: 'points' | 'cashback' | 'coupon' | 'ai_credits' | 'referral' | 'achievement';
  amount: number;
  earnedAt: Date;
  source: string;
}

export interface ShoppingStreak {
  type: 'daily_login' | 'daily_search' | 'daily_purchase' | 'ai_interaction';
  currentStreak: number;
  longestStreak: number;
  lastActivity: Date;
  rewards: {
    bonusPoints: number;
    couponCode?: string;
    exclusiveAccess?: string[];
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'buyer' | 'seller' | 'ai';
  category: string;
  progress: number;
  target: number;
  rewards: {
    points: number;
    badge?: string;
    cashback?: number;
  };
  deadline: Date;
  status: 'active' | 'completed' | 'expired';
  isAIgenerated: boolean;
}

export interface SellerGrowthScore {
  totalScore: number;
  revenueGrowth: number;
  customerSatisfaction: number;
  deliveryPerformance: number;
  productQuality: number;
  returnRate: number;
  reviewQuality: number;
  aiAdoption: number;
  inventoryHealth: number;
  marketingPerformance: number;
  trends: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface RewardWallet {
  points: number;
  cashback: number;
  coupons: Array<{
    code: string;
    discount: number;
    expiresAt: Date;
  }>;
  aiCredits: number;
  referralRewards: number;
  achievementRewards: number;
}

// AI-SOS Operating System Types

export type MissionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
export type MissionPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AIMission {
  id: string;
  name: string;
  description: string;
  type: string;
  status: MissionStatus;
  priority: MissionPriority;
  progress: number;
  assignedAgents: string[];
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedCompletion?: Date;
  result?: string;
  error?: string;
}

export interface AIAgent {
  id: string;
  name: string;
  type: 'executive' | 'worker' | 'specialist';
  status: 'idle' | 'busy' | 'failed' | 'offline';
  currentMission?: string;
  completedMissions: number;
  failedMissions: number;
  avgExecutionTime: number;
  health: number;
  capabilities: string[];
}

export interface ExecutiveAI {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'busy';
  activeDecisions: number;
  confidence: number;
  businessImpact: 'low' | 'medium' | 'high';
  currentMissions: string[];
  lastActive: Date;
}

export interface AIMemory {
  id: string;
  key: string;
  value: string;
  category: 'preferences' | 'shopping' | 'brands' | 'budget' | 'context' | 'profile' | 'business';
  confidence: number;
  lastUpdated: Date;
  source: 'explicit' | 'learned' | 'inferred';
  type?: 'short_term' | 'long_term' | 'buyer' | 'seller' | 'project' | 'evolution';
  connections?: string[];
  strength?: number;
  createdAt?: Date;
}

export interface KnowledgeNode {
  id: string;
  type: 'buyer' | 'seller' | 'product' | 'order' | 'category' | 'campaign' | 'warehouse';
  label: string;
  properties: Record<string, unknown>;
  connections: string[];
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  relationship: string;
  strength: number;
}

export interface EventMessage {
  id: string;
  type: string;
  source: string;
  target?: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  status: 'pending' | 'processed' | 'failed';
}

export interface TrustMetrics {
  overallScore: number;
  riskScore: number;
  securityScore: number;
  complianceScore: number;
  aiConfidence: number;
  humanApprovals: number;
  governanceStatus: 'compliant' | 'warning' | 'critical';
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  change: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  isLive: boolean;
}
