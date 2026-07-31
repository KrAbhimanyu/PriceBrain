'use client';

import { useState, useEffect } from 'react';
import {
  Cpu,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  GitBranch,
  Users,
  DollarSign,
  Target,
  Shield,
  History,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const MOCK_TWIN = {
  name: 'TechCorp India Digital Twin',
  syncStatus: 'synced',
  lastSyncAt: '2026-07-31T14:00:00Z',
  healthScore: 87,
  riskScore: 23,
  performanceScore: 91,
  components: {
    total: 24,
    healthy: 20,
    degraded: 3,
    unhealthy: 1,
  },
};

const MOCK_COMPONENTS = [
  { type: 'department', name: 'Engineering', health: 92, metrics: { members: 15, projects: 5 } },
  { type: 'department', name: 'Marketing', health: 85, metrics: { members: 8, projects: 3 } },
  { type: 'department', name: 'Sales', health: 78, metrics: { members: 10, projects: 4 } },
  { type: 'project', name: 'Mobile App v2.0', health: 88, metrics: { progress: 80, tasks: 24 } },
  { type: 'project', name: 'Website Redesign', health: 72, metrics: { progress: 45, tasks: 18 } },
  { type: 'workflow', name: 'Order Processing', health: 95, metrics: { throughput: 150, latency: 23 } },
  { type: 'workflow', name: 'Customer Onboarding', health: 81, metrics: { throughput: 45, latency: 67 } },
];

const MOCK_SNAPSHOTS = [
  { id: '1', createdAt: '2026-07-31T14:00:00Z', healthScore: 87, riskScore: 23 },
  { id: '2', createdAt: '2026-07-30T14:00:00Z', healthScore: 85, riskScore: 25 },
  { id: '3', createdAt: '2026-07-29T14:00:00Z', healthScore: 83, riskScore: 28 },
  { id: '4', createdAt: '2026-07-28T14:00:00Z', healthScore: 88, riskScore: 20 },
  { id: '5', createdAt: '2026-07-27T14:00:00Z', healthScore: 86, riskScore: 22 },
];

const HEALTH_STATUS_COLORS = {
  healthy: 'text-green-600 bg-green-50',
  degraded: 'text-yellow-600 bg-yellow-50',
  unhealthy: 'text-red-600 bg-red-50',
};

export default function DigitalTwinPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-96 mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Digital Twin Engine</h1>
              <p className="text-muted-foreground">{MOCK_TWIN.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              variant={MOCK_TWIN.syncStatus === 'synced' ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              {MOCK_TWIN.syncStatus === 'synced' ? 'Synced' : 'Syncing...'}
            </Badge>
            <Button onClick={handleSync} disabled={isSyncing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync Now
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Health Score</p>
              <p className="text-2xl font-bold">{MOCK_TWIN.healthScore}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Score</p>
              <p className="text-2xl font-bold">{MOCK_TWIN.riskScore}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Performance</p>
              <p className="text-2xl font-bold">{MOCK_TWIN.performanceScore}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Components</p>
              <p className="text-2xl font-bold">{MOCK_TWIN.components.total}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Component Health */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{MOCK_TWIN.components.healthy}</p>
            <p className="text-sm text-muted-foreground">Healthy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-600">{MOCK_TWIN.components.degraded}</p>
            <p className="text-sm text-muted-foreground">Degraded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{MOCK_TWIN.components.unhealthy}</p>
            <p className="text-sm text-muted-foreground">Unhealthy</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="components" className="mb-6">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_COMPONENTS.map((comp, i) => (
              <Card key={i} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {comp.type === 'department' && <Users className="h-5 w-5 text-muted-foreground" />}
                      {comp.type === 'project' && <Target className="h-5 w-5 text-muted-foreground" />}
                      {comp.type === 'workflow' && <GitBranch className="h-5 w-5 text-muted-foreground" />}
                      <div>
                        <h4 className="font-semibold">{comp.name}</h4>
                        <p className="text-xs text-muted-foreground capitalize">{comp.type}</p>
                      </div>
                    </div>
                    <Badge className={HEALTH_STATUS_COLORS[comp.health >= 85 ? 'healthy' : comp.health >= 70 ? 'degraded' : 'unhealthy']}>
                      {comp.health >= 85 ? 'Healthy' : comp.health >= 70 ? 'Degraded' : 'Unhealthy'}
                    </Badge>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Health</span>
                      <span className="font-medium">{comp.health}%</span>
                    </div>
                    <Progress value={comp.health} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(comp.metrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="snapshots" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Digital Twin Snapshots</CardTitle>
              <Button size="sm">
                <History className="h-4 w-4 mr-2" />
                Create Snapshot
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_SNAPSHOTS.map((snapshot) => (
                  <div key={snapshot.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{new Date(snapshot.createdAt).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Snapshot #{snapshot.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">{snapshot.healthScore}%</p>
                        <p className="text-xs text-muted-foreground">Health</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{snapshot.riskScore}%</p>
                        <p className="text-xs text-muted-foreground">Risk</p>
                      </div>
                      <Button size="sm" variant="outline">Compare</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Health & Risk History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-around gap-2">
                {[87, 85, 83, 88, 86, 89, 87].map((health, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div
                      className="w-12 bg-gradient-to-t from-green-500 to-green-300 rounded-t"
                      style={{ height: `${health}%` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-8 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-sm">Health Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded" />
                  <span className="text-sm">Risk Score</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
