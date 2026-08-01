import { apiClient } from '../api-client';
import type {
  Agent,
  AgentInstance,
  KernelHealth,
  KernelMetrics,
  CreateAgentDto,
  StartAgentDto,
  Event,
  EventType,
  EventSubscription,
  PublishEventDto,
  CreateSubscriptionDto,
  Tool,
  ToolInvocation,
  CreateToolDto,
  InvokeToolDto,
  AgentListing,
  AgentReview,
  AgentInstallation,
  CreateAgentListingDto,
  InstallAgentDto,
  Organization,
  OrganizationMember,
  Department,
  Team,
  Project,
  CreateOrganizationDto,
  CreateTeamDto,
  CreateProjectDto,
  AddTeamMemberDto,
} from '@/types/ai-cos';

// ============ AI Kernel Service ============

export const kernelService = {
  // Health & Metrics
  async getHealth(): Promise<KernelHealth> {
    const response = await apiClient.get<KernelHealth>('/kernel/health');
    return response.data;
  },

  async getMetrics(): Promise<KernelMetrics> {
    const response = await apiClient.get<KernelMetrics>('/kernel/metrics');
    return response.data;
  },

  // Kernel State
  async getState(key: string): Promise<Record<string, any>> {
    const response = await apiClient.get<Record<string, any>>(`/kernel/state/${key}`);
    return response.data;
  },

  async setState(key: string, value: Record<string, any>): Promise<void> {
    await apiClient.post(`/kernel/state/${key}`, { value });
  },

  // Agents
  async getAgents(params?: {
    type?: string;
    status?: string;
    marketplaceOnly?: boolean;
    systemOnly?: boolean;
  }): Promise<Agent[]> {
    const response = await apiClient.get<Agent[]>('/kernel/agents', { params });
    return response.data;
  },

  async getAgent(id: string): Promise<Agent> {
    const response = await apiClient.get<Agent>(`/kernel/agents/${id}`);
    return response.data;
  },

  async getAgentBySlug(slug: string): Promise<Agent> {
    const response = await apiClient.get<Agent>(`/kernel/agents/slug/${slug}`);
    return response.data;
  },

  async createAgent(data: CreateAgentDto): Promise<Agent> {
    const response = await apiClient.post<Agent>('/kernel/agents', data);
    return response.data;
  },

  async updateAgent(id: string, data: Partial<Agent>): Promise<Agent> {
    const response = await apiClient.patch<Agent>(`/kernel/agents/${id}`, data);
    return response.data;
  },

  async deleteAgent(id: string): Promise<void> {
    await apiClient.delete(`/kernel/agents/${id}`);
  },

  async startAgent(id: string, data: StartAgentDto): Promise<AgentInstance> {
    const response = await apiClient.post<AgentInstance>(`/kernel/agents/${id}/start`, data);
    return response.data;
  },

  // Agent Instances
  async getInstance(id: string): Promise<AgentInstance> {
    const response = await apiClient.get<AgentInstance>(`/kernel/instances/${id}`);
    return response.data;
  },

  async getMyInstances(): Promise<AgentInstance[]> {
    const response = await apiClient.get<AgentInstance[]>('/kernel/instances/mine');
    return response.data;
  },

  async pauseInstance(id: string): Promise<AgentInstance> {
    const response = await apiClient.post<AgentInstance>(`/kernel/instances/${id}/pause`);
    return response.data;
  },

  async resumeInstance(id: string): Promise<AgentInstance> {
    const response = await apiClient.post<AgentInstance>(`/kernel/instances/${id}/resume`);
    return response.data;
  },

  async cancelInstance(id: string): Promise<AgentInstance> {
    const response = await apiClient.post<AgentInstance>(`/kernel/instances/${id}/cancel`);
    return response.data;
  },
};

// ============ Event Mesh Service ============

