'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles, DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown,
  BarChart3, Bot, Settings, Bell, ChevronRight, ArrowUp, ArrowDown, Minus,
  RefreshCw, Plus, Eye, Edit, Trash2, Zap, Target, Lightbulb, Wand2,
  Calendar, Clock, Star, AlertTriangle, CheckCircle, XCircle, Package as PackageIcon,
  Truck, CreditCard, Filter, Download, Search, Mic, ImageIcon, MoreVertical,
  Activity, Server, Shield, Database, Cloud, Cpu, Lock, EyeOff, Mail, Share2, Percent, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

// Mock Data
const mockStats = {
  revenue: { value: 456789, change: 23.5, trend: 'up' },
  orders: { value: 1234, change: 15.2, trend: 'up' },
  customers: { value: 456, change: 8.7, trend: 'up' },
  products: { value: 789, change: -2.3, trend: 'down' },
  conversionRate: { value: 3.8, change: 0.5, trend: 'up' },
  avgOrderValue: { value: 2345, change: 12.1, trend: 'up' },
};

const mockRecentOrders = [
  { id: 'ORD001', customer: 'Rahul Sharma', product: 'iPhone 15 Pro', amount: 129999, status: 'processing', time: '2 min ago' },
  { id: 'ORD002', customer: 'Priya Patel', product: 'MacBook Air M2', amount: 98999, status: 'shipped', time: '15 min ago' },
  { id: 'ORD003', customer: 'Amit Kumar', product: 'Samsung Galaxy S24', amount: 89999, status: 'delivered', time: '1 hour ago' },
  { id: 'ORD004', customer: 'Sneha Gupta', product: 'Sony WH-1000XM5', amount: 24999, status: 'processing', time: '2 hours ago' },
];

const mockLowStockProducts = [
  { name: 'iPhone 15 Pro Max 256GB', stock: 5, threshold: 20, status: 'critical' },
  { name: 'MacBook Pro 14" M3', stock: 8, threshold: 15, status: 'warning' },
  { name: 'AirPods Pro 2', stock: 12, threshold: 25, status: 'warning' },
];

const mockAIInsights = [
  { type: 'pricing', title: 'Price Optimization Opportunity', description: 'Your iPhone 14 is priced 5% higher than competitors. Consider reducing price to increase sales.', impact: 'high', savings: 12000 },
  { type: 'inventory', title: 'Restock Recommendation', description: 'AirPods Pro is selling fast. AI predicts stockout in 3 days.', impact: 'high', savings: 25000 },
  { type: 'marketing', title: 'Campaign Opportunity', description: 'Diwali is in 2 weeks. Start a campaign now to maximize reach.', impact: 'medium', savings: 45000 },
];

const mockCompetitorPrices = [
  { product: 'iPhone 15 Pro', myPrice: 129999, competitorPrice: 127999, competitor: 'Amazon' },
  { product: 'MacBook Air M2', myPrice: 98999, competitorPrice: 99999, competitor: 'Flipkart' },
  { product: 'Samsung S24', myPrice: 89999, competitorPrice: 87999, competitor: 'Myntra' },
];

const mockAISuggestions = [
  { category: 'SEO', title: 'Product Title Optimization', description: 'Add "2024 Model" to improve search ranking', roi: 340 },
  { category: 'Pricing', title: 'Dynamic Price Alert', description: 'Set automatic price matching with Amazon', roi: 280 },
  { category: 'Marketing', title: 'Bundle Deal', description: 'Create iPhone + AirPods bundle for 5% higher AOV', roi: 420 },
  { category: 'Inventory', title: 'Pre-order Setup', description: 'Enable pre-orders for upcoming iPhone 16', roi: 520 },
];

