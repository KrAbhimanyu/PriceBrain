'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2, Bell, BellOff, ExternalLink, TrendingDown, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrency, calculateDiscount } from '@/lib/utils';
import { wishlistService } from '@/services/api';
import type { WishlistItem } from '@/types';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [targetPrice, setTargetPrice] = useState('');

  useEffect(() => {
    const fetchWishlist = async () => {
      setIsLoading(true);
      try {
        const response = await wishlistService.getAll();
        if (response.data?.success) {
          setWishlist(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (id: string) => {
    try {
      await wishlistService.remove(id);
      setWishlist(wishlist.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const togglePriceAlert = async (id: string) => {
    const item = wishlist.find(i => i.id === id);
    if (!item) return;
    try {
      await wishlistService.update(id, { priceAlert: !item.priceAlert });
      setWishlist(wishlist.map((item) => item.id === id ? { ...item, priceAlert: !item.priceAlert } : item));
    } catch (error) {
      console.error('Failed to toggle price alert:', error);
    }
  };

  const updateTargetPrice = async (id: string) => {
    if (!targetPrice) return;
    try {
      await wishlistService.update(id, { targetPrice: parseInt(targetPrice) });
      setWishlist(wishlist.map((item) => item.id === id ? { ...item, targetPrice: parseInt(targetPrice) } : item));
      setEditingPrice(null);
      setTargetPrice('');
    } catch (error) {
      console.error('Failed to update target price:', error);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary fill-primary" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground mt-1">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
            </p>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <Card className="py-16">
            <CardContent className="text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Save products you want to track and get price alerts when prices drop.
              </p>
              <Button asChild>
                <Link href="/search">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {wishlist.map((item) => {
              const lowestPrice = Math.min(...item.product.retailerPrices.map((p) => p.price));
              const originalPrice = item.product.retailerPrices[0]?.originalPrice || lowestPrice;
              const discount = calculateDiscount(originalPrice, lowestPrice);
              const priceDiff = item.targetPrice ? lowestPrice - item.targetPrice : 0;
              const isBelowTarget = priceDiff <= 0;

              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-elevated transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Product Image */}
                      <Link href={`/product/${item.product.slug}`} className="flex-shrink-0">
                        <div className="w-full md:w-32 h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">Image</span>
                          </div>
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {item.product.brand.name}
                            </p>
                            <Link href={`/product/${item.product.slug}`}>
                              <h3 className="font-medium hover:text-primary transition-colors line-clamp-2 mb-2">
                                {item.product.name}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm">
                                ⭐ {item.product.rating.toFixed(1)} ({item.product.reviewCount})
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-bold text-primary">
                                {formatCurrency(lowestPrice)}
                              </span>
                              {originalPrice > lowestPrice && (
                                <>
                                  <span className="text-sm text-muted-foreground line-through">
                                    {formatCurrency(originalPrice)}
                                  </span>
                                  <Badge variant="destructive" className="text-xs">
                                    -{discount}%
                                  </Badge>
                                </>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              from {item.product.retailerPrices[0]?.retailer.name}
                            </p>
                          </div>
                        </div>

                        {/* Price Alert Section */}
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              {editingPrice === item.id ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">Target:</span>
                                  <Input
                                    type="number"
                                    placeholder="Enter price"
                                    value={targetPrice}
                                    onChange={(e) => setTargetPrice(e.target.value)}
                                    className="w-32 h-8"
                                  />
                                  <Button size="sm" onClick={() => updateTargetPrice(item.id)}>
                                    Save
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingPrice(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2">
                                    {item.targetPrice ? (
                                      <>
                                        <span className="text-sm text-muted-foreground">Target:</span>
                                        <span className="font-medium">{formatCurrency(item.targetPrice)}</span>
                                        {isBelowTarget && (
                                          <Badge variant="success" className="text-xs">
                                            <TrendingDown className="h-3 w-3 mr-1" />
                                            Price Drop!
                                          </Badge>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">No target price set</span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingPrice(item.id);
                                  setTargetPrice(item.targetPrice?.toString() || '');
                                }}
                              >
                                {item.targetPrice ? 'Edit Target' : 'Set Target'}
                              </Button>
                              <Button
                                variant={item.priceAlert ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => togglePriceAlert(item.id)}
                              >
                                {item.priceAlert ? (
                                  <>
                                    <Bell className="h-4 w-4 mr-1" />
                                    Alert On
                                  </>
                                ) : (
                                  <>
                                    <BellOff className="h-4 w-4 mr-1" />
                                    Alert Off
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/product/${item.product.slug}`}>
                                View Product <ExternalLink className="h-3 w-3 ml-1" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href="/compare">
                                Compare
                              </Link>
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeFromWishlist(item.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
