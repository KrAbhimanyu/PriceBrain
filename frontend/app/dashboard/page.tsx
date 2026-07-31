'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Rocket,
  Target,
  CheckCircle2,
  Clock,
  Bell,
  Zap,
  Shield,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Activity,
  DollarSign,
  Calendar,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  missionService,
  approvalService,
  automationService,
  monitoringService,
} from '@/services/api';
import type {
  Mission,
  Approval,
  AutomationRule,
  MissionDashboardData,
} from '@/types';

// Empty state data - API will provide real data
const EMPTY_DASHBOARD_DATA: MissionDashboardData = {
  activeMissions: 0,
  completedMissions: 0,
  pendingApprovals: 0,
  activeAutomations: 0,
  priceAlerts: { active: 0, triggered: 0 },
  warranties: { total: 0, expiringSoon: 0 },
  executions: { total: 0, success: 0, failure: 0, avgExecutionTime: 0 },
};

const EMPTY_APPROVALS: Partial<Approval>[] = [];

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<MissionDashboardData | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [approvals, setApprovals] = useState<Partial<Approval>[]>([]);
  const [automations, setAutomations] = useState<Partial<AutomationRule>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dashboardRes, missionsRes, approvalsRes, automationsRes] = await Promise.all([
        monitoringService.getDashboard(),
        missionService.getAll({ status: 'active' }),
        approvalService.getPending(),
        automationService.getActive(),
      ]);

      setDashboardData(dashboardRes.data?.data || EMPTY_DASHBOARD_DATA);
      setMissions(missionsRes.data?.data || []);
      setApprovals(approvalsRes.data?.data || EMPTY_APPROVALS);
      setAutomations(automationsRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard. Please try again.');
      setDashboardData(EMPTY_DASHBOARD_DATA);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRetry = () => {
    fetchDashboardData();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Failed to Load Dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const data = dashboardData || EMPTY_DASHBOARD_DATA;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Rocket className="h-8 w-8 text-primary" />
            Mission Control
          </h1>
          <p className="text-muted-foreground mt-1">
            Your autonomous commerce intelligence dashboard
          </p>
        </div>
        <Button variant="outline" onClick={handleRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Active Missions</p>
                <p className="text-3xl font-bold">{data.activeMissions}</p>
              </div>
              <Target className="h-12 w-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Completed</p>
                <p className="text-3xl font-bold">{data.completedMissions}</p>
              </div>
              <CheckCircle2 className="h-12 w-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Pending Approvals</p>
                <p className="text-3xl font-bold">{data.pendingApprovals}</p>
              </div>
              <Clock className="h-12 w-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Active Automations</p>
                <p className="text-3xl font-bold">{data.activeAutomations}</p>
              </div>
              <Zap className="h-12 w-12 text-white/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Approvals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                Pending Approvals
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/approvals">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {approvals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No pending approvals
                </p>
              ) : (
                <div className="space-y-3">
                  {approvals.slice(0, 3).map((approval) => (
                    <div
                      key={approval.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <Bell className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">{approval.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {approval.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={approval.priority === 'high' ? 'destructive' : 'secondary'}
                        >
                          {approval.priority}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Missions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Active Missions
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/missions">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {missions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No active missions
                </p>
              ) : (
                <div className="space-y-4">
                  {missions.slice(0, 3).map((mission) => (
                    <Link
                      key={mission.id}
                      href={`/missions/${mission.id}`}
                      className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{mission.title}</h4>
                        <Badge variant="outline">{mission.type.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{Math.round(mission.progress)}% complete</span>
                        {mission.targetBudget && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {(mission.currentSpent || 0).toLocaleString()} /{' '}
                            {mission.targetBudget.toLocaleString()}
                          </span>
                        )}
                        {mission.targetDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(mission.targetDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${mission.progress}%` }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Execution Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Execution Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{data.executions.total}</p>
                  <p className="text-sm text-muted-foreground">Total Executions</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-50">
                  <p className="text-2xl font-bold text-green-600">
                    {data.executions.success}
                  </p>
                  <p className="text-sm text-green-600">Successful</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-50">
                  <p className="text-2xl font-bold text-red-600">{data.executions.failure}</p>
                  <p className="text-sm text-red-600">Failed</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50">
                  <p className="text-2xl font-bold text-blue-600">
                    {data.executions.avgExecutionTime}ms
                  </p>
                  <p className="text-sm text-blue-600">Avg Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium">{data.priceAlerts.triggered} Price Drops</p>
                    <p className="text-sm text-amber-600">In the last 24 hours</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">{data.warranties.expiringSoon} Expiring</p>
                    <p className="text-sm text-orange-600">Warranties expiring soon</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{data.pendingApprovals} Pending</p>
                    <p className="text-sm text-blue-600">Awaiting your approval</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/missions/new">
                  <Target className="h-4 w-4 mr-2" />
                  Create Mission
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/automation/new">
                  <Zap className="h-4 w-4 mr-2" />
                  New Automation
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/workflows">
                  <Activity className="h-4 w-4 mr-2" />
                  Browse Workflows
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/plugins">
                  <Shield className="h-4 w-4 mr-2" />
                  Explore Plugins
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Active Automations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                Active Automations
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/automation">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Price Drop Monitor', count: 12 },
                  { name: 'Deal Hunter', count: 5 },
                  { name: 'Warranty Checker', count: 8 },
                ].map((automation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <span className="text-sm">{automation.name}</span>
                    <Badge variant="secondary">{automation.count} rules</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trust Indicators */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold">Secure & Private</p>
                <p className="text-sm text-muted-foreground">
                  All autonomous actions are logged and require your approval
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-semibold">Full Transparency</p>
                <p className="text-sm text-muted-foreground">
                  Every decision is explainable and auditable
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-semibold">You Stay in Control</p>
                <p className="text-sm text-muted-foreground">
                  Review and approve all sensitive actions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
