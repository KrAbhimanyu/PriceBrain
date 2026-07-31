'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Scale,
  Lock,
  Eye,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const MOCK_CONSTITUTION = [
  { id: '1', title: 'Human Approval Required', type: 'human_approval', priority: 'critical', isImmutable: true, isEnforced: true },
  { id: '2', title: 'Data Privacy Protection', type: 'data_privacy', priority: 'critical', isImmutable: true, isEnforced: true },
  { id: '3', title: 'Decision Transparency', type: 'transparency', priority: 'high', isImmutable: true, isEnforced: true },
  { id: '4', title: 'Regulatory Compliance', type: 'compliance', priority: 'critical', isImmutable: true, isEnforced: true },
  { id: '5', title: 'Security First', type: 'security', priority: 'high', isImmutable: true, isEnforced: true },
  { id: '6', title: 'Budget Limits', type: 'budget', priority: 'medium', isImmutable: false, isEnforced: true },
];

const MOCK_VIOLATIONS = [
  { id: '1', rule: 'Data Privacy Protection', severity: 'high', status: 'open', description: 'AI agent accessed customer data without authorization', createdAt: '2h ago' },
  { id: '2', rule: 'Human Approval Required', severity: 'medium', status: 'resolved', description: 'Automated purchase exceeded budget without approval', createdAt: '1d ago' },
  { id: '3', rule: 'Decision Transparency', severity: 'low', status: 'open', description: 'AI recommendation lacked explanation', createdAt: '2d ago' },
];

const MOCK_POLICIES = [
  { id: '1', name: 'Data Protection Policy', type: 'security', compliance: 95, status: 'active' },
  { id: '2', name: 'Financial Controls', type: 'finance', compliance: 88, status: 'active' },
  { id: '3', name: 'Access Management', type: 'security', compliance: 92, status: 'active' },
  { id: '4', name: 'AI Ethics Guidelines', type: 'ethics', compliance: 78, status: 'review' },
];

const MOCK_AUDITS = [
  { id: '1', type: 'Security Audit', status: 'completed', complianceScore: 94, date: '2026-07-15' },
  { id: '2', type: 'Financial Audit', status: 'completed', complianceScore: 89, date: '2026-07-01' },
  { id: '3', type: 'Privacy Audit', status: 'scheduled', complianceScore: null, date: '2026-08-01' },
];

const PRIORITY_COLORS = {
  critical: 'text-red-600 bg-red-50',
  high: 'text-orange-600 bg-orange-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-blue-600 bg-blue-50',
};

export default function GovernancePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-96 mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const filteredRules = MOCK_CONSTITUTION.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openViolations = MOCK_VIOLATIONS.filter((v) => v.status === 'open').length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Governance Center</h1>
            <p className="text-muted-foreground">
              AI Constitution, Policies, and Compliance
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Lock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AI Constitution Rules</p>
              <p className="text-2xl font-bold">{MOCK_CONSTITUTION.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open Violations</p>
              <p className="text-2xl font-bold">{openViolations}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Policies</p>
              <p className="text-2xl font-bold">{MOCK_POLICIES.filter((p) => p.status === 'active').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Scale className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Compliance</p>
              <p className="text-2xl font-bold">91%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="constitution" className="mb-6">
        <TabsList>
          <TabsTrigger value="constitution">AI Constitution</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
        </TabsList>

        <TabsContent value="constitution" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">AI Constitution Rules</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search rules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRules.map((rule) => (
                  <div key={rule.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[rule.priority as keyof typeof PRIORITY_COLORS]}`}>
                          {rule.priority}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{rule.title}</h4>
                            {rule.isImmutable && (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{rule.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={rule.isEnforced ? 'default' : 'secondary'}>
                          {rule.isEnforced ? 'Enforced' : 'Not Enforced'}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Constitution Violations</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Report Violation
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_VIOLATIONS.map((violation) => (
                  <div key={violation.id} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <AlertCircle className={`h-5 w-5 ${violation.severity === 'high' ? 'text-red-500' : violation.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`} />
                        <div>
                          <h4 className="font-medium">{violation.rule}</h4>
                          <p className="text-sm text-muted-foreground">{violation.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{violation.createdAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={violation.severity === 'high' ? 'destructive' : 'secondary'}>
                          {violation.severity}
                        </Badge>
                        <Badge variant={violation.status === 'open' ? 'outline' : 'default'}>
                          {violation.status}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {MOCK_POLICIES.map((policy) => (
              <Card key={policy.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">{policy.name}</h4>
                      <Badge variant="outline" className="mt-1">{policy.type}</Badge>
                    </div>
                    <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                      {policy.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Compliance Score</span>
                      <span className="font-medium">{policy.compliance}%</span>
                    </div>
                    <Progress value={policy.compliance} />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">View</Button>
                    <Button size="sm" variant="ghost">Audit</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audits" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Governance Audits</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Audit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_AUDITS.map((audit) => (
                  <div key={audit.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {audit.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : audit.status === 'scheduled' ? (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <h4 className="font-medium">{audit.type}</h4>
                          <p className="text-sm text-muted-foreground">{audit.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {audit.complianceScore && (
                          <div className="text-center">
                            <p className="text-2xl font-bold">{audit.complianceScore}%</p>
                            <p className="text-xs text-muted-foreground">Score</p>
                          </div>
                        )}
                        <Badge variant={audit.status === 'completed' ? 'default' : 'secondary'}>
                          {audit.status}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
