'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Rocket,
  Plus,
  Target,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Wallet,
  Play,
  Pause,
  MoreVertical,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { missionService } from '@/services/api';
import type { Mission, MissionStatus, MissionType } from '@/types';

const MISSION_TYPE_LABELS: Record<MissionType, string> = {
  wedding: 'Wedding',
  vacation: 'Vacation',
  study_abroad: 'Study Abroad',
  first_job: 'First Job',
  home_office: 'Home Office',
  gaming_setup: 'Gaming Setup',
  photography_studio: 'Photography Studio',
  fitness_journey: 'Fitness Journey',
  home_renovation: 'Home Renovation',
  baby_preparation: 'Baby Preparation',
  business_launch: 'Business Launch',
  festival_planning: 'Festival Planning',
  custom: 'Custom',
};

const STATUS_CONFIG: Record<MissionStatus, { label: string; color: string; icon: React.ElementType }> = {
  planning: { label: 'Planning', color: 'bg-blue-100 text-blue-700', icon: Target },
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: Play },
  paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-700', icon: Pause },
  completed: { label: 'Completed', color: 'bg-purple-100 text-purple-700', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-600' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-600' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-600' },
};

// Empty state for missions
const EMPTY_MISSIONS: Mission[] = [];

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<MissionStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const fetchMissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await missionService.getAll();
      if (response.data?.success) {
        setMissions(response.data.data || EMPTY_MISSIONS);
      }
    } catch (err) {
      console.error('Failed to load missions:', err);
      setError('Failed to load missions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const filteredMissions = missions.filter((mission) => {
    const matchesFilter = filter === 'all' || mission.status === filter;
    const matchesSearch =
      !search ||
      mission.title.toLowerCase().includes(search.toLowerCase()) ||
      mission.description?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: missions.length,
    active: missions.filter((m) => m.status === 'active').length,
    completed: missions.filter((m) => m.status === 'completed').length,
    planning: missions.filter((m) => m.status === 'planning').length,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Rocket className="h-8 w-8 text-primary" />
            Missions
          </h1>
          <p className="text-muted-foreground mt-1">
            Transform your goals into achievable missions
          </p>
        </div>
        <Button className="mt-4 md:mt-0 gap-2" asChild>
          <Link href="/missions/new">
            <Plus className="h-4 w-4" />
            Create Mission
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Missions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Target className="h-10 w-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Play className="h-10 w-10 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Planning</p>
                <p className="text-2xl font-bold text-blue-600">{stats.planning}</p>
              </div>
              <Clock className="h-10 w-10 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-purple-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search missions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={filter === 'planning' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('planning')}
          >
            Planning
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Mission List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMissions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Rocket className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No missions found</h3>
            <p className="text-muted-foreground mb-4">
              {search
                ? 'Try adjusting your search terms'
                : 'Create your first mission to get started'}
            </p>
            <Button asChild>
              <Link href="/missions/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Mission
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMissions.map((mission) => {
            const statusConfig = STATUS_CONFIG[mission.status];
            const StatusIcon = statusConfig.icon;
            const budgetPercentage = mission.targetBudget
              ? ((mission.currentSpent || 0) / mission.targetBudget) * 100
              : 0;

            return (
              <Card key={mission.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link
                          href={`/missions/${mission.id}`}
                          className="text-xl font-semibold hover:text-primary transition-colors"
                        >
                          {mission.title}
                        </Link>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <Badge className={PRIORITY_CONFIG[mission.priority].color}>
                          {PRIORITY_CONFIG[mission.priority].label}
                        </Badge>
                      </div>
                      {mission.description && (
                        <p className="text-muted-foreground text-sm mb-4">
                          {mission.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Target className="h-4 w-4" />
                          {MISSION_TYPE_LABELS[mission.type]}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Target: {formatDate(mission.targetDate)}
                        </div>
                        {mission.targetBudget && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Wallet className="h-4 w-4" />
                            {formatCurrency(mission.currentSpent || 0)} /{' '}
                            {formatCurrency(mission.targetBudget)}
                          </div>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/missions/${mission.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/missions/${mission.id}/edit`}>
                            Edit Mission
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {mission.status === 'active' ? 'Pause Mission' : 'Resume Mission'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete Mission
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{Math.round(mission.progress)}%</span>
                    </div>
                    <Progress value={mission.progress} className="h-2" />
                  </div>

                  {/* Budget Progress (if applicable) */}
                  {mission.targetBudget && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Budget</span>
                        <span className={budgetPercentage > 100 ? 'text-red-600' : ''}>
                          {budgetPercentage.toFixed(0)}% used
                        </span>
                      </div>
                      <Progress
                        value={Math.min(budgetPercentage, 100)}
                        className={`h-1.5 ${budgetPercentage > 100 ? '[&>div]:bg-red-500' : ''}`}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Start Templates */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Quick Start Templates</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { type: 'wedding' as MissionType, icon: '💒', label: 'Wedding' },
            { type: 'vacation' as MissionType, icon: '✈️', label: 'Vacation' },
            { type: 'home_office' as MissionType, icon: '🏠', label: 'Home Office' },
            { type: 'gaming_setup' as MissionType, icon: '🎮', label: 'Gaming Setup' },
            { type: 'fitness_journey' as MissionType, icon: '💪', label: 'Fitness' },
            { type: 'business_launch' as MissionType, icon: '🚀', label: 'Business' },
            { type: 'home_renovation' as MissionType, icon: '🏗️', label: 'Renovation' },
            { type: 'custom' as MissionType, icon: '✨', label: 'Custom' },
          ].map((template) => (
            <Card
              key={template.type}
              className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
            >
              <CardContent className="p-4 text-center">
                <Link href={`/missions/new?type=${template.type}`}>
                  <span className="text-3xl mb-2 block">{template.icon}</span>
                  <span className="font-medium">{template.label}</span>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
