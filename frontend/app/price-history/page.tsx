'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { productService } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

interface PricePoint {
  date: string;
  price: number;
}

interface PriceStats {
  current: number;
  lowest: number;
  highest: number;
  average: number;
}

function PriceHistoryContent() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [stats, setStats] = useState<PriceStats>({ current: 0, lowest: 0, highest: 0, average: 0 });
  const [productName, setProductName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  useEffect(() => {
    const fetchPriceHistory = async () => {
      if (!productId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await productService.getPriceHistory(productId);
        if (response.data?.success) {
          const data = response.data.data;
          setPriceData(data.prices || []);
          setStats(data.stats || { current: 0, lowest: 0, highest: 0, average: 0 });
          setProductName(data.productName || 'Product');
        }
      } catch (error) {
        console.error('Failed to fetch price history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriceHistory();
  }, [productId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Price History</h1>
          <p className="text-slate-600">Track price changes and find the best time to buy</p>
        </div>

        {/* Time Range Selector */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Price Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Price Trend</h2>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <p className="text-slate-400">Loading price history...</p>
            </div>
          ) : priceData.length > 0 ? (
            <div className="h-80 flex items-end justify-between gap-2 px-4">
              {priceData.slice(0, 15).map((data, i) => {
                const minPrice = Math.min(...priceData.map(p => p.price));
                const maxPrice = Math.max(...priceData.map(p => p.price));
                const height = maxPrice > minPrice ? ((data.price - minPrice) / (maxPrice - minPrice)) * 80 : 50;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-blue-200 rounded-t" style={{ height: `${Math.max(height, 5)}%` }} />
                    <span className="text-xs text-slate-400 transform -rotate-45 origin-top-left">
                      {new Date(data.date).getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p className="text-slate-400">No price history available</p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500 mb-1">Current Price</p>
            <p className="text-2xl font-bold text-slate-900">Rs.{stats.current.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500 mb-1">Lowest Price</p>
            <p className="text-2xl font-bold text-green-600">Rs.{stats.lowest.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500 mb-1">Highest Price</p>
            <p className="text-2xl font-bold text-red-600">Rs.{stats.highest.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500 mb-1">Average Price</p>
            <p className="text-2xl font-bold text-slate-900">Rs.{stats.average.toLocaleString()}</p>
          </div>
        </div>

        {/* Price Drop Alert */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Set Price Drop Alert</h3>
              <p className="text-blue-100">Get notified when price drops below your target</p>
            </div>
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Set Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PriceHistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-32 w-full mb-6" />
          <Skeleton className="h-80 w-full mb-6" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    }>
      <PriceHistoryContent />
    </Suspense>
  );
}
