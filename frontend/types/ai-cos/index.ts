// AI Kernel Types
export type AgentStatus = 'inactive' | 'active' | 'running' | 'error';
export type HealthStatus = 'unknown' | 'healthy' | 'degraded' | 'unhealthy';

export interface Agent {
  id: string;
  name: string;
  slug: string;
  description?: string;
  version: string;
  agentType: string;
  capabilities: string[];
  permissions: string[];
  config: Record<string, any>;
  status: AgentStatus;
  healthStatus: HealthStatus;
  isSystem: boolean;
  isMarketplace: boolean;
  ownerId?: string;
  organizationId?: string;
  marketplaceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentInstance {
  id: string;
  agentId: string;
  agent?: Agent;
  userId?: string;
  organizationId?: string;
  missionId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  state: Record<string, any>;
  resources: Record<string, any>;
  startTime?: string;
  endTime?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KernelHealth {
  overall: HealthStatus;
  components: Record<string, HealthStatus>;
  lastCheck: string;
  uptime: number;
}

export interface KernelMetrics {
  agents: {
    total: number;
    active: number;
    running: number;
    byType: Record<string, number>;
  };
  instances: {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
  };
  system: {
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

// Event Mesh Types
export type EventStatus = 'published' | 'processing' | 'processed' | 'failed' | 'dead_letter';
export type EndpointType = 'webhook' | 'queue' | 'function' | 'email';

export interface Event {
  id: string;
  eventType: string;
  source: string;
  sourceId?: string;
  correlationId?: string;
  causationId?: string;
  priority: number;
  payload: Record<string, any>;
  metadata: Record<string, any>;
  status: EventStatus;
  retryCount: number;
  maxRetries: number;
  processedAt?: string;
  errorMessage?: string;
  publishedAt: string;
}

export interface EventType {
  id: string;
  name: string;
  description?: string;
  category: string;
  schema: Record<string, any>;
  isSystem: boolean;
  createdAt: string;
}

export interface EventSubscription {
  id: string;
  userId?: string;
  organizationId?: string;
  name: string;
  eventPattern: string;
  eventTypes: string[];
  filterExpression?: string;
  endpointUrl?: string;
  endpointType: EndpointType;
  headers: Record<string, string>;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tool Bus Types
export type InvocationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'timeout';

export interface Tool {
  id: string;
  name: string;
  description?: string;
  category: string;
  version: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  permissions: string[];
  rateLimit?: number;
  timeoutMs: number;
  isSystem: boolean;
  isAsync: boolean;
  handlerPath?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ToolInvocation {
  id: string;
  toolId: string;
  tool?: Tool;
  agentInstanceId?: string;
  userId?: string;
  correlationId?: string;
  inputData: Record<string, any>;
  outputData?: Record<string, any>;
  status: InvocationStatus;
  errorMessage?: string;
  executionTimeMs?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

// Agent Marketplace Types
export type PricingModel = 'free' | 'subscription' | 'one_time' | 'usage';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type InstallationStatus = 'active' | 'disabled' | 'error' | 'update_available';

export interface AgentListing {
  id: string;
  agentId: string;
  agent?: Agent;
  authorId?: string;
  authorName?: string;
  category: string;
  shortDescription?: string;
  longDescription?: string;
  icon?: string;
  screenshots: string[];
  demoUrl?: string;
  pricingModel: PricingModel;
  priceAmount?: number;
  priceCurrency: string;
  subscriptionInterval?: string;
  rating: number;
  ratingCount: number;
  downloadCount: number;
  installCount: number;
  isFeatured: boolean;
  isVerified: boolean;
  isPremium: boolean;
  isActive: boolean;
  tags: string[];
  supportedPlatforms: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentReview {
  id: string;
  marketplaceId: string;
  userId: string;
  user?: any;
  rating: number;
  title?: string;
  content?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AgentInstallation {
  id: string;
  marketplaceId: string;
  marketplace?: AgentListing;
  userId: string;
  organizationId?: string;
  installedAgentId?: string;
  installedAgent?: Agent;
  version: string;
  config: Record<string, any>;
  status: InstallationStatus;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Enterprise Workspace Types
export type OrganizationPlan = 'free' | 'starter' | 'professional' | 'enterprise';
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';
export type ProjectStatus = 'active' | 'archived' | 'completed';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  plan: OrganizationPlan;
  settings: Record<string, any>;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  organization?: Organization;
  userId: string;
  user?: any;
  role: MemberRole;
  departmentId?: string;
  department?: Department;
  title?: string;
  permissions: string[];
  joinedAt: string;
}

export interface Department {
  id: string;
  organizationId: string;
  organization?: Organization;
  name: string;
  description?: string;
  parentDepartmentId?: string;
  parentDepartment?: Department;
  headUserId?: string;
  headUser?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  organizationId: string;
  organization?: Organization;
  departmentId?: string;
  department?: Department;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  team?: Team;
  userId: string;
  user?: any;
  role: MemberRole;
  permissions: string[];
  joinedAt: string;
}

export interface Project {
  id: string;
  organizationId: string;
  organization?: Organization;
  teamId?: string;
  team?: Team;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  project?: Project;
  userId: string;
  user?: any;
  role: MemberRole;
}

// API Request/Response Types
export interface CreateAgentDto {
  name: string;
  slug: string;
  description?: string;
  version: string;
  agentType: string;
  capabilities?: string[];
  permissions?: string[];
  config?: Record<string, any>;
  dependencies?: string[];
  organizationId?: string;
}

export interface StartAgentDto {
  missionId?: string;
  organizationId?: string;
  input?: Record<string, any>;
  resources?: Record<string, any>;
}

export interface PublishEventDto {
  eventType: string;
  source: string;
  sourceId?: string;
  correlationId?: string;
  causationId?: string;
  priority?: number;
  payload: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CreateSubscriptionDto {
  name: string;
  eventPattern: string;
  eventTypes?: string[];
  filterExpression?: string;
  endpointUrl?: string;
  endpointType?: EndpointType;
  headers?: Record<string, string>;
}

export interface CreateToolDto {
  name: string;
  description?: string;
  category: string;
  version: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  permissions?: string[];
  rateLimit?: number;
  timeoutMs?: number;
  isAsync?: boolean;
  handlerPath?: string;
}

export interface InvokeToolDto {
  input: Record<string, any>;
  agentInstanceId?: string;
  correlationId?: string;
}

export interface CreateAgentListingDto {
  agentId: string;
  category: string;
  shortDescription?: string;
  longDescription?: string;
  icon?: string;
  screenshots?: string[];
  demoUrl?: string;
  pricingModel?: PricingModel;
  priceAmount?: number;
  priceCurrency?: string;
  tags?: string[];
  supportedPlatforms?: string[];
}

export interface InstallAgentDto {
  marketplaceId: string;
  organizationId?: string;
  config?: Record<string, any>;
}

export interface CreateOrganizationDto {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  plan?: OrganizationPlan;
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  departmentId?: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  teamId?: string;
  startDate?: string;
  endDate?: string;
}

export interface AddTeamMemberDto {
  userId: string;
  role?: MemberRole;
  permissions?: string[];
}

export interface AddProjectMemberDto {
  userId: string;
  role?: MemberRole;
}
