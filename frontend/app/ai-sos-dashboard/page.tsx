'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles, Activity, TrendingUp, TrendingDown, DollarSign, Users,
  ShoppingCart, Package, Truck, Bot, AlertTriangle, CheckCircle, XCircle,
  Target, Lightbulb, BarChart3, PieChart, LineChart, Shield, Zap,
  Globe, Clock, ArrowUp, ArrowDown, Minus, RefreshCw, Settings,
  ChevronDown, ChevronUp, Eye, EyeOff, Play, Pause, Download,
  MapPin, Bell, Keyboard, Volume2, Contrast, Type, Moon, Sun, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type {
  ExecutiveMetrics, AISOSHealth, RevenueForecast, DemandForecast,
  RiskIntelligence, OpportunityIntelligence, LiveActivity, SimulationScenario,
  MarketplaceSimulation
} from '@/types';

// Mock Data
const mockExecutiveMetrics: ExecutiveMetrics = {
  marketplaceHealthScore: 94,
  trustScore: 92,
  aiPerformance: 97,
  totalRevenue: 45678900,
  revenueGrowth: 23.5,
  activeUsers: 234567,
  activeSellers: 12345,
  totalProducts: 567890,
  conversionRate: 3.8,
  avgOrderValue: 2345,
  customerSatisfaction: 4.6,
};

const mockAISOSHealth: AISOSHealth = {
  status: 'healthy',
  uptime: 99.97,
  activeMissions: 15,
  completedMissions: 1247,
  failedMissions: 3,
  avgResponseTime: 145,
  lastHealthCheck: new Date(),
};

const mockRevenueForecasts: RevenueForecast[] = [
  { period: 'daily', predicted: 1234567, lowerBound: 1100000, upperBound: 1400000, confidence: 95, drivers: ['Festival season', 'New product launches'], risks: ['Economic uncertainty', 'Competition'], opportunities: ['New markets', 'AI recommendations'] },
  { period: 'weekly', predicted: 8652340, lowerBound: 7800000, upperBound: 9500000, confidence: 92, drivers: ['Growing user base', 'Seller expansion'], risks: ['Seasonal variations'], opportunities: ['Holiday campaigns'] },
  { period: 'monthly', predicted: 34567890, lowerBound: 31000000, upperBound: 38000000, confidence: 88, drivers: ['AI optimization', 'Product variety'], risks: ['Market saturation'], opportunities: ['Premium segment'] },
  { period: 'quarterly', predicted: 125000000, lowerBound: 110000000, upperBound: 140000000, confidence: 85, drivers: ['Global expansion', 'Enterprise deals'], risks: ['Regulatory changes'], opportunities: ['Strategic partnerships'] },
  { period: 'annual', predicted: 520000000, lowerBound: 450000000, upperBound: 600000000, confidence: 78, drivers: ['Market leadership', 'AI-first strategy'], risks: ['Tech disruption'], opportunities: ['New verticals'] },
];

const mockDemandForecasts: DemandForecast[] = [
  { category: 'Electronics', predictedDemand: 45000, currentDemand: 38000, changePercent: 18.4, confidence: 92, seasonal: true, festival: true, trend: 'up' },
  { category: 'Fashion', predictedDemand: 32000, currentDemand: 28000, changePercent: 14.3, confidence: 89, seasonal: true, festival: false, trend: 'up' },
  { category: 'Home & Kitchen', predictedDemand: 18000, currentDemand: 15000, changePercent: 20.0, confidence: 87, seasonal: false, festival: true, trend: 'up' },
  { category: 'Beauty & Personal Care', predictedDemand: 22000, currentDemand: 21000, changePercent: 4.8, confidence: 85, seasonal: false, festival: false, trend: 'stable' },
  { category: 'Sports & Fitness', predictedDemand: 12000, currentDemand: 14000, changePercent: -14.3, confidence: 82, seasonal: true, festival: false, trend: 'down' },
];

