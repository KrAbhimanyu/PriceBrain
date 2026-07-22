'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, TrendingDown } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, removeItem } from '@/store/slices/wishlistSlice';
import { RootState } from '@/store';

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    brand?: { name: string };
    images?: Array<{ url: string; isPrimary: boolean }>;
    lowestPrice: number;
    originalPrice?: number;
    rating?: number;
    reviewCount?: number;
    inStock?: boolean;
  };
  onCompare?: (id: string) => void;
}

export function ProductCard({ product, onCompare }: ProductCardProps) {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isInWishlist = wishlistItems.some((item) => item.id === product.id);
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const discount = product.originalPrice
    ? Math.round(((Number(product.originalPrice) - Number(product.lowestPrice)) / Number(product.originalPrice)) * 100)
    : 0;

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch(removeItem(product.id));
    } else {
      dispatch(addItem({ 
        id: product.id,
        userId: '', 
        product: product as any,
        priceAlert: true,
        targetPrice: Number(product.lowestPrice) * 0.9,
        createdAt: new Date()
      }));
    }
  };

  return (
    <div
      className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-slate-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-square bg-slate-50">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <span className="text-sm">No Image</span>
          </div>
        )}
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            {discount}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            handleWishlistToggle();
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
            isInWishlist
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-slate-600 hover:bg-white hover:text-red-500'
          } shadow-sm`}
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>
      </Link>

      {/* Content Section */}
      <div className="p-4">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
            {product.brand.name}
          </p>
        )}

        {/* Product Name */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-medium text-slate-900 line-clamp-2 hover:text-blue-600 transition-colors mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center gap-0.5">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-slate-700">{product.rating}</span>
            </div>
            <span className="text-sm text-slate-500">({product.reviewCount || 0})</span>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-slate-900">₹{Number(product.lowestPrice).toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-sm text-slate-500 line-through">₹{Number(product.originalPrice).toLocaleString()}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className={`flex gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <Link
            href={`/product/${product.slug}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg text-center transition-colors"
          >
            View Details
          </Link>
          {onCompare && (
            <button
              onClick={() => onCompare(product.id)}
              className="px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
              Compare
            </button>
          )}
        </div>

        {/* Stock Status */}
        {!product.inStock && (
          <p className="text-sm text-red-500 font-medium mt-2">Out of Stock</p>
        )}
      </div>
    </div>
  );
}
