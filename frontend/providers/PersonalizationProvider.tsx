'use client';

import { createContext, useContext, useMemo, ReactNode, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import type { UserRole, User } from '@/types';
import type {
  RecentlyViewedProduct,
  SmartCollection,
  AIRecommendationItem,
  ContinueShoppingItem,
  SellerDailyGoal,
  SellerRevenueCard,
  SellerBusinessInsight,
  SellerAISuggestion,
  MarketplaceHealthMetric,
  LiveAlert,
  ExecutiveMetric,
} from '@/types';

interface PersonalizationContextValue {
  role: UserRole | 'guest';
  isAuthenticated: boolean;
  user: User | null;
  
  // Buyer features
  recentlyViewed: RecentlyViewedProduct[];
  aiRecommendations: AIRecommendationItem[];
  continueShopping: ContinueShoppingItem[];
  smartCollections: SmartCollection[];
  
  // Seller features
  dailyGoals: SellerDailyGoal[];
  revenueCards: SellerRevenueCard[];
  businessInsights: SellerBusinessInsight[];
  aiSuggestions: SellerAISuggestion[];
  
  // Admin features
  marketplaceHealth: MarketplaceHealthMetric[];
  liveAlerts: LiveAlert[];
  executiveMetrics: ExecutiveMetric[];
  
  // Actions
  addToRecentlyViewed: (product: RecentlyViewedProduct['product']) => void;
  dismissRecommendation: (id: string) => void;
  markAlertRead: (id: string) => void;
  updateDailyGoal: (id: string, progress: number) => void;
}

const PersonalizationContext = createContext<PersonalizationContextValue | null>(null);

interface PersonalizationProviderProps {
  children: ReactNode;
}

// Mock data generators
function generateMockBuyerData() {
  return {
    recentlyViewed: [] as RecentlyViewedProduct[],
    aiRecommendations: [
      {
        id: 'rec-1',
        product: {
          id: '1',
          name: 'iPhone 15 Pro',
          slug: 'iphone-15-pro',
          description: '',
          images: [{ id: '1', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', alt: 'iPhone', isPrimary: true, order: 1 }],
          brand: { id: '1', name: 'Apple', slug: 'apple', isActive: true },
          category: { id: '1', name: 'Electronics', slug: 'electronics', isActive: true },
          retailerPrices: [],
          specifications: [],
          rating: 4.5,
          reviewCount: 1234,
          inStock: true,
          isFeatured: true,
          isActive: true,
          lowestPrice: 119900,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        reason: 'Based on your interest in premium smartphones',
        confidence: 0.92,
        type: 'personalized' as const,
      },
      {
        id: 'rec-2',
        product: {
          id: '2',
          name: 'Samsung Galaxy S24',
          slug: 'samsung-galaxy-s24',
          description: '',
          images: [{ id: '2', url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', alt: 'Galaxy', isPrimary: true, order: 1 }],
          brand: { id: '2', name: 'Samsung', slug: 'samsung', isActive: true },
          category: { id: '1', name: 'Electronics', slug: 'electronics', isActive: true },
          retailerPrices: [],
          specifications: [],
          rating: 4.3,
          reviewCount: 890,
          inStock: true,
          isFeatured: true,
          isActive: true,
          lowestPrice: 79999,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        reason: 'Trending in Electronics right now',
        confidence: 0.88,
        type: 'trending' as const,
      },
    ] as AIRecommendationItem[],
    continueShopping: [
      {
        product: {
          id: '3',
          name: 'MacBook Air M3',
          slug: 'macbook-air-m3',
          description: '',
          images: [{ id: '3', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', alt: 'MacBook', isPrimary: true, order: 1 }],
          brand: { id: '1', name: 'Apple', slug: 'apple', isActive: true },
          category: { id: '1', name: 'Electronics', slug: 'electronics', isActive: true },
          retailerPrices: [],
          specifications: [],
          rating: 4.7,
          reviewCount: 2100,
          inStock: true,
          isFeatured: true,
          isActive: true,
          lowestPrice: 114900,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        lastViewed: new Date(Date.now() - 3600000),
        priceChange: -5.2,
      },
    ] as ContinueShoppingItem[],
    smartCollections: [
      {
        id: 'col-1',
        name: 'Summer Electronics Sale',
        slug: 'summer-electronics-sale',
        description: 'Best deals on gadgets this summer',
        icon: 'zap',
        products: [],
        productCount: 45,
      },
      {
        id: 'col-2',
        name: 'Budget-Friendly Finds',
        slug: 'budget-friendly',
        description: 'Quality products under ₹10,000',
        icon: 'tag',
        products: [],
        productCount: 128,
      },
      {
        id: 'col-3',
        name: 'Top-Rated Products',
        slug: 'top-rated',
        description: 'Products with 4+ star ratings',
        icon: 'star',
        products: [],
        productCount: 89,
      },
    ] as SmartCollection[],
  };
}

function generateMockSellerData() {
  return {
    dailyGoals: [
      { id: 'goal-1', type: 'revenue' as const, target: 50000, current: 32500, progress: 65, deadline: new Date() },
      { id: 'goal-2', type: 'orders' as const, target: 20, current: 14, progress: 70, deadline: new Date() },
      { id: 'goal-3', type: 'products' as const, target: 5, current: 2, progress: 40, deadline: new Date() },
    ] as SellerDailyGoal[],
    revenueCards: [
      { id: 'rev-1', title: 'Today\'s Revenue', value: 32500, change: 15.2, changeType: 'increase' as const, period: 'today' },
      { id: 'rev-2', title: 'This Week', value: 145000, change: 8.5, changeType: 'increase' as const, period: 'week' },
      { id: 'rev-3', title: 'This Month', value: 485000, change: -2.3, changeType: 'decrease' as const, period: 'month' },
      { id: 'rev-4', title: 'Avg. Order Value', value: 2850, change: 4.1, changeType: 'increase' as const, period: 'month' },
    ] as SellerRevenueCard[],
    businessInsights: [
      {
        id: 'ins-1',
        type: 'opportunity' as const,
        title: 'Price Optimization Available',
        description: 'Your product "iPhone 15 Pro" is priced 8% above market average. Consider adjusting to increase competitiveness.',
        impact: 'high' as const,
        actionUrl: '/seller/products',
        createdAt: new Date(),
      },
      {
        id: 'ins-2',
        type: 'trend' as const,
        title: 'Trending: Wireless Earbuds',
        description: 'Search volume for wireless earbuds increased 45% this week. Consider adding related products.',
        impact: 'medium' as const,
        actionUrl: '/seller/products/add',
        createdAt: new Date(),
      },
    ] as SellerBusinessInsight[],
    aiSuggestions: [
      {
        id: 'sug-1',
        title: 'Dynamic Pricing Strategy',
        description: 'Implement time-based pricing for your products during peak hours to maximize revenue.',
        potentialImpact: '+12% potential revenue increase',
        category: 'pricing' as const,
        actionLabel: 'Apply Now',
      },
      {
        id: 'sug-2',
        title: 'Inventory Alert',
        description: 'Stock levels for "MacBook Air" are running low. Consider restocking soon to avoid lost sales.',
        potentialImpact: 'Prevent ₹50,000 in lost sales',
        category: 'inventory' as const,
        actionLabel: 'View Product',
      },
      {
        id: 'sug-3',
        title: 'Seasonal Campaign',
        description: 'Back to School season starts in 2 weeks. Prepare your product listings for increased traffic.',
        potentialImpact: '+25% traffic potential',
        category: 'marketing' as const,
        actionLabel: 'Learn More',
      },
    ] as SellerAISuggestion[],
  };
}

function generateMockAdminData() {
  return {
    marketplaceHealth: [
      { id: 'health-1', name: 'Product Coverage', value: 94, target: 95, status: 'warning' as const, trend: 'up' as const, changePercent: 2.1 },
      { id: 'health-2', name: 'Price Accuracy', value: 98.5, target: 99, status: 'healthy' as const, trend: 'stable' as const, changePercent: 0.3 },
      { id: 'health-3', name: 'Scraper Uptime', value: 99.9, target: 99.5, status: 'healthy' as const, trend: 'stable' as const, changePercent: 0 },
      { id: 'health-4', name: 'User Engagement', value: 78, target: 80, status: 'warning' as const, trend: 'down' as const, changePercent: -3.2 },
    ] as MarketplaceHealthMetric[],
    liveAlerts: [
      {
        id: 'alert-1',
        type: 'scraper' as const,
        severity: 'warning' as const,
        title: 'Scraper Rate Limited',
        message: 'Amazon scraper is experiencing rate limiting. Consider reducing request frequency.',
        timestamp: new Date(Date.now() - 300000),
        isRead: false,
        actionUrl: '/admin/scrapers',
      },
      {
        id: 'alert-2',
        type: 'system' as const,
        severity: 'info' as const,
        title: 'Scheduled Maintenance',
        message: 'Database maintenance scheduled for tonight 2:00 AM - 4:00 AM UTC.',
        timestamp: new Date(Date.now() - 3600000),
        isRead: true,
      },
      {
        id: 'alert-3',
        type: 'user' as const,
        severity: 'critical' as const,
        title: 'Unusual Activity Detected',
        message: 'High volume of sign-ups detected from a single IP range. Possible bot activity.',
        timestamp: new Date(Date.now() - 1800000),
        isRead: false,
        actionUrl: '/admin/users',
      },
    ] as LiveAlert[],
    executiveMetrics: [
      {
        id: 'exec-1',
        category: 'revenue' as const,
        title: 'Total Revenue',
        value: 2450000,
        formattedValue: '₹24.5L',
        change: 245000,
        changePercent: 11.1,
        trend: [],
      },
      {
        id: 'exec-2',
        category: 'users' as const,
        title: 'Active Users',
        value: 8234,
        formattedValue: '8,234',
        change: 612,
        changePercent: 8.0,
        trend: [],
      },
      {
        id: 'exec-3',
        category: 'products' as const,
        title: 'Products Tracked',
        value: 12456,
        formattedValue: '12,456',
        change: 234,
        changePercent: 1.9,
        trend: [],
      },
      {
        id: 'exec-4',
        category: 'engagement' as const,
        title: 'Conversion Rate',
        value: 3.2,
        formattedValue: '3.2%',
        change: 0.2,
        changePercent: 6.7,
        trend: [],
      },
    ] as ExecutiveMetric[],
  };
}

export function PersonalizationProvider({ children }: PersonalizationProviderProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  const role = user?.role || (isAuthenticated ? 'buyer' : 'guest');
  
  // Generate role-specific data
  const buyerData = useMemo(() => generateMockBuyerData(), []);
  const sellerData = useMemo(() => generateMockSellerData(), []);
  const adminData = useMemo(() => generateMockAdminData(), []);
  
  // Actions
  const addToRecentlyViewed = useCallback((product: RecentlyViewedProduct['product']) => {
    // In a real app, this would update state/persist to localStorage/API
    console.log('Adding to recently viewed:', product.name);
  }, []);
  
  const dismissRecommendation = useCallback((id: string) => {
    // In a real app, this would update state
    console.log('Dismissing recommendation:', id);
  }, []);
  
  const markAlertRead = useCallback((id: string) => {
    // In a real app, this would update state
    console.log('Marking alert as read:', id);
  }, []);
  
  const updateDailyGoal = useCallback((id: string, progress: number) => {
    // In a real app, this would update state
    console.log('Updating daily goal:', id, progress);
  }, []);
  
  const value = useMemo<PersonalizationContextValue>(() => ({
    role,
    isAuthenticated,
    user,
    
    // Buyer features (available for all authenticated users)
    recentlyViewed: isAuthenticated ? buyerData.recentlyViewed : [],
    aiRecommendations: isAuthenticated ? buyerData.aiRecommendations : [],
    continueShopping: isAuthenticated ? buyerData.continueShopping : [],
    smartCollections: buyerData.smartCollections,
    
    // Seller features
    dailyGoals: role === 'seller' ? sellerData.dailyGoals : [],
    revenueCards: role === 'seller' ? sellerData.revenueCards : [],
    businessInsights: role === 'seller' ? sellerData.businessInsights : [],
    aiSuggestions: role === 'seller' ? sellerData.aiSuggestions : [],
    
    // Admin features
    marketplaceHealth: role === 'admin' ? adminData.marketplaceHealth : [],
    liveAlerts: role === 'admin' ? adminData.liveAlerts : [],
    executiveMetrics: role === 'admin' ? adminData.executiveMetrics : [],
    
    // Actions
    addToRecentlyViewed,
    dismissRecommendation,
    markAlertRead,
    updateDailyGoal,
  }), [
    role,
    isAuthenticated,
    user,
    buyerData,
    sellerData,
    adminData,
    addToRecentlyViewed,
    dismissRecommendation,
    markAlertRead,
    updateDailyGoal,
  ]);
  
  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
}

export function useRole() {
  const { role, isAuthenticated } = usePersonalization();
  return {
    role,
    isAuthenticated,
    isBuyer: role === 'buyer',
    isSeller: role === 'seller',
    isAdmin: role === 'admin',
    isGuest: !isAuthenticated,
  };
}
