'use client';

import { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  Activity,
  TrendingUp,
  Zap,
  Bell,
  ShoppingCart,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock events data
const MOCK_EVENTS = [
  {
    id: '1',
    eventType: 'product.price_updated',
    source: 'price-tracker',
    status: 'processed',
    priority: 1,
    payload: { productId: '123', oldPrice: 999, newPrice: 899 },
    publishedAt: '2026-07-31T14:00:00Z',
    processedAt: '2026-07-31T14:00:01Z',
  },
  {
    id: '2',
    eventType: 'agent.started',
    source: 'kernel',
    status: 'processed',
    priority: 2,
    payload: { agentId: '456', instanceId: '789' },
    publishedAt: '2026-07-31T13:55:00Z',
    processedAt: '2026-07-31T13:55:02Z',
  },
  {
    id: '3',
    eventType: 'workflow.completed',
    source: 'workflow-engine',
    status: 'processed',
    priority: 0,
    payload: { workflowId: 'wf-123', tasksCompleted: 5 },
    publishedAt: '2026-07-31T13:50:00Z',
    processedAt: '2026-07-31T13:50:30Z',
  },
  {
    id: '4',
    eventType: 'notification.sent',
    source: 'notification-service',
    status: 'failed',
    priority: 1,
    payload: { userId: 'user-1', type: 'email' },
    errorMessage: 'SMTP connection timeout',
    publishedAt: '2026-07-31T13:45:00Z',
  },
  {
    id: '5',
    eventType: 'mission.created',
    source: 'mission-engine',
    status: 'processing',
    priority: 2,
    payload: { missionId: 'm-123', type: 'wedding' },
    publishedAt: '2026-07-31T13:40:00Z',
  },
];

const MOCK_EVENT_TYPES = [
  { name: 'product.price_updated', category: 'Commerce', count: 4523 },
  { name: 'agent.started', category: 'Kernel', count: 2341 },
  { name: 'workflow.completed', category: 'Workflow', count: 1892 },
  { name: 'notification.sent', category: 'Communication', count: 3421 },
  { name: 'mission.created', category: 'Missions', count: 892 },
  { name: 'policy.evaluated', category: 'Security', count: 15670 },
];

const MOCK_SUBSCRIPTIONS = [
  {
    id: '1',
    name: 'Price Alert Webhook',
    eventPattern: 'product.price_*',
    endpointUrl: 'https://api.example.com/webhooks/prices',
    endpointType: 'webhook',
    isActive: true,
  },
  {
    id: '2',
    name: 'Agent Start Logger',
    eventPattern: 'agent.started',
    endpointUrl: 'https://api.example.com/webhooks/agents',
    endpointType: 'webhook',
    isActive: true,
  },
  {
    id: '3',
    name: 'Workflow Completion Queue',
    eventPattern: 'workflow.*',
    endpointUrl: null,
    endpointType: 'queue',
    isActive: true,
  },
];

const STATUS_ICONS = {
  published: Clock,
  processing: Activity,
  processed: CheckCircle,
  failed: XCircle,
  dead_letter: AlertCircle,
};

const STATUS_COLORS = {
  published: 'text-blue-600 bg-blue-50',
  processing: 'text-yellow-600 bg-yellow-50',
  processed: 'text-green-600 bg-green-50',
  failed: 'text-red-600 bg-red-50',
  dead_letter: 'text-gray-600 bg-gray-50',
};

export default function EventsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('events');
  const [selectedEvent, setSelectedEvent] = useState<typeof MOCK_EVENTS[0] | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredEvents = MOCK_EVENTS.filter((event) =>
    searchQuery === '' ||
    event.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: MOCK_EVENTS.length,
    processed: MOCK_EVENTS.filter((e) => e.status === 'processed').length,
    processing: MOCK_EVENTS.filter((e) => e.status === 'processing').length,
    failed: MOCK_EVENTS.filter((e) => e.status === 'failed').length,
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Event Mesh</h1>
            <p className="text-muted-foreground">
              Event-driven architecture with pub/sub and real-time processing
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Layers className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Processed</p>
              <p className="text-2xl font-bold">{stats.processed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
              <Activity className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Processing</p>
              <p className="text-2xl font-bold">{stats.processing}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold">{stats.failed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="types">Event Types</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="mt-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Publish Event
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Events List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Events</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="divide-y">
                    {filteredEvents.map((event) => {
                      const StatusIcon = STATUS_ICONS[event.status as keyof typeof STATUS_ICONS];
                      const statusColor = STATUS_COLORS[event.status as keyof typeof STATUS_COLORS];
                      return (
                        <div
                          key={event.id}
                          className={`p-4 cursor-pointer hover:bg-muted/50 ${
                            selectedEvent?.id === event.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <StatusIcon className={`h-5 w-5 ${statusColor.split(' ')[0]}`} />
                              <div>
                                <p className="font-medium font-mono text-sm">
                                  {event.eventType}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {event.source}
                                </p>
                              </div>
                            </div>
                            <Badge className={statusColor} variant="outline">
                              {event.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(event.publishedAt).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Event Details
                  {selectedEvent && (
                    <Button size="sm" variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Replay
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEvent ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Event Type</p>
                        <p className="font-mono">{selectedEvent.eventType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Source</p>
                        <p>{selectedEvent.source}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Priority</p>
                        <p>{selectedEvent.priority}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className={STATUS_COLORS[selectedEvent.status as keyof typeof STATUS_COLORS]}>
                          {selectedEvent.status}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Payload</p>
                      <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                        {JSON.stringify(selectedEvent.payload, null, 2)}
                      </pre>
                    </div>

                    {selectedEvent.errorMessage && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Error</p>
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                          {selectedEvent.errorMessage}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Published</p>
                        <p>{new Date(selectedEvent.publishedAt).toLocaleString()}</p>
                      </div>
                      {selectedEvent.processedAt && (
                        <div>
                          <p className="text-muted-foreground">Processed</p>
                          <p>{new Date(selectedEvent.processedAt).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Layers className="h-12 w-12 mb-4" />
                    <p>Select an event to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Event Types Tab */}
        <TabsContent value="types" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_EVENT_TYPES.map((eventType) => (
              <Card key={eventType.name} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                    <Badge variant="outline">{eventType.category}</Badge>
                  </div>
                  <h4 className="font-mono text-sm mb-2">{eventType.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {eventType.count.toLocaleString()} events
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Event Subscriptions</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Subscription
            </Button>
          </div>
          <div className="space-y-4">
            {MOCK_SUBSCRIPTIONS.map((sub) => (
              <Card key={sub.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{sub.name}</h4>
                        <Badge variant={sub.isActive ? 'default' : 'secondary'}>
                          {sub.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Pattern: <span className="font-mono">{sub.eventPattern}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {sub.endpointType}
                        </Badge>
                        {sub.endpointUrl && (
                          <span className="text-xs text-muted-foreground truncate max-w-xs">
                            {sub.endpointUrl}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost">
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
