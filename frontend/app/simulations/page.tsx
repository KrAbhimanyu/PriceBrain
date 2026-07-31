'use client';

import { useState, useEffect } from 'react';
import {
  FlaskConical,
  Plus,
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
  Building,
  Target,
  BarChart3,
  Timer,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const MOCK_SIMULATIONS = [
  {
    id: '1',
    title: 'Business Growth Q3-Q4',
    type: 'business_growth',
    status: 'completed',
    successProbability: 78,
    expectedCost: 250000,
    expectedTimeline: '6 months',
    createdAt: '2026-07-30',
  },
  {
    id: '2',
    title: 'Engineering Team Expansion',
    type: 'hiring',
    status: 'completed',
    successProbability: 82,
    expectedCost: 450000,
    expectedTimeline: '3 months',
    createdAt: '2026-07-28',
  },
  {
    id: '3',
    title: 'Marketing Campaign ROI',
    type: 'marketing_campaign',
    status: 'running',
    progress: 65,
    createdAt: '2026-07-31',
  },
  {
    id: '4',
    title: 'Infrastructure Scaling',
    type: 'infrastructure',
    status: 'pending',
    createdAt: '2026-07-31',
  },
  {
    id: '5',
    title: 'New Product Launch',
    type: 'project_planning',
    status: 'pending',
    createdAt: '2026-07-31',
  },
];

const SIMULATION_TYPES = [
  { type: 'business_growth', label: 'Business Growth', icon: TrendingUp, color: 'bg-green-500' },
  { type: 'hiring', label: 'Hiring', icon: Users, color: 'bg-blue-500' },
  { type: 'budget_change', label: 'Budget Change', icon: DollarSign, color: 'bg-yellow-500' },
  { type: 'marketing_campaign', label: 'Marketing', icon: Target, color: 'bg-purple-500' },
  { type: 'infrastructure', label: 'Infrastructure', icon: Building, color: 'bg-cyan-500' },
  { type: 'project_planning', label: 'Project Planning', icon: BarChart3, color: 'bg-orange-500' },
];

const STATUS_COLORS = {
  pending: 'text-yellow-600 bg-yellow-50',
  running: 'text-blue-600 bg-blue-50',
  completed: 'text-green-600 bg-green-50',
  failed: 'text-red-600 bg-red-50',
};

export default function SimulationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-96 mb-8" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const filteredSimulations = selectedType
    ? MOCK_SIMULATIONS.filter((s) => s.type === selectedType)
    : MOCK_SIMULATIONS;

  const completedSims = MOCK_SIMULATIONS.filter((s) => s.status === 'completed');
  const avgSuccessRate = completedSims.reduce((sum, s) => sum + s.successProbability, 0) / (completedSims.length || 1);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600">
              <FlaskConical className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Simulation Center</h1>
              <p className="text-muted-foreground">
                Test scenarios before execution
              </p>
            </div>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Simulation
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <FlaskConical className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Simulations</p>
              <p className="text-2xl font-bold">{MOCK_SIMULATIONS.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{completedSims.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Success Rate</p>
              <p className="text-2xl font-bold">{avgSuccessRate.toFixed(0)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
              <Timer className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Running</p>
              <p className="text-2xl font-bold">{MOCK_SIMULATIONS.filter((s) => s.status === 'running').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulation Types */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Simulation Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SIMULATION_TYPES.map((simType) => {
            const Icon = simType.icon;
            const count = MOCK_SIMULATIONS.filter((s) => s.type === simType.type).length;
            return (
              <Card
                key={simType.type}
                className={`cursor-pointer hover:shadow-lg transition-all ${selectedType === simType.type ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedType(selectedType === simType.type ? null : simType.type)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${simType.color} text-white mx-auto mb-2`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium">{simType.label}</p>
                  <p className="text-xs text-muted-foreground">{count} simulations</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Simulations List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedType
              ? `${SIMULATION_TYPES.find((t) => t.type === selectedType)?.label} Simulations`
              : 'All Simulations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSimulations.map((sim) => {
              const simType = SIMULATION_TYPES.find((t) => t.type === sim.type);
              const Icon = simType?.icon || FlaskConical;
              return (
                <div
                  key={sim.id}
                  className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${simType?.color || 'bg-gray-500'} text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{sim.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{sim.type.replace('_', ' ')}</Badge>
                          <Badge className={STATUS_COLORS[sim.status as keyof typeof STATUS_COLORS]}>
                            {sim.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {sim.status === 'completed' && (
                        <>
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">{sim.successProbability}%</p>
                            <p className="text-xs text-muted-foreground">Success Rate</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">${(sim.expectedCost / 1000).toFixed(0)}k</p>
                            <p className="text-xs text-muted-foreground">Est. Cost</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">{sim.expectedTimeline}</p>
                            <p className="text-xs text-muted-foreground">Timeline</p>
                          </div>
                        </>
                      )}
                      {sim.status === 'running' && (
                        <div className="w-32">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{sim.progress}%</span>
                          </div>
                          <Progress value={sim.progress} />
                        </div>
                      )}
                      <Button size="sm" variant="outline">
                        {sim.status === 'pending' && <><Play className="h-4 w-4 mr-1" /> Run</>}
                        {sim.status === 'running' && <><Clock className="h-4 w-4 mr-1" /> View</>}
                        {sim.status === 'completed' && <><ChevronRight className="h-4 w-4 mr-1" /> Details</>}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
