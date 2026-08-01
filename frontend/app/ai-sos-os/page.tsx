'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles, Activity, Cpu, Server, Database, Globe, Shield, Lock, Zap,
  Bot, Brain, Users, ShoppingCart, Package, Truck, DollarSign, TrendingUp,
  TrendingDown, AlertTriangle, CheckCircle, Clock, Play, Pause, Square,
  Terminal, GitBranch, Layers, Circle, ArrowRight, RefreshCw, Bell,
  Target, Lightbulb, Eye, EyeOff, ChevronDown, ChevronUp, Settings,
  Maximize2, Minus, Square as SquareIcon, X, Wifi, WifiOff, Activity as ActivityIcon,
  Crown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Mock Data
const mockMissions = [
  { id: '1', name: 'Price Monitoring', type: 'monitoring', status: 'running', progress: 78, agents: 4, priority: 'high' },
  { id: '2', name: 'User Behavior Analysis', type: 'analytics', status: 'running', progress: 45, agents: 2, priority: 'medium' },
  { id: '3', name: 'Competitor Price Sync', type: 'sync', status: 'pending', progress: 0, agents: 1, priority: 'high' },
  { id: '4', name: 'Fraud Detection Batch', type: 'security', status: 'completed', progress: 100, agents: 3, priority: 'critical' },
  { id: '5', name: 'Inventory Forecast', type: 'prediction', status: 'running', progress: 62, agents: 2, priority: 'medium' },
];

const mockAgents = [
  { id: '1', name: 'CEO-AI', type: 'executive', status: 'busy', tasks: 5, health: 98 },
  { id: '2', name: 'Revenue-Agent', type: 'worker', status: 'busy', tasks: 12, health: 95 },
  { id: '3', name: 'Price-Optimizer', type: 'worker', status: 'idle', tasks: 0, health: 100 },
  { id: '4', name: 'Security-AI', type: 'specialist', status: 'busy', tasks: 8, health: 99 },
  { id: '5', name: 'Marketing-Agent', type: 'worker', status: 'idle', tasks: 0, health: 97 },
  { id: '6', name: 'CTO-AI', type: 'executive', status: 'busy', tasks: 3, health: 96 },
];

const mockExecutiveAIs = [
  { name: 'CEO AI', status: 'active', decisions: 24, confidence: 94, impact: 'high', icon: Crown },
  { name: 'CTO AI', status: 'active', decisions: 18, confidence: 91, impact: 'high', icon: Cpu },
  { name: 'Product AI', status: 'active', decisions: 31, confidence: 88, impact: 'medium', icon: Package },
  { name: 'Finance AI', status: 'idle', decisions: 12, confidence: 96, impact: 'high', icon: DollarSign },
  { name: 'Security AI', status: 'active', decisions: 45, confidence: 99, impact: 'critical', icon: Shield },
  { name: 'Marketing AI', status: 'active', decisions: 22, confidence: 85, impact: 'medium', icon: TrendingUp },
];

const mockEvents = [
  { type: 'order', action: 'New order', location: 'Mumbai', time: '2s ago', color: 'green' },
  { type: 'payment', action: 'Payment processed', location: 'Delhi', time: '5s ago', color: 'blue' },
  { type: 'ai', action: 'Price update', location: 'Bangalore', time: '8s ago', color: 'purple' },
  { type: 'user', action: 'New signup', location: 'Chennai', time: '12s ago', color: 'orange' },
  { type: 'alert', action: 'Low stock alert', location: 'Pune', time: '15s ago', color: 'red' },
];

const mockMetrics = [
  { label: 'Kernel Health', value: 98, unit: '%', trend: 'up', color: 'green' },
  { label: 'Active Workflows', value: 156, unit: '', trend: 'stable', color: 'blue' },
  { label: 'Event Throughput', value: '12.5K', unit: '/s', trend: 'up', color: 'purple' },
  { label: 'AI Confidence', value: 94, unit: '%', trend: 'up', color: 'cyan' },
];

const mockKnowledgeGraph = [
  { id: '1', type: 'buyer', label: 'Active Buyers', count: 234567, color: 'blue' },
  { id: '2', type: 'seller', label: 'Sellers', count: 12345, color: 'green' },
  { id: '3', type: 'product', label: 'Products', count: 567890, color: 'orange' },
  { id: '4', type: 'order', label: 'Orders', count: 1234567, color: 'purple' },
  { id: '5', type: 'ai_agent', label: 'AI Agents', count: 50, color: 'pink' },
];

