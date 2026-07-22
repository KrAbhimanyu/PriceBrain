'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, TrendingDown, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, calculateDiscount, cn } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  isInWishlist?: boolean;
  onToggleWishlist?: (productId: string) => void;
  className?: string;
}

export function ProductCard({ product, isInWishlist, onToggleWishlist, className }: ProductCardProps) {
  const lowestPrice = Math.min(...product.retailerPrices.map((p) => p.price));
  const originalPrice = product.retailerPrices[0]?.originalPrice || lowestPrice;
  const discount = calculateDiscount(originalPrice, lowestPrice);
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const primaryRetailer = product.retailerPrices.find((p) => p.price === lowestPrice)?.retailer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          'group relative overflow-hidden bg-card hover:shadow-elevated transition-all duration-300',
          className
        )}
      >
        {/* Image Section */}
        <Link href={`/product/${product.slug}`} className="block relative aspect-square bg-muted/50">
          <Image
            src={primaryImage?.url || '/images/placeholder.svg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-red-500 text-white hover:bg-red-600">
              -{discount}%
            </Badge>
          )}

          {/* Wishlist Button */}
          {onToggleWishlist && (
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                'absolute top-3 right-3 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity',
                isInWishlist && 'opacity-100 bg-red-100 hover:bg-red-200'
              )}
              onClick={(e) => {
                e.preventDefault();
                onToggleWishlist(product.id);
              }}
            >
              <Heart
                className={cn(
                  'h-4 w-4',
                  isInWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                )}
              />
            </Button>
          )}

          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
            <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity text-sm bg-black/50 px-3 py-1 rounded-full">
              Quick View
            </span>
          </div>
        </Link>

        {/* Content Section */}
        <div className="p-4">
          {/* Brand */}
          <p className="text-xs text-muted-foreground mb-1">{product.brand.name}</p>
          
          {/* Product Name */}
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors mb-2 min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>

          {/* Price Section */}
          <div className="space-y-1 mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">
                {formatCurrency(lowestPrice)}
              </span>
              {originalPrice > lowestPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </div>
            {primaryRetailer && (
              <p className="text-xs text-muted-foreground">
                from {primaryRetailer.name}
              </p>
            )}
          </div>

          {/* Price Drop Indicator */}
          {product.priceChangePercentage !== undefined && product.priceChangePercentage < 0 && (
            <div className="flex items-center gap-1 text-green-600 mb-3">
              <TrendingDown className="h-3 w-3" />
              <span className="text-xs font-medium">
                {Math.abs(product.priceChangePercentage).toFixed(0)}% cheaper
              </span>
            </div>
          )}

          {/* Retailers Count */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {product.retailerPrices.length} stores
            </span>
            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
              <Link href={`/product/${product.slug}`}>
                Compare <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
