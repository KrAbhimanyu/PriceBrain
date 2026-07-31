'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  Brain,
  TrendingUp,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Activity,
  Shield,
  Zap,
  BarChart3,
  GitBranch,
  Lightbulb,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { executiveService, orgMonitoringService } from '@/services/api';

interface OrgData {
  name: string;
  healthScore: number;
  riskScore: number;
  activeMissions: number;
  completedMissions: number;
  departments: number;
  teamMembers: number;
  activeProjects: number;
}

interface ChiefAIData {
  name: string;
  title: string;
  decisionsToday: number;
  recommendationsAccepted: number;
  avgResponseTime: string;
}

interface Decision {
  id: string;
  title: string;
  decisionType: string;
  status: string;
  priority: number;
  riskLevel: string;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
  healthScore: number;
  members: number;
  projects: number;
  status: string;
}

interface Recommendation {
  id: string;
  type: string;
  title: string;
  impact: string;
  effort: string;
  confidence: number;
}

interface KPI {
  name: string;
  value: number;
  target: number;
  unit: string;
}

const MOCK_KPIS: KPI[] = [
  { name: 'Revenue Growth', value: 24.5, target: 30, unit: '%' },
  { name: 'Customer Satisfaction', value: 87, target: 90, unit: '%' },
  { name: 'Employee Retention', value: 92, target: 95, unit: '%' },
  { name: 'Project On-Time Delivery', value: 78, target: 85, unit: '%' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-600 bg-yellow-50',
  approved: 'text-green-600 bg-green-50',
  implemented: 'text-blue-600 bg-blue-50',
  rejected: 'text-red-600 bg-red-50',
};

export default function OrganizationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const [chiefAI, setChiefAI] = useState<ChiefAIData | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizationData();
  }, []);

  const fetchOrganizationData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get organization ID from URL or context
      const orgId = 'default-org'; // In production, get from auth context

      // Fetch all data in parallel
      const [orgRes, chiefAIRes, decisionsRes, recommendationsRes] = await Promise.allSettled([
        executiveService.getChiefAI(orgId),
        executiveService.getChiefAIPerformance(orgId),
        executiveService.getDecisions(orgId),
        executiveService.getRecommendations(orgId),
      ]);

      // Process organization data
      if (orgRes.status === 'fulfilled') {
        setOrgData({
          name: orgRes.value.data?.organization?.name || 'Organization',
          healthScore: orgRes.value.data?.performanceMetrics?.organizationHealth || 85,
          riskScore: orgRes.value.data?.performanceMetrics?.riskScore || 25,
          activeMissions: orgRes.value.data?.performanceMetrics?.activeMissions || 0,
          completedMissions: orgRes.value.data?.performanceMetrics?.completedMissions || 0,
          departments: orgRes.value.data?.performanceMetrics?.departments || 0,
          teamMembers: orgRes.value.data?.performanceMetrics?.teamMembers || 0,
          activeProjects: orgRes.value.data?.performanceMetrics?.activeProjects || 0,
        });
      }

      // Process Chief AI data
      if (chiefAIRes.status === 'fulfilled') {
        setChiefAI({
          name: 'ARIA',
          title: 'Chief AI Officer',
          decisionsToday: chiefAIRes.value.data?.totalDecisions || 0,
          recommendationsAccepted: chiefAIRes.value.data?.implementedDecisions || 0,
          avgResponseTime: '45ms',
        });
      }

      // Process decisions
      if (decisionsRes.status === 'fulfilled') {
        setDecisions(
          (decisionsRes.value.data || []).map((d: any) => ({
            id: d.id,
            title: d.title,
            decisionType: d.decisionType,
            status: d.status,
            priority: d.priority,
            riskLevel: d.riskLevel,
            createdAt: new Date(d.createdAt).toLocaleDateString(),
          }))
        );
      }

      // Process recommendations
      if (recommendationsRes.status === 'fulfilled') {
        setRecommendations(
          (recommendationsRes.value.data || []).map((r: any, i: number) => ({
            id: r.id || String(i),
            type: r.type,
            title: r.title,
            impact: r.priority === 'high' ? 'high' : 'medium',
            effort: 'medium',
            confidence: r.confidence || 75,
          }))
        );
      }

      // Set fallback data if API calls failed
      if (!orgData) {
        setOrgData({
          name: 'Organization',
          healthScore: 85,
          riskScore: 25,
          activeMissions: 0,
          completedMissions: 0,
          departments: 0,
          teamMembers: 0,
          activeProjects: 0,
        });
      }

      if (!chiefAI) {
        setChiefAI({
          name: 'ARIA',
          title: 'Chief AI Officer',
          decisionsToday: 0,
          recommendationsAccepted: 0,
          avgResponseTime: 'N/A',
        });
      }
    } catch (err) {
      console.error('Error fetching organization data:', err);
      setError('Failed to load organization data');
      // Use fallback data
      setOrgData({
        name: 'Organization',
        healthScore: 85,
        riskScore: 25,
        activeMissions: 0,
        completedMissions: 0,
        departments: 0,
        teamMembers: 0,
        activeProjects: 0,
      });
      setChiefAI({
        name: 'ARIA',
        title: 'Chief AI Officer',
        decisionsToday: 0,
        recommendationsAccepted: 0,
        avgResponseTime: 'N/A',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDecision = async () => {
    try {
      await executiveService.createDecision({
        title: 'New Decision',
        decisionType: 'strategy',
        description: 'Created from dashboard',
      });
      // Refresh decisions
      fetchOrganizationData();
    } catch (err) {
      console.error('Error creating decision:', err);
    }
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
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Organization Operating System</h1>
            <p className="text-muted-foreground">
              {orgData?.name || 'Organization'} - Powered by {chiefAI?.name || 'AI'}
            </p>
          </div>
        </div>
      </div>

      {/* Chief AI Card */}
      <Card className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <Brain className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{chiefAI?.name || 'ARIA'}</h2>
                <p className="text-white/80">{chiefAI?.title || 'Chief AI Officer'}</p>
                <Badge className="mt-2 bg-white/20 text-white">Active</Badge>
              </div>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold">{chiefAI?.decisionsToday || 0}</p>
                <p className="text-sm text-white/80">Decisions Today</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{chiefAI?.recommendationsAccepted || 0}</p>
                <p className="text-sm text-white/80">Recommendations</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{chiefAI?.avgResponseTime || 'N/A'}</p>
                <p className="text-sm text-white/80">Avg Response</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Organization Health</p>
              <p className="text-2xl font-bold">{orgData?.healthScore || 0}%</p>
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
              <p className="text-2xl font-bold">{orgData?.riskScore || 0}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Missions</p>
              <p className="text-2xl font-bold">{orgData?.activeMissions || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Team Members</p>
              <p className="text-2xl font-bold">{orgData?.teamMembers || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="decisions">Decisions</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* KPIs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {MOCK_KPIS.map((kpi) => (
                  <div key={kpi.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{kpi.name}</span>
                      <span className="text-sm font-medium">{kpi.value}{kpi.unit}</span>
                    </div>
                    <Progress value={(kpi.value / kpi.target) * 100} />
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: {kpi.target}{kpi.unit}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: '5m ago', action: 'Mission completed: Q1 Review', icon: Target },
                    { time: '15m ago', action: 'Budget approved for Marketing', icon: CheckCircle },
                    { time: '1h ago', action: 'New team member added to Engineering', icon: Users },
                    { time: '2h ago', action: 'Simulation completed: Infrastructure', icon: GitBranch },
                    { time: '3h ago', action: 'Policy violation detected and resolved', icon: Shield },
                  ].map((activity, i) => {
                    const Icon = activity.icon;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="decisions" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Executive Decisions</CardTitle>
              <Button size="sm" onClick={handleCreateDecision}>
                <Zap className="h-4 w-4 mr-2" />
                New Decision
              </Button>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                {decisions.length > 0 ? (
                  decisions.map((decision) => (
                    <div
                      key={decision.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[decision.status] || 'bg-gray-50'}`}>
                          {decision.status}
                        </div>
                        <div>
                          <p className="font-medium">{decision.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {decision.decisionType} • {decision.createdAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">Risk: {decision.riskLevel}</Badge>
                        <Badge variant="outline">Priority: {decision.priority}</Badge>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No decisions yet</p>
                    <p className="text-sm">Create your first executive decision to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.length > 0 ? (
              departments.map((dept) => (
                <Card key={dept.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{dept.name}</h4>
                        <p className="text-sm text-muted-foreground">{dept.members} members</p>
                      </div>
                      <Badge
                        variant={dept.status === 'healthy' ? 'default' : 'secondary'}
                        className={dept.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                      >
                        {dept.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Health Score</span>
                        <span className="font-medium">{dept.healthScore}%</span>
                      </div>
                      <Progress value={dept.healthScore} />
                      <div className="flex justify-between text-sm mt-4">
                        <span>{dept.projects} active projects</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No departments configured</p>
                <p className="text-sm">Set up your organization structure in the Enterprise workspace</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Strategic Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline" className="mb-2">{rec.type}</Badge>
                          <h4 className="font-medium">{rec.title}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{rec.confidence}%</p>
                          <p className="text-xs text-muted-foreground">Confidence</p>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-4 text-sm">
                        <span>Impact: <strong>{rec.impact}</strong></span>
                        <span>Effort: <strong>{rec.effort}</strong></span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm">Approve</Button>
                        <Button size="sm" variant="outline">Review Details</Button>
                        <Button size="sm" variant="ghost">Dismiss</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recommendations available</p>
                  <p className="text-sm">AI recommendations will appear as your organization evolves</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