export default function AISOSOSPage() {
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('mission-control');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [animatedEvents, setAnimatedEvents] = useState(mockEvents);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      // Simulate new events
      const newEvent = {
        type: ['order', 'payment', 'ai', 'user', 'alert'][Math.floor(Math.random() * 5)],
        action: ['New order', 'Payment processed', 'Price update', 'New signup', 'Low stock alert'][Math.floor(Math.random() * 5)],
        location: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune'][Math.floor(Math.random() * 5)],
        time: 'just now',
        color: ['green', 'blue', 'purple', 'orange', 'red'][Math.floor(Math.random() * 5)],
      };
      setAnimatedEvents(prev => [newEvent, ...prev.slice(0, 4)]);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': case 'active': case 'busy': return 'bg-green-500';
      case 'pending': case 'idle': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-slate-950 text-white",
      isFullscreen ? "fixed inset-0 z-50" : ""
    )}>
      {/* Title Bar */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium">AI-SOS Operating System</span>
          <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
            LIVE
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {time.toLocaleTimeString()} | {time.toLocaleDateString()}
          </span>
          <div className="flex items-center gap-1 ml-4">
            <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-800 rounded transition-colors">
              <Minus className="h-4 w-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-800 rounded transition-colors">
              <SquareIcon className="h-4 w-4" />
            </button>
            <button 
              className="w-8 h-8 flex items-center justify-center hover:bg-red-500 rounded transition-colors"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Layout */}
      <div className="flex h-[calc(100vh-2.5rem)]">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-slate-800 bg-slate-900/50 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* AI-SOS Status */}
            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold">AI-SOS</p>
                    <p className="text-xs text-slate-400">Kernel v2.0</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {mockMetrics.map((metric, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{metric.label}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold">{metric.value}{metric.unit}</span>
                        {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                        {metric.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Navigation */}
            <div className="space-y-1">
              {[
                { id: 'mission-control', icon: Target, label: 'Mission Control' },
                { id: 'kernel', icon: Cpu, label: 'AI Kernel' },
                { id: 'executives', icon: Bot, label: 'Executive AIs' },
                { id: 'agents', icon: Users, label: 'Worker Agents' },
                { id: 'memory', icon: Database, label: 'AI Memory' },
                { id: 'knowledge', icon: GitBranch, label: 'Knowledge Graph' },
                { id: 'events', icon: Layers, label: 'Event Bus' },
                { id: 'trust', icon: Shield, label: 'Trust Engine' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                    activeTab === item.id 
                      ? 'bg-purple-500/20 text-purple-400 border-l-2 border-purple-500' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
            
            {/* Connection Status */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsConnected(!isConnected)}>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'mission-control' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <Target className="h-7 w-7 text-purple-500" />
                  AI Mission Control
                </h1>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-400">
                    <Play className="h-4 w-4 mr-1" /> Start Mission
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600">
                    <Settings className="h-4 w-4 mr-1" /> Configure
                  </Button>
                </div>
              </div>
              
              {/* Mission Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockMissions.map((mission) => (
                  <Card key={mission.id} className="bg-slate-900/50 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-2 h-2 rounded-full', getStatusColor(mission.status))} />
                          <h4 className="font-bold">{mission.name}</h4>
                        </div>
                        <Badge className={getPriorityColor(mission.priority)}>
                          {mission.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{mission.type}</p>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Progress</span>
                          <span className="font-medium">{mission.progress}%</span>
                        </div>
                        <Progress value={mission.progress} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-400">{mission.agents} agents</span>
                        </div>
                        <div className="flex gap-1">
                          {mission.status === 'running' && (
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Square className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Live Event Stream */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="border-b border-slate-800">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ActivityIcon className="h-5 w-5 text-green-500 animate-pulse" />
                      Live Event Stream
                    </span>
                    <Badge className="bg-green-500/20 text-green-400">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-ping" />
                      Streaming
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto">
                    {animatedEvents.map((event, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          'flex items-center gap-4 p-3 animate-in slide-in-from-top duration-500',
                          i === 0 && 'bg-slate-800/50'
                        )}
                      >
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', `bg-${event.color}-500/20`)}>
                          {event.type === 'order' && <ShoppingCart className={cn('h-4 w-4', `text-${event.color}-500`)} />}
                          {event.type === 'payment' && <DollarSign className={cn('h-4 w-4', `text-${event.color}-500`)} />}
                          {event.type === 'ai' && <Bot className={cn('h-4 w-4', `text-${event.color}-500`)} />}
                          {event.type === 'user' && <Users className={cn('h-4 w-4', `text-${event.color}-500`)} />}
                          {event.type === 'alert' && <AlertTriangle className={cn('h-4 w-4', `text-${event.color}-500`)} />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.action}</p>
                          <p className="text-xs text-slate-500">{event.location}</p>
                        </div>
                        <span className="text-xs text-slate-500">{event.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === 'executives' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Bot className="h-7 w-7 text-purple-500" />
                Executive AI Dashboard
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockExecutiveAIs.map((ai, i) => (
                  <Card key={i} className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center',
                            ai.status === 'active' ? 'bg-green-500/20' : 'bg-slate-700'
                          )}>
                            <ai.icon className={cn('h-6 w-6', ai.status === 'active' ? 'text-green-500' : 'text-slate-500')} />
                          </div>
                          <div>
                            <h4 className="font-bold">{ai.name}</h4>
                            <Badge className={cn(
                              'text-xs mt-1',
                              ai.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                            )}>
                              {ai.status}
                            </Badge>
                          </div>
                        </div>
                        <Badge className={cn(
                          'text-xs',
                          ai.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                          ai.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-slate-500/20 text-slate-400'
                        )}>
                          {ai.impact} impact
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-800 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Decisions</p>
                          <p className="text-xl font-bold">{ai.decisions}</p>
                        </div>
                        <div className="p-3 bg-slate-800 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Confidence</p>
                          <p className="text-xl font-bold text-green-400">{ai.confidence}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'agents' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Users className="h-7 w-7 text-blue-500" />
                Worker Agent Dashboard
              </h1>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {mockAgents.map((agent) => (
                  <Card 
                    key={agent.id} 
                    className={cn(
                      'bg-slate-900/50 border-slate-700',
                      agent.status === 'busy' && 'ring-2 ring-green-500/50'
                    )}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={cn(
                        'w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center',
                        agent.status === 'busy' ? 'bg-green-500/20' :
                        agent.status === 'idle' ? 'bg-yellow-500/20' :
                        'bg-red-500/20'
                      )}>
                        <Bot className={cn(
                          'h-6 w-6',
                          agent.status === 'busy' ? 'text-green-500' :
                          agent.status === 'idle' ? 'text-yellow-500' :
                          'text-red-500'
                        )} />
                      </div>
                      <h4 className="font-medium text-sm mb-1">{agent.name}</h4>
                      <Badge variant="outline" className="text-xs capitalize">{agent.type}</Badge>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-slate-500">Tasks</p>
                          <p className="font-bold">{agent.tasks}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Health</p>
                          <p className="font-bold text-green-400">{agent.health}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <GitBranch className="h-7 w-7 text-orange-500" />
                Knowledge Graph Explorer
              </h1>
              
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex justify-center items-center gap-8 flex-wrap">
                    {mockKnowledgeGraph.map((node, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className={cn(
                          'w-24 h-24 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br',
                          node.color === 'blue' && 'from-blue-500/20 to-blue-600/20 border border-blue-500/30',
                          node.color === 'green' && 'from-green-500/20 to-green-600/20 border border-green-500/30',
                          node.color === 'orange' && 'from-orange-500/20 to-orange-600/20 border border-orange-500/30',
                          node.color === 'purple' && 'from-purple-500/20 to-purple-600/20 border border-purple-500/30',
                          node.color === 'pink' && 'from-pink-500/20 to-pink-600/20 border border-pink-500/30',
                        )}>
                          <span className="text-2xl font-bold">{node.count.toLocaleString()}</span>
                          <span className="text-xs text-slate-400">{node.type}</span>
                        </div>
                        <p className="text-sm font-medium mt-2">{node.label}</p>
                        {i < mockKnowledgeGraph.length - 1 && (
                          <ArrowRight className="h-6 w-6 text-slate-600 mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-4 bg-slate-800/50 rounded-lg">
                    <p className="text-sm text-slate-400 text-center">
                      Knowledge Graph: {mockKnowledgeGraph.reduce((acc, n) => acc + n.count, 0).toLocaleString()} nodes | 
                      {mockKnowledgeGraph.reduce((acc, n) => acc + n.count * 3, 0).toLocaleString()} relationships
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === 'events' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Layers className="h-7 w-7 text-cyan-500" />
                Event Bus Monitor
              </h1>
              
              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-green-400">12,547</p>
                    <p className="text-sm text-slate-400">Events/min</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-blue-400">99.9%</p>
                    <p className="text-sm text-slate-400">Success Rate</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-yellow-400">23</p>
                    <p className="text-sm text-slate-400">Pending</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-red-400">2</p>
                    <p className="text-sm text-slate-400">Failed</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="border-b border-slate-800">
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-green-500" />
                    Live Event Stream
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 max-h-96 overflow-y-auto font-mono text-sm">
                  <div className="p-4 space-y-2">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 text-slate-400">
                        <span className="text-slate-600">{new Date(Date.now() - i * 10000).toLocaleTimeString()}</span>
                        <Badge variant="outline" className="text-xs">
                          {['ORDER', 'PAYMENT', 'USER', 'PRODUCT', 'AI'][i % 5]}
                        </Badge>
                        <span className="flex-1">Event processed successfully</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === 'trust' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Shield className="h-7 w-7 text-green-500" />
                Trust Engine Dashboard
              </h1>
              
              <div className="grid grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30">
                  <CardContent className="p-6 text-center">
                    <Shield className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p className="text-4xl font-bold text-green-400">96%</p>
                    <p className="text-sm text-slate-400">Trust Score</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/30">
                  <CardContent className="p-6 text-center">
                    <Lock className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                    <p className="text-4xl font-bold text-blue-400">98%</p>
                    <p className="text-sm text-slate-400">Security Score</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30">
                  <CardContent className="p-6 text-center">
                    <Brain className="h-12 w-12 mx-auto mb-3 text-purple-500" />
                    <p className="text-4xl font-bold text-purple-400">94%</p>
                    <p className="text-sm text-slate-400">AI Confidence</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Governance Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <div>
                        <p className="font-bold text-green-400">Fully Compliant</p>
                        <p className="text-sm text-slate-400">All governance checks passed</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-green-500/50 text-green-400">
                      View Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === 'kernel' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Cpu className="h-7 w-7 text-purple-500" />
                AI Kernel Dashboard
              </h1>
              
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Kernel Health', value: '99.7%', color: 'green' },
                  { label: 'Active Workflows', value: '156', color: 'blue' },
                  { label: 'Scheduler Queue', value: '23', color: 'yellow' },
                  { label: 'Plugin Status', value: '48/50', color: 'purple' },
                ].map((metric, i) => (
                  <Card key={i} className="bg-slate-900/50 border-slate-700">
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-slate-400 mb-1">{metric.label}</p>
                      <p className={`text-2xl font-bold text-${metric.color}-400`}>{metric.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="border-b border-slate-800">
                  <CardTitle>Live Workflow Graph</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-8">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center">
                        <Brain className="h-8 w-8 text-purple-500" />
                      </div>
                      <p className="text-sm mt-2">Kernel</p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-slate-600 animate-pulse" />
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                        <GitBranch className="h-8 w-8 text-blue-500" />
                      </div>
                      <p className="text-sm mt-2">Orchestrator</p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-slate-600 animate-pulse" />
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                        <Bot className="h-8 w-8 text-green-500" />
                      </div>
                      <p className="text-sm mt-2">Agents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === 'memory' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Database className="h-7 w-7 text-amber-500" />
                AI Memory Dashboard
              </h1>
              
              <div className="grid grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 border-amber-500/30">
                  <CardContent className="p-6 text-center">
                    <p className="text-xs text-slate-400 mb-1">Short-term Memory</p>
                    <p className="text-3xl font-bold text-amber-400">2.4 GB</p>
                    <p className="text-sm text-slate-400 mt-2">12,547 items</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/30">
                  <CardContent className="p-6 text-center">
                    <p className="text-xs text-slate-400 mb-1">Long-term Memory</p>
                    <p className="text-3xl font-bold text-blue-400">156 GB</p>
                    <p className="text-sm text-slate-400 mt-2">1.2M items</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30">
                  <CardContent className="p-6 text-center">
                    <p className="text-xs text-slate-400 mb-1">Evolution Memory</p>
                    <p className="text-3xl font-bold text-purple-400">45.2 GB</p>
                    <p className="text-sm text-slate-400 mt-2">Learned patterns</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Sidebar - Quick Stats */}
        <div className="w-72 border-l border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            Quick Stats
          </h3>
          
          <div className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Active Missions</span>
                  <span className="font-bold text-green-400">5</span>
                </div>
                <Progress value={83} className="h-1" />
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Active Agents</span>
                  <span className="font-bold text-blue-400">42/50</span>
                </div>
                <Progress value={84} className="h-1" />
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">CPU Usage</span>
                  <span className="font-bold text-yellow-400">67%</span>
                </div>
                <Progress value={67} className="h-1" />
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Memory</span>
                  <span className="font-bold text-purple-400">78%</span>
                </div>
                <Progress value={78} className="h-1" />
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">AI Insight</span>
            </div>
            <p className="text-xs text-slate-400">
              Mission &quot;Price Monitoring&quot; is performing 23% better than expected. Consider applying learnings to other missions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
