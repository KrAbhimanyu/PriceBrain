'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  FolderKanban,
  UserPlus,
  Plus,
  MoreVertical,
  Crown,
  Shield,
  User,
  Eye,
  Settings,
  ChevronRight,
  Briefcase,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data
const MOCK_ORGS = [
  {
    id: '1',
    name: 'TechCorp India',
    slug: 'techcorp-india',
    plan: 'enterprise',
    memberCount: 45,
    teamCount: 8,
    projectCount: 12,
    logo: null,
  },
  {
    id: '2',
    name: 'StartupXYZ',
    slug: 'startupxyz',
    plan: 'professional',
    memberCount: 12,
    teamCount: 3,
    projectCount: 5,
    logo: null,
  },
];

const MOCK_TEAMS = [
  {
    id: '1',
    name: 'Engineering',
    department: 'Technology',
    memberCount: 15,
    projects: 4,
    color: 'bg-blue-500',
  },
  {
    id: '2',
    name: 'Marketing',
    department: 'Business',
    memberCount: 8,
    projects: 3,
    color: 'bg-purple-500',
  },
  {
    id: '3',
    name: 'Design',
    department: 'Creative',
    memberCount: 5,
    projects: 2,
    color: 'bg-pink-500',
  },
  {
    id: '4',
    name: 'Operations',
    department: 'Business',
    memberCount: 7,
    projects: 3,
    color: 'bg-green-500',
  },
];

const MOCK_PROJECTS = [
  {
    id: '1',
    name: 'Q1 Marketing Campaign',
    team: 'Marketing',
    status: 'active',
    progress: 65,
    dueDate: '2026-03-31',
    members: ['John D.', 'Sarah M.', 'Mike R.'],
  },
  {
    id: '2',
    name: 'Website Redesign',
    team: 'Design',
    status: 'active',
    progress: 40,
    dueDate: '2026-04-15',
    members: ['Alice K.', 'Bob L.'],
  },
  {
    id: '3',
    name: 'Mobile App v2.0',
    team: 'Engineering',
    status: 'active',
    progress: 80,
    dueDate: '2026-03-15',
    members: ['Charlie P.', 'Diana S.', 'Eve T.', 'Frank W.'],
  },
  {
    id: '4',
    name: 'Customer Analytics Platform',
    team: 'Engineering',
    status: 'active',
    progress: 25,
    dueDate: '2026-05-01',
    members: ['Grace H.', 'Henry I.'],
  },
];

const MOCK_MEMBERS = [
  { id: '1', name: 'John Doe', email: 'john@techcorp.com', role: 'owner', avatar: null },
  { id: '2', name: 'Sarah Miller', email: 'sarah@techcorp.com', role: 'admin', avatar: null },
  { id: '3', name: 'Mike Ross', email: 'mike@techcorp.com', role: 'member', avatar: null },
  { id: '4', name: 'Alice Kim', email: 'alice@techcorp.com', role: 'member', avatar: null },
  { id: '5', name: 'Bob Lee', email: 'bob@techcorp.com', role: 'member', avatar: null },
];

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: Eye,
};

const ROLE_COLORS = {
  owner: 'text-yellow-600 bg-yellow-50',
  admin: 'text-blue-600 bg-blue-50',
  member: 'text-gray-600 bg-gray-50',
  viewer: 'text-gray-500 bg-gray-50',
};

const PLAN_LABELS = {
  free: { label: 'Free', color: 'bg-gray-500' },
  starter: { label: 'Starter', color: 'bg-blue-500' },
  professional: { label: 'Pro', color: 'bg-purple-500' },
  enterprise: { label: 'Enterprise', color: 'bg-gradient-to-r from-orange-500 to-red-500' },
};

export default function EnterprisePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeOrg, setActiveOrg] = useState(MOCK_ORGS[0]);

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

  const planInfo = PLAN_LABELS[activeOrg.plan as keyof typeof PLAN_LABELS];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Enterprise Workspace</h1>
            <p className="text-muted-foreground">
              Manage organizations, teams, and projects
            </p>
          </div>
        </div>
      </div>

      {/* Organization Selector */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{activeOrg.name}</h2>
                <div className="flex items-center gap-2">
                  <Badge className={planInfo.color}>{planInfo.label}</Badge>
                  <span className="text-sm text-muted-foreground">
                    slug: {activeOrg.slug}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {MOCK_ORGS.map((org) => (
                    <DropdownMenuItem
                      key={org.id}
                      onClick={() => setActiveOrg(org)}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      {org.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Organization
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Members</p>
              <p className="text-2xl font-bold">{activeOrg.memberCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teams</p>
              <p className="text-2xl font-bold">{activeOrg.teamCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <FolderKanban className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Projects</p>
              <p className="text-2xl font-bold">{activeOrg.projectCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
              <Crown className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="text-2xl font-bold">{planInfo.label}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="mb-6">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Team Members</h3>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {MOCK_MEMBERS.map((member) => {
                  const RoleIcon = ROLE_ICONS[member.role as keyof typeof ROLE_ICONS];
                  const roleColorClass = ROLE_COLORS[member.role as keyof typeof ROLE_COLORS];
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={roleColorClass} variant="outline">
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {member.role}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuItem>Remove</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Teams</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {MOCK_TEAMS.map((team) => (
              <Card key={team.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${team.color} text-white`}
                      >
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{team.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {team.department}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Team</DropdownMenuItem>
                        <DropdownMenuItem>View Projects</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {team.memberCount} members
                    </span>
                    <span className="flex items-center gap-1">
                      <FolderKanban className="h-4 w-4 text-muted-foreground" />
                      {team.projects} projects
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Projects</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
          <div className="space-y-4">
            {MOCK_PROJECTS.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{project.name}</h4>
                        <Badge variant="outline">{project.team}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due: {project.dueDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {project.members.length} members
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Project</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Progress
                      </span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <div className="flex -space-x-2">
                      {project.members.map((member, i) => (
                        <Avatar
                          key={i}
                          className="h-8 w-8 border-2 border-background"
                        >
                          <AvatarFallback className="text-xs">
                            {member
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
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
