'use client';

import Link from 'next/link';
import { 
  Target, TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  Package, Users, ArrowUpRight, ArrowDownRight, Lightbulb,
  AlertTriangle, Zap, ChevronRight, Plus, Bell, Settings,
  BarChart3, Package as PackageIcon, ShoppingBag, Tag, FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePersonalization } from '@/providers';
import type { 
  SellerDailyGoal, 
  SellerRevenueCard, 
  SellerBusinessInsight, 
  SellerAISuggestion 
} from '@/types';

function DailyGoalCard({ goal }: { goal: SellerDailyGoal }) {
  const icons: Record<string, React.ElementType> = {
    revenue: DollarSign,
    orders: ShoppingCart,
    products: Package,
    customers: Users,
  };
  
  const colors: Record<string, string> = {
    revenue: 'text-green-600 bg-green-100',
    orders: 'text-blue-600 bg-blue-100',
    products: 'text-purple-600 bg-purple-100',
    customers: 'text-orange-600 bg-orange-100',
  };
  
  const Icon = icons[goal.type] || Target;
  const colorClass = colors[goal.type] || colors.revenue;
  
  const formatValue = (value: number, type: string) => {
    if (type === 'revenue') {
      return `₹${value.toLocaleString()}`;
    }
    return value.toString();
  };
  
  const isOnTrack = goal.progress >= 50;
  
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${isOnTrack ? 'bg-green-500' : 'bg-yellow-500'}`} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant={isOnTrack ? 'default' : 'secondary'} className="text-xs">
            {isOnTrack ? 'On Track' : 'Behind'}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold">
              {formatValue(goal.current, goal.type)}
            </span>
            <span className="text-sm text-muted-foreground">
              / {formatValue(goal.target, goal.type)}
            </span>
          </div>
          <Progress value={goal.progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {goal.progress}% complete
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueCard({ card }: { card: SellerRevenueCard }) {
  const isPositive = card.changeType === 'increase';
  const isNeutral = card.changeType === 'neutral';
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">{card.title}</span>
          <div className={`flex items-center gap-1 text-sm ${
            isNeutral ? 'text-muted-foreground' : 
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : isNeutral ? null : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            {card.change}%
          </div>
        </div>
        <p className="text-2xl font-bold mb-1">
          {card.title.includes('Value') ? '₹' : ''}{card.value.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground capitalize">{card.period}</p>
      </CardContent>
    </Card>
  );
}

function BusinessInsightCard({ insight }: { insight: SellerBusinessInsight }) {
  const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    opportunity: { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    alert: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
    tip: { icon: Lightbulb, color: 'text-blue-600', bg: 'bg-blue-100' },
    trend: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
  };
  
  const impactColors: Record<string, string> = {
    high: 'border-red-200',
    medium: 'border-yellow-200',
    low: 'border-blue-200',
  };
  
  const config = typeConfig[insight.type] || typeConfig.tip;
  const Icon = config.icon;
  
  return (
    <Card className={`border-l-4 ${impactColors[insight.impact]}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`h-4 w-4 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm">{insight.title}</h4>
              {insight.actionUrl && (
                <Link href={insight.actionUrl} className="text-primary text-xs flex items-center gap-1 flex-shrink-0">
                  Action <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {insight.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AISuggestionCard({ suggestion }: { suggestion: SellerAISuggestion }) {
  const categoryIcons: Record<string, React.ElementType> = {
    pricing: DollarSign,
    inventory: Package,
    marketing: Tag,
    product: ShoppingBag,
  };
  
  const categoryColors: Record<string, string> = {
    pricing: 'bg-green-100 text-green-700',
    inventory: 'bg-blue-100 text-blue-700',
    marketing: 'bg-purple-100 text-purple-700',
    product: 'bg-orange-100 text-orange-700',
  };
  
  const Icon = categoryIcons[suggestion.category] || Lightbulb;
  const colorClass = categoryColors[suggestion.category] || categoryColors.product;
  
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-lg ${colorClass} flex items-center justify-center`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
          {suggestion.title}
        </h4>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {suggestion.description}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-green-600">
            {suggestion.potentialImpact}
          </p>
          <Button size="sm" variant="outline" className="text-xs h-7">
            {suggestion.actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SellerDashboard() {
  const { 
    dailyGoals, 
    revenueCards, 
    businessInsights, 
    aiSuggestions,
    user 
  } = usePersonalization();
  
  const firstName = user?.name?.split(' ')[0] || 'there';
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: PackageIcon },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <span className="font-bold text-slate-900">PriceBrain</span>
              </Link>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Seller Dashboard
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.[0] || 'S'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {firstName}!
            </h1>
            <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your store today.</p>
          </div>
          <Button asChild>
            <Link href="/seller/products/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
        
        {/* Daily Goals Section */}
        {dailyGoals.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold">Daily Goals</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dailyGoals.map((goal) => (
                <DailyGoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </section>
        )}
        
        {/* Revenue Cards Section */}
        {revenueCards.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold">Revenue Overview</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {revenueCards.map((card) => (
                <RevenueCard key={card.id} card={card} />
              ))}
            </div>
          </section>
        )}
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Insights - 2 columns */}
          {businessInsights.length > 0 && (
            <section className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-lg font-semibold">Business Insights</h2>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/seller/insights">View all <ChevronRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </div>
              <div className="space-y-3">
                {businessInsights.map((insight) => (
                  <BusinessInsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </section>
          )}
          
          {/* Quick Actions - 1 column */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <Link href="/seller/products/add">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Plus className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Add New Product</p>
                      <p className="text-xs text-muted-foreground">List a new item</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/seller/analytics">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">View Analytics</p>
                      <p className="text-xs text-muted-foreground">Track performance</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/seller/orders">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Manage Orders</p>
                      <p className="text-xs text-muted-foreground">View & process</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>
        </div>
        
        {/* AI Suggestions Section */}
        {aiSuggestions.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Zap className="h-3 w-3 text-white" />
                </div>
                <h2 className="text-lg font-semibold">AI Suggestions</h2>
                <Badge variant="secondary" className="text-xs">Powered by AI</Badge>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/seller/ai-suggestions">View all <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiSuggestions.map((suggestion) => (
                <AISuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
