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