export default function SellerStudioPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-yellow-100 text-yellow-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Seller Studio</h1>
                  <p className="text-sm text-slate-500">AI-Powered Business Management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                AI Active
              </Badge>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                <Badge className="ml-2 bg-red-500 text-white">3</Badge>
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="ai-studio">AI Studio</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Revenue', value: mockStats.revenue.value, change: mockStats.revenue.change, trend: mockStats.revenue.trend, icon: DollarSign, color: 'green' },
                { label: 'Orders', value: mockStats.orders.value, change: mockStats.orders.change, trend: mockStats.orders.trend, icon: ShoppingCart, color: 'blue' },
                { label: 'Customers', value: mockStats.customers.value, change: mockStats.customers.change, trend: mockStats.customers.trend, icon: Users, color: 'purple' },
                { label: 'Products', value: mockStats.products.value, change: mockStats.products.change, trend: mockStats.products.trend, icon: Package, color: 'orange' },
                { label: 'Conv. Rate', value: `${mockStats.conversionRate.value}%`, change: mockStats.conversionRate.change, trend: mockStats.conversionRate.trend, icon: Target, color: 'cyan' },
                { label: 'Avg. Order', value: mockStats.avgOrderValue.value, change: mockStats.avgOrderValue.change, trend: mockStats.avgOrderValue.trend, icon: TrendingUp, color: 'pink' },
              ].map((stat, i) => (
                <Card key={i} className="bg-white dark:bg-slate-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-500">{stat.label}</span>
                      <div className={`w-8 h-8 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                        <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{typeof stat.value === 'number' && stat.label !== 'Conv. Rate' && stat.label !== 'Avg. Order' 
                      ? formatCurrency(stat.value) 
                      : stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {getTrendIcon(stat.trend)}
                      <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                        +{stat.change}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders */}
              <Card className="bg-white dark:bg-slate-900 lg:col-span-2">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-purple-500" />
                      Recent Orders
                    </CardTitle>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {mockRecentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <PackageIcon className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{order.customer}</p>
                            <p className="text-sm text-slate-500">{order.product}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(order.amount)}</p>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                        <span className="text-sm text-slate-500">{order.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* AI Insights */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200">
                <CardHeader className="border-b border-purple-100">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-purple-500" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockAIInsights.map((insight, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border border-purple-100">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">{insight.type}</Badge>
                        <span className="text-xs text-green-600 font-medium">+{formatCurrency(insight.savings)}</span>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                      <p className="text-xs text-slate-600">{insight.description}</p>
                    </div>
                  ))}
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Get More Insights
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Low Stock Alert */}
            <Card className="bg-white dark:bg-slate-900 border-orange-200">
              <CardHeader className="border-b border-orange-100">
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="h-5 w-5" />
                  Low Stock Alert
                  <Badge className="ml-auto bg-orange-100 text-orange-700">{mockLowStockProducts.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockLowStockProducts.map((product, i) => (
                    <div key={i} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          product.status === 'critical' ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                          {product.status === 'critical' ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-slate-500">Threshold: {product.threshold} units</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-bold ${product.status === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                            {product.stock} left
                          </p>
                          <Progress 
                            value={(product.stock / product.threshold) * 100} 
                            className={`h-2 w-24 ${product.status === 'critical' ? '[&>div]:bg-red-500' : '[&>div]:bg-yellow-500'}`} 
                          />
                        </div>
                        <Button size="sm" variant="outline">Restock</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* AI Studio Tab */}
          <TabsContent value="ai-studio" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI SEO Studio */}
              <Card className="bg-white dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-blue-500" />
                    AI SEO Studio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600">AI-powered product optimization</p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Product Titles
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="h-4 w-4 mr-2" />
                      Write Descriptions
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Tag className="h-4 w-4 mr-2" />
                      Generate Meta Tags
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Keyword Research
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* AI Marketing Studio */}
              <Card className="bg-white dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    AI Marketing Studio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600">AI-powered marketing campaigns</p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Zap className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Generate Coupons
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Marketing
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Share2 className="h-4 w-4 mr-2" />
                      Social Media Posts
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* AI Pricing Studio */}
              <Card className="bg-white dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-purple-500" />
                    AI Pricing Studio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600">AI-powered pricing optimization</p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Competitor Analysis
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Zap className="h-4 w-4 mr-2" />
                      Dynamic Pricing
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Percent className="h-4 w-4 mr-2" />
                      Discount Strategy
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Profit Optimization
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* AI Suggestions */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mockAISuggestions.map((suggestion, i) => (
                    <div key={i} className="p-4 bg-white rounded-lg border border-purple-100">
                      <Badge variant="outline" className="mb-2">{suggestion.category}</Badge>
                      <h4 className="font-medium mb-1">{suggestion.title}</h4>
                      <p className="text-sm text-slate-600 mb-3">{suggestion.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-600 font-medium">ROI: {suggestion.roi}%</span>
                        <Button size="sm" variant="outline">Apply</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Competitor Prices */}
            <Card className="bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  Competitor Price Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Your Price</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Competitor</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Difference</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {mockCompetitorPrices.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 font-medium">{item.product}</td>
                          <td className="px-4 py-3 font-bold">{formatCurrency(item.myPrice)}</td>
                          <td className="px-4 py-3">
                            <span className="text-slate-600">{item.competitor}</span>
                            <span className="ml-2 text-sm text-slate-500">{formatCurrency(item.competitorPrice)}</span>
                          </td>
                          <td className="px-4 py-3">
                            {item.myPrice > item.competitorPrice ? (
                              <Badge className="bg-red-100 text-red-700">
                                <ArrowUp className="h-3 w-3 mr-1" />
                                +{formatCurrency(item.myPrice - item.competitorPrice)}
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700">
                                <ArrowDown className="h-3 w-3 mr-1" />
                                {formatCurrency(item.myPrice - item.competitorPrice)}
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Button size="sm" variant="outline">Match Price</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Placeholder content for other tabs */}
          <TabsContent value="orders">
            <Card className="bg-white dark:bg-slate-900">
              <CardContent className="p-12 text-center">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-medium mb-2">Order Management</h3>
                <p className="text-slate-500 mb-4">View and manage all your orders</p>
                <Button>Go to Orders</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="products">
            <Card className="bg-white dark:bg-slate-900">
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-medium mb-2">Product Management</h3>
                <p className="text-slate-500 mb-4">Manage your product catalog</p>
                <Button>Go to Products</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card className="bg-white dark:bg-slate-900">
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-medium mb-2">Business Analytics</h3>
                <p className="text-slate-500 mb-4">Detailed insights and reports</p>
                <Button>View Analytics</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inventory">
            <Card className="bg-white dark:bg-slate-900">
              <CardContent className="p-12 text-center">
                <PackageIcon className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-medium mb-2">Inventory Management</h3>
                <p className="text-slate-500 mb-4">Track and manage your stock</p>
                <Button>Manage Inventory</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
