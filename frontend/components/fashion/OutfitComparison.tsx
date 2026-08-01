'use client';

import Image from 'next/image';
import { Star, TrendingUp, Award, Zap, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Outfit, OutfitItem } from '@/types';

interface OutfitComparisonProps {
  outfits: Outfit[];
}

const ASPECTS = [
  { key: 'totalPrice', label: 'Total Price', type: 'price' as const, lowerIsBetter: true },
  { key: 'style', label: 'Style Score', type: 'rating' as const },
  { key: 'comfort', label: 'Comfort', type: 'rating' as const },
  { key: 'trendScore', label: 'Trend Score', type: 'rating' as const },
  { key: 'aiConfidence', label: 'AI Confidence', type: 'rating' as const },
  { key: 'overall', label: 'Overall Score', type: 'rating' as const },
  { key: 'totalDiscount', label: 'Discount', type: 'percent' as const, higherIsBetter: true },
];

const CATEGORY_CONFIG = {
  best_selling: { label: 'Best Seller', color: 'bg-amber-100 text-amber-700', icon: Award },
  budget_friendly: { label: 'Budget Friendly', color: 'bg-green-100 text-green-700', icon: Zap },
  mid_range: { label: 'Mid Range', color: 'bg-blue-100 text-blue-700', icon: Star },
};

