'use client';

import { useState } from 'react';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import type { SearchFacets } from '@/types';

interface FilterSidebarProps {
  facets?: SearchFacets;
  filters: {
    brands?: string[];
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
  };
  onFilterChange: (filters: FilterSidebarProps['filters']) => void;
  className?: string;
}

export function FilterSidebar({ facets, filters, onFilterChange, className }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['brands', 'price', 'rating']);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 100000,
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleBrandToggle = (brandSlug: string) => {
    const brands = filters.brands || [];
    const newBrands = brands.includes(brandSlug)
      ? brands.filter((b) => b !== brandSlug)
      : [...brands, brandSlug];
    onFilterChange({ ...filters, brands: newBrands });
  };

  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value);
  };

  const applyPriceRange = () => {
    onFilterChange({ ...filters, minPrice: priceRange[0], maxPrice: priceRange[1] });
  };

  const handleRatingChange = (rating: number) => {
    onFilterChange({ ...filters, minRating: filters.minRating === rating ? undefined : rating });
  };

  const handleInStockToggle = () => {
    onFilterChange({ ...filters, inStock: !filters.inStock });
  };

  const clearAllFilters = () => {
    onFilterChange({});
    setPriceRange([0, 100000]);
  };

  const hasActiveFilters = Object.values(filters).some((v) => {
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined;
  });

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="font-semibold">Filters</span>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <button
          className="flex items-center justify-between w-full text-left"
          onClick={() => toggleSection('brands')}
        >
          <span className="font-medium text-sm">Brands</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              expandedSections.includes('brands') && 'rotate-180'
            )}
          />
        </button>
        {expandedSections.includes('brands') && (
          <div className="space-y-2 pl-1">
            {facets?.brands?.slice(0, 8).map((brand) => (
              <div key={brand.value} className="flex items-center gap-3">
                <Checkbox
                  id={`brand-${brand.value}`}
                  checked={filters.brands?.includes(brand.value)}
                  onCheckedChange={() => handleBrandToggle(brand.value)}
                />
                <Label
                  htmlFor={`brand-${brand.value}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {brand.label}
                </Label>
                <span className="text-xs text-muted-foreground">({brand.count})</span>
              </div>
            ))}
            {facets?.brands && facets.brands.length > 8 && (
              <Button variant="ghost" size="sm" className="text-xs">
                Show {facets.brands.length - 8} more
              </Button>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <button
          className="flex items-center justify-between w-full text-left"
          onClick={() => toggleSection('price')}
        >
          <span className="font-medium text-sm">Price Range</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              expandedSections.includes('price') && 'rotate-180'
            )}
          />
        </button>
        {expandedSections.includes('price') && (
          <div className="space-y-4 pl-1">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              onValueCommit={applyPriceRange}
              min={0}
              max={100000}
              step={500}
              className="w-full"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {formatCurrency(priceRange[0])}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(priceRange[1])}
              </span>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Rating */}
      <div className="space-y-3">
        <button
          className="flex items-center justify-between w-full text-left"
          onClick={() => toggleSection('rating')}
        >
          <span className="font-medium text-sm">Rating</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              expandedSections.includes('rating') && 'rotate-180'
            )}
          />
        </button>
        {expandedSections.includes('rating') && (
          <div className="space-y-2 pl-1">
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={filters.minRating === rating}
                  onCheckedChange={() => handleRatingChange(rating)}
                />
                <Label htmlFor={`rating-${rating}`} className="text-sm font-normal cursor-pointer">
                  {rating}★ & above
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Availability */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Checkbox
            id="in-stock"
            checked={filters.inStock}
            onCheckedChange={handleInStockToggle}
          />
          <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
            In Stock Only
          </Label>
        </div>
      </div>
    </div>
  );
}
