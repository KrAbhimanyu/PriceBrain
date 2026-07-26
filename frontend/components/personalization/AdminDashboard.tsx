'use client';

import Link from 'next/link';
import { 
  Activity, AlertTriangle, Bell, CheckCircle, Clock, 
  DollarSign, Eye, Filter, Globe, Package, Plus, 
  Search, Settings, TrendingUp, TrendingDown, Users, 
  XCircle, BarChart3, ShoppingBag, RefreshCw, Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePersonalization } from '@/providers';
import type { 
  MarketplaceHealthMetric, 
  LiveAlert, 
  ExecutiveMetric 
} from '@/types';

function MarketplaceHealthCard({ metric }: { metric: MarketplaceHealthMetric }) {
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    healthy: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  };
  
  const trendIcons: Record<string, React.ElementType> = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Activity,
  };
  
  const colors = statusColors[metric.status];
  const TrendIcon = trendIcons[metric.trend];
  
  return (
    <Card className={`border-l-4 ${colors.border}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm font-medium text-slate-600">{metric.name}</span>
          <Badge className={`${colors.bg} ${colors.text} border-0`}>
            {metric.status}
          </Badge>
        </div>
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold">{metric.value}%</span>
            <div className={`flex items-center gap-1 text-sm ${
              metric.trend === 'up' ? 'text-green-600' : 
              metric.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              <TrendIcon className="h-4 w-4" />
              {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Current</span>
              <span>Target: {metric.target}%</span>
            </div>
            <Progress value={metric.value} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LiveAlertCard({ alert, onMarkRead }: { alert: LiveAlert; onMarkRead: (id: string) => void }) {
  const severityConfig: Record<string, { icon: React.ElementType; bg: string; border: string }> = {
    info: { icon: Bell, bg: 'bg-blue-100', border: 'border-blue-200' },
    warning: { icon: AlertTriangle, bg: 'bg-yellow-100', border: 'border-yellow-200' },
    critical: { icon: XCircle, bg: 'bg-red-100', border: 'border-red-200' },
  };
  
  const typeIcons: Record<string, React.ElementType> = {
    scraper: RefreshCw,
    system: Activity,
    user: Users,
    revenue: DollarSign,
  };
  
  const config = severityConfig[alert.severity];
  const TypeIcon = typeIcons[alert.type] || Bell;
  const Icon = config.icon;
  
  const timeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${config.border} ${
      alert.isRead ? 'bg-white opacity-75' : 'bg-white'
    }`}>
      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-4 w-4 ${alert.severity === 'critical' ? 'text-red-600' : 
          alert.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{alert.title}</span>
              {!alert.isRead && (
                <span className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {alert.message}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {timeAgo(alert.timestamp)}
            </span>
            {alert.actionUrl && (
              <Link href={alert.actionUrl} className="text-primary text-xs">
                View
              </Link>
            )}
            {!alert.isRead && (
              <button 
                onClick={() => onMarkRead(alert.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs capitalize">
            <TypeIcon className="h-3 w-3 mr-1" />
            {alert.type}
          </Badge>
          <Badge variant="outline" className={`text-xs capitalize ${
            alert.severity === 'critical' ? 'border-red-200 text-red-600' :
            alert.severity === 'warning' ? 'border-yellow-200 text-yellow-600' :
            'border-blue-200 text-blue-600'
          }`}>
            {alert.severity}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function ExecutiveMetricCard({ metric }: { metric: ExecutiveMetric }) {
  const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    revenue: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    users: { icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    products: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
    engagement: { icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100' },
  };
  
  const config = categoryConfig[metric.category] || categoryConfig.engagement;
  const Icon = config.icon;
  const isPositive = metric.changePercent > 0;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(metric.changePercent)}%
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
          <p className="text-3xl font-bold mb-1">{metric.formattedValue}</p>
          <p className="text-xs text-muted-foreground">
            {isPositive ? '+' : ''}₹{metric.change.toLocaleString()} this period
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const { 
    marketplaceHealth, 
    liveAlerts, 
    executiveMetrics,
    user 
  } = usePersonalization();
  
  const firstName = user?.name?.split(' ')[0] || 'there';
  
  const stats = [
    { label: 'Total Products', value: '12,456', change: '+12%', trend: 'up', icon: Package },
    { label: 'Active Users', value: '8,234', change: '+8%', trend: 'up', icon: Users },
    { label: 'Total Retailers', value: '24', change: '0%', trend: 'neutral', icon: ShoppingBag },
    { label: 'Commission Earned', value: '₹1,45,678', change: '+23%', trend: 'up', icon: TrendingUp },
  ];
  
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <span className="font-bold text-slate-900">PriceBrain</span>
              </Link>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Admin Panel
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {liveAlerts.filter(a => !a.isRead).length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {liveAlerts.filter(a => !a.isRead).length}
                  </span>
                )}
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.[0] || 'A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Executive Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {firstName}. Here&apos;s the overview of your marketplace.
          </p>
        </div>
        
        {/* Executive Metrics */}
        {executiveMetrics.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Key Metrics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {executiveMetrics.map((metric) => (
                <ExecutiveMetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          </section>
        )}
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Marketplace Health - 2 columns */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold">Marketplace Health</h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                  Healthy
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5" />
                  Warning
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
                  Critical
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketplaceHealth.map((metric) => (
                <MarketplaceHealthCard key={metric.id} metric={metric} />
              ))}
            </div>
          </section>
          
          {/* Live Alerts - 1 column */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-semibold">Live Alerts</h2>
                {liveAlerts.filter(a => !a.isRead).length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {liveAlerts.filter(a => !a.isRead).length} new
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/alerts">View all</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {liveAlerts.slice(0, 4).map((alert) => (
                <LiveAlertCard 
                  key={alert.id} 
                  alert={alert} 
                  onMarkRead={(id) => console.log('Mark read:', id)} 
                />
              ))}
              {liveAlerts.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <p className="font-medium">All clear!</p>
                    <p className="text-sm text-muted-foreground">No active alerts</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </div>
        
        {/* Quick Stats */}
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold">Platform Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center`}>
                      <stat.icon className="h-6 h-6 text-slate-600" />
                    </div>
                    <span className={`flex items-center gap-1 text-sm ${
                      stat.trend === 'up' ? 'text-green-600' : 
                      stat.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                       stat.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        {/* Quick Actions */}
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Plus className="h-5 w-5" />
              <span className="text-sm">Add Product</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <FileText className="h-5 w-5" />
              <span className="text-sm">Generate Report</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <RefreshCw className="h-5 w-5" />
              <span className="text-sm">Sync Retailers</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Settings className="h-5 w-5" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

// Add missing imports
function FileText({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
