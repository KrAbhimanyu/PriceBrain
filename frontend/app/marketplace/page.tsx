'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Star,
  Download,
  Users,
  Filter,
  Grid,
  List,
  TrendingUp,
  Award,
  Zap,
  Shield,
  Code,
  Palette,
  ShoppingCart,
  Briefcase,
  Home,
  Gamepad2,
  Camera,
  Heart,
  Plane,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock marketplace data
const MOCK_AGENTS = [
  {
    id: '1',
    name: 'Price Intelligence Pro',
    slug: 'price-intelligence-pro',
    author: 'PriceBrain',
    shortDescription: 'Advanced price tracking and prediction for e-commerce',
    category: 'Commerce',
    pricing: 'free',
    rating: 4.8,
    reviews: 234,
    installs: 15420,
    icon: TrendingUp,
    color: 'bg-green-500',
    tags: ['price-tracking', 'prediction', 'analytics'],
    isFeatured: true,
    isVerified: true,
  },
  {
    id: '2',
    name: 'Smart Recommender',
    slug: 'smart-recommender',
    author: 'AI Labs',
    shortDescription: 'Personalized product recommendations using ML',
    category: 'Recommendation',
    pricing: 'subscription',
    price: 9.99,
    rating: 4.6,
    reviews: 189,
    installs: 8932,
    icon: Zap,
    color: 'bg-yellow-500',
    tags: ['recommendations', 'ml', 'personalization'],
    isFeatured: true,
    isVerified: true,
  },
  {
    id: '3',
    name: 'Deal Hunter',
    slug: 'deal-hunter',
    author: 'SavingsBot',
    shortDescription: 'Automatically find and alert best deals',
    category: 'Commerce',
    pricing: 'free',
    rating: 4.9,
    reviews: 567,
    installs: 45000,
    icon: Shield,
    color: 'bg-blue-500',
    tags: ['deals', 'alerts', 'savings'],
    isFeatured: true,
    isVerified: false,
  },
  {
    id: '4',
    name: 'Visual Search',
    slug: 'visual-search',
    author: 'VisionAI',
    shortDescription: 'Find products using images',
    category: 'Search',
    pricing: 'one_time',
    price: 29.99,
    rating: 4.5,
    reviews: 89,
    installs: 2341,
    icon: Camera,
    color: 'bg-purple-500',
    tags: ['visual-search', 'images', 'search'],
    isFeatured: false,
    isVerified: true,
  },
  {
    id: '5',
    name: 'Wishlist Manager',
    slug: 'wishlist-manager',
    author: 'PriceBrain',
    shortDescription: 'Smart wishlist with price drop alerts',
    category: 'Commerce',
    pricing: 'free',
    rating: 4.7,
    reviews: 312,
    installs: 28900,
    icon: Heart,
    color: 'bg-pink-500',
    tags: ['wishlist', 'alerts', 'tracking'],
    isFeatured: false,
    isVerified: false,
  },
  {
    id: '6',
    name: 'Budget Planner',
    slug: 'budget-planner',
    author: 'FinanceAI',
    shortDescription: 'Plan and track your shopping budget',
    category: 'Finance',
    pricing: 'subscription',
    price: 4.99,
    rating: 4.4,
    reviews: 156,
    installs: 5670,
    icon: Briefcase,
    color: 'bg-gray-600',
    tags: ['budget', 'planning', 'finance'],
    isFeatured: false,
    isVerified: true,
  },
];

const CATEGORIES = [
  { name: 'All', icon: Grid, count: 156 },
  { name: 'Commerce', icon: ShoppingCart, count: 45 },
  { name: 'Finance', icon: Briefcase, count: 28 },
  { name: 'Search', icon: Search, count: 34 },
  { name: 'Recommendation', icon: Star, count: 22 },
  { name: 'Home', icon: Home, count: 15 },
  { name: 'Travel', icon: Plane, count: 12 },
  { name: 'Gaming', icon: Gamepad2, count: 8 },
];

