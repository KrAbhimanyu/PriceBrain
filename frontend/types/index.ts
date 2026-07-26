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