export const eventService = {
  // Events
  async publish(data: PublishEventDto): Promise<Event> {
    const response = await apiClient.post<Event>('/events', data);
    return response.data;
  },

  async getEvents(params?: {
    eventType?: string;
    source?: string;
    status?: string;
    correlationId?: string;
    from?: string;
    to?: string;
    limit?: number;
  }): Promise<Event[]> {
    const response = await apiClient.get<Event[]>('/events', { params });
    return response.data;
  },

  async getEvent(id: string): Promise<Event> {
    const response = await apiClient.get<Event>(`/events/${id}`);
    return response.data;
  },

  async replayEvent(id: string): Promise<Event> {
    const response = await apiClient.post<Event>(`/events/${id}/replay`);
    return response.data;
  },

  async getStats(days?: number): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    avgProcessingTime: number;
  }> {
    const response = await apiClient.get('/events/stats', { params: { days } });
    return response.data;
  },

  // Event Types
  async getEventTypes(category?: string): Promise<EventType[]> {
    const response = await apiClient.get<EventType[]>('/events/types/all', {
      params: { category },
    });
    return response.data;
  },

  async createEventType(data: Partial<EventType>): Promise<EventType> {
    const response = await apiClient.post<EventType>('/events/types', data);
    return response.data;
  },

  // Subscriptions
  async getSubscriptions(): Promise<EventSubscription[]> {
    const response = await apiClient.get<EventSubscription[]>('/events/subscriptions/mine');
    return response.data;
  },

  async createSubscription(data: CreateSubscriptionDto): Promise<EventSubscription> {
    const response = await apiClient.post<EventSubscription>('/events/subscriptions', data);
    return response.data;
  },

  async updateSubscription(id: string, data: Partial<EventSubscription>): Promise<EventSubscription> {
    const response = await apiClient.patch<EventSubscription>(`/events/subscriptions/${id}`, data);
    return response.data;
  },

  async deleteSubscription(id: string): Promise<void> {
    await apiClient.delete(`/events/subscriptions/${id}`);
  },

  async toggleSubscription(id: string): Promise<EventSubscription> {
    const response = await apiClient.post<EventSubscription>(`/events/subscriptions/${id}/toggle`);
    return response.data;
  },
};

// ============ Tool Bus Service ============

export const toolService = {
  // Tools
  async getTools(params?: {
    category?: string;
    systemOnly?: boolean;
    search?: string;
  }): Promise<Tool[]> {
    const response = await apiClient.get<Tool[]>('/tools', { params });
    return response.data;
  },

  async getTool(id: string): Promise<Tool> {
    const response = await apiClient.get<Tool>(`/tools/${id}`);
    return response.data;
  },

  async getToolByName(name: string): Promise<Tool> {
    const response = await apiClient.get<Tool>(`/tools/name/${name}`);
    return response.data;
  },

  async createTool(data: CreateToolDto): Promise<Tool> {
    const response = await apiClient.post<Tool>('/tools', data);
    return response.data;
  },

  async updateTool(id: string, data: Partial<Tool>): Promise<Tool> {
    const response = await apiClient.patch<Tool>(`/tools/${id}`, data);
    return response.data;
  },

  async deleteTool(id: string): Promise<void> {
    await apiClient.delete(`/tools/${id}`);
  },

  async getCategories(): Promise<{ category: string; count: number }[]> {
    const response = await apiClient.get('/tools/categories');
    return response.data;
  },

  // Tool Invocation
  async invoke(name: string, data: InvokeToolDto): Promise<ToolInvocation> {
    const response = await apiClient.post<ToolInvocation>(`/tools/invoke/${name}`, data);
    return response.data;
  },

  async getInvocation(id: string): Promise<ToolInvocation> {
    const response = await apiClient.get<ToolInvocation>(`/tools/invocations/${id}`);
    return response.data;
  },

  async getMyInvocations(toolId?: string): Promise<ToolInvocation[]> {
    const response = await apiClient.get<ToolInvocation[]>('/tools/invocations/mine', {
      params: { toolId },
    });
    return response.data;
  },

  async getToolStats(name: string): Promise<{
    totalInvocations: number;
    successRate: number;
    avgExecutionTime: number;
    lastInvoked: string | null;
  }> {
    const response = await apiClient.get(`/tools/stats/${name}`);
    return response.data;
  },
};

// ============ Marketplace Service ============

export const marketplaceService = {
  // Listings
  async getListings(params?: {
    category?: string;
    featuredOnly?: boolean;
    search?: string;
    pricingModel?: string;
    sortBy?: string;
  }): Promise<AgentListing[]> {
    const response = await apiClient.get<AgentListing[]>('/marketplace/agents', { params });
    return response.data;
  },

  async getListing(id: string): Promise<AgentListing> {
    const response = await apiClient.get<AgentListing>(`/marketplace/agents/${id}`);
    return response.data;
  },

  async createListing(data: CreateAgentListingDto): Promise<AgentListing> {
    const response = await apiClient.post<AgentListing>('/marketplace/agents', data);
    return response.data;
  },

  async updateListing(id: string, data: Partial<AgentListing>): Promise<AgentListing> {
    const response = await apiClient.patch<AgentListing>(`/marketplace/agents/${id}`, data);
    return response.data;
  },

  async deleteListing(id: string): Promise<void> {
    await apiClient.delete(`/marketplace/agents/${id}`);
  },

  async getFeatured(): Promise<AgentListing[]> {
    const response = await apiClient.get<AgentListing[]>('/marketplace/agents/featured');
    return response.data;
  },

  async getCategories(): Promise<{ category: string; count: number }[]> {
    const response = await apiClient.get('/marketplace/agents/categories');
    return response.data;
  },

  // Reviews
  async getReviews(marketplaceId: string): Promise<AgentReview[]> {
    const response = await apiClient.get<AgentReview[]>(`/marketplace/agents/${marketplaceId}/reviews`);
    return response.data;
  },

  async createReview(marketplaceId: string, data: { rating: number; title?: string; content?: string }): Promise<AgentReview> {
    const response = await apiClient.post<AgentReview>(`/marketplace/agents/${marketplaceId}/reviews`, data);
    return response.data;
  },

  async markReviewHelpful(reviewId: string): Promise<void> {
    await apiClient.post(`/marketplace/agents/reviews/${reviewId}/helpful`);
  },

  // Installations
  async install(data: InstallAgentDto): Promise<AgentInstallation> {
    const response = await apiClient.post<AgentInstallation>('/marketplace/agents/install', data);
    return response.data;
  },

  async getInstallations(organizationId?: string): Promise<AgentInstallation[]> {
    const response = await apiClient.get<AgentInstallation[]>('/marketplace/agents/installations/mine', {
      params: { organizationId },
    });
    return response.data;
  },

  async updateInstallation(id: string, data: { enabled?: boolean; config?: Record<string, any> }): Promise<AgentInstallation> {
    const response = await apiClient.patch<AgentInstallation>(`/marketplace/agents/installations/${id}`, data);
    return response.data;
  },

  async uninstall(id: string): Promise<void> {
    await apiClient.delete(`/marketplace/agents/installations/${id}`);
  },
};

