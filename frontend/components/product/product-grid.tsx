'use client';

import { ProductCard } from './product-card';
import { ProductCardSkeleton } from './product-card-skeleton';

interface Product {
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
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onCompare?: (id: string) => void;
  emptyMessage?: string;
}

export function ProductGrid({ products, loading, onCompare, emptyMessage = 'No products found' }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">{emptyMessage}</h3>
        <p className="text-slate-500">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onCompare={onCompare} />
      ))}
    </div>
  );
}