const mockRisks: RiskIntelligence[] = [
  { id: '1', type: 'fraud', title: 'Payment Gateway Latency', description: 'Increased latency detected in payment processing', severity: 'high', score: 78, impact: 'May affect checkout conversion', mitigation: ['Scale payment gateway', 'Add fallback'], detectedAt: new Date(Date.now() - 3600000), status: 'active' },
  { id: '2', type: 'inventory', title: 'Seller Stockout Alert', description: 'Top 50 sellers have low stock on popular items', severity: 'medium', score: 65, impact: 'Potential lost sales', mitigation: ['Notify sellers', 'Show alternatives'], detectedAt: new Date(Date.now() - 7200000), status: 'mitigated' },
  { id: '3', type: 'security', title: 'Suspicious Login Patterns', description: 'Unusual login activity from multiple IPs', severity: 'critical', score: 89, impact: 'Account security risk', mitigation: ['Block IPs', 'Force MFA', 'Notify users'], detectedAt: new Date(Date.now() - 1800000), status: 'active' },
  { id: '4', type: 'churn', title: 'Increased Cart Abandonment', description: '15% increase in cart abandonment rate', severity: 'medium', score: 58, impact: 'Revenue loss', mitigation: ['Optimize checkout', 'Send reminders'], detectedAt: new Date(Date.now() - 14400000), status: 'active' },
];

const mockOpportunities: OpportunityIntelligence[] = [
  { id: '1', type: 'product', title: 'AI-Personalized Bundles', description: 'Create dynamic product bundles based on user preferences', revenuePotential: 2500000, roi: 340, confidence: 88, strategicImportance: 'high', status: 'evaluating', createdAt: new Date(Date.now() - 86400000) },
  { id: '2', type: 'market', title: 'Southeast Asia Expansion', description: 'Expand marketplace to Vietnam, Thailand, and Indonesia', revenuePotential: 15000000, roi: 180, confidence: 75, strategicImportance: 'high', status: 'discovered', createdAt: new Date(Date.now() - 172800000) },
  { id: '3', type: 'automation', title: 'AI-SOS Price Monitoring', description: 'Implement real-time AI monitoring for competitor prices', revenuePotential: 890000, roi: 420, confidence: 92, strategicImportance: 'medium', status: 'approved', createdAt: new Date(Date.now() - 259200000) },
  { id: '4', type: 'marketing', title: 'Festival Campaign Engine', description: 'Automated festival-specific campaigns for all regions', revenuePotential: 5600000, roi: 280, confidence: 85, strategicImportance: 'high', status: 'implemented', createdAt: new Date(Date.now() - 604800000) },
];

const mockLiveActivities: LiveActivity[] = [
  { id: '1', type: 'order', action: 'New order placed', location: 'Mumbai, India', timestamp: new Date(Date.now() - 30000) },
  { id: '2', type: 'user', action: 'New seller registered', location: 'Delhi, India', timestamp: new Date(Date.now() - 120000) },
  { id: '3', type: 'ai_agent', action: 'Price drop alert sent', location: 'Bangalore, India', timestamp: new Date(Date.now() - 180000) },
  { id: '4', type: 'delivery', action: 'Package delivered', location: 'Chennai, India', timestamp: new Date(Date.now() - 240000) },
  { id: '5', type: 'product', action: 'New product listed', location: 'Pune, India', timestamp: new Date(Date.now() - 300000) },
];

const mockSimulation: MarketplaceSimulation = {
  buyers: { total: 234567, active: 45678, healthy: 45000, warning: 500, critical: 178 },
  sellers: { total: 12345, active: 8923, healthy: 8700, warning: 200, critical: 23 },
  orders: { total: 567890, active: 1234, healthy: 1200, warning: 30, critical: 4 },
  products: { total: 567890, active: 456789, healthy: 450000, warning: 5000, critical: 1789 },
  aiAgents: { total: 50, active: 48, healthy: 48, warning: 0, critical: 0 },
  deliveries: { total: 123456, active: 8923, healthy: 8500, warning: 400, critical: 23 },
  sessions: { total: 789012, active: 23456, healthy: 23000, warning: 400, critical: 56 },
};

