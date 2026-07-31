'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Brain, Search, Sparkles, TrendingUp, ChevronRight, ChevronDown, Filter,
  Grid3X3, LayoutList, Mic, Camera, Zap, Target, Award, Trophy, Flame, Clock,
  Star, Shield, Truck, Package, RefreshCw, X, Eye, Heart, ShoppingCart,
  BarChart3, Users, Globe, Store, Percent, Tag, CreditCard, TrendingDown,
  ArrowUpDown, SortAsc, Layers, TreePine, Map, Bookmark, BookmarkCheck,
  ThumbsUp, MessageSquare, Share2, ExternalLink, ArrowRight, Calendar,
  Home, Smartphone, Shirt, Laptop, Sofa, Sparkle, Dumbbell, BookOpen,
  Baby, Car, Dog, ShoppingBag, Plane, Gem, Crown, Coffee, Tv, Cpu, Watch,
  Headphones, Camera as CameraIcon, Bike, Gift, Music, Palette, Gamepad2,
  ChevronLeft, Volume2, VolumeX, Info, HelpCircle, ArrowUp, ArrowDown,
  DollarSign, PercentCircle, TrendingRight, Leaf, Recycle, UsersRound,
  ShoppingBasket, Briefcase, GraduationCap, BabyCarriage, Camera2, ChefHat,
  ShirtIcon, PlaneTakeoff, BriefcaseIcon, HeartPulse, PawPrint, UtensilsCrossed
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: React.ReactNode;
  image: string;
  productCount: number;
  avgDiscount: number;
  aiScore: number;
  trending: boolean;
  topBrands: string[];
  avgPrice: number;
  color: string;
}

interface SmartCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  count: number;
}

interface LifestyleCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  productCount: number;
}

interface SeasonalCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  season: string;
  discount: number;
}

interface TrendingCollection {
  id: string;
  name: string;
  description: string;
  type: 'today' | 'week' | 'purchased' | 'growing' | 'editor' | 'community' | 'ai' | 'shared' | 'social';
  productCount: number;
  image: string;
}

interface Brand {
  id: string;
  name: string;
  logo: string;
  productCount: number;
  avgRating: number;
  dealsCount: number;
  category: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  basedOn: string;
  products: number;
}

interface FilterState {
  category: string;
  subcategory: string;
  brand: string;
  priceRange: [number, number];
  discountMin: number;
  aiScoreMin: number;
  trustScoreMin: number;
  ratingMin: number;
  availability: 'all' | 'in-stock' | 'out-of-stock';
  deliveryTime: 'all' | 'fast' | 'standard';
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'discount' | 'rating' | 'popularity' | 'newest';
}

