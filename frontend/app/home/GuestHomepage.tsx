'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, ChevronRight, Tag, Laptop, Shirt, Home, Sparkles, Dumbbell, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/search/SearchBar';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product, Category } from '@/types';

const CATEGORY_CONFIG = [
  { name: 'Electronics', icon: Laptop, color: 'bg-blue-100 text-blue-600' },
  { name: 'Fashion', icon: Shirt, color: 'bg-pink-100 text-pink-600' },
  { name: 'Home & Kitchen', icon: Home, color: 'bg-orange-100 text-orange-600' },
  { name: 'Beauty', icon: Sparkles, color: 'bg-purple-100 text-purple-600' },
  { name: 'Sports', icon: Dumbbell, color: 'bg-green-100 text-green-600' },
  { name: 'Books', icon: BookOpen, color: 'bg-yellow-100 text-yellow-600' },
];

const FEATURES = [
  { icon: TrendingUp, title: 'AI-Powered Matching', description: 'Our AI finds identical products across retailers.' },
  { icon: ChevronRight, title: 'Verified Prices', description: 'Real-time price updates from trusted retailers.' },
  { icon: Tag, title: 'Instant Price Alerts', description: 'Get notified when prices drop.' },
];

// Mock data for when API is unavailable
const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', isActive: true },
  { id: '2', name: 'Fashion', slug: 'fashion', isActive: true },
  { id: '3', name: 'Home & Kitchen', slug: 'home-kitchen', isActive: true },
  { id: '4', name: 'Beauty', slug: 'beauty', isActive: true },
  { id: '5', name: 'Sports', slug: 'sports', isActive: true },
  { id: '6', name: 'Books', slug: 'books', isActive: true },
];

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'iPhone 15 Pro', slug: 'iphone-15-pro', description: '', images: [{ id: '1', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', alt: '', isPrimary: true, order: 1 }], brand: { id: '1', name: 'Apple', slug: 'apple', isActive: true }, category: { id: '1', name: 'Electronics', slug: 'electronics', isActive: true }, retailerPrices: [], specifications: [], rating: 4.5, reviewCount: 1234, inStock: true, isFeatured: true, isActive: true, lowestPrice: 119900, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Samsung Galaxy S24', slug: 'samsung-galaxy-s24', description: '', images: [{ id: '2', url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', alt: '', isPrimary: true, order: 1 }], brand: { id: '2', name: 'Samsung', slug: 'samsung', isActive: true }, category: { id: '1', name: 'Electronics', slug: 'electronics', isActive: true }, retailerPrices: [], specifications: [], rating: 4.3, reviewCount: 890, inStock: true, isFeatured: true, isActive: true, lowestPrice: 79999, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'MacBook Air M3', slug: 'macbook-air-m3', description: '', images: [{ id: '3', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', alt: '', isPrimary: true, order: 1 }], brand: { id: '1', name: 'Apple', slug: 'apple', isActive: true }, category: { id: '1', name: 'Electronics', slug: 'electronics', isActive: true }, retailerPrices: [], specifications: [], rating: 4.7, reviewCount: 2100, inStock: true, isFeatured: true, isActive: true, lowestPrice: 114900, createdAt: new Date(), updatedAt: new Date() },
  { id: '4', name: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', description: '', images: [{ id: '4', url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', alt: '', isPrimary: true, order: 1 }], brand: { id: '3', name: 'Sony', slug: 'sony', isActive: true }, category: { id: '1', name: 'Electronics', slug: 'electronics', isActive: true }, retailerPrices: [], specifications: [], rating: 4.6, reviewCount: 4500, inStock: true, isFeatured: true, isActive: true, lowestPrice: 24990, createdAt: new Date(), updatedAt: new Date() },
  { id: '5', name: 'Nike Air Max', slug: 'nike-air-max', description: '', images: [{ id: '5', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', alt: '', isPrimary: true, order: 1 }], brand: { id: '4', name: 'Nike', slug: 'nike', isActive: true }, category: { id: '5', name: 'Sports', slug: 'sports', isActive: true }, retailerPrices: [], specifications: [], rating: 4.4, reviewCount: 3200, inStock: true, isFeatured: true, isActive: true, lowestPrice: 5995, createdAt: new Date(), updatedAt: new Date() },
  { id: '6', name: 'Adidas Ultraboost', slug: 'adidas-ultraboost', description: '', images: [{ id: '6', url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400', alt: '', isPrimary: true, order: 1 }], brand: { id: '5', name: 'Adidas', slug: 'adidas', isActive: true }, category: { id: '5', name: 'Sports', slug: 'sports', isActive: true }, retailerPrices: [], specifications: [], rating: 4.5, reviewCount: 1800, inStock: true, isFeatured: true, isActive: true, lowestPrice: 7995, createdAt: new Date(), updatedAt: new Date() },
];

export function GuestHomepage() {
  const [deals, setDeals] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use mock data for now
    setDeals(MOCK_PRODUCTS.slice(0, 4));
    setTrending(MOCK_PRODUCTS);
    setIsLoading(false);
  }, []);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">Compare prices across 100+ retailers</Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Find the <span className="text-primary">Best Prices</span> Across the Web
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
              Compare prices from Amazon, Flipkart, Myntra, and 100+ retailers.
            </p>
            <div className="max-w-2xl mx-auto">
              <SearchBar variant="hero" />
            </div>
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">10M+</p>
                <p className="text-sm text-muted-foreground">Products</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">100+</p>
                <p className="text-sm text-muted-foreground">Retailers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">50K+</p>
                <p className="text-sm text-muted-foreground">Daily Deals</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Browse Categories</h2>
              <p className="text-muted-foreground mt-1">Explore products from top categories</p>
            </div>
            <Button variant="ghost" asChild><Link href="/categories">View all <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORY_CONFIG.map((config) => (
              <Link key={config.name} href={`/categories/${config.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <Card className="group cursor-pointer hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-xl ${config.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}><config.icon className="h-7 w-7" /></div>
                    <h3 className="font-medium mb-1">{config.name}</h3>
                    <p className="text-xs text-muted-foreground">Browse products</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center"><Tag className="h-5 w-5 text-white" /></div>
              <div><h2 className="text-2xl md:text-3xl font-bold">Top Deals</h2><p className="text-muted-foreground">Handpicked deals with the biggest discounts</p></div>
            </div>
            <Button variant="ghost" asChild><Link href="/deals">View all deals <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {deals.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Why Choose PriceBrain?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">We are not just a price comparison site. We are your smart shopping assistant.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-soft">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"><feature.icon className="h-7 w-7 text-primary" /></div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div><Badge variant="secondary" className="mb-2">Trending</Badge><h2 className="text-2xl md:text-3xl font-bold">Popular Right Now</h2></div>
            <Button variant="ghost" asChild><Link href="/search?sort=popular">View all <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trending.slice(0, 6).map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="w-full aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {product.images?.[0] ? (
                        <Image 
                          src={product.images[0].url} 
                          alt={product.name} 
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 16vw"
                          loading="lazy"
                        />
                      ) : <TrendingUp className="h-8 w-8 text-muted-foreground" />}
                    </div>
                    <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">from Rs.{Number(product.lowestPrice || 0).toLocaleString()}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground border-0 overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center relative">
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Get Price Alerts in Your Inbox</h2>
                <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto"> Subscribe to our newsletter and be the first to know about price drops, exclusive deals, and new features.</p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 placeholder:text-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/50" />
                  <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">Subscribe</Button>
                </div>
                <p className="text-xs mt-4 text-primary-foreground/60">No spam. Unsubscribe anytime.</p>
              </div>
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
