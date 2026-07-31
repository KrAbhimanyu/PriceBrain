'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Brain, Search, TrendingUp, TrendingDown, Sparkles, Shield, Star, Clock,
  ChevronRight, ChevronLeft, Filter, X, ShoppingCart, Heart, BarChart3,
  Zap, Target, Award, Trophy, Flame, Timer, Percent, Tag, CreditCard,
  Truck, Package, RefreshCw, CheckCircle2, AlertTriangle, ArrowUpDown,
  Mic, Camera, Bell, Share2, GitCompare, Eye, Wallet, Calendar, Leaf,
  ChevronDown, SlidersHorizontal, Grid3X3, LayoutList, SortAsc, Info,
  Users, Globe, Store, IndianRupee, Minus, Plus, Volume2, VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DealProduct {
  id: string;
  name: string;
  brand: string;
  image: string;
  currentPrice: number;
  originalPrice: number;
  discount: number;
  aiDealScore: number;
  aiVerdict: 'BUY_NOW' | 'WAIT' | 'PRICE_MAY_DROP' | 'LIMITED_TIME' | 'OVERPRICED' | 'NOT_RECOMMENDED';
  verdictReason: string;
  trustScore: number;
  sellerRating: number;
  reviewCount: number;
  reviewSummary: string;
  category: string;
  subcategory: string;
  priceHistory: PricePoint[];
  retailers: Retailer[];
  bankOffers: BankOffer[];
  coupons: Coupon[];
  cashback: number;
  emi: { available: boolean; minAmount: number; interest: number };
  delivery: { estimated: string; fast: boolean; free: boolean };
  warranty: string;
  exchange: string;
  stock: 'high' | 'medium' | 'low' | 'limited';
  demand: 'increasing' | 'stable' | 'decreasing';
  aiInsights: AIInsight[];
  tags: string[];
  isWishlisted: boolean;
}

interface PricePoint {
  date: string;
  price: number;
}

interface Retailer {
  name: string;
  price: number;
  delivery: string;
  warranty: string;
  returnPolicy: string;
  rating: number;
  trustScore: number;
  url: string;
  inStock: boolean;
}

interface BankOffer {
  bank: string;
  type: 'credit' | 'debit' | 'upi' | 'wallet';
  discount: number;
  maxDiscount: number;
  code?: string;
}

interface Coupon {
  code: string;
  discount: number;
  minPurchase: number;
  expiresAt: string;
}

interface AIInsight {
  type: 'price_up' | 'price_down' | 'demand_up' | 'stock_low' | 'better_alternative';
  message: string;
  confidence: number;
}

interface FilterState {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  discountRange: [number, number];
  aiScoreRange: [number, number];
  trustScoreMin: number;
  sellerRatingMin: number;
  cashbackMin: number;
  emiOnly: boolean;
  freeDelivery: boolean;
  fastDelivery: boolean;
  inStock: boolean;
  bankOffers: boolean;
  noCostEmi: boolean;
}

interface DealCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

interface SavingsStats {
  today: number;
  monthly: number;
  yearly: number;
  comparedToAverage: number;
}

