'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, Mic, Camera, Sparkles, TrendingUp, Clock, X, Grid3X3, LayoutGrid,
  Star, Filter, Zap, ChevronRight, History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SORT_OPTIONS } from '@/constants';
import type { Product, SearchFacets } from '@/types';

// Mock AI Search data
const mockAISuggestions = [
  { type: 'product', text: 'iPhone 15 Pro Max', category: 'Electronics', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100' },
  { type: 'product', text: 'Samsung Galaxy S24 Ultra', category: 'Electronics', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=100' },
  { type: 'category', text: 'Laptops under 70000', category: 'Computers' },
  { type: 'ai', text: 'Best phones for photography', isAI: true },
  { type: 'trending', text: 'Trending in Mumbai', isTrending: true },
];

const mockTrendingSearches = [
  'iPhone 15 deals',
  'Samsung Galaxy S24',
  'Laptop under 50000',
  'Running shoes',
  'Wedding wear',
  'Gaming monitor',
];

const mockRecentSearches = [
  'White formal shirts',
  'Gaming headphones',
  'Smart watches',
];

const mockAIAnswer = {
  title: 'Best Laptops for Programming in 2024',
  summary: 'Based on your requirements, here are the top recommendations:',
  points: [
    'MacBook Air M2 - Best overall for coding, excellent performance',
    'Dell XPS 13 - Premium Windows option with great display',
    'Lenovo ThinkPad - Best for enterprise software development',
    'ASUS ROG - If you also want gaming capability',
  ],
  pros: ['Excellent keyboards', 'Long battery life', 'Great displays'],
  cons: ['MacBook is expensive', 'Windows options vary in quality'],
  budgetOption: 'Acer Aspire 5 - Best value under 50000',
  premiumOption: 'MacBook Pro 14 - Best premium choice',
  confidence: 94,
};

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [facets, setFacets] = useState<SearchFacets | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMode, setSearchMode] = useState<'text' | 'voice' | 'image'>('text');
  const [showAIAnswer, setShowAIAnswer] = useState(false);
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
  
  const inputRef = useRef<HTMLInputElement>(null);
  
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
  
  useEffect(() => {
    if (query.toLowerCase().includes('best laptop') || query.toLowerCase().includes('laptop for')) {
      setShowAIAnswer(true);
    } else {
      setShowAIAnswer(false);
    }
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setInputValue(searchQuery);
    setShowSuggestions(false);
  };
  
  const handleVoiceSearch = () => {
    const voiceQueries = [
      'Best laptop under 70000 rupees',
      'White shoes for office wear',
      'Gift for my wife anniversary',
    ];
    const randomQuery = voiceQueries[Math.floor(Math.random() * voiceQueries.length)];
    setInputValue(randomQuery);
    setQuery(randomQuery);
    setSearchMode('text');
  };
  
  const handleImageUpload = () => {
    setSearchMode('image');
  };
  
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
      {/* AI Search Header */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-b border-purple-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">AI-Powered Search</span>
          </div>
          
          {/* Search Input */}
          <div className="relative max-w-3xl mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
              <Search className="h-5 w-5 text-purple-400 ml-4 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(inputValue.length > 0)}
                placeholder="Search for products, brands, or ask AI..."
                className="flex-1 px-4 py-4 outline-none text-lg"
              />
              <div className="flex items-center gap-2 pr-2">
                <Button variant="ghost" size="icon" onClick={handleVoiceSearch} className="text-purple-500 hover:text-purple-600 hover:bg-purple-50">
                  <Mic className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleImageUpload} className="text-purple-500 hover:text-purple-600 hover:bg-purple-50">
                  <Camera className="h-5 w-5" />
                </Button>
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl px-6"
                  onClick={() => handleSearch(inputValue)}
                  disabled={!inputValue.trim()}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
            
            {/* AI Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-purple-100 z-50 overflow-hidden">
                <div className="p-3 border-b border-purple-50">
                  <p className="text-xs text-purple-600 font-medium">AI Suggestions</p>
                </div>
                {mockAISuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(suggestion.text)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 transition-colors"
                  >
                    {suggestion.type === 'product' && suggestion.image && (
                      <Image src={suggestion.image} alt="" width={40} height={40} className="rounded-lg object-cover" />
                    )}
                    {suggestion.type === 'product' && !suggestion.image && (
                      <Search className="h-5 w-5 text-gray-400" />
                    )}
                    <div className="flex-1 text-left">
                      <p className="font-medium">{suggestion.text}</p>
                      <p className="text-sm text-gray-500">{suggestion.category}</p>
                    </div>
                    {suggestion.isAI && <Sparkles className="h-4 w-4 text-purple-500" />}
                    {suggestion.isTrending && <TrendingUp className="h-4 w-4 text-orange-500" />}
                  </button>
                ))}
                <div className="p-3 bg-purple-50">
                  <p className="text-xs text-purple-600 font-medium mb-2">Trending Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {mockTrendingSearches.map((search, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearch(search)}
                        className="text-sm px-3 py-1 bg-white rounded-full border border-purple-200 hover:border-purple-400 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Search Mode Tabs */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setSearchMode('text')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                searchMode === 'text' ? 'bg-purple-500 text-white' : 'bg-white text-gray-600 hover:bg-purple-50'
              )}
            >
              <Search className="h-4 w-4" />
              Text Search
            </button>
            <button
              onClick={() => { setSearchMode('voice'); handleVoiceSearch(); }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                searchMode === 'voice' ? 'bg-purple-500 text-white' : 'bg-white text-gray-600 hover:bg-purple-50'
              )}
            >
              <Mic className="h-4 w-4" />
              Voice Search
            </button>
            <button
              onClick={() => setSearchMode('image')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                searchMode === 'image' ? 'bg-purple-500 text-white' : 'bg-white text-gray-600 hover:bg-purple-50'
              )}
            >
              <Camera className="h-4 w-4" />
              Image Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* AI Answer Card */}
        {showAIAnswer && (
          <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Sparkles className="h-5 w-5" />
                  AI Answer
                  <Badge className="bg-purple-100 text-purple-700 ml-2">
                    {mockAIAnswer.confidence}% confidence
                  </Badge>
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAIAnswer(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-bold mb-2">{mockAIAnswer.title}</h3>
              <p className="text-gray-600 mb-4">{mockAIAnswer.summary}</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Top Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {mockAIAnswer.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-purple-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-1">Budget Pick</h4>
                    <p className="text-sm text-green-600">{mockAIAnswer.budgetOption}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-1">Premium Pick</h4>
                    <p className="text-sm text-purple-600">{mockAIAnswer.premiumOption}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-500">Pros</p>
                      {mockAIAnswer.pros.map((pro, i) => (
                        <p key={i} className="text-sm text-green-700">+ {pro}</p>
                      ))}
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-xs text-gray-500">Cons</p>
                      {mockAIAnswer.cons.map((con, i) => (
                        <p key={i} className="text-sm text-red-700">- {con}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
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
          
          <div className="flex items-center gap-4">
            {/* Recent Searches */}
            {mockRecentSearches.length > 0 && (
              <div className="hidden md:flex items-center gap-2">
                <History className="h-4 w-4 text-gray-400" />
                {mockRecentSearches.slice(0, 2).map((search, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(search)}
                    className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}
            
            <p className="text-muted-foreground text-sm">
              {isLoading ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                <span>{products.length} results</span>
              )}
            </p>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
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
                {filters.minRating} Stars & above
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
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-b border-purple-100">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-14 w-full max-w-3xl mx-auto" />
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