// ============ Enterprise Service ============

export const enterpriseService = {
  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    const response = await apiClient.get<Organization[]>('/enterprise/organizations');
    return response.data;
  },

  async getOrganization(id: string): Promise<Organization> {
    const response = await apiClient.get<Organization>(`/enterprise/organizations/${id}`);
    return response.data;
  },

  async createOrganization(data: CreateOrganizationDto): Promise<Organization> {
    const response = await apiClient.post<Organization>('/enterprise/organizations', data);
    return response.data;
  },

  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
    const response = await apiClient.patch<Organization>(`/enterprise/organizations/${id}`, data);
    return response.data;
  },

  async deleteOrganization(id: string): Promise<void> {
    await apiClient.delete(`/enterprise/organizations/${id}`);
  },

  // Organization Members
  async getOrgMembers(orgId: string): Promise<OrganizationMember[]> {
    const response = await apiClient.get<OrganizationMember[]>(`/enterprise/organizations/${orgId}/members`);
    return response.data;
  },

  async addOrgMember(orgId: string, data: { userId: string; role?: string; departmentId?: string; title?: string }): Promise<OrganizationMember> {
    const response = await apiClient.post<OrganizationMember>(`/enterprise/organizations/${orgId}/members`, data);
    return response.data;
  },

  async removeOrgMember(orgId: string, userId: string): Promise<void> {
    await apiClient.delete(`/enterprise/organizations/${orgId}/members/${userId}`);
  },

  // Departments
  async getDepartments(orgId: string): Promise<Department[]> {
    const response = await apiClient.get<Department[]>(`/enterprise/organizations/${orgId}/departments`);
    return response.data;
  },

  async createDepartment(orgId: string, data: { name: string; description?: string; parentDepartmentId?: string }): Promise<Department> {
    const response = await apiClient.post<Department>(`/enterprise/organizations/${orgId}/departments`, data);
    return response.data;
  },

  // Teams
  async getTeams(orgId: string): Promise<Team[]> {
    const response = await apiClient.get<Team[]>(`/enterprise/organizations/${orgId}/teams`);
    return response.data;
  },

  async getTeam(id: string): Promise<Team> {
    const response = await apiClient.get<Team>(`/enterprise/teams/${id}`);
    return response.data;
  },

  async createTeam(orgId: string, data: CreateTeamDto): Promise<Team> {
    const response = await apiClient.post<Team>(`/enterprise/organizations/${orgId}/teams`, data);
    return response.data;
  },

  async addTeamMember(teamId: string, data: AddTeamMemberDto): Promise<void> {
    await apiClient.post(`/enterprise/teams/${teamId}/members`, data);
  },

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    await apiClient.delete(`/enterprise/teams/${teamId}/members/${userId}`);
  },

  // Projects
  async getProjects(orgId: string, teamId?: string): Promise<Project[]> {
    const response = await apiClient.get<Project[]>(`/enterprise/organizations/${orgId}/projects`, {
      params: { teamId },
    });
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await apiClient.get<Project>(`/enterprise/projects/${id}`);
    return response.data;
  },

  async createProject(orgId: string, data: CreateProjectDto): Promise<Project> {
    const response = await apiClient.post<Project>(`/enterprise/organizations/${orgId}/projects`, data);
    return response.data;
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const response = await apiClient.patch<Project>(`/enterprise/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/enterprise/projects/${id}`);
  },

  async addProjectMember(projectId: string, data: AddProjectMemberDto): Promise<void> {
    await apiClient.post(`/enterprise/projects/${projectId}/members`, data);
  },
};
