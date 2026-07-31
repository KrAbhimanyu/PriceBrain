'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Cpu,
  Zap,
  Activity,
  Shield,
  Layers,
  Globe,
  Box,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  Users,
  TrendingUp,
  Code,
  Puzzle,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data for AI COS Dashboard
const MOCK_KERNEL_STATUS = {
  overall: 'healthy',
  components: {
    agents: { status: 'healthy', count: 12 },
    events: { status: 'healthy', count: 15420 },
    tools: { status: 'healthy', count: 24 },
    workflows: { status: 'healthy', count: 8 },
  },
  uptime: 86400000,
};

const MOCK_METRICS = {
  agents: { total: 12, active: 5, running: 2 },
  events: { published: 15420, processed: 15380, failed: 12 },
  tools: { total: 24, invoked: 8945, avgTime: 45 },
  workflows: { total: 8, running: 3, completed: 156 },
};

const MODULES = [
  {
    name: 'AI Kernel',
    description: 'Central runtime for agents, workflows, and resource management',
    icon: Cpu,
    href: '/ai-cos/kernel',
    color: 'bg-blue-500',
    status: 'healthy',
  },
  {
    name: 'Event Mesh',
    description: 'Event-driven architecture with pub/sub, replay, and DLQ',
    icon: Layers,
    href: '/ai-cos/events',
    color: 'bg-purple-500',
    status: 'healthy',
  },
  {
    name: 'Tool Bus',
    description: 'Unified tool invocation for all AI capabilities',
    icon: Zap,
    href: '/ai-cos/tools',
    color: 'bg-yellow-500',
    status: 'healthy',
  },
  {
    name: 'Agent Marketplace',
    description: 'Discover and install AI agents',
    icon: Globe,
    href: '/marketplace',
    color: 'bg-green-500',
    status: 'healthy',
  },
  {
    name: 'Enterprise Workspace',
    description: 'Organizations, teams, and projects',
    icon: Users,
    href: '/enterprise',
    color: 'bg-orange-500',
    status: 'healthy',
  },
  {
    name: 'Commerce Cloud',
    description: 'Connectors for marketplaces and services',
    icon: Box,
    href: '/ai-cos/connectors',
    color: 'bg-pink-500',
    status: 'healthy',
  },
];

export default function AICOSPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-96 mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Commerce Operating System</h1>
            <p className="text-muted-foreground">
              The intelligent platform for autonomous commerce
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            System Healthy
          </Badge>
          <span className="text-sm text-muted-foreground">
            Uptime: {formatUptime(MOCK_KERNEL_STATUS.uptime)}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Active Agents</p>
                <p className="text-3xl font-bold">{MOCK_METRICS.agents.active}</p>
              </div>
              <Activity className="h-12 w-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Events Today</p>
                <p className="text-3xl font-bold">
                  {MOCK_METRICS.events.published.toLocaleString()}
                </p>
              </div>
              <Layers className="h-12 w-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Tools Invoked</p>
                <p className="text-3xl font-bold">{MOCK_METRICS.tools.invoked.toLocaleString()}</p>
              </div>
              <Zap className="h-12 w-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Workflows</p>
                <p className="text-3xl font-bold">{MOCK_METRICS.workflows.completed}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-white/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Modules */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">AI-COS Modules</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <Link key={module.name} href={module.href}>
                  <Card className="hover:shadow-lg transition-all hover:border-primary/50 h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${module.color} text-white`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {module.status}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{module.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {module.description}
                      </p>
                      <div className="flex items-center text-sm text-primary">
                        Explore <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-green-500" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(MOCK_KERNEL_STATUS.components).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm capitalize">{key}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {value.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/ai-cos/kernel/agents/new">
                  <Cpu className="h-4 w-4 mr-2" />
                  Create Agent
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/ai-cos/events/new">
                  <Layers className="h-4 w-4 mr-2" />
                  Create Event Subscription
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/marketplace">
                  <Globe className="h-4 w-4 mr-2" />
                  Browse Agent Marketplace
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/ai-cos/tools/new">
                  <Zap className="h-4 w-4 mr-2" />
                  Register Tool
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Code className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                  <p className="text-xs text-muted-foreground">SDK</p>
                </div>
                <div className="text-center">
                  <Layers className="h-6 w-6 mx-auto text-purple-500 mb-1" />
                  <p className="text-xs text-muted-foreground">REST API</p>
                </div>
                <div className="text-center">
                  <Database className="h-6 w-6 mx-auto text-green-500 mb-1" />
                  <p className="text-xs text-muted-foreground">GraphQL</p>
                </div>
                <div className="text-center">
                  <Puzzle className="h-6 w-6 mx-auto text-orange-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Plugins</p>
                </div>
                <div className="text-center">
                  <Activity className="h-6 w-6 mx-auto text-red-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Webhooks</p>
                </div>
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto text-pink-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Multi-tenant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Architecture Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Architecture Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-8 overflow-x-auto pb-4">
            {[
              { label: 'Users', icon: Users, color: 'border-blue-500' },
              { label: 'AI Kernel', icon: Cpu, color: 'border-purple-500' },
              { label: 'Event Mesh', icon: Layers, color: 'border-yellow-500' },
              { label: 'Tool Bus', icon: Zap, color: 'border-orange-500' },
              { label: 'Services', icon: Box, color: 'border-green-500' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center">
                  <div className={`flex flex-col items-center p-4 rounded-xl border-2 ${item.color}`}>
                    <Icon className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {index < 4 && <ArrowRight className="h-6 w-6 mx-4 text-muted-foreground" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
