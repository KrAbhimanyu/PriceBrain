'use client';

import { useState, useEffect } from 'react';
import {
  Zap,
  Search,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Copy,
  Code,
  Database,
  ShoppingCart,
  Star,
  Bell,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MOCK_TOOLS = [
  {
    id: '1',
    name: 'search.products',
    category: 'Commerce',
    description: 'Search products across multiple sources',
    inputSchema: { query: 'string', filters: 'object', limit: 'number' },
    outputSchema: { results: 'array', count: 'number' },
    invocations: 15620,
    successRate: 99.2,
    avgTime: 45,
    isSystem: true,
    icon: Search,
    color: 'bg-blue-500',
  },
  {
    id: '2',
    name: 'get.price_history',
    category: 'Analytics',
    description: 'Get historical price data for products',
    inputSchema: { productId: 'string', days: 'number' },
    outputSchema: { history: 'array', stats: 'object' },
    invocations: 8934,
    successRate: 98.5,
    avgTime: 120,
    isSystem: true,
    icon: TrendingUp,
    color: 'bg-green-500',
  },
  {
    id: '3',
    name: 'compare.products',
    category: 'Commerce',
    description: 'Compare multiple products side by side',
    inputSchema: { productIds: 'array' },
    outputSchema: { comparison: 'object' },
    invocations: 4521,
    successRate: 99.8,
    avgTime: 89,
    isSystem: true,
    icon: Star,
    color: 'bg-yellow-500',
  },
  {
    id: '4',
    name: 'get.recommendations',
    category: 'Recommendation',
    description: 'Get personalized product recommendations',
    inputSchema: { context: 'object', count: 'number' },
    outputSchema: { recommendations: 'array' },
    invocations: 12450,
    successRate: 97.8,
    avgTime: 156,
    isSystem: true,
    icon: Zap,
    color: 'bg-purple-500',
  },
  {
    id: '5',
    name: 'send.notification',
    category: 'Communication',
    description: 'Send notifications to users',
    inputSchema: { userId: 'string', message: 'string', type: 'string' },
    outputSchema: { sent: 'boolean' },
    invocations: 34200,
    successRate: 99.9,
    avgTime: 23,
    isSystem: true,
    icon: Bell,
    color: 'bg-pink-500',
  },
  {
    id: '6',
    name: 'create.wishlist',
    category: 'Commerce',
    description: 'Create and manage wishlists',
    inputSchema: { userId: 'string', productId: 'string' },
    outputSchema: { created: 'boolean', wishlistId: 'string' },
    invocations: 8920,
    successRate: 99.1,
    avgTime: 34,
    isSystem: false,
    icon: ShoppingCart,
    color: 'bg-orange-500',
  },
  {
    id: '7',
    name: 'check.policy',
    category: 'Security',
    description: 'Evaluate policies and permissions',
    inputSchema: { context: 'object', policyId: 'string' },
    outputSchema: { allowed: 'boolean', reasons: 'array' },
    invocations: 45600,
    successRate: 100,
    avgTime: 12,
    isSystem: true,
    icon: Settings,
    color: 'bg-gray-600',
  },
  {
    id: '8',
    name: 'query.knowledge_graph',
    category: 'Knowledge',
    description: 'Query the knowledge graph',
    inputSchema: { query: 'string', depth: 'number' },
    outputSchema: { results: 'array', confidence: 'number' },
    invocations: 6780,
    successRate: 95.6,
    avgTime: 234,
    isSystem: true,
    icon: Database,
    color: 'bg-cyan-500',
  },
];

const MOCK_INVOCATIONS = [
  { id: '1', tool: 'search.products', status: 'completed', time: 45, timestamp: '2m ago' },
  { id: '2', tool: 'get.price_history', status: 'completed', time: 120, timestamp: '5m ago' },
  { id: '3', tool: 'send.notification', status: 'completed', time: 23, timestamp: '8m ago' },
  { id: '4', tool: 'check.policy', status: 'failed', time: 12, timestamp: '12m ago', error: 'Permission denied' },
  { id: '5', tool: 'compare.products', status: 'completed', time: 89, timestamp: '15m ago' },
];

const CATEGORIES = [
  { name: 'All', count: 24 },
  { name: 'Commerce', count: 8 },
  { name: 'Analytics', count: 4 },
  { name: 'Communication', count: 3 },
  { name: 'Security', count: 2 },
  { name: 'Knowledge', count: 3 },
  { name: 'Recommendation', count: 4 },
];

export default function ToolsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('tools');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredTools = MOCK_TOOLS.filter((tool) => {
    const matchesSearch =
      searchQuery === '' ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalInvocations = MOCK_TOOLS.reduce((sum, t) => sum + t.invocations, 0);
  const avgSuccessRate =
    MOCK_TOOLS.reduce((sum, t) => sum + t.successRate, 0) / MOCK_TOOLS.length;
  const avgTime =
    MOCK_TOOLS.reduce((sum, t) => sum + t.avgTime, 0) / MOCK_TOOLS.length;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-96 mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Tool Bus</h1>
            <p className="text-muted-foreground">
              Unified capability invocation for AI agents
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tools</p>
                <p className="text-2xl font-bold">{MOCK_TOOLS.length}</p>
              </div>
              <Zap className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Invocations</p>
                <p className="text-2xl font-bold">
                  {(totalInvocations / 1000).toFixed(1)}k
                </p>
              </div>
              <Play className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Time</p>
                <p className="text-2xl font-bold">{avgTime.toFixed(0)}ms</p>
              </div>
              <Clock className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="invocations">Invocations</TabsTrigger>
          <TabsTrigger value="schemas">Schemas</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'tools' && (
        <>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.name}
                  variant={selectedCategory === cat.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  {cat.name}
                  <Badge variant="secondary" className="ml-2">
                    {cat.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card key={tool.id} className="hover:shadow-lg transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${tool.color} text-white`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{tool.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {tool.category}
                          </Badge>
                        </div>
                      </div>
                      {tool.isSystem && (
                        <Badge variant="secondary">System</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {tool.description}
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Invocations</p>
                        <p className="font-medium">{tool.invocations.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success</p>
                        <p className="font-medium text-green-600">
                          {tool.successRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Time</p>
                        <p className="font-medium">{tool.avgTime}ms</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                      <Button size="sm" variant="outline">
                        <Code className="h-4 w-4 mr-1" />
                        Schema
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'invocations' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Invocations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_INVOCATIONS.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {inv.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {inv.status === 'failed' && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    {inv.status === 'running' && (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">{inv.tool}</p>
                      <p className="text-sm text-muted-foreground">
                        {inv.timestamp}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {inv.error && (
                      <Badge variant="destructive">{inv.error}</Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {inv.time}ms
                    </span>
                    <Badge
                      variant={
                        inv.status === 'completed'
                          ? 'secondary'
                          : inv.status === 'failed'
                          ? 'destructive'
                          : 'default'
                      }
                    >
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'schemas' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tool Schemas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTools.slice(0, 4).map((tool) => (
                <div key={tool.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-mono text-sm">{tool.name}</h4>
                    <Button size="sm" variant="ghost">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(
                      {
                        input: tool.inputSchema,
                        output: tool.outputSchema,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