interface CategoryInsight {
  metric: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

interface ProductPreview {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  aiSummary: string;
  topFeatures: string[];
  topBrands: string[];
  lowestPrice: number;
  highestPrice: number;
  avgPrice: number;
}

interface Stats {
  categories: number;
  subcategories: number;
  products: number;
  brands: number;
  stores: number;
  deals: number;
  comparisons: number;
  users: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const CATEGORIES: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', icon: <Cpu className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', productCount: 1250000, avgDiscount: 22, aiScore: 95, trending: true, topBrands: ['Apple', 'Samsung', 'Sony', 'LG', 'Dell'], avgPrice: 25000, color: 'from-blue-500 to-cyan-500' },
  { id: '2', name: 'Mobiles', slug: 'mobiles', icon: <Smartphone className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', productCount: 85000, avgDiscount: 18, aiScore: 92, trending: true, topBrands: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo'], avgPrice: 18000, color: 'from-indigo-500 to-purple-500' },
  { id: '3', name: 'Laptops', slug: 'laptops', icon: <Laptop className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', productCount: 45000, avgDiscount: 20, aiScore: 94, trending: true, topBrands: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS'], avgPrice: 65000, color: 'from-gray-600 to-gray-800' },
  { id: '4', name: 'Fashion', slug: 'fashion', icon: <ShirtIcon className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', productCount: 2500000, avgDiscount: 45, aiScore: 88, trending: true, topBrands: ['Nike', 'Adidas', "Levi's", 'Zara', 'H&M'], avgPrice: 1500, color: 'from-pink-500 to-rose-500' },
  { id: '5', name: 'Home & Kitchen', slug: 'home-kitchen', icon: <Home className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', productCount: 890000, avgDiscount: 35, aiScore: 90, trending: false, topBrands: ['Prestige', 'Pigeon', 'Wonderchef', 'Milton', 'Crompton'], avgPrice: 2500, color: 'from-orange-500 to-amber-500' },
  { id: '6', name: 'Beauty', slug: 'beauty', icon: <Sparkle className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', productCount: 320000, avgDiscount: 30, aiScore: 85, trending: true, topBrands: ['Lakme', 'Maybelline', 'MAC', 'Nykaa', 'Forest Essentials'], avgPrice: 800, color: 'from-purple-500 to-pink-500' },
  { id: '7', name: 'Sports', slug: 'sports', icon: <Dumbbell className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1461896836934- voices5935623?w=400', productCount: 180000, avgDiscount: 40, aiScore: 87, trending: false, topBrands: ['Nike', 'Adidas', 'Puma', 'Reebok', 'HRX'], avgPrice: 2000, color: 'from-green-500 to-emerald-500' },
  { id: '8', name: 'Books', slug: 'books', icon: <BookOpen className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400', productCount: 5600000, avgDiscount: 25, aiScore: 82, trending: false, topBrands: ['Penguin', 'HarperCollins', 'Oxford', 'Cambridge', 'Bloomsbury'], avgPrice: 350, color: 'from-yellow-600 to-orange-500' },
  { id: '9', name: 'Gaming', slug: 'gaming', icon: <Gamepad2 className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400', productCount: 78000, avgDiscount: 28, aiScore: 93, trending: true, topBrands: ['PlayStation', 'Xbox', 'Nintendo', 'Razer', 'Logitech'], avgPrice: 15000, color: 'from-red-500 to-purple-500' },
  { id: '10', name: 'Furniture', slug: 'furniture', icon: <Sofa className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', productCount: 250000, avgDiscount: 38, aiScore: 84, trending: false, topBrands: ['IKEA', 'UrbanLadder', 'Pepperfry', 'Sleepycat', 'Wakefit'], avgPrice: 15000, color: 'from-amber-600 to-brown-500' },
  { id: '11', name: 'Smart Wearables', slug: 'wearables', icon: <Watch className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', productCount: 35000, avgDiscount: 25, aiScore: 91, trending: true, topBrands: ['Apple', 'Samsung', 'BoAt', 'Noise', 'Fitbit'], avgPrice: 5000, color: 'from-teal-500 to-cyan-500' },
  { id: '12', name: 'Audio', slug: 'audio', icon: <Headphones className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', productCount: 65000, avgDiscount: 30, aiScore: 89, trending: true, topBrands: ['Sony', 'BoAt', 'JBL', 'Bose', 'Sennheiser'], avgPrice: 3000, color: 'from-violet-500 to-purple-500' },
  { id: '13', name: 'Kitchen Appliances', slug: 'kitchen-appliances', icon: <Coffee className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400', productCount: 120000, avgDiscount: 32, aiScore: 86, trending: false, topBrands: ['Prestige', 'Philips', 'Morphy Richards', 'Panasonic', 'Havells'], avgPrice: 4000, color: 'from-orange-500 to-red-500' },
  { id: '14', name: 'Camera', slug: 'camera', icon: <Camera2 className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400', productCount: 28000, avgDiscount: 18, aiScore: 90, trending: false, topBrands: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'GoPro'], avgPrice: 45000, color: 'from-gray-700 to-black' },
  { id: '15', name: 'Automotive', slug: 'automotive', icon: <Car className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400', productCount: 180000, avgDiscount: 25, aiScore: 83, trending: false, topBrands: ['Bosch', '3M', 'Michelin', 'CEAT', 'MotorNite'], avgPrice: 2000, color: 'from-blue-600 to-gray-600' },
  { id: '16', name: 'Pet Supplies', slug: 'pet-supplies', icon: <PawPrint className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', productCount: 95000, avgDiscount: 28, aiScore: 80, trending: true, topBrands: ['Pedigree', 'Royal Canin', 'Drools', 'Farmina', 'Kirby'], avgPrice: 800, color: 'from-amber-500 to-yellow-500' },
  { id: '17', name: 'Kids', slug: 'kids', icon: <Baby className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400', productCount: 340000, avgDiscount: 42, aiScore: 84, trending: false, topBrands: ['Mattel', 'Lego', 'Fisher Price', 'Chicco', 'Mamaearth'], avgPrice: 900, color: 'from-pink-400 to-purple-400' },
  { id: '18', name: 'Travel', slug: 'travel', icon: <PlaneTakeoff className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400', productCount: 45000, avgDiscount: 20, aiScore: 78, trending: true, topBrands: ['American Tourister', 'Safari', 'Skybags', 'Tommy Hilfiger', 'Protege'], avgPrice: 2500, color: 'from-sky-500 to-blue-500' },
  { id: '19', name: 'Grocery', slug: 'grocery', icon: <ShoppingBasket className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', productCount: 15000000, avgDiscount: 15, aiScore: 75, trending: false, topBrands: ['Tata', 'Haldiram', 'Parle', 'ITC', 'MTR'], avgPrice: 300, color: 'from-green-600 to-emerald-500' },
  { id: '20', name: 'Luxury', slug: 'luxury', icon: <Crown className="h-6 w-6" />, image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400', productCount: 25000, avgDiscount: 12, aiScore: 88, trending: true, topBrands: ['Gucci', 'Prada', 'Louis Vuitton', 'Hermes', 'Rolex'], avgPrice: 150000, color: 'from-yellow-500 to-amber-500' },
];

const SMART_CATEGORIES: SmartCategory[] = [
  { id: 'best-value', name: 'Best Value', icon: <TrendingDown className="h-5 w-5" />, description: 'Maximum savings per product', color: 'bg-green-500', count: 125000 },
  { id: 'most-trusted', name: 'Most Trusted', icon: <Shield className="h-5 w-5" />, description: 'Verified sellers, high ratings', color: 'bg-blue-500', count: 89000 },
  { id: 'lowest-ever', name: 'Lowest Ever Price', icon: <ArrowDown className="h-5 w-5" />, description: 'All-time low prices', color: 'bg-emerald-500', count: 45000 },
  { id: 'price-drop', name: 'Price Drop Today', icon: <TrendingRight className="h-5 w-5" />, description: 'Drops in last 24 hours', color: 'bg-red-500', count: 23000 },
  { id: 'hidden-deals', name: 'Hidden Deals', icon: <Eye className="h-5 w-5" />, description: 'Less known but great value', color: 'bg-purple-500', count: 67000 },
  { id: 'most-wishlisted', name: 'Most Wishlisted', icon: <Heart className="h-5 w-5" />, description: 'Top picks by shoppers', color: 'bg-pink-500', count: 156000 },
  { id: 'most-reviewed', name: 'Most Reviewed', icon: <MessageSquare className="h-5 w-5" />, description: 'Proven by thousands', color: 'bg-amber-500', count: 78000 },
  { id: 'highest-rated', name: 'Highest Rated', icon: <Star className="h-5 w-5" />, description: '4.5+ star products', color: 'bg-yellow-500', count: 134000 },
  { id: 'students', name: 'Best for Students', icon: <GraduationCap className="h-5 w-5" />, description: 'Budget-friendly essentials', color: 'bg-indigo-500', count: 89000 },
  { id: 'professionals', name: 'For Professionals', icon: <BriefcaseIcon className="h-5 w-5" />, description: 'Premium work tools', color: 'bg-slate-600', count: 67000 },
  { id: 'families', name: 'Best for Families', icon: <UsersRound className="h-5 w-5" />, description: 'Complete family solutions', color: 'bg-teal-500', count: 178000 },
  { id: 'eco-friendly', name: 'Eco Friendly', icon: <Leaf className="h-5 w-5" />, description: 'Sustainable choices', color: 'bg-green-600', count: 34000 },
  { id: 'trending-week', name: 'Trending This Week', icon: <Flame className="h-5 w-5" />, description: 'Hot picks right now', color: 'bg-orange-500', count: 89000 },
  { id: 'newly-launched', name: 'Recently Launched', icon: <Sparkles className="h-5 w-5" />, description: 'Fresh arrivals', color: 'bg-cyan-500', count: 23000 },
  { id: 'limited-stock', name: 'Limited Stock', icon: <Package className="h-5 w-5" />, description: 'Running out fast', color: 'bg-rose-500', count: 45000 },
  { id: 'fast-delivery', name: 'Fast Delivery', icon: <Truck className="h-5 w-5" />, description: 'Get it tomorrow', color: 'bg-blue-600', count: 234000 },
  { id: 'festival', name: 'Festival Essentials', icon: <Gift className="h-5 w-5" />, description: 'Celebration ready', color: 'bg-gold-500', count: 156000 },
  { id: 'budget', name: 'Budget Friendly', icon: <DollarSign className="h-5 w-5" />, description: 'Under ₹500 picks', color: 'bg-lime-500', count: 456000 },
  { id: 'premium', name: 'Premium Picks', icon: <Gem className="h-5 w-5" />, description: 'Top-tier quality', color: 'bg-violet-600', count: 67000 },
  { id: 'ai-recommended', name: 'AI Recommended', icon: <Brain className="h-5 w-5" />, description: 'Curated for you', color: 'bg-gradient-to-r from-blue-500 to-purple-500', count: 89000 },
];

const LIFESTYLE_CATEGORIES: LifestyleCategory[] = [
  { id: 'student', name: 'Student Essentials', icon: <GraduationCap className="h-6 w-6" />, description: 'Laptops, books, supplies, and more for college life', productCount: 156000 },
  { id: 'wfh', name: 'Work From Home', icon: <Home className="h-6 w-6" />, description: 'Everything for your home office setup', productCount: 89000 },
  { id: 'office', name: 'Office Setup', icon: <BriefcaseIcon className="h-6 w-6" />, description: 'Professional gear for career success', productCount: 78000 },
  { id: 'gaming', name: 'Gaming Setup', icon: <Gamepad2 className="h-6 w-6" />, description: 'Level up your gaming experience', productCount: 67000 },
  { id: 'travel', name: 'Travel Essentials', icon: <PlaneTakeoff className="h-6 w-6" />, description: 'Pack smart for your next adventure', productCount: 45000 },
  { id: 'fitness', name: 'Fitness Journey', icon: <Dumbbell className="h-6 w-6" />, description: 'Home gym, supplements, wearables', productCount: 134000 },
  { id: 'parents', name: 'New Parents', icon: <BabyCarriage className="h-6 w-6" />, description: 'Everything for your little one', productCount: 234000 },
  { id: 'pets', name: 'Pet Owners', icon: <PawPrint className="h-6 w-6" />, description: 'Food, toys, accessories for pets', productCount: 95000 },
  { id: 'photo', name: 'Photography', icon: <Camera2 className="h-6 w-6" />, description: 'Cameras, lenses, accessories', productCount: 28000 },
  { id: 'home-decor', name: 'Home Decoration', icon: <Sofa className="h-6 w-6" />, description: 'Transform your living space', productCount: 178000 },
  { id: 'cooking', name: 'Cooking Lovers', icon: <ChefHat className="h-6 w-6" />, description: 'Kitchen tools, appliances, ingredients', productCount: 145000 },
  { id: 'fashion', name: 'Fashion Trends', icon: <ShirtIcon className="h-6 w-6" />, description: 'Stay stylish with latest trends', productCount: 890000 },
  { id: 'wedding', name: 'Wedding Shopping', icon: <Gift className="h-6 w-6" />, description: 'Complete wedding essentials', productCount: 234000 },
  { id: 'business', name: 'Business Essentials', icon: <Briefcase className="h-6 w-6" />, description: 'Corporate gifting, office supplies', productCount: 67000 },
  { id: 'health', name: 'Health & Wellness', icon: <HeartPulse className="h-6 w-6" />, description: 'Healthy lifestyle products', productCount: 156000 },
];

const SEASONAL_CATEGORIES = [
  { id: 'summer', name: 'Summer', icon: <Sun className="h-5 w-5" />, season: 'Apr-Jun', discount: 40 },
  { id: 'winter', name: 'Winter', icon: <Snowflake className="h-5 w-5" />, season: 'Oct-Feb', discount: 45 },
  { id: 'monsoon', name: 'Monsoon', icon: <CloudRain className="h-5 w-5" />, season: 'Jun-Sep', discount: 35 },
  { id: 'festive', name: 'Festive', icon: <Sparkles className="h-5 w-5" />, season: 'Year-round', discount: 50 },
  { id: 'diwali', name: 'Diwali', icon: <Lamp className="h-5 w-5" />, season: 'Oct-Nov', discount: 60 },
  { id: 'christmas', name: 'Christmas', icon: <TreePine className="h-5 w-5" />, season: 'Dec', discount: 40 },
  { id: 'newyear', name: 'New Year', icon: <Party className="h-5 w-5" />, season: 'Dec-Jan', discount: 45 },
  { id: 'valentine', name: "Valentine's", icon: <Heart className="h-5 w-5" />, season: 'Feb', discount: 35 },
  { id: 'back-school', name: 'Back to School', icon: <Backpack className="h-5 w-5" />, season: 'Jun-Jul', discount: 30 },
  { id: 'wedding-season', name: 'Wedding', icon: <Ring className="h-5 w-5" />, season: 'Nov-Mar', discount: 50 },
  { id: 'holiday', name: 'Holiday Travel', icon: <Plane className="h-5 w-5" />, season: 'Dec', discount: 25 },
];

const TRENDING_COLLECTIONS: TrendingCollection[] = [
  { id: '1', name: 'iPhone 15 Series', description: 'Latest Apple flagship with USB-C', type: 'today', productCount: 45, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400' },
  { id: '2', name: 'Samsung Galaxy S24', description: 'AI-powered Android experience', type: 'ai', productCount: 38, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400' },
  { id: '3', name: 'AirPods Pro 2', description: 'Premium wireless earbuds', type: 'week', productCount: 28, image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400' },
  { id: '4', name: 'Running Shoes', description: 'Top picks for marathon training', type: 'purchased', productCount: 156, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
  { id: '5', name: 'Skincare Essentials', description: 'Korean beauty favorites', type: 'community', productCount: 234, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
  { id: '6', name: 'Smart Home Devices', description: 'Transform your home', type: 'growing', productCount: 89, image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400' },
];

const BRANDS: Brand[] = [
  { id: '1', name: 'Apple', logo: '🍎', productCount: 12500, avgRating: 4.7, dealsCount: 234, category: 'Electronics' },
  { id: '2', name: 'Samsung', logo: '📱', productCount: 8900, avgRating: 4.5, dealsCount: 189, category: 'Electronics' },
  { id: '3', name: 'Sony', logo: '🎧', productCount: 5600, avgRating: 4.6, dealsCount: 145, category: 'Electronics' },
  { id: '4', name: 'Nike', logo: '👟', productCount: 12300, avgRating: 4.4, dealsCount: 312, category: 'Fashion' },
  { id: '5', name: 'Adidas', logo: '🏃', productCount: 9800, avgRating: 4.5, dealsCount: 267, category: 'Fashion' },
  { id: '6', name: 'BoAt', logo: '🎵', productCount: 4500, avgRating: 4.2, dealsCount: 178, category: 'Audio' },
  { id: '7', name: 'OnePlus', logo: '⚡', productCount: 3200, avgRating: 4.5, dealsCount: 89, category: 'Mobiles' },
  { id: '8', name: "Levi's", logo: '👖', productCount: 7800, avgRating: 4.3, dealsCount: 234, category: 'Fashion' },
  { id: '9', name: 'Dell', logo: '💻', productCount: 4100, avgRating: 4.4, dealsCount: 123, category: 'Laptops' },
  { id: '10', name: 'LG', logo: '📺', productCount: 3400, avgRating: 4.4, dealsCount: 98, category: 'Electronics' },
  { id: '11', name: 'Puma', logo: '🏅', productCount: 6700, avgRating: 4.3, dealsCount: 198, category: 'Fashion' },
  { id: '12', name: 'HP', logo: '🖥️', productCount: 3800, avgRating: 4.3, dealsCount: 112, category: 'Laptops' },
];

const AI_COLLECTIONS: Collection[] = [
  { id: '1', name: 'Curated For You', description: 'Personalized recommendations based on your shopping patterns', basedOn: 'Your unique profile', products: 2340 },
  { id: '2', name: 'Based on Wishlist', description: 'Products similar to items you saved earlier', basedOn: 'Your wishlist analysis', products: 890 },
  { id: '3', name: 'Budget Smart Picks', description: 'Maximum value within your budget range', basedOn: 'Your budget settings', products: 1560 },
  { id: '4', name: 'Your Shopping Style', description: 'Products matching your preferences and taste', basedOn: 'Shopping persona', products: 1980 },
  { id: '5', name: 'You Recently Viewed', description: 'Continue exploring similar products', basedOn: 'Browsing history', products: 450 },
  { id: '6', name: 'Buy Again', description: 'Reorder your frequently purchased items', basedOn: 'Purchase history', products: 340 },
  { id: '7', name: 'Healthy Choices', description: 'Products aligned with your wellness goals', basedOn: 'Health score', products: 890 },
  { id: '8', name: 'Your Style Profile', description: 'Fashion items matching your wardrobe', basedOn: 'Digital wardrobe', products: 1230 },
  { id: '9', name: 'Life Stage Picks', description: 'Products for your current life phase', basedOn: 'Life timeline', products: 780 },
  { id: '10', name: 'AI Coach Suggestions', description: 'Expert recommendations from your shopping coach', basedOn: 'AI analysis', products: 560 },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const formatNumber = (num: number): string => {
  if (num >= 10000000) return (num / 10000000).toFixed(1) + ' Cr';
  if (num >= 100000) return (num / 100000).toFixed(1) + ' L';
  if (num >= 1000) return (num / 1000).toFixed(1) + ' K';
  return num.toLocaleString();
};

// ============================================================================
// COMPONENTS
// ============================================================================

const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{formatNumber(count)}</span>;
};

const GlassCard = ({ children, className = '', hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) => (
  <motion.div
    whileHover={hover ? { y: -4, scale: 1.01 } : {}}
    transition={{ duration: 0.3 }}
    className={cn(
      'backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 rounded-2xl shadow-xl',
      hover && 'hover:shadow-2xl',
      className
    )}
  >
    {children}
  </motion.div>
);

const CategoryCard = ({ category, index }: { category: Category; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/categories/${category.slug}`}>
        <GlassCard className="overflow-hidden group cursor-pointer">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent'
            )} />
            
            {/* Trending Badge */}
            {category.trending && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                  <Flame className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              </div>
            )}

            {/* AI Score */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-black/50 backdrop-blur-sm text-white border-0">
                <Brain className="w-3 h-3 mr-1" />
                {category.aiScore}% AI
              </Badge>
            </div>

            {/* Category Icon */}
            <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-primary shadow-lg">
              {category.icon}
            </div>

            {/* Hover Overlay */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4"
                >
                  <div className="text-white">
                    <p className="font-bold text-lg">{formatNumber(category.productCount)} products</p>
                    <p className="text-sm text-white/80">Avg {category.avgDiscount}% off</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">{category.name}</h3>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatNumber(category.productCount)} products</span>
              <span className="text-green-600 font-medium">Up to {category.avgDiscount}% off</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {category.topBrands.slice(0, 3).map((brand) => (
                <Badge key={brand} variant="secondary" className="text-xs">
                  {brand}
                </Badge>
              ))}
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
};

const SmartCategoryCard = ({ category, index }: { category: SmartCategory; index: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.03 }}
  >
    <GlassCard className="p-5 cursor-pointer hover:glow-effect transition-all duration-500">
      <div className="flex items-start gap-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white', category.color)}>
          {category.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold mb-1">{category.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{formatNumber(category.count)} products</Badge>
          </div>
        </div>
      </div>
    </GlassCard>
  </motion.div>
);

const LifestyleCard = ({ lifestyle, index }: { lifestyle: LifestyleCategory; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <GlassCard className="p-5 flex items-center gap-4 cursor-pointer hover:bg-primary/5 transition-colors">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
        {lifestyle.icon}
      </div>
      <div className="flex-1">
        <h3 className="font-bold">{lifestyle.name}</h3>
        <p className="text-sm text-muted-foreground">{lifestyle.description}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-primary">{formatNumber(lifestyle.productCount)}</p>
        <p className="text-xs text-muted-foreground">products</p>
      </div>
    </GlassCard>
  </motion.div>
);

const BrandCard = ({ brand, index }: { brand: Brand; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <GlassCard className="p-5 text-center cursor-pointer group hover:bg-primary/5 transition-colors">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mx-auto mb-4 text-3xl group-hover:scale-110 transition-transform">
        {brand.logo}
      </div>
      <h3 className="font-bold mb-2">{brand.name}</h3>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span>{brand.avgRating}</span>
      </div>
      <div className="flex items-center justify-center gap-2">
        <Badge variant="secondary" className="text-xs">{formatNumber(brand.productCount)} products</Badge>
        <Badge variant="outline" className="text-xs text-green-600 border-green-200">{brand.dealsCount} deals</Badge>
      </div>
    </GlassCard>
  </motion.div>
);

const CollectionCard = ({ collection, index }: { collection: Collection; index: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
  >
    <GlassCard className="p-6 cursor-pointer hover:glow-effect transition-all duration-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
          <Brain className="w-5 h-5" />
        </div>
        <Badge variant="secondary" className="text-xs">Based on: {collection.basedOn}</Badge>
      </div>
      <h3 className="font-bold text-lg mb-2">{collection.name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{collection.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{formatNumber(collection.products)} products</span>
        <Button size="sm" variant="ghost" className="text-primary">
          Explore <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </GlassCard>
  </motion.div>
);

const TrendingCard = ({ collection, index }: { collection: TrendingCollection; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <GlassCard className="overflow-hidden group cursor-pointer">
      <div className="relative aspect-video">
        <Image
          src={collection.image}
          alt={collection.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <Badge className={cn(
            'mb-2 border-0',
            collection.type === 'today' && 'bg-red-500',
            collection.type === 'ai' && 'bg-gradient-to-r from-blue-500 to-purple-500',
            collection.type === 'week' && 'bg-orange-500',
            collection.type === 'community' && 'bg-pink-500',
            collection.type === 'purchased' && 'bg-green-500',
            collection.type === 'growing' && 'bg-yellow-500',
          )}>
            {collection.type === 'today' && '🔥 Trending Today'}
            {collection.type === 'ai' && '🤖 AI Pick'}
            {collection.type === 'week' && '📈 This Week'}
            {collection.type === 'community' && '👥 Community'}
            {collection.type === 'purchased' && '✅ Most Bought'}
            {collection.type === 'growing' && '🚀 Growing Fast'}
          </Badge>
          <h3 className="text-white font-bold text-lg">{collection.name}</h3>
          <p className="text-white/80 text-sm">{collection.description}</p>
        </div>
      </div>
    </GlassCard>
  </motion.div>
);

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'tree'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeSection, setActiveSection] = useState('popular');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const filters: FilterState = {
    category: '',
    subcategory: '',
    brand: '',
    priceRange: [0, 500000],
    discountMin: 0,
    aiScoreMin: 0,
    trustScoreMin: 0,
    ratingMin: 0,
    availability: 'all',
    deliveryTime: 'all',
    sortBy: 'relevance',
  };

  const stats: Stats = {
    categories: 100,
    subcategories: 1500,
    products: 50000000,
    brands: 10000,
    stores: 500,
    deals: 25000,
    comparisons: 100000000,
    users: 2500000,
  };

  const insights: CategoryInsight[] = [
    { metric: 'Average Price', value: '₹2,450', trend: 'down', change: '-5%' },
    { metric: 'Top Brands', value: 'Apple, Samsung, Sony', trend: 'stable', change: '' },
    { metric: 'Best Time to Buy', value: 'Festival Sales', trend: 'stable', change: '' },
    { metric: 'Avg Rating', value: '4.3/5', trend: 'up', change: '+0.1' },
    { metric: 'Return Rate', value: '8%', trend: 'down', change: '-2%' },
  ];

  const sections = [
    { id: 'popular', name: 'Popular Categories', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'smart', name: 'AI Smart', icon: <Brain className="w-4 h-4" /> },
    { id: 'lifestyle', name: 'Lifestyle', icon: <Heart className="w-4 h-4" /> },
    { id: 'brands', name: 'Brands', icon: <Store className="w-4 h-4" /> },
    { id: 'collections', name: 'AI Collections', icon: <Layers className="w-4 h-4" /> },
    { id: 'trending', name: 'Trending', icon: <Flame className="w-4 h-4" /> },
  ];

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        .gradient-text {
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, #8B5CF6 50%, hsl(var(--primary)) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glass-panel {
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .glow-effect {
          box-shadow: 0 0 60px -15px hsl(var(--primary) / 0.3);
        }
      `}</style>

      {/* ============================================================
          SECTION 1: PREMIUM HERO
      ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 md:py-24">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
          
          {/* Floating Elements */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 backdrop-blur-sm"
              style={{
                left: `${10 + (i * 8)}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Badge variant="secondary" className="px-4 py-2">
              <Brain className="w-4 h-4 mr-1 text-primary" />
              AI-Powered Discovery
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              {formatNumber(stats.products)}+ Products
            </Badge>
          </div>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              Discover Smarter.{' '}
              <span className="gradient-text">Shop Better.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Explore millions of products organized intelligently by AI, interests, trends, lifestyle, and shopping goals.
            </p>

            {/* Advanced Search Bar */}
            <div className="flex items-center gap-3 max-w-3xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for products, brands, categories, or ask AI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-32 h-16 rounded-2xl border border-border bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg shadow-lg"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    onClick={() => setIsVoiceSearchActive(!isVoiceSearchActive)}
                    className={cn(
                      'p-3 rounded-xl transition-all',
                      isVoiceSearchActive 
                        ? 'bg-primary text-white' 
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {isVoiceSearchActive ? <VolumeX className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button className="p-3 bg-muted hover:bg-muted/80 rounded-xl">
                    <Camera className="w-5 h-5" />
                  </button>
                  <Button size="lg" className="h-12 px-6 rounded-xl">
                    <Sparkles className="w-5 h-5 mr-2" />
                    AI Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {[
                { name: 'Explore Categories', icon: <Grid3X3 className="w-4 h-4" />, href: '#popular' },
                { name: 'Trending', icon: <Flame className="w-4 h-4" />, href: '#trending' },
                { name: 'Deals', icon: <Percent className="w-4 h-4" />, href: '/deal' },
                { name: 'AI Recommendations', icon: <Brain className="w-4 h-4" />, href: '#collections' },
              ].map((link) => (
                <Link key={link.name} href={link.href}>
                  <Button variant="outline" className="rounded-full">
                    {link.icon}
                    <span className="ml-2">{link.name}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <GlassCard className="p-5 text-center">
              <p className="text-3xl font-bold text-primary"><AnimatedCounter value={stats.categories} /></p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </GlassCard>
            <GlassCard className="p-5 text-center">
              <p className="text-3xl font-bold text-primary"><AnimatedCounter value={stats.brands} /></p>
              <p className="text-sm text-muted-foreground">Brands</p>
            </GlassCard>
            <GlassCard className="p-5 text-center">
              <p className="text-3xl font-bold text-primary"><AnimatedCounter value={stats.products} /></p>
              <p className="text-sm text-muted-foreground">Products</p>
            </GlassCard>
            <GlassCard className="p-5 text-center">
              <p className="text-3xl font-bold text-primary"><AnimatedCounter value={stats.deals} /></p>
              <p className="text-sm text-muted-foreground">Active Deals</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: POPULAR CATEGORIES
      ============================================================ */}
      <section id="popular" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-3">
                <TrendingUp className="w-4 h-4 mr-1" />
                Most Popular
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Shop by <span className="gradient-text">Category</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'grid' ? 'bg-primary text-white' : 'bg-background'
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'list' ? 'bg-primary text-white' : 'bg-background'
                  )}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
              <select className="h-10 px-4 rounded-lg border border-border bg-background text-sm">
                <option>Sort by: Popular</option>
                <option>Sort by: Name</option>
                <option>Sort by: Products</option>
                <option>Sort by: Discount</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {CATEGORIES.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: AI SMART CATEGORIES
      ============================================================ */}
      <section id="smart" className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3">
              <Brain className="w-4 h-4 mr-1 text-primary" />
              AI-Powered
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Smart <span className="gradient-text">Categories</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI-generated collections that help you discover products based on value, trust, trends, and your preferences.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {SMART_CATEGORIES.map((category, index) => (
              <SmartCategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: LIFESTYLE SHOPPING
      ============================================================ */}
      <section id="lifestyle" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3">
              <Heart className="w-4 h-4 mr-1 text-pink-500" />
              By Lifestyle
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Shop by <span className="gradient-text">Lifestyle</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find products organized around how you live, work, and play.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LIFESTYLE_CATEGORIES.map((lifestyle, index) => (
              <LifestyleCard key={lifestyle.id} lifestyle={lifestyle} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: SEASONAL COLLECTIONS
      ============================================================ */}
      <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3">
              <Calendar className="w-4 h-4 mr-1 text-orange-500" />
              Seasonal
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Shop by <span className="gradient-text">Season</span>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {SEASONAL_CATEGORIES.map((season) => (
              <motion.div
                key={season.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <GlassCard className="px-6 py-4 flex items-center gap-3 cursor-pointer hover:bg-primary/5 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    {season.icon}
                  </div>
                  <div>
                    <p className="font-bold">{season.name}</p>
                    <p className="text-xs text-muted-foreground">{season.season} • Up to {season.discount}% off</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 6: TRENDING COLLECTIONS
      ============================================================ */}
      <section id="trending" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-3">
                <Flame className="w-4 h-4 mr-1 text-orange-500" />
                Hot Right Now
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="gradient-text">Trending</span> Collections
              </h2>
            </div>
            <Button variant="outline">View All</Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRENDING_COLLECTIONS.map((collection, index) => (
              <TrendingCard key={collection.id} collection={collection} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 7: BRAND DISCOVERY
      ============================================================ */}
      <section id="brands" className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3">
              <Store className="w-4 h-4 mr-1 text-blue-500" />
              Top Brands
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Discover <span className="gradient-text">Brands</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {BRANDS.map((brand, index) => (
              <BrandCard key={brand.id} brand={brand} index={index} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              View All 10,000+ Brands
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 8: AI SHOPPING COLLECTIONS
      ============================================================ */}
      <section id="collections" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3">
              <Brain className="w-4 h-4 mr-1 text-purple-500" />
              Personal to You
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              AI <span className="gradient-text">Collections</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Personalized collections powered by PriceBrain AI that learn from your shopping behavior.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {AI_COLLECTIONS.map((collection, index) => (
              <CollectionCard key={collection.id} collection={collection} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 9: CATEGORY INSIGHTS
      ============================================================ */}
      <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3">
              <BarChart3 className="w-4 h-4 mr-1 text-green-500" />
              Market Intelligence
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Category <span className="gradient-text">Insights</span>
            </h2>
          </div>

          <GlassCard className="p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {insights.map((insight, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">{insight.metric}</p>
                  <p className="text-2xl font-bold mb-1">{insight.value}</p>
                  {insight.change && (
                    <Badge variant={insight.trend === 'up' ? 'default' : insight.trend === 'down' ? 'destructive' : 'secondary'} className="text-xs">
                      {insight.trend === 'up' && <ArrowUp className="w-3 h-3 mr-1" />}
                      {insight.trend === 'down' && <ArrowDown className="w-3 h-3 mr-1" />}
                      {insight.change}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ============================================================
          SECTION 10: EXPLORER LEVELS
      ============================================================ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-8 bg-gradient-to-r from-primary/5 to-purple-500/5">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl">
                  🏆
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Shopping Explorer</h3>
                  <p className="text-muted-foreground">Level 5 • Top 15% of explorers</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Categories Explored</span>
                  <span className="font-bold">47/100</span>
                </div>
                <Progress value={47} className="h-2" />
                
                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-4 bg-background/50 rounded-xl">
                    <p className="text-2xl font-bold text-amber-500">47</p>
                    <p className="text-xs text-muted-foreground">Categories</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-xl">
                    <p className="text-2xl font-bold text-green-500">₹45K</p>
                    <p className="text-xs text-muted-foreground">Saved</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-500">156</p>
                    <p className="text-xs text-muted-foreground">Deals</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-xl">
                    <p className="text-2xl font-bold text-purple-500">12</p>
                    <p className="text-xs text-muted-foreground">Badges</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 11: RECENTLY VIEWED
      ============================================================ */}
      <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Recently Viewed</h2>
            <Button variant="ghost">Clear History</Button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.slice(0, 6).map((category) => (
              <GlassCard key={category.id} className="p-4 min-w-[200px] cursor-pointer">
                <div className="relative aspect-video mb-3 rounded-lg overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="font-medium text-sm">{category.name}</p>
                <p className="text-xs text-muted-foreground">Viewed 2 hours ago</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 12: CALL TO ACTION
      ============================================================ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-3xl blur-3xl" />
            
            <GlassCard className="p-12 md:p-20 text-center relative bg-gradient-to-br from-primary/10 via-background to-purple-500/10 border-primary/20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to <span className="gradient-text">Explore</span>?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Start discovering millions of products with AI-powered recommendations.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="h-14 px-8 text-lg">
                  <Grid3X3 className="w-5 h-5 mr-2" />
                  Explore Products
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                  <Percent className="w-5 h-5 mr-2" />
                  Discover Deals
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                  <Brain className="w-5 h-5 mr-2" />
                  Ask AI
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER
      ============================================================ */}
      <footer className="bg-muted/50 border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold">PriceBrain</p>
                <p className="text-xs text-muted-foreground">AI Commerce Platform</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 PriceBrain. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Missing icons helper (placeholders)
const Sun = ({ className }: { className?: string }) => <span className={className}>☀️</span>;
const Snowflake = ({ className }: { className?: string }) => <span className={className}>❄️</span>;
const CloudRain = ({ className }: { className?: string }) => <span className={className}>🌧️</span>;
const Lamp = ({ className }: { className?: string }) => <span className={className}>🪔</span>;
const Party = ({ className }: { className?: string }) => <span className={className}>🎉</span>;
const Backpack = ({ className }: { className?: string }) => <span className={className}>🎒</span>;
const Ring = ({ className }: { className?: string }) => <span className={className}>💍</span>;
const Plane = ({ className }: { className?: string }) => <span className={className}>✈️</span>;
