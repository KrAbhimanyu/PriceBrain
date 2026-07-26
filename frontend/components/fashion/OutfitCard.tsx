'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, TrendingUp, ShoppingCart, Heart, Check, 
  ChevronDown, ChevronUp, ExternalLink, Award, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Outfit, OutfitItem } from '@/types';

interface OutfitCardProps {
  outfit: Outfit;
  isSelected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}

const CATEGORY_CONFIG = {
  best_selling: { label: 'Best Seller', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Award },
  budget_friendly: { label: 'Budget Friendly', color: 'bg-green-100 text-green-700 border-green-200', icon: Zap },
  mid_range: { label: 'Mid Range', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Star },
};

const SLOT_LABELS: Record<string, string> = {
  top: 'Top',
  bottom: 'Bottom',
  dress: 'Dress',
  outerwear: 'Blazer/Outerwear',
  footwear: 'Footwear',
  accessory: 'Accessory',
  watch: 'Watch',
  jewelry: 'Jewelry',
  bag: 'Bag',
  belt: 'Belt',
  sunglasses: 'Sunglasses',
  hat: 'Hat',
  scarf: 'Scarf',
  perfume: 'Perfume',
  socks: 'Socks',
  tie: 'Tie',
  pocket_square: 'Pocket Square',
};

export function OutfitCard({ outfit, isSelected, onSelect, compact = false }: OutfitCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  
  const categoryConfig = CATEGORY_CONFIG[outfit.category];
  const CategoryIcon = categoryConfig?.icon || Star;
  
  const primaryItem = outfit.items.find(item => item.isPrimary) || outfit.items[0];
  const visibleItems = showAllItems ? outfit.items : outfit.items.slice(0, 4);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const renderRating = (rating: number) => (
    <div className="flex items-center gap-1">
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      <span className="text-xs font-medium">{rating.toFixed(1)}</span>
    </div>
  );
  
  return (
    <Card className={`overflow-hidden transition-all duration-300 ${
      isSelected 
        ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-200' 
        : 'hover:shadow-md'
    } ${compact ? 'border-l-4 border-l-purple-500' : ''}`}>
      {/* Header with Image */}
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
        {primaryItem && (
          <Image
            src={primaryItem.product.images[0]?.url || '/placeholder.png'}
            alt={primaryItem.product.name}
            fill
            className="object-cover"
          />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge className={`${categoryConfig?.color || 'bg-purple-100 text-purple-700'} shadow-sm`}>
            <CategoryIcon className="h-3 w-3 mr-1" />
            {categoryConfig?.label}
          </Badge>
          {outfit.totalDiscount > 20 && (
            <Badge className="bg-green-500 text-white shadow-sm">
              {outfit.totalDiscount}% OFF
            </Badge>
          )}
        </div>
        
        {/* Selection Checkbox */}
        {onSelect && (
          <button
            onClick={onSelect}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-purple-500 text-white'
                : 'bg-white/80 text-muted-foreground hover:bg-white'
            }`}
          >
            {isSelected ? <Check className="h-4 w-4" /> : null}
          </button>
        )}
        
        {/* Price Tag */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-purple-700">
                {formatCurrency(outfit.totalPrice)}
              </span>
              {outfit.originalTotalPrice > outfit.totalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(outfit.originalTotalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{outfit.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {outfit.description}
        </p>
        
        {/* Ratings */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
            <span className="text-xs text-purple-700">Style</span>
            {renderRating(outfit.ratings.style)}
          </div>
          <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
            <span className="text-xs text-blue-700">Comfort</span>
            {renderRating(outfit.ratings.comfort)}
          </div>
          <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
            <span className="text-xs text-green-700">AI Score</span>
            {renderRating(outfit.ratings.aiConfidence)}
          </div>
          <div className="flex items-center justify-between bg-orange-50 rounded-lg px-3 py-2">
            <span className="text-xs text-orange-700">Trend</span>
            {renderRating(outfit.ratings.trendScore)}
          </div>
        </div>
        
        {/* Items Preview */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-medium text-muted-foreground">
            Includes {outfit.items.length} items
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-14 h-14 rounded-lg bg-muted overflow-hidden relative"
                title={item.product.name}
              >
                {item.product.images[0] && (
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            ))}
            {!showAllItems && outfit.items.length > 4 && (
              <button
                onClick={() => setShowAllItems(true)}
                className="flex-shrink-0 w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 hover:bg-purple-200 transition-colors"
              >
                <span className="text-xs font-medium">+{outfit.items.length - 4}</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Expand/Collapse Details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-sm text-purple-600 hover:text-purple-700 py-2 border-t border-dashed border-purple-200"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              View All Details
            </>
          )}
        </button>
        
        {/* Expanded Content */}
        {expanded && (
          <div className="mt-4 space-y-4 border-t border-purple-100 pt-4">
            {/* AI Explanation */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                AI Style Notes
              </h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p><span className="font-medium">Why it suits you:</span> {outfit.aiExplanation.whyItSuits}</p>
                <p><span className="font-medium">Color matching:</span> {outfit.aiExplanation.colorMatching}</p>
                <p><span className="font-medium">Style tips:</span> {outfit.aiExplanation.styleNotes}</p>
              </div>
            </div>
            
            {/* Item Details */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Complete Look</h4>
              {outfit.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-white overflow-hidden relative flex-shrink-0">
                      {item.product.images[0] && (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{SLOT_LABELS[item.slot]}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-bold">{formatCurrency(item.price)}</p>
                    {item.discount > 0 && (
                      <p className="text-xs text-green-600">-{item.discount}%</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Cross-sell Items */}
            {outfit.crossSellItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Complete Your Look</h4>
                <div className="grid grid-cols-2 gap-2">
                  {outfit.crossSellItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/product/${item.product.slug}`}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="w-12 h-12 rounded bg-white overflow-hidden relative flex-shrink-0">
                        {item.product.images[0] && (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{item.product.name}</p>
                        <p className="text-xs font-bold text-purple-700">{formatCurrency(item.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-purple-100">
          <Button variant="outline" className="flex-1 border-purple-200 hover:bg-purple-50">
            <Heart className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for lists
export function OutfitCardCompact({ outfit, isSelected, onSelect }: OutfitCardProps) {
  const categoryConfig = CATEGORY_CONFIG[outfit.category];
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'bg-purple-100 border border-purple-300'
          : 'bg-white border border-gray-200 hover:border-purple-300'
      }`}
      onClick={onSelect}
    >
      <div className="w-16 h-16 rounded bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden relative flex-shrink-0">
        {outfit.items[0]?.product.images[0] && (
          <Image
            src={outfit.items[0].product.images[0].url}
            alt={outfit.items[0].product.name}
            fill
            className="object-cover"
          />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${categoryConfig?.color}`}>
            {categoryConfig?.label}
          </span>
        </div>
        <p className="text-sm font-medium truncate">{outfit.name}</p>
        <p className="text-xs text-muted-foreground">{outfit.items.length} items</p>
      </div>
      
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-purple-700">{formatCurrency(outfit.totalPrice)}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          {outfit.ratings.overall.toFixed(1)}
        </div>
      </div>
      
      {isSelected && (
        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}
