'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal, X, Grid3X3, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SORT_OPTIONS } from '@/constants';
import type { Product, SearchFacets } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [facets, setFacets] = useState<SearchFacets | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<{
    brands?: string[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
  }>({
    brands: [],
    inStock: false,
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, unknown> = { page: 1, limit: 20 };
        if (query) params.q = query;
        if (filters.brands && filters.brands.length > 0) params.brands = filters.brands.join(',');
        if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
        if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
        if (filters.minRating !== undefined) params.minRating = filters.minRating;
        if (filters.inStock) params.inStock = true;
        if (sortBy !== 'relevance') params.sortBy = sortBy;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/search?${new URLSearchParams(params as Record<string, string>).toString()}`);
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.data || []);
          setFacets(data.meta?.facets);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [query, filters, sortBy]);

  const clearFilters = () => {
    setFilters({
      brands: [],
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      inStock: false,
    });
  };

  const hasActiveFilters = (filters.brands && filters.brands.length > 0) ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.minRating !== undefined ||
    filters.inStock === true;

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="bg-card border-b border-border sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full max-w-2xl">
              <SearchBar />
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {((filters.brands?.length) || 0) + (filters.minRating ? 1 : 0) + (filters.inStock ? 1 : 0)}
                  </Badge>
                )}
              </Button>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="hidden md:flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('rounded-r-none', viewMode === 'grid' && 'bg-muted')}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('rounded-l-none', viewMode === 'list' && 'bg-muted')}
                  onClick={() => setViewMode('list')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {(filters.brands || []).map((brand) => (
                <Badge key={brand} variant="secondary" className="gap-1">
                  {brand}
                  <button
                    onClick={() => setFilters({
                      ...filters,
                      brands: (filters.brands || []).filter((b) => b !== brand),
                    })}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {filters.minRating && (
                <Badge variant="secondary" className="gap-1">
                  {filters.minRating}★ & above
                  <button onClick={() => setFilters({ ...filters, minRating: undefined })} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.inStock && (
                <Badge variant="secondary" className="gap-1">
                  In Stock
                  <button onClick={() => setFilters({ ...filters, inStock: false })} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className={cn(
            'w-64 flex-shrink-0',
            showFilters ? 'block' : 'hidden md:block'
          )}>
            <div className="sticky top-32">
              <FilterSidebar
                facets={facets}
                filters={filters}
                onFilterChange={setFilters}
              />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-5 w-40" />
                ) : (
                  <>
                    <span className="font-medium text-foreground">{products.length}</span> results
                    {query && <> for &quot;<span className="font-medium">{query}</span>&quot;</>}
                  </>
                )}
              </p>
            </div>

            {/* Products */}
            <ProductGrid
              products={products}
              isLoading={isLoading}
            />

            {/* Pagination */}
            {!isLoading && products.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button variant="outline" disabled>Previous</Button>
                <Button variant="outline" className="bg-primary text-white hover:bg-primary/90">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <span className="px-2">...</span>
                <Button variant="outline">10</Button>
                <Button variant="outline">Next</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b border-border sticky top-16 z-40">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-10 w-full max-w-2xl" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <div className="w-64 hidden md:block">
              <Skeleton className="h-96" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-12 mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
