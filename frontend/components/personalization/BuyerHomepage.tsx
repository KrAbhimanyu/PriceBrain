'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronRight, Tag, Zap, Star, Clock, TrendingUp, Sparkles,
  ArrowRight, ShoppingBag, Heart, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product/ProductCard';
import { SearchBar } from '@/components/search/SearchBar';
import { usePersonalization } from '@/providers';
import type { AIRecommendationItem, ContinueShoppingItem, SmartCollection } from '@/types';

function ContinueShoppingCard({ item }: { item: ContinueShoppingItem }) {
  return (
    <Link href={`/product/${item.product.slug}`}>
      <Card className="group cursor-pointer hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="flex gap-4 p-4">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {item.product.images?.[0] ? (
              <Image
                src={item.product.images[0].url}
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {item.product.name}
            </p>
            <p className="text-lg font-bold text-primary mt-1">
              ₹{Number(item.product.lowestPrice || 0).toLocaleString()}
            </p>
            {item.priceChange && (
              <Badge 
                variant={item.priceChange < 0 ? 'default' : 'secondary'}
                className={`mt-2 text-xs ${item.priceChange < 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
              >
                {item.priceChange < 0 ? '↓' : '↑'} {Math.abs(item.priceChange).toFixed(1)}%
              </Badge>
            )}
          </div>
          <div className="flex items-center">
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

function AIRecommendationCard({ item }: { item: AIRecommendationItem }) {
  const typeLabels: Record<string, { label: string; color: string }> = {
    personalized: { label: 'For You', color: 'bg-purple-100 text-purple-700' },
    trending: { label: 'Trending', color: 'bg-orange-100 text-orange-700' },
    bestseller: { label: 'Bestseller', color: 'bg-green-100 text-green-700' },
    similar: { label: 'Similar', color: 'bg-blue-100 text-blue-700' },
    price_drop: { label: 'Price Drop', color: 'bg-red-100 text-red-700' },
    back_in_stock: { label: 'Back in Stock', color: 'bg-yellow-100 text-yellow-700' },
  };
  
  const typeInfo = typeLabels[item.type] || typeLabels.personalized;
  
  return (
    <div className="relative group">
      <ProductCard product={item.product} />
      <div className="absolute top-3 left-3 z-10">
        <Badge className={`${typeInfo.color} shadow-sm`}>
          <Sparkles className="h-3 w-3 mr-1" />
          {typeInfo.label}
        </Badge>
      </div>
      <div className="absolute bottom-20 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-muted-foreground bg-background/95 backdrop-blur-sm rounded-lg p-2 shadow-sm">
          {item.reason}
        </p>
      </div>
    </div>
  );
}

function SmartCollectionCard({ collection }: { collection: SmartCollection }) {
  const iconMap: Record<string, React.ElementType> = {
    zap: Zap,
    tag: Tag,
    star: Star,
    trending: TrendingUp,
    clock: Clock,
    heart: Heart,
  };
  
  const Icon = iconMap[collection.icon] || Tag;
  
  return (
    <Link href={`/collections/${collection.slug}`}>
      <Card className="group cursor-pointer hover:shadow-md transition-all duration-300 h-full">
        <CardContent className="p-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
            {collection.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {collection.description}
          </p>
          <p className="text-sm font-medium text-primary">
            {collection.productCount} products
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function BuyerHomepage() {
  const { 
    aiRecommendations, 
    continueShopping, 
    smartCollections,
    recentlyViewed,
    user 
  } = usePersonalization();
  
  const firstName = user?.name?.split(' ')[0] || 'there';
  
  return (
    <div className="flex flex-col">
      {/* Personalized Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Welcome back, {firstName}!
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Find the <span className="text-primary">Best Prices</span> for You
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
              Your personalized shopping assistant with AI-powered recommendations
            </p>
            <div className="max-w-2xl mx-auto">
              <SearchBar variant="hero" />
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Continue Shopping Section */}
      {continueShopping.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Continue Shopping</h2>
                  <p className="text-sm text-muted-foreground">Pick up where you left off</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {continueShopping.map((item) => (
                <ContinueShoppingCard key={item.product.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AI Recommendations Section */}
      {aiRecommendations.length > 0 && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI Recommendations</h2>
                  <p className="text-sm text-muted-foreground">Curated just for you</p>
                </div>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/recommendations">View all <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {aiRecommendations.map((item) => (
                <AIRecommendationCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Recently Viewed</h2>
                  <p className="text-sm text-muted-foreground">Products you have looked at</p>
                </div>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/history">View all <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentlyViewed.slice(0, 6).map((item) => (
                <Link key={item.product.id} href={`/product/${item.product.slug}`}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="w-full aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                        {item.product.images?.[0] ? (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="150px"
                          />
                        ) : (
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-xs font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-primary font-semibold">
                        ₹{Number(item.product.lowestPrice || 0).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Smart Collections Section */}
      {smartCollections.length > 0 && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Smart Collections</h2>
                  <p className="text-sm text-muted-foreground">Curated deals and categories</p>
                </div>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/collections">View all <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {smartCollections.map((collection) => (
                <SmartCollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/wishlist">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6 text-center">
                  <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="font-medium">Wishlist</p>
                  <p className="text-xs text-muted-foreground">Saved items</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/price-history">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="font-medium">Price History</p>
                  <p className="text-xs text-muted-foreground">Track prices</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/compare">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6 text-center">
                  <Tag className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-medium">Compare</p>
                  <p className="text-xs text-muted-foreground">Find best deals</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/coupons">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="font-medium">Coupons</p>
                  <p className="text-xs text-muted-foreground">Exclusive deals</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
