'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Plus, X, ShoppingCart, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { productService, compareService } from '@/services/api';

interface CompareProduct {
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
  retailerPrices?: Array<{
    retailer: { name: string };
    price: number;
    affiliateUrl: string;
    inStock: boolean;
  }>;
  specifications?: Array<{ key: string; value: string }>;
}

export default function ComparePage() {
  const router = useRouter();
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CompareProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load products from URL params or localStorage
  useEffect(() => {
    const loadProducts = async () => {
      const params = new URLSearchParams(window.location.search);
      const productIds = params.get('products')?.split(',').filter(Boolean) || [];
      
      if (productIds.length > 0) {
        setIsLoading(true);
        try {
          const response = await compareService.compare(productIds);
          if (response.data?.success) {
            setProducts(response.data.data?.products || []);
          }
        } catch (error) {
          console.error('Failed to load products:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadProducts();
  }, []);

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await productService.getAll({ q: query, limit: 10 });
      if (response.data?.success) {
        setSearchResults(response.data.data || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchProducts]);

  const addProduct = (product: CompareProduct) => {
    if (products.length < 4 && !products.find(p => p.id === product.id)) {
      setProducts([...products, product]);
      setShowAddModal(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const lowestPrice = products.reduce((min, p) => Math.min(min, p.lowestPrice), Infinity);
  const bestPriceProducts = products.filter((p) => p.lowestPrice === lowestPrice);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => router.back()} className="flex items-center text-slate-600 hover:text-slate-900 mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Compare Products</h1>
          </div>
          {products.length < 4 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Products to Compare</h3>
            <p className="text-slate-500 mb-4">Add products to start comparing prices and features</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Add Products
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl border border-slate-200">
              <thead>
                <tr>
                  <th className="p-4 text-left font-medium text-slate-500 border-b border-slate-200 min-w-[200px]">
                    Product
                  </th>
                  {products.map((product) => (
                    <th key={product.id} className="p-4 text-center border-b border-slate-200 min-w-[250px] relative">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="absolute top-4 right-4 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="relative aspect-square w-32 mx-auto mb-3 bg-slate-50 rounded-lg overflow-hidden">
                        {product.images?.[0] && (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{product.brand?.name}</p>
                      <h3 className="font-medium text-slate-900 line-clamp-2">{product.name}</h3>
                      {bestPriceProducts.some((p) => p.id === product.id) && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Best Price
                        </span>
                      )}
                    </th>
                  ))}
                  {products.length < 4 && (
                    <th className="p-4 text-center border-b border-slate-200 min-w-[250px]">
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="w-32 h-32 mx-auto border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Plus className="w-8 h-8 mb-2" />
                        <span className="text-sm">Add</span>
                      </button>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {/* Price Row */}
                <tr>
                  <td className="p-4 font-medium text-slate-700 border-b border-slate-200">Price</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center border-b border-slate-200">
                      <span className="text-2xl font-bold text-slate-900">
                        ₹{Number(product.lowestPrice).toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="block text-sm text-slate-500 line-through">
                          ₹{Number(product.originalPrice).toLocaleString()}
                        </span>
                      )}
                      <a
                        href={product.retailerPrices?.[0]?.affiliateUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Buy Now
                      </a>
                    </td>
                  ))}
                  {products.length < 4 && <td className="p-4 border-b border-slate-200" />}
                </tr>

                {/* Rating Row */}
                <tr>
                  <td className="p-4 font-medium text-slate-700 border-b border-slate-200">Rating</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center border-b border-slate-200">
                      <span className="text-lg font-semibold">{product.rating}</span>
                      <span className="text-sm text-slate-500">/5 ({product.reviewCount})</span>
                    </td>
                  ))}
                  {products.length < 4 && <td className="p-4 border-b border-slate-200" />}
                </tr>

                {/* Specifications */}
                {products[0]?.specifications?.map((spec) => (
                  <tr key={spec.key}>
                    <td className="p-4 font-medium text-slate-700 border-b border-slate-200">{spec.key}</td>
                    {products.map((product) => {
                      const productSpec = product.specifications?.find((s) => s.key === spec.key);
                      return (
                        <td key={product.id} className="p-4 text-center border-b border-slate-200 text-slate-600">
                          {productSpec?.value || '-'}
                        </td>
                      );
                    })}
                    {products.length < 4 && <td className="p-4 border-b border-slate-200" />}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
