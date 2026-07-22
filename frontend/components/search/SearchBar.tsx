'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce, useClickOutside } from '@/hooks';
import { searchService } from '@/services/api';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'search';
}

interface SearchBarProps {
  variant?: 'default' | 'hero';
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({ variant = 'default', className, autoFocus }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  useClickOutside(containerRef, () => setIsOpen(false));

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const fetchSuggestions = async (q: string) => {
    setIsLoading(true);
    try {
      const { data } = await searchService.suggestions(q);
      setSuggestions(data || []);
      setIsOpen(true);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery || query;
    if (q.trim()) {
      // Save to recent searches
      const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search products, brands, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          className={cn(
            'pl-12 pr-12 h-12 text-base rounded-xl',
            variant === 'hero' && 'h-14 text-lg rounded-xl shadow-lg'
          )}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={clearQuery}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {variant === 'hero' && (
          <Button
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6"
            onClick={() => handleSearch()}
          >
            Search
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background rounded-xl border border-border shadow-elevated overflow-hidden z-50">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                  onClick={() => {
                    if (suggestion.type === 'search') {
                      handleSearch(suggestion.text);
                    } else {
                      router.push(`/search?q=${encodeURIComponent(suggestion.text)}`);
                      setIsOpen(false);
                    }
                  }}
                >
                  {suggestion.type === 'product' && (
                    <Search className="h-4 w-4 text-muted-foreground" />
                  )}
                  {suggestion.type === 'category' && (
                    <TrendingUp className="h-4 w-4 text-primary" />
                  )}
                  {suggestion.type === 'brand' && (
                    <span className="h-4 w-4 flex items-center justify-center text-xs font-bold text-muted-foreground">
                      B
                    </span>
                  )}
                  {suggestion.type === 'search' && (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="flex-1 text-sm">{suggestion.text}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No suggestions found. Press Enter to search.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