interface DealAlert {
  productId: string;
  type: 'price_drop' | 'back_in_stock' | 'lowest_ever' | 'upcoming_sale';
  enabled: boolean;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_DEALS: DealProduct[] = [
  {
    id: '1',
    name: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
    currentPrice: 139900,
    originalPrice: 159900,
    discount: 13,
    aiDealScore: 92,
    aiVerdict: 'BUY_NOW',
    verdictReason: 'Lowest price in 180 days. Trusted Apple authorized seller with 99% positive reviews.',
    trustScore: 98,
    sellerRating: 4.8,
    reviewCount: 12450,
    reviewSummary: '4.6/5 based on 12,450 reviews',
    category: 'Electronics',
    subcategory: 'Smartphones',
    priceHistory: [
      { date: '2024-01', price: 159900 },
      { date: '2024-02', price: 154900 },
      { date: '2024-03', price: 149900 },
      { date: '2024-04', price: 144900 },
      { date: '2024-05', price: 142900 },
      { date: '2024-06', price: 139900 },
    ],
    retailers: [
      { name: 'Amazon', price: 139900, delivery: '2 days', warranty: '1 Year', returnPolicy: '7 days', rating: 4.7, trustScore: 95, url: '#', inStock: true },
      { name: 'Flipkart', price: 141900, delivery: '1 day', warranty: '1 Year', returnPolicy: '10 days', rating: 4.6, trustScore: 92, url: '#', inStock: true },
      { name: 'Apple Store', price: 139900, delivery: '3-5 days', warranty: '1 Year', returnPolicy: '14 days', rating: 4.9, trustScore: 100, url: '#', inStock: true },
    ],
    bankOffers: [
      { bank: 'HDFC Bank', type: 'credit', discount: 10, maxDiscount: 5000 },
      { bank: 'ICICI Bank', type: 'credit', discount: 10, maxDiscount: 4000 },
      { bank: 'SBI Card', type: 'credit', discount: 10, maxDiscount: 3000 },
    ],
    coupons: [
      { code: 'FIRST500', discount: 500, minPurchase: 10000, expiresAt: '2024-12-31' },
    ],
    cashback: 2500,
    emi: { available: true, minAmount: 5000, interest: 14 },
    delivery: { estimated: '2-3 days', fast: true, free: true },
    warranty: '1 Year Manufacturer Warranty',
    exchange: 'Up to ₹28,000 off on exchange',
    stock: 'low',
    demand: 'increasing',
    aiInsights: [
      { type: 'demand_up', message: 'Demand increased 45% in last 7 days', confidence: 92 },
      { type: 'stock_low', message: 'Only 23 units left at this price', confidence: 98 },
      { type: 'price_down', message: 'Price dropped ₹3,000 since last week', confidence: 95 },
    ],
    tags: ['Best Seller', 'Tranding', 'Lowest Price'],
    isWishlisted: false,
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra 12GB/256GB Titanium Black',
    brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
    currentPrice: 109999,
    originalPrice: 129999,
    discount: 15,
    aiDealScore: 88,
    aiVerdict: 'BUY_NOW',
    verdictReason: 'Festival price. ₹20,000 savings with extra bank offers.',
    trustScore: 95,
    sellerRating: 4.7,
    reviewCount: 8920,
    reviewSummary: '4.5/5 based on 8,920 reviews',
    category: 'Electronics',
    subcategory: 'Smartphones',
    priceHistory: [
      { date: '2024-01', price: 129999 },
      { date: '2024-02', price: 124999 },
      { date: '2024-03', price: 119999 },
      { date: '2024-04', price: 114999 },
      { date: '2024-05', price: 109999 },
      { date: '2024-06', price: 109999 },
    ],
    retailers: [
      { name: 'Amazon', price: 109999, delivery: '2 days', warranty: '1 Year', returnPolicy: '7 days', rating: 4.6, trustScore: 94, url: '#', inStock: true },
      { name: 'Flipkart', price: 107999, delivery: '1 day', warranty: '1 Year', returnPolicy: '10 days', rating: 4.7, trustScore: 91, url: '#', inStock: true },
      { name: 'Samsung Store', price: 109999, delivery: '3 days', warranty: '2 Year', returnPolicy: '15 days', rating: 4.8, trustScore: 100, url: '#', inStock: true },
    ],
    bankOffers: [
      { bank: 'HDFC Bank', type: 'credit', discount: 15, maxDiscount: 10000 },
      { bank: 'Axis Bank', type: 'credit', discount: 10, maxDiscount: 5000 },
    ],
    coupons: [
      { code: 'SAMSUNG500', discount: 500, minPurchase: 50000, expiresAt: '2024-12-31' },
    ],
    cashback: 3000,
    emi: { available: true, minAmount: 3000, interest: 12 },
    delivery: { estimated: '1-2 days', fast: true, free: true },
    warranty: '2 Year Manufacturer Warranty',
    exchange: 'Up to ₹25,000 off on exchange',
    stock: 'high',
    demand: 'stable',
    aiInsights: [
      { type: 'better_alternative', message: 'S24 Ultra available at ₹5,000 less on Flipkart', confidence: 88 },
      { type: 'price_down', message: 'Price dropped ₹5,000 in flash sale', confidence: 97 },
    ],
    tags: ['Festival Deal', 'Bank Offer'],
    isWishlisted: true,
  },
  {
    id: '3',
    name: 'MacBook Air M3 15-inch 8GB/256GB Space Grey',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    currentPrice: 114900,
    originalPrice: 134900,
    discount: 15,
    aiDealScore: 85,
    aiVerdict: 'WAIT',
    verdictReason: 'Price expected to drop further in upcoming sale events.',
    trustScore: 97,
    sellerRating: 4.8,
    reviewCount: 3240,
    reviewSummary: '4.8/5 based on 3,240 reviews',
    category: 'Electronics',
    subcategory: 'Laptops',
    priceHistory: [
      { date: '2024-01', price: 134900 },
      { date: '2024-02', price: 134900 },
      { date: '2024-03', price: 124900 },
      { date: '2024-04', price: 119900 },
      { date: '2024-05', price: 114900 },
      { date: '2024-06', price: 114900 },
    ],
    retailers: [
      { name: 'Amazon', price: 114900, delivery: '2 days', warranty: '1 Year', returnPolicy: '7 days', rating: 4.7, trustScore: 95, url: '#', inStock: true },
      { name: 'Apple Store', price: 114900, delivery: '5-7 days', warranty: '1 Year', returnPolicy: '14 days', rating: 4.9, trustScore: 100, url: '#', inStock: true },
    ],
    bankOffers: [
      { bank: 'HDFC Bank', type: 'credit', discount: 10, maxDiscount: 10000 },
    ],
    coupons: [],
    cashback: 2000,
    emi: { available: true, minAmount: 5000, interest: 14 },
    delivery: { estimated: '3-5 days', fast: false, free: false },
    warranty: '1 Year Limited Warranty',
    exchange: 'Up to ₹20,000 off on exchange',
    stock: 'medium',
    demand: 'stable',
    aiInsights: [
      { type: 'price_up', message: 'Price may increase by ₹2,000 after sale ends', confidence: 78 },
      { type: 'price_down', message: 'Expected to drop to ₹109,900 in upcoming sale', confidence: 82 },
    ],
    tags: ['Student Discount'],
    isWishlisted: false,
  },
  {
    id: '4',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
    currentPrice: 24990,
    originalPrice: 34990,
    discount: 29,
    aiDealScore: 96,
    aiVerdict: 'LIMITED_TIME',
    verdictReason: 'All-time lowest price! Limited stock available. Ends in 6 hours.',
    trustScore: 94,
    sellerRating: 4.7,
    reviewCount: 15680,
    reviewSummary: '4.7/5 based on 15,680 reviews',
    category: 'Electronics',
    subcategory: 'Audio',
    priceHistory: [
      { date: '2024-01', price: 34990 },
      { date: '2024-02', price: 32990 },
      { date: '2024-03', price: 29990 },
      { date: '2024-04', price: 27990 },
      { date: '2024-05', price: 25990 },
      { date: '2024-06', price: 24990 },
    ],
    retailers: [
      { name: 'Amazon', price: 24990, delivery: '1 day', warranty: '1 Year', returnPolicy: '7 days', rating: 4.8, trustScore: 96, url: '#', inStock: true },
      { name: 'Flipkart', price: 25490, delivery: '2 days', warranty: '1 Year', returnPolicy: '10 days', rating: 4.6, trustScore: 92, url: '#', inStock: true },
    ],
    bankOffers: [
      { bank: 'HDFC Bank', type: 'credit', discount: 10, maxDiscount: 1500 },
      { bank: 'ICICI Bank', type: 'credit', discount: 10, maxDiscount: 1000 },
    ],
    coupons: [
      { code: 'AUDIO1000', discount: 1000, minPurchase: 20000, expiresAt: '2024-12-31' },
    ],
    cashback: 500,
    emi: { available: true, minAmount: 1000, interest: 14 },
    delivery: { estimated: 'Next Day', fast: true, free: true },
    warranty: '1 Year Manufacturer Warranty',
    exchange: 'Up to ₹3,000 off on exchange',
    stock: 'limited',
    demand: 'increasing',
    aiInsights: [
      { type: 'stock_low', message: 'Only 15 units left at this price!', confidence: 99 },
      { type: 'price_down', message: 'All-time lowest price! Was ₹34,990', confidence: 100 },
      { type: 'demand_up', message: 'Selling 3x faster than usual', confidence: 91 },
    ],
    tags: ['Lightning Deal', 'All-Time Low', 'Bestseller'],
    isWishlisted: false,
  },
  {
    id: '5',
    name: 'Nike Air Max 270 Mens Running Shoes - Black/White',
    brand: 'Nike',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    currentPrice: 5995,
    originalPrice: 9995,
    discount: 40,
    aiDealScore: 91,
    aiVerdict: 'BUY_NOW',
    verdictReason: 'Clearance sale. Best price this season. Multiple sizes available.',
    trustScore: 92,
    sellerRating: 4.6,
    reviewCount: 4520,
    reviewSummary: '4.5/5 based on 4,520 reviews',
    category: 'Fashion',
    subcategory: 'Footwear',
    priceHistory: [
      { date: '2024-01', price: 9995 },
      { date: '2024-02', price: 8995 },
      { date: '2024-03', price: 7995 },
      { date: '2024-04', price: 6995 },
      { date: '2024-05', price: 6495 },
      { date: '2024-06', price: 5995 },
    ],
    retailers: [
      { name: 'Myntra', price: 5995, delivery: '3 days', warranty: 'None', returnPolicy: '15 days', rating: 4.5, trustScore: 88, url: '#', inStock: true },
      { name: 'Amazon', price: 6195, delivery: '2 days', warranty: 'None', returnPolicy: '7 days', rating: 4.6, trustScore: 94, url: '#', inStock: true },
    ],
    bankOffers: [
      { bank: 'HDFC Bank', type: 'credit', discount: 10, maxDiscount: 500 },
    ],
    coupons: [
      { code: 'NEWUSER200', discount: 200, minPurchase: 2000, expiresAt: '2024-12-31' },
    ],
    cashback: 100,
    emi: { available: false, minAmount: 0, interest: 0 },
    delivery: { estimated: '3-5 days', fast: false, free: true },
    warranty: 'Standard brand warranty',
    exchange: 'Easy exchange available',
    stock: 'medium',
    demand: 'stable',
    aiInsights: [
      { type: 'price_down', message: 'Lowest price in 6 months', confidence: 97 },
      { type: 'better_alternative', message: 'Nike Air Max 90 available at ₹4,999', confidence: 75 },
    ],
    tags: ['Clearance', '40% Off', 'Trending'],
    isWishlisted: true,
  },
  {
    id: '6',
    name: 'LG 65-inch OLED evo C3 4K Smart TV 2023',
    brand: 'LG',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
    currentPrice: 149990,
    originalPrice: 199990,
    discount: 25,
    aiDealScore: 89,
    aiVerdict: 'PRICE_MAY_DROP',
    verdictReason: 'Good price but Big Billion Days start in 2 weeks. May get better deal.',
    trustScore: 96,
    sellerRating: 4.7,
    reviewCount: 2180,
    reviewSummary: '4.6/5 based on 2,180 reviews',
    category: 'Electronics',
    subcategory: 'TVs',
    priceHistory: [
      { date: '2024-01', price: 199990 },
      { date: '2024-02', price: 189990 },
      { date: '2024-03', price: 179990 },
      { date: '2024-04', price: 169990 },
      { date: '2024-05', price: 159990 },
      { date: '2024-06', price: 149990 },
    ],
    retailers: [
      { name: 'Amazon', price: 149990, delivery: '5 days', warranty: '2 Year', returnPolicy: '7 days', rating: 4.7, trustScore: 95, url: '#', inStock: true },
      { name: 'Flipkart', price: 147990, delivery: '3 days', warranty: '2 Year', returnPolicy: '10 days', rating: 4.6, trustScore: 92, url: '#', inStock: true },
    ],
    bankOffers: [
      { bank: 'HDFC Bank', type: 'credit', discount: 10, maxDiscount: 15000 },
      { bank: 'ICICI Bank', type: 'credit', discount: 10, maxDiscount: 10000 },
    ],
    coupons: [],
    cashback: 5000,
    emi: { available: true, minAmount: 5000, interest: 14 },
    delivery: { estimated: '5-7 days', fast: false, free: false },
    warranty: '2 Year Comprehensive Warranty',
    exchange: 'Up to ₹15,000 off on exchange',
    stock: 'medium',
    demand: 'stable',
    aiInsights: [
      { type: 'price_up', message: 'Expected to drop ₹10,000 during Big Billion Days', confidence: 85 },
      { type: 'better_alternative', message: 'Samsung OLED available at ₹5,000 less', confidence: 72 },
    ],
    tags: ['OLED TV', 'Premium', 'Smart TV'],
    isWishlisted: false,
  },
  {
    id: '7',
    name: 'Dyson V15 Detect Absolute Cordless Vacuum',
    brand: 'Dyson',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400',
    currentPrice: 54990,
    originalPrice: 64990,
    discount: 15,
    aiDealScore: 78,
    aiVerdict: 'WAIT',
    verdictReason: 'Price was lower in April sale. May get better deal during festive sales.',
    trustScore: 94,
    sellerRating: 4.8,
    reviewCount: 3240,
    reviewSummary: '4.7/5 based on 3,240 reviews',
    category: 'Home',
    subcategory: 'Appliances',
    priceHistory: [
      { date: '2024-01', price: 64990 },
      { date: '2024-02', price: 59990 },
      { date: '2024-03', price: 54990 },
      { date: '2024-04', price: 49990 },
      { date: '2024-05', price: 54990 },
      { date: '2024-06', price: 54990 },
    ],
    retailers: [
      { name: 'Amazon', price: 54990, delivery: '2 days', warranty: '2 Year', returnPolicy: '7 days', rating: 4.8, trustScore: 96, url: '#', inStock: true },
      { name: 'Dyson Store', price: 54990, delivery: '5 days', warranty: '2 Year', returnPolicy: '30 days', rating: 4.9, trustScore: 100, url: '#', inStock: true },
    ],
    bankOffers: [
      { bank: 'HDFC Bank', type: 'credit', discount: 5, maxDiscount: 2500 },
    ],
    coupons: [],
    cashback: 1000,
    emi: { available: true, minAmount: 3000, interest: 14 },
    delivery: { estimated: '2-3 days', fast: true, free: true },
    warranty: '2 Year Warranty',
    exchange: 'No exchange',
    stock: 'medium',
    demand: 'stable',
    aiInsights: [
      { type: 'price_down', message: 'Was ₹49,990 in April sale', confidence: 99 },
      { type: 'price_up', message: 'Price may increase post monsoons', confidence: 78 },
    ],
    tags: ['Premium', 'Bestseller'],
    isWishlisted: false,
  },
  {
    id: '8',
    name: 'Adidas Ultraboost Light Running Shoes - Cloud White',
    brand: 'Adidas',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400',
    currentPrice: 7995,
    originalPrice: 12995,
    discount: 38,
    aiDealScore: 94,
    aiVerdict: 'BUY_NOW',
    verdictReason: 'End of season sale. Best price ever. Running into stock issues.',
    trustScore: 91,
    sellerRating: 4.5,
    reviewCount: 2890,
    reviewSummary: '4.4/5 based on 2,890 reviews',
    category: 'Fashion',
    subcategory: 'Footwear',
    priceHistory: [
      { date: '2024-01', price: 12995 },
      { date: '2024-02', price: 11995 },
      { date: '2024-03', price: 9995 },
      { date: '2024-04', price: 8995 },
      { date: '2024-05', price: 8495 },
      { date: '2024-06', price: 7995 },
    ],
    retailers: [
      { name: 'Myntra', price: 7995, delivery: '4 days', warranty: 'None', returnPolicy: '15 days', rating: 4.5, trustScore: 87, url: '#', inStock: true },
      { name: 'Adidas Store', price: 8495, delivery: '5 days', warranty: 'None', returnPolicy: '30 days', rating: 4.7, trustScore: 98, url: '#', inStock: false },
    ],
    bankOffers: [
      { bank: 'ICICI Bank', type: 'credit', discount: 10, maxDiscount: 750 },
    ],
    coupons: [
      { code: 'ADIDAS500', discount: 500, minPurchase: 5000, expiresAt: '2024-12-31' },
    ],
    cashback: 200,
    emi: { available: false, minAmount: 0, interest: 0 },
    delivery: { estimated: '4-6 days', fast: false, free: true },
    warranty: 'Standard brand warranty',
    exchange: 'Easy exchange within 30 days',
    stock: 'limited',
    demand: 'increasing',
    aiInsights: [
      { type: 'stock_low', message: 'Limited sizes available (7, 8, 9 only)', confidence: 95 },
      { type: 'price_down', message: 'All-time lowest price!', confidence: 100 },
    ],
    tags: ['End Season', '38% Off', 'Running'],
    isWishlisted: false,
  },
];

const DEAL_CATEGORIES: DealCategory[] = [
  { id: 'todays-best', name: "Today's Best", icon: <Sparkles className="h-5 w-5" />, count: 245, color: 'bg-gradient-to-br from-yellow-400 to-orange-500' },
  { id: 'lightning', name: 'Lightning Deals', icon: <Zap className="h-5 w-5" />, count: 38, color: 'bg-gradient-to-br from-amber-400 to-yellow-500' },
  { id: 'limited', name: 'Limited Time', icon: <Timer className="h-5 w-5" />, count: 67, color: 'bg-gradient-to-br from-red-400 to-pink-500' },
  { id: 'bank', name: 'Bank Offers', icon: <CreditCard className="h-5 w-5" />, count: 124, color: 'bg-gradient-to-br from-blue-400 to-indigo-500' },
  { id: 'coupon', name: 'Coupon Deals', icon: <Tag className="h-5 w-5" />, count: 89, color: 'bg-gradient-to-br from-green-400 to-emerald-500' },
  { id: 'festival', name: 'Festival Deals', icon: <Trophy className="h-5 w-5" />, count: 312, color: 'bg-gradient-to-br from-purple-400 to-violet-500' },
  { id: 'clearance', name: 'Clearance', icon: <Percent className="h-5 w-5" />, count: 156, color: 'bg-gradient-to-br from-teal-400 to-cyan-500' },
  { id: 'hidden', name: 'Hidden Deals', icon: <Eye className="h-5 w-5" />, count: 45, color: 'bg-gradient-to-br from-gray-600 to-gray-800' },
  { id: 'ai-pick', name: 'AI Recommended', icon: <Brain className="h-5 w-5" />, count: 78, color: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
  { id: 'lowest', name: 'Lowest Ever', icon: <TrendingDown className="h-5 w-5" />, count: 23, color: 'bg-gradient-to-br from-green-500 to-emerald-600' },
  { id: 'crash', name: 'Price Crash', icon: <ArrowUpDown className="h-5 w-5" />, count: 34, color: 'bg-gradient-to-br from-red-500 to-rose-600' },
  { id: 'upcoming', name: 'Upcoming', icon: <Calendar className="h-5 w-5" />, count: 56, color: 'bg-gradient-to-br from-orange-400 to-amber-500' },
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

const getVerdictConfig = (verdict: DealProduct['aiVerdict']) => {
  const configs = {
    BUY_NOW: { label: 'Buy Now', color: 'bg-green-500', textColor: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
    WAIT: { label: 'Wait', color: 'bg-yellow-500', textColor: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200' },
    PRICE_MAY_DROP: { label: 'Price May Drop', color: 'bg-orange-500', textColor: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
    LIMITED_TIME: { label: 'Limited Time', color: 'bg-red-500', textColor: 'text-red-600', bgColor: 'bg-red-50 border-red-200' },
    OVERPRICED: { label: 'Overpriced', color: 'bg-gray-500', textColor: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200' },
    NOT_RECOMMENDED: { label: 'Not Recommended', color: 'bg-red-600', textColor: 'text-red-700', bgColor: 'bg-red-100 border-red-300' },
  };
  return configs[verdict];
};

const getScoreLabel = (score: number): { label: string; color: string } => {
  if (score >= 90) return { label: 'Excellent Deal', color: 'text-green-600 bg-green-50' };
  if (score >= 75) return { label: 'Great Deal', color: 'text-emerald-600 bg-emerald-50' };
  if (score >= 60) return { label: 'Fair Deal', color: 'text-yellow-600 bg-yellow-50' };
  if (score >= 40) return { label: 'Wait', color: 'text-orange-600 bg-orange-50' };
  return { label: 'Avoid', color: 'text-red-600 bg-red-50' };
};

const getStockStatus = (stock: DealProduct['stock']) => {
  const configs = {
    high: { label: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-100' },
    medium: { label: 'Limited Stock', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    low: { label: 'Few Left', color: 'text-orange-600', bgColor: 'bg-orange-100' },
    limited: { label: 'Last Few!', color: 'text-red-600', bgColor: 'bg-red-100' },
  };
  return configs[stock];
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

  return <span>{count.toLocaleString()}</span>;
};

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={cn(
    'backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 rounded-2xl shadow-xl',
    className
  )}>
    {children}
  </div>
);

const PriceHistoryChart = ({ history }: { history: PricePoint[] }) => {
  const prices = history.map(h => h.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = prices[prices.length - 1];
  
  const getY = (price: number) => {
    if (maxPrice === minPrice) return 50;
    return 100 - ((price - minPrice) / (maxPrice - minPrice)) * 100;
  };

  const pathData = history.map((point, i) => {
    const x = (i / (history.length - 1)) * 100;
    const y = getY(point.price);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="relative h-20 w-full">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={pathData + ' L 100 100 L 0 100 Z'}
          fill="url(#chartGradient)"
        />
        <path
          d={pathData}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx="100"
          cy={getY(currentPrice)}
          r="4"
          fill="hsl(var(--primary))"
        />
      </svg>
      <div className="absolute -bottom-6 left-0 text-xs text-green-600 font-medium">
        Low: {formatPrice(minPrice)}
      </div>
      <div className="absolute -bottom-6 right-0 text-xs text-red-600 font-medium">
        High: {formatPrice(maxPrice)}
      </div>
    </div>
  );
};

const ProductCard = ({ deal, onToggleWishlist }: { deal: DealProduct; onToggleWishlist: (id: string) => void }) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const verdictConfig = getVerdictConfig(deal.aiVerdict);
  const scoreConfig = getScoreLabel(deal.aiDealScore);
  const stockConfig = getStockStatus(deal.stock);
  const bestRetailer = deal.retailers.reduce((best, curr) => curr.price < best.price ? curr : best);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group"
      >
        <GlassCard className="overflow-hidden hover:shadow-2xl transition-all duration-300">
          {/* Image Section */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <Image
              src={deal.image}
              alt={deal.name}
              fill
              className="object-cover p-4"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Badge className={cn('text-white border-0', verdictConfig.color)}>
                {verdictConfig.label}
              </Badge>
              {deal.tags.slice(0, 2).map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onToggleWishlist(deal.id)}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all',
                  deal.isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
                )}
              >
                <Heart className={cn('w-4 h-4', deal.isWishlisted && 'fill-current')} />
              </button>
              <button
                onClick={() => setShowCompare(true)}
                className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-all"
              >
                <GitCompare className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-all">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Stock Alert */}
            {deal.stock === 'limited' && (
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-red-500 text-white border-0 animate-pulse">
                  <Flame className="w-3 h-3 mr-1" />
                  Last Few Left!
                </Badge>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4">
            {/* Brand & Name */}
            <p className="text-xs text-muted-foreground mb-1">{deal.brand}</p>
            <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
              {deal.name}
            </h3>

            {/* AI Deal Score */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="relative w-12 h-12">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-gray-200"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={`${(deal.aiDealScore / 100) * 125.6} 125.6`}
                      strokeLinecap="round"
                      className={cn(
                        deal.aiDealScore >= 90 && 'text-green-500',
                        deal.aiDealScore >= 75 && deal.aiDealScore < 90 && 'text-emerald-500',
                        deal.aiDealScore >= 60 && deal.aiDealScore < 75 && 'text-yellow-500',
                        deal.aiDealScore < 60 && 'text-red-500'
                      )}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {deal.aiDealScore}
                  </span>
                </div>
                <Badge className={cn('text-xs border-0', scoreConfig.color)}>
                  {scoreConfig.label}
                </Badge>
              </div>
              <div className={cn('text-xs px-2 py-1 rounded-full', stockConfig.bgColor, stockConfig.color)}>
                {stockConfig.label}
              </div>
            </div>

            {/* Price Section */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-xl font-bold">{formatPrice(deal.currentPrice)}</span>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(deal.originalPrice)}
              </span>
              <span className="text-sm font-medium text-green-600">-{deal.discount}%</span>
            </div>

            {/* Trust & Rating */}
            <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-primary" />
                <span>{deal.trustScore}% Trust</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{deal.sellerRating}</span>
              </div>
              <span>({deal.reviewCount.toLocaleString()})</span>
            </div>

            {/* Delivery Info */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
              {deal.delivery.fast && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Zap className="w-3 h-3" /> Fast Delivery
                </Badge>
              )}
              {deal.delivery.free && (
                <span className="text-green-600 font-medium">Free Delivery</span>
              )}
              <span>{deal.delivery.estimated}</span>
            </div>

            {/* Price History Mini */}
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">Price Trend</p>
              <PriceHistoryChart history={deal.priceHistory} />
            </div>

            {/* Bank Offers Summary */}
            {deal.bankOffers.length > 0 && (
              <div className="flex items-center gap-2 mb-3 text-xs">
                <CreditCard className="w-3 h-3 text-blue-600" />
                <span className="text-blue-600 font-medium">
                  Up to {Math.max(...deal.bankOffers.map(o => o.discount))}% off
                </span>
                <span className="text-muted-foreground">with bank offers</span>
              </div>
            )}

            {/* Verdict Reason */}
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
              {deal.verdictReason}
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-2">
              <Button className="flex-1 h-9 text-sm" size="sm">
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3"
                onClick={() => setShowQuickView(true)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowQuickView(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Image */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                  <Image
                    src={deal.image}
                    alt={deal.name}
                    fill
                    className="object-cover p-4"
                  />
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={cn('text-white border-0', verdictConfig.color)}>
                      {verdictConfig.label}
                    </Badge>
                    <button onClick={() => setShowQuickView(false)} className="p-2 hover:bg-gray-100 rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-1">{deal.brand}</p>
                  <h2 className="text-xl font-bold mb-4">{deal.name}</h2>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-bold">{formatPrice(deal.currentPrice)}</span>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(deal.originalPrice)}
                    </span>
                    <Badge className="bg-green-100 text-green-700 border-0">
                      -{deal.discount}%
                    </Badge>
                  </div>

                  {/* AI Score */}
                  <div className="p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">AI Deal Score</span>
                      <span className="text-2xl font-bold">{deal.aiDealScore}/100</span>
                    </div>
                    <Progress value={deal.aiDealScore} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">{deal.verdictReason}</p>
                  </div>

                  {/* Retailers */}
                  <div className="space-y-2 mb-4">
                    <h3 className="font-medium">Compare Prices</h3>
                    {deal.retailers.map((retailer, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{retailer.name}</p>
                          <p className="text-xs text-muted-foreground">{retailer.delivery} • {retailer.warranty}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPrice(retailer.price)}</p>
                          <p className="text-xs text-green-600">
                            Save {formatPrice(bestRetailer.price - retailer.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bank Offers */}
                  {deal.bankOffers.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Bank Offers</h3>
                      <div className="flex flex-wrap gap-2">
                        {deal.bankOffers.map((offer, i) => (
                          <Badge key={i} variant="outline" className="text-blue-600 border-blue-200">
                            {offer.bank}: {offer.discount}% off (max ₹{offer.maxDiscount})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button className="flex-1">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="outline">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="outline">
                      <Bell className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const FilterPanel = ({ 
  filters, 
  onFilterChange,
  onClear 
}: { 
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onClear: () => void;
}) => {
  const [openSections, setOpenSections] = useState<string[]>(['category', 'price']);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="w-80 flex-shrink-0">
      <GlassCard className="p-4 sticky top-20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </h3>
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear All
          </Button>
        </div>

        {/* Category */}
        <div className="border-b border-border pb-4 mb-4">
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full font-medium mb-2"
          >
            Category
            <ChevronDown className={cn('w-4 h-4 transition-transform', openSections.includes('category') && 'rotate-180')} />
          </button>
          {openSections.includes('category') && (
            <div className="space-y-2 pl-2">
              {['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books'].map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.categories.includes(cat)}
                    onCheckedChange={(checked) => {
                      const newCategories = checked
                        ? [...filters.categories, cat]
                        : filters.categories.filter(c => c !== cat);
                      onFilterChange('categories', newCategories);
                    }}
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="border-b border-border pb-4 mb-4">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full font-medium mb-2"
          >
            Price Range
            <ChevronDown className={cn('w-4 h-4 transition-transform', openSections.includes('price') && 'rotate-180')} />
          </button>
          {openSections.includes('price') && (
            <div className="pl-2">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => onFilterChange('priceRange', value as [number, number])}
                min={0}
                max={500000}
                step={1000}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatPrice(filters.priceRange[0])}</span>
                <span>{formatPrice(filters.priceRange[1])}</span>
              </div>
            </div>
          )}
        </div>

        {/* Discount */}
        <div className="border-b border-border pb-4 mb-4">
          <button
            onClick={() => toggleSection('discount')}
            className="flex items-center justify-between w-full font-medium mb-2"
          >
            Minimum Discount
            <ChevronDown className={cn('w-4 h-4 transition-transform', openSections.includes('discount') && 'rotate-180')} />
          </button>
          {openSections.includes('discount') && (
            <div className="pl-2">
              <Slider
                value={filters.discountRange}
                onValueChange={(value) => onFilterChange('discountRange', value as [number, number])}
                min={0}
                max={80}
                step={5}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{filters.discountRange[0]}%</span>
                <span>{filters.discountRange[1]}%</span>
              </div>
            </div>
          )}
        </div>

        {/* AI Score */}
        <div className="border-b border-border pb-4 mb-4">
          <button
            onClick={() => toggleSection('aiScore')}
            className="flex items-center justify-between w-full font-medium mb-2"
          >
            AI Deal Score
            <ChevronDown className={cn('w-4 h-4 transition-transform', openSections.includes('aiScore') && 'rotate-180')} />
          </button>
          {openSections.includes('aiScore') && (
            <div className="pl-2">
              <Slider
                value={filters.aiScoreRange}
                onValueChange={(value) => onFilterChange('aiScoreRange', value as [number, number])}
                min={0}
                max={100}
                step={5}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{filters.aiScoreRange[0]}+</span>
                <span>{filters.aiScoreRange[1]}+</span>
              </div>
            </div>
          )}
        </div>

        {/* Trust Score */}
        <div className="border-b border-border pb-4 mb-4">
          <label className="font-medium mb-2 block">Minimum Trust Score</label>
          <div className="flex items-center gap-2">
            <Slider
              value={[filters.trustScoreMin]}
              onValueChange={(value) => onFilterChange('trustScoreMin', value[0])}
              min={0}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-sm font-medium w-12">{filters.trustScoreMin}%</span>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={filters.freeDelivery}
              onCheckedChange={(checked) => onFilterChange('freeDelivery', checked)}
            />
            <Truck className="w-4 h-4 text-green-600" />
            <span className="text-sm">Free Delivery</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={filters.fastDelivery}
              onCheckedChange={(checked) => onFilterChange('fastDelivery', checked)}
            />
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm">Fast Delivery</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={filters.emiOnly}
              onCheckedChange={(checked) => onFilterChange('emiOnly', checked)}
            />
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span className="text-sm">EMI Available</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={filters.bankOffers}
              onCheckedChange={(checked) => onFilterChange('bankOffers', checked)}
            />
            <Tag className="w-4 h-4 text-purple-600" />
            <span className="text-sm">Bank Offers</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={filters.inStock}
              onCheckedChange={(checked) => onFilterChange('inStock', checked)}
            />
            <Package className="w-4 h-4 text-green-600" />
            <span className="text-sm">In Stock Only</span>
          </label>
        </div>
      </GlassCard>
    </div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function DealsPage() {
  const [deals, setDeals] = useState<DealProduct[]>(MOCK_DEALS);
  const [filteredDeals, setFilteredDeals] = useState<DealProduct[]>(MOCK_DEALS);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'discount' | 'score'>('relevance');
  const [activeTab, setActiveTab] = useState('todays-best');
  const [searchQuery, setSearchQuery] = useState('');
  const [savingsStreak, setSavingsStreak] = useState(7);
  const [totalSaved, setTotalSaved] = useState(45250);
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    priceRange: [0, 500000],
    discountRange: [0, 80],
    aiScoreRange: [0, 100],
    trustScoreMin: 0,
    sellerRatingMin: 0,
    cashbackMin: 0,
    emiOnly: false,
    freeDelivery: false,
    fastDelivery: false,
    inStock: true,
    bankOffers: false,
    noCostEmi: false,
  });

  // Countdown timer state
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter and sort deals
  useEffect(() => {
    let result = [...deals];

    // Search filter
    if (searchQuery) {
      result = result.filter(deal =>
        deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter(deal => filters.categories.includes(deal.category));
    }

    // Price filter
    result = result.filter(deal =>
      deal.currentPrice >= filters.priceRange[0] &&
      deal.currentPrice <= filters.priceRange[1]
    );

    // Discount filter
    result = result.filter(deal =>
      deal.discount >= filters.discountRange[0] &&
      deal.discount <= filters.discountRange[1]
    );

    // AI Score filter
    result = result.filter(deal =>
      deal.aiDealScore >= filters.aiScoreRange[0] &&
      deal.aiDealScore <= filters.aiScoreRange[1]
    );

    // Trust Score filter
    result = result.filter(deal => deal.trustScore >= filters.trustScoreMin);

    // Quick filters
    if (filters.freeDelivery) {
      result = result.filter(deal => deal.delivery.free);
    }
    if (filters.fastDelivery) {
      result = result.filter(deal => deal.delivery.fast);
    }
    if (filters.emiOnly) {
      result = result.filter(deal => deal.emi.available);
    }
    if (filters.bankOffers) {
      result = result.filter(deal => deal.bankOffers.length > 0);
    }
    if (filters.inStock) {
      result = result.filter(deal => deal.retailers.some(r => r.inStock));
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case 'price-high':
        result.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case 'discount':
        result.sort((a, b) => b.discount - a.discount);
        break;
      case 'score':
        result.sort((a, b) => b.aiDealScore - a.aiDealScore);
        break;
      default:
        break;
    }

    setFilteredDeals(result);
  }, [deals, filters, sortBy, searchQuery]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      priceRange: [0, 500000],
      discountRange: [0, 80],
      aiScoreRange: [0, 100],
      trustScoreMin: 0,
      sellerRatingMin: 0,
      cashbackMin: 0,
      emiOnly: false,
      freeDelivery: false,
      fastDelivery: false,
      inStock: true,
      bankOffers: false,
      noCostEmi: false,
    });
  };

  const handleToggleWishlist = (id: string) => {
    setDeals(prev => prev.map(deal =>
      deal.id === id ? { ...deal, isWishlisted: !deal.isWishlisted } : deal
    ));
  };

  // Calculate savings
  const savings: SavingsStats = {
    today: filteredDeals.reduce((sum, deal) => sum + (deal.originalPrice - deal.currentPrice), 0),
    monthly: totalSaved,
    yearly: totalSaved * 12,
    comparedToAverage: Math.round(filteredDeals.reduce((sum, deal) => sum + deal.currentPrice * 0.15, 0)),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
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
      `}</style>

      {/* ============================================================
          HERO SECTION
      ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-12 md:py-16">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="px-4 py-2">
                <Flame className="w-4 h-4 mr-1 text-orange-500" />
                {filteredDeals.length} Active Deals
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Clock className="w-4 h-4 mr-1" />
                Updates in 2 mins
              </Badge>
            </div>

            {/* Countdown */}
            <div className="hidden md:flex items-center gap-3 glass-panel px-5 py-3 rounded-full">
              <Timer className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Lightning Deals End In:</span>
              <div className="flex items-center gap-1 font-bold">
                <span className="bg-red-500 text-white px-2 py-1 rounded">{String(countdown.hours).padStart(2, '0')}</span>
                <span>:</span>
                <span className="bg-red-500 text-white px-2 py-1 rounded">{String(countdown.minutes).padStart(2, '0')}</span>
                <span>:</span>
                <span className="bg-red-500 text-white px-2 py-1 rounded">{String(countdown.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto mb-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Today&apos;s <span className="gradient-text">Smartest Deals</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              AI-powered deal intelligence that tells you exactly which products are worth buying right now.
            </p>

            {/* Search Bar */}
            <div className="flex items-center gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for deals, brands, or products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 h-14 rounded-xl border border-border bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Camera className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => setIsVoiceSearchActive(!isVoiceSearchActive)}
                    className={cn(
                      'p-2 rounded-full transition-colors',
                      isVoiceSearchActive ? 'bg-primary text-white' : 'hover:bg-gray-100'
                    )}
                  >
                    {isVoiceSearchActive ? <VolumeX className="w-5 h-5" /> : <Mic className="w-5 h-5 text-muted-foreground" />}
                  </button>
                </div>
              </div>
              <Button size="lg" className="h-14 px-8">
                Search Deals
              </Button>
            </div>

            {/* Category Shortcuts */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {DEAL_CATEGORIES.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full transition-all',
                    activeTab === cat.id
                      ? 'bg-primary text-white'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {cat.icon}
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <GlassCard className="p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                <TrendingDown className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold mb-1">{formatPrice(savings.today)}</p>
              <p className="text-sm text-muted-foreground">You Save Today</p>
            </GlassCard>

            <GlassCard className="p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold mb-1">{formatPrice(savings.monthly)}</p>
              <p className="text-sm text-muted-foreground">Monthly Savings</p>
            </GlassCard>

            <GlassCard className="p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <Flame className="w-6 h-6 text-amber-500" />
              </div>
              <p className="text-2xl font-bold mb-1">{savingsStreak}</p>
              <p className="text-sm text-muted-foreground">Day Savings Streak</p>
            </GlassCard>

            <GlassCard className="p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-2xl font-bold mb-1">{filteredDeals.length}+</p>
              <p className="text-sm text-muted-foreground">AI-Curated Deals</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ============================================================
          DEAL CATEGORIES TABS
      ============================================================ */}
      <section className="py-8 border-b border-border bg-background/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2">
            {DEAL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 rounded-xl whitespace-nowrap transition-all',
                  activeTab === cat.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-muted/50 hover:bg-muted'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  activeTab === cat.id ? 'bg-white/20' : cat.color
                )}>
                  {cat.icon}
                </div>
                <div className="text-left">
                  <p className={cn('font-medium', activeTab === cat.id ? 'text-white' : '')}>
                    {cat.name}
                  </p>
                  <p className={cn('text-xs', activeTab === cat.id ? 'text-white/80' : 'text-muted-foreground')}>
                    {cat.count} deals
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Filter Panel - Desktop */}
            <div className="hidden lg:block">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            </div>

            {/* Deals Grid */}
            <div className="flex-1">
              {/* Sort & View Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setShowFilters(true)}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filteredDeals.length}</span> deals
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="h-10 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="discount">Highest Discount</option>
                    <option value="score">AI Deal Score</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'p-2 transition-colors',
                        viewMode === 'grid' ? 'bg-primary text-white' : 'bg-background hover:bg-muted'
                      )}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'p-2 transition-colors',
                        viewMode === 'list' ? 'bg-primary text-white' : 'bg-background hover:bg-muted'
                      )}
                    >
                      <LayoutList className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Savings Banner */}
              <GlassCard className="p-5 mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
                      <Wallet className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Your AI Savings Summary</p>
                      <p className="text-sm text-muted-foreground">
                        Based on your preferences, you could save <span className="text-green-600 font-semibold">{formatPrice(savings.comparedToAverage)}</span> more compared to average market prices
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
                    View Details
                  </Button>
                </div>
              </GlassCard>

              {/* Deals Grid */}
              <div className={cn(
                'grid gap-6',
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              )}>
                {filteredDeals.map((deal) => (
                  <ProductCard
                    key={deal.id}
                    deal={deal}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredDeals.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No deals found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}

              {/* Load More */}
              {filteredDeals.length > 0 && (
                <div className="text-center mt-12">
                  <Button variant="outline" size="lg" className="px-12">
                    Load More Deals
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">
                    Showing {filteredDeals.length} of 2,500+ deals
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          MOBILE FILTER DRAWER
      ============================================================ */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-[320px] bg-background z-50 lg:hidden overflow-auto"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-muted rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClear={handleClearFilters}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ============================================================
          AI INSIGHTS SECTION
      ============================================================ */}
      <section className="py-12 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-4">
                <Brain className="w-4 h-4 mr-1" />
                AI Insights
              </Badge>
              <h2 className="text-3xl font-bold mb-2">Smart Insights for Smarter Shopping</h2>
              <p className="text-muted-foreground">Real-time analysis to help you make better decisions</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard className="p-6 border-l-4 border-l-green-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Price Predictions</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Based on historical data and market trends, electronics prices are expected to drop 8-12% in the next sale event.
                    </p>
                    <Badge variant="secondary" className="text-xs">Updated 2 hours ago</Badge>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 border-l-4 border-l-amber-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Trending Category</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Smartwatches are seeing 45% higher demand. Top deals selling out within hours.
                    </p>
                    <Badge variant="secondary" className="text-xs">Live tracking</Badge>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 border-l-4 border-l-blue-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Best Bank Offers</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      HDFC Bank cardholders save up to ₹10,000 extra on electronics this week.
                    </p>
                    <Badge variant="secondary" className="text-xs">3 days remaining</Badge>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 border-l-4 border-l-purple-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">AI Recommendation</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Based on your browsing, Sony WH-1000XM5 is at its lowest price. 92% deal score!
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">View Deal</Button>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          GAMIFICATION SECTION
      ============================================================ */}
      <section className="py-12 bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Deal Hunter Achievements</h3>
                    <p className="text-muted-foreground">Your progress towards becoming a master saver</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                    <Flame className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold">{savingsStreak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>

                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                    <Wallet className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold">{formatPrice(totalSaved)}</p>
                  <p className="text-xs text-muted-foreground">Total Saved</p>
                </div>

                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold">47</p>
                  <p className="text-xs text-muted-foreground">Deals Caught</p>
                </div>

                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold">Level 5</p>
                  <p className="text-xs text-muted-foreground">Hunter Rank</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 border-2 border-white flex items-center justify-center text-white text-sm font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="flex-1">
                  <p className="font-medium">You&apos;re #4 on the leaderboard!</p>
                  <p className="text-sm text-muted-foreground">Top 5% of deal hunters this month</p>
                </div>
                <Button size="sm">View Leaderboard</Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ============================================================
          NEWSLETTER SECTION
      ============================================================ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-10 text-center bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border-primary/20">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Bell className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Never Miss a Great Deal
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Set up personalized deal alerts and get notified the moment prices drop on your wishlist items.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-5 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button size="lg">Subscribe</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Join 2.5M+ smart shoppers. Unsubscribe anytime.
              </p>
            </GlassCard>
          </div>
        </div>
      </section>
    </div>
  );
}