export default function AISOSDashboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedForecastPeriod, setSelectedForecastPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showSimulation, setShowSimulation] = useState(true);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };
  
  const formatPercent = (num: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'percent', maximumFractionDigits: 1 }).format(num / 100);
  };
  
  const getTimeAgo = (date: Date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  
  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };
  
  const selectedForecast = mockRevenueForecasts.find(f => f.period === selectedForecastPeriod) || mockRevenueForecasts[0];
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-950 text-white">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                      AI-SOS Digital Twin
                    </h1>
                    <p className="text-sm text-slate-400">Real-time Marketplace Intelligence</p>
                  </div>
                </div>
                
                {/* AI-SOS Health Badge */}
                <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full ${
                  mockAISOSHealth.status === 'healthy' 
                    ? 'bg-green-500/20 text-green-400' 
                    : mockAISOSHealth.status === 'degraded'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">AI-SOS: {mockAISOSHealth.status.toUpperCase()}</span>
                  <span className="text-xs opacity-75">{mockAISOSHealth.uptime.toFixed(2)}% uptime</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-slate-800 border-slate-700">
                  <Clock className="h-3 w-3 mr-1" />
                  Live
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-6">
          {/* Executive Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Health Score</span>
                  <Badge className={`${getHealthColor(mockExecutiveMetrics.marketplaceHealthScore).replace('text-', 'bg-')}/20`}>
                    {mockExecutiveMetrics.marketplaceHealthScore}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-white">{mockExecutiveMetrics.marketplaceHealthScore}%</div>
                <Progress value={mockExecutiveMetrics.marketplaceHealthScore} className="h-1 mt-2" />
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Revenue</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{formatCurrency(mockExecutiveMetrics.totalRevenue)}</div>
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <ArrowUp className="h-3 w-3" />
                  +{mockExecutiveMetrics.revenueGrowth}%
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Active Users</span>
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">{formatNumber(mockExecutiveMetrics.activeUsers)}</div>
                <div className="text-xs text-slate-400">Buyers & Sellers</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Products</span>
                  <Package className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold">{formatNumber(mockExecutiveMetrics.totalProducts)}</div>
                <div className="text-xs text-slate-400">Tracked</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">AI Performance</span>
                  <Bot className="h-4 w-4 text-pink-500" />
                </div>
                <div className="text-2xl font-bold">{mockExecutiveMetrics.aiPerformance}%</div>
                <div className="text-xs text-slate-400">{mockAISOSHealth.activeMissions} active</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Trust Score</span>
                  <Shield className="h-4 w-4 text-cyan-500" />
                </div>
                <div className="text-2xl font-bold">{mockExecutiveMetrics.trustScore}%</div>
                <div className="text-xs text-slate-400">Customer satisfaction</div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-slate-900/50 border border-slate-800">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="simulation">Simulation</TabsTrigger>
              <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
              <TabsTrigger value="risks">Risk Intelligence</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="activity">Live Activity</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Activity Feed */}
                <Card className="bg-slate-900/50 border-slate-800 lg:col-span-2">
                  <CardHeader className="border-b border-slate-800">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-500" />
                        Live Marketplace Activity
                      </span>
                      <Badge className="bg-green-500/20 text-green-400 animate-pulse">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-ping" />
                        LIVE
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-800">
                      {mockLiveActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              activity.type === 'order' ? 'bg-green-500/20 text-green-500' :
                              activity.type === 'user' ? 'bg-blue-500/20 text-blue-500' :
                              activity.type === 'ai_agent' ? 'bg-purple-500/20 text-purple-500' :
                              activity.type === 'delivery' ? 'bg-orange-500/20 text-orange-500' :
                              'bg-pink-500/20 text-pink-500'
                            }`}>
                              {activity.type === 'order' && <ShoppingCart className="h-5 w-5" />}
                              {activity.type === 'user' && <Users className="h-5 w-5" />}
                              {activity.type === 'ai_agent' && <Bot className="h-5 w-5" />}
                              {activity.type === 'delivery' && <Truck className="h-5 w-5" />}
                              {activity.type === 'product' && <Package className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="font-medium">{activity.action}</p>
                              <p className="text-sm text-slate-400 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {activity.location}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-slate-500">{getTimeAgo(activity.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* AI-SOS Mission Status */}
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader className="border-b border-slate-800">
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-purple-500" />
                      AI-SOS Missions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-500">{mockAISOSHealth.completedMissions}</p>
                        <p className="text-xs text-slate-400">Completed</p>
                      </div>
                      <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-500">{mockAISOSHealth.activeMissions}</p>
                        <p className="text-xs text-slate-400">Active</p>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-red-500">{mockAISOSHealth.failedMissions}</p>
                        <p className="text-xs text-slate-400">Failed</p>
                      </div>
                      <div className="p-3 bg-purple-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-purple-500">{mockAISOSHealth.avgResponseTime}ms</p>
                        <p className="text-xs text-slate-400">Avg Response</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">System Uptime</span>
                        <span className="font-medium text-green-500">{mockAISOSHealth.uptime.toFixed(2)}%</span>
                      </div>
                      <Progress value={mockAISOSHealth.uptime} className="h-2" />
                    </div>
                    
                    <div className="pt-2 border-t border-slate-800">
                      <p className="text-xs text-slate-500">
                        Last health check: {new Date(mockAISOSHealth.lastHealthCheck).toLocaleTimeString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Avg Order Value</p>
                      <p className="text-xl font-bold">{formatCurrency(mockExecutiveMetrics.avgOrderValue)}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Target className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Conversion Rate</p>
                      <p className="text-xl font-bold">{mockExecutiveMetrics.conversionRate}%</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Satisfaction</p>
                      <p className="text-xl font-bold">{mockExecutiveMetrics.customerSatisfaction}/5</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Active Sellers</p>
                      <p className="text-xl font-bold">{formatNumber(mockExecutiveMetrics.activeSellers)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Simulation Tab */}
            <TabsContent value="simulation" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Marketplace Simulation</h2>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={showSimulation} 
                    onCheckedChange={setShowSimulation}
                    id="show-simulation"
                  />
                  <label htmlFor="show-simulation" className="text-sm text-slate-400">
                    Show Details
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {[
                  { key: 'buyers', label: 'Buyers', icon: Users, color: 'blue' },
                  { key: 'sellers', label: 'Sellers', icon: ShoppingCart, color: 'green' },
                  { key: 'orders', label: 'Orders', icon: Package, color: 'purple' },
                  { key: 'products', label: 'Products', icon: Package, color: 'orange' },
                  { key: 'aiAgents', label: 'AI Agents', icon: Bot, color: 'pink' },
                  { key: 'deliveries', label: 'Deliveries', icon: Truck, color: 'cyan' },
                  { key: 'sessions', label: 'Sessions', icon: Activity, color: 'indigo' },
                ].map(({ key, label, icon: Icon, color }) => {
                  const entity = mockSimulation[key as keyof MarketplaceSimulation];
                  return (
                    <Card key={key} className="bg-slate-900/50 border-slate-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-slate-400">{label}</span>
                          <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
                            <Icon className={`h-4 w-4 text-${color}-500`} />
                          </div>
                        </div>
                        <div className="text-2xl font-bold mb-2">{formatNumber(entity.total)}</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Active</span>
                            <span className="text-green-500">{formatNumber(entity.active)}</span>
                          </div>
                          {showSimulation && (
                            <>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Healthy</span>
                                <span className="text-green-400">{entity.healthy}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Warning</span>
                                <span className="text-yellow-400">{entity.warning}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Critical</span>
                                <span className="text-red-400">{entity.critical}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            {/* Forecasts Tab */}
            <TabsContent value="forecasts" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Forecast */}
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader className="border-b border-slate-800">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        Revenue Forecast
                      </span>
                      <Select value={selectedForecastPeriod} onValueChange={(v: any) => setSelectedForecastPeriod(v)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-400 mb-1">Predicted Revenue</p>
                      <p className="text-4xl font-bold text-green-500">{formatCurrency(selectedForecast.predicted)}</p>
                      <div className="flex items-center justify-center gap-4 mt-2">
                        <span className="text-sm text-slate-500">
                          Range: {formatCurrency(selectedForecast.lowerBound)} - {formatCurrency(selectedForecast.upperBound)}
                        </span>
                        <Badge className="bg-green-500/20 text-green-400">
                          {selectedForecast.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <p className="text-sm font-medium text-green-400 mb-1">Revenue Drivers</p>
                        <ul className="text-xs text-slate-400 space-y-1">
                          {selectedForecast.drivers.map((d, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <ArrowUp className="h-3 w-3 text-green-500" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="p-3 bg-red-500/10 rounded-lg">
                        <p className="text-sm font-medium text-red-400 mb-1">Risk Factors</p>
                        <ul className="text-xs text-slate-400 space-y-1">
                          {selectedForecast.risks.map((r, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Demand Forecast */}
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader className="border-b border-slate-800">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                      Category Demand Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockDemandForecasts.map((forecast) => (
                      <div key={forecast.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{forecast.category}</span>
                            {forecast.seasonal && <Badge variant="outline" className="text-xs">Seasonal</Badge>}
                            {forecast.festival && <Badge variant="outline" className="text-xs">Festival</Badge>}
                          </div>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(forecast.trend)}
                            <span className={`text-sm font-medium ${
                              forecast.changePercent > 0 ? 'text-green-500' : 
                              forecast.changePercent < 0 ? 'text-red-500' : 'text-slate-500'
                            }`}>
                              {forecast.changePercent > 0 ? '+' : ''}{forecast.changePercent.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Current: {formatNumber(forecast.currentDemand)}</span>
                          <span>Predicted: {formatNumber(forecast.predictedDemand)}</span>
                          <span className="ml-auto">Confidence: {forecast.confidence}%</span>
                        </div>
                        <Progress 
                          value={(forecast.currentDemand / forecast.predictedDemand) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Risks Tab */}
            <TabsContent value="risks" className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="border-b border-slate-800">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    AI Risk Intelligence
                    <Badge className="ml-auto bg-red-500/20 text-red-400">
                      {mockRisks.filter(r => r.status === 'active').length} Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockRisks.map((risk) => (
                    <div key={risk.id} className={`p-4 rounded-lg border ${getSeverityColor(risk.severity)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {risk.severity === 'critical' && <XCircle className="h-5 w-5 text-red-500" />}
                          {risk.severity === 'high' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                          {risk.severity === 'medium' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                          <div>
                            <h4 className="font-semibold">{risk.title}</h4>
                            <p className="text-sm opacity-80">{risk.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{risk.score}</p>
                          <p className="text-xs opacity-60">Risk Score</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-current/20">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">{risk.type}</Badge>
                          <Badge variant="outline" className="text-xs capitalize">{risk.status}</Badge>
                        </div>
                        <span className="text-xs opacity-60">{getTimeAgo(risk.detectedAt)}</span>
                      </div>
                      {risk.mitigation.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-current/20">
                          <p className="text-xs font-medium mb-1">Recommended Actions:</p>
                          <ul className="text-xs opacity-80 space-y-1">
                            {risk.mitigation.map((m, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Opportunities Tab */}
            <TabsContent value="opportunities" className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="border-b border-slate-800">
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Opportunity Intelligence
                    <Badge className="ml-auto bg-green-500/20 text-green-400">
                      {mockOpportunities.length} Discovered
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockOpportunities.map((opp) => (
                      <div key={opp.id} className="p-4 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-slate-600 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Badge variant="outline" className="mb-2">{opp.type}</Badge>
                            <h4 className="font-semibold">{opp.title}</h4>
                            <p className="text-sm text-slate-400 mt-1">{opp.description}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="text-center p-2 bg-slate-800 rounded">
                            <p className="text-lg font-bold text-green-500">{formatCurrency(opp.revenuePotential)}</p>
                            <p className="text-xs text-slate-500">Revenue</p>
                          </div>
                          <div className="text-center p-2 bg-slate-800 rounded">
                            <p className="text-lg font-bold text-blue-500">{opp.roi}%</p>
                            <p className="text-xs text-slate-500">ROI</p>
                          </div>
                          <div className="text-center p-2 bg-slate-800 rounded">
                            <p className="text-lg font-bold text-purple-500">{opp.confidence}%</p>
                            <p className="text-xs text-slate-500">Confidence</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={`${
                            opp.strategicImportance === 'high' ? 'bg-red-500/20 text-red-400' :
                            opp.strategicImportance === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {opp.strategicImportance} priority
                          </Badge>
                          <Badge variant="outline" className="capitalize">{opp.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Live Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="border-b border-slate-800">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-500" />
                      Real-time Activity Feed
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-800 max-h-[600px] overflow-y-auto">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            ['bg-green-500/20 text-green-500', 'bg-blue-500/20 text-blue-500', 
                             'bg-purple-500/20 text-purple-500', 'bg-orange-500/20 text-orange-500',
                             'bg-pink-500/20 text-pink-500'][i % 5]
                          }`}>
                            {[ShoppingCart, Users, Bot, Truck, Package][i % 5] && 
                              (() => {
                                const icons = [ShoppingCart, Users, Bot, Truck, Package];
                                const Icon = icons[i % 5];
                                return <Icon className="h-5 w-5" />;
                              })()
                            }
                          </div>
                          <div>
                            <p className="font-medium">
                              {['New order placed', 'User signed up', 'AI alert sent', 
                                'Delivery completed', 'Price updated'][i % 5]}
                            </p>
                            <p className="text-sm text-slate-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad'][i % 6]}, India
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-slate-500">
                            {new Date(Date.now() - i * 60000).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