export function OutfitComparison({ outfits }: OutfitComparisonProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const getWinner = (aspect: typeof ASPECTS[0], getValue: (o: Outfit) => number) => {
    let best = 0;
    let winnerIndex = 0;
    
    outfits.forEach((outfit, index) => {
      const value = getValue(outfit);
      if (aspect.higherIsBetter) {
        if (value > best) {
          best = value;
          winnerIndex = index;
        }
      } else if (aspect.lowerIsBetter) {
        if (index === 0 || value < best) {
          best = value;
          winnerIndex = index;
        }
      } else {
        if (value > best) {
          best = value;
          winnerIndex = index;
        }
      }
    });
    
    return winnerIndex;
  };
  
  const renderValue = (aspect: typeof ASPECTS[0], value: number) => {
    switch (aspect.type) {
      case 'price':
        return formatCurrency(value);
      case 'rating':
        return (
          <div className="flex items-center gap-1 justify-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-bold">{value.toFixed(1)}</span>
            <span className="text-muted-foreground">/10</span>
          </div>
        );
      case 'percent':
        return (
          <span className="font-bold text-green-600">{value}%</span>
        );
      default:
        return value;
    }
  };
  
  const getValue = (outfit: Outfit, aspect: typeof ASPECTS[0]) => {
    switch (aspect.key) {
      case 'totalPrice':
        return outfit.totalPrice;
      case 'style':
        return outfit.ratings.style;
      case 'comfort':
        return outfit.ratings.comfort;
      case 'trendScore':
        return outfit.ratings.trendScore;
      case 'aiConfidence':
        return outfit.ratings.aiConfidence;
      case 'overall':
        return outfit.ratings.overall;
      case 'totalDiscount':
        return outfit.totalDiscount;
      default:
        return 0;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1" />
        {outfits.map((outfit) => {
          const config = CATEGORY_CONFIG[outfit.category];
          const Icon = config?.icon || Star;
          return (
            <div key={outfit.id} className="text-center">
              <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 relative mb-2">
                {outfit.items[0]?.product.images[0] && (
                  <Image
                    src={outfit.items[0].product.images[0].url}
                    alt={outfit.items[0].product.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <Badge className={`${config?.color} mb-2`}>
                <Icon className="h-3 w-3 mr-1" />
                {config?.label}
              </Badge>
              <h4 className="font-semibold text-sm line-clamp-1">{outfit.name}</h4>
              <p className="text-xs text-muted-foreground">{outfit.items.length} items</p>
            </div>
          );
        })}
      </div>
      
      {/* Comparison Table */}
      <div className="space-y-2">
        {ASPECTS.map((aspect) => {
          const winnerIndex = getWinner(aspect, (o) => getValue(o, aspect));
          
          return (
            <div
              key={aspect.key}
              className={`grid grid-cols-4 gap-4 p-3 rounded-lg ${
                aspect.key === 'totalPrice' || aspect.key === 'overall'
                  ? 'bg-purple-50'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center font-medium text-sm">
                {aspect.label}
                {aspect.lowerIsBetter && (
                  <span className="ml-1 text-xs text-muted-foreground">(lower is better)</span>
                )}
              </div>
              {outfits.map((outfit, index) => {
                const value = getValue(outfit, aspect);
                const isWinner = index === winnerIndex && outfits.length > 1;
                
                return (
                  <div
                    key={outfit.id}
                    className={`text-center rounded-lg p-2 ${
                      isWinner
                        ? 'bg-green-100 ring-2 ring-green-500'
                        : 'bg-white'
                    }`}
                  >
                    {renderValue(aspect, value)}
                    {isWinner && (
                      <Badge className="mt-1 bg-green-500 text-white text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Best
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      
      {/* AI Explanations */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">AI Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {outfits.map((outfit) => {
            const config = CATEGORY_CONFIG[outfit.category];
            return (
              <Card key={outfit.id} className="border-2 border-purple-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={config?.color}>
                      {config?.label}
                    </Badge>
                    <span className="text-sm font-medium">{outfit.name}</span>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-purple-700">Why this outfit?</p>
                      <p className="text-muted-foreground">{outfit.aiExplanation.whyItSuits}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-purple-700">Color combination</p>
                      <p className="text-muted-foreground">{outfit.aiExplanation.colorMatching}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-purple-700">Budget analysis</p>
                      <p className="text-muted-foreground">{outfit.aiExplanation.budgetFit}</p>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Body type: </span>
                        {outfit.aiExplanation.bodyTypeSuitability}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Weather: </span>
                        {outfit.aiExplanation.weatherAppropriate}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* Items Comparison */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Items Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Item</th>
                {outfits.map((outfit) => (
                  <th key={outfit.id} className="text-center py-3 px-4 font-medium min-w-[150px]">
                    {outfit.name.split(' - ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Collect all unique slots */}
              {Array.from(new Set(outfits.flatMap(o => o.items.map(i => i.slot)))).map((slot) => (
                <tr key={slot} className="border-b">
                  <td className="py-3 px-4 font-medium capitalize">
                    {slot.replace('_', ' ')}
                  </td>
                  {outfits.map((outfit) => {
                    const item = outfit.items.find(i => i.slot === slot);
                    return (
                      <td key={outfit.id} className="py-3 px-4 text-center">
                        {item ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted relative">
                              {item.product.images[0] && (
                                <Image
                                  src={item.product.images[0].url}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <p className="text-xs font-medium truncate max-w-[120px]">
                              {item.product.name}
                            </p>
                            <p className="text-xs font-bold text-purple-700">
                              {formatCurrency(item.price)}
                            </p>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">{item.product.rating}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-purple-50 font-bold">
                <td className="py-3 px-4">Total</td>
                {outfits.map((outfit) => (
                  <td key={outfit.id} className="py-3 px-4 text-center">
                    <span className="text-purple-700">{formatCurrency(outfit.totalPrice)}</span>
                    {outfit.totalDiscount > 0 && (
                      <span className="ml-2 text-green-600 text-sm">
                        (-{outfit.totalDiscount}%)
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Cross-sell Comparison */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Complete Your Look - Accessories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {outfits.map((outfit) => {
            if (outfit.crossSellItems.length === 0) return null;
            
            return (
              <div key={outfit.id} className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium mb-3">Recommended Accessories</p>
                <div className="space-y-2">
                  {outfit.crossSellItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-2">
                      <div className="w-12 h-12 rounded bg-muted overflow-hidden relative flex-shrink-0">
                        {item.product.images[0] && (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.product.brand.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-purple-700">{formatCurrency(item.price)}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{item.product.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