const PRICING_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Free', value: 'free' },
  { label: 'Subscription', value: 'subscription' },
  { label: 'One-time', value: 'one_time' },
];

export default function MarketplacePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPricing, setSelectedPricing] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [agents, setAgents] = useState(MOCK_AGENTS);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      searchQuery === '' ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || agent.category === selectedCategory;
    const matchesPricing =
      selectedPricing === 'all' || agent.pricing === selectedPricing;
    return matchesSearch && matchesCategory && matchesPricing;
  });

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-96 mb-8" />
        <div className="flex gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Agent Marketplace</h1>
            <p className="text-muted-foreground">
              Discover and install AI agents for your commerce needs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="outline">{MOCK_AGENTS.length} Agents</Badge>
          <Badge variant="outline">1.2M+ Installs</Badge>
          <Badge variant="outline">4.7 Avg Rating</Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.name}
                variant={selectedCategory === cat.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.name)}
                className="shrink-0"
              >
                <Icon className="h-4 w-4 mr-2" />
                {cat.name}
                <Badge variant="secondary" className="ml-2">
                  {cat.count}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Pricing Filters */}
        <div className="flex gap-2">
          <Filter className="h-4 w-4 text-muted-foreground mt-2" />
          {PRICING_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              variant={selectedPricing === filter.value ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPricing(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Agents */}
      {selectedCategory === 'All' && selectedPricing === 'all' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Featured Agents
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {filteredAgents
              .filter((a) => a.isFeatured)
              .map((agent) => (
                <Link key={agent.id} href={`/marketplace/${agent.slug}`}>
                  <Card className="hover:shadow-lg transition-all border-yellow-200 bg-gradient-to-br from-yellow-50 to-white h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-xl ${agent.color} text-white`}
                        >
                          <agent.icon className="h-7 w-7" />
                        </div>
                        <Badge className="bg-yellow-500">Featured</Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{agent.name}</h3>
                        {agent.isVerified && (
                          <Shield className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {agent.shortDescription}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {agent.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {formatNumber(agent.installs)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* All Agents */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {selectedCategory === 'All' ? 'All Agents' : selectedCategory}
        </h2>
        <div
          className={
            viewMode === 'grid'
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          }
        >
          {filteredAgents.map((agent) => {
            const Icon = agent.icon;
            if (viewMode === 'list') {
              return (
                <Link key={agent.id} href={`/marketplace/${agent.slug}`}>
                  <Card className="hover:shadow-lg transition-all h-full">
                    <CardContent className="p-4 flex gap-4">
                      <div
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${agent.color} text-white`}
                      >
                        <Icon className="h-8 w-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold truncate">
                            {agent.name}
                          </h3>
                          {agent.isVerified && (
                            <Shield className="h-4 w-4 text-blue-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate mb-2">
                          {agent.shortDescription}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="outline">{agent.category}</Badge>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {agent.rating} ({agent.reviews})
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Download className="h-4 w-4" />
                            {formatNumber(agent.installs)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge
                          variant={
                            agent.pricing === 'free' ? 'secondary' : 'default'
                          }
                        >
                          {agent.pricing === 'free'
                            ? 'Free'
                            : `$${agent.price}`}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            }

            return (
              <Link key={agent.id} href={`/marketplace/${agent.slug}`}>
                <Card className="hover:shadow-lg transition-all h-full group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${agent.color} text-white group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge
                        variant={
                          agent.pricing === 'free' ? 'secondary' : 'default'
                        }
                      >
                        {agent.pricing === 'free'
                          ? 'Free'
                          : `$${agent.price}`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{agent.name}</h3>
                      {agent.isVerified && (
                        <Shield className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {agent.shortDescription}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {agent.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-4 w-full">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {agent.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {formatNumber(agent.installs)}
                      </span>
                      <span className="ml-auto text-xs">
                        by {agent.author}
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
