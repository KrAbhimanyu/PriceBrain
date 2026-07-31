// Phase 8: AI Organization Operating System Types

// Executive Intelligence
export type DecisionStatus = 'pending' | 'approved' | 'rejected' | 'implemented';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ChiefAIAgent {
  id: string;
  organizationId: string;
  agentId: string;
  agent?: any;
  name: string;
  title: string;
  responsibilities: string[];
  strategicGoals: string[];
  keyDecisions: Record<string, any>[];
  isActive: boolean;
  performanceMetrics: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutiveDecision {
  id: string;
  organizationId: string;
  chiefAiId?: string;
  chiefAi?: ChiefAIAgent;
  departmentId?: string;
  department?: any;
  decisionType: string;
  title: string;
  description?: string;
  context: Record<string, any>;
  rationale?: string;
  alternatives: Record<string, any>[];
  outcome: Record<string, any>;
  status: DecisionStatus;
  priority: number;
  riskLevel: RiskLevel;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Digital Twin
export type SyncStatus = 'synced' | 'syncing' | 'error';
export type ComponentHealth = 'healthy' | 'degraded' | 'unhealthy';

export interface DigitalTwin {
  id: string;
  organizationId: string;
  organization?: any;
  name: string;
  description?: string;
  modelState: Record<string, any>;
  syncStatus: SyncStatus;
  lastSyncAt?: string;
  healthScore: number;
  riskScore: number;
  performanceScore: number;
  metrics: Record<string, any>;
  configurations: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TwinComponent {
  id: string;
  twinId: string;
  twin?: DigitalTwin;
  componentType: string;
  componentId: string;
  state: Record<string, any>;
  metrics: Record<string, any>;
  healthStatus: ComponentHealth;
  lastUpdated?: string;
  createdAt: string;
}

export interface TwinSnapshot {
  id: string;
  twinId: string;
  twin?: DigitalTwin;
  snapshotData: Record<string, any>;
  healthScore?: number;
  riskScore?: number;
  createdAt: string;
}

// Simulation
export type SimulationStatus = 'pending' | 'running' | 'completed' | 'failed';
export type SimulationType = 'business_growth' | 'hiring' | 'budget_change' | 'marketing_campaign' | 'infrastructure' | 'project_planning';

export interface Simulation {
  id: string;
  organizationId: string;
  organization?: any;
  simulationType: SimulationType;
  title: string;
  description?: string;
  parameters: Record<string, any>;
  initialState: Record<string, any>;
  iterations: number;
  durationDays?: number;
  confidenceLevel: number;
  status: SimulationStatus;
  results: Record<string, any>;
  predictions: Record<string, any>;
  risks: Record<string, any>[];
  alternatives: Record<string, any>[];
  successProbability?: number;
  expectedCost?: number;
  expectedTimeline?: string;
  createdBy?: string;
  creator?: any;
  approvedBy?: string;
  approver?: any;
  metadata: Record<string, any>;
  createdAt: string;
  completedAt?: string;
}

export interface SimulationScenario {
  id: string;
  simulationId: string;
  simulation?: Simulation;
  name: string;
  description?: string;
  scenarioData: Record<string, any>;
  outcomes: Record<string, any>;
  probability?: number;
  createdAt: string;
}

// AI Constitution
export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ViolationStatus = 'open' | 'investigating' | 'resolved';

export interface ConstitutionRule {
  id: string;
  organizationId?: string;
  organization?: any;
  isGlobal: boolean;
  ruleType: string;
  title: string;
  description?: string;
  ruleText: string;
  priority: number;
  isImmutable: boolean;
  isEnforced: boolean;
  exceptions: Record<string, any>[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ConstitutionViolation {
  id: string;
  ruleId: string;
  rule?: ConstitutionRule;
  organizationId: string;
  organization?: any;
  violatedBy?: string;
  violator?: any;
  agentInstanceId?: string;
  workflowId?: string;
  description: string;
  severity: ViolationSeverity;
  status: ViolationStatus;
  resolution?: string;
  resolvedBy?: string;
  resolver?: any;
  resolvedAt?: string;
  metadata: Record<string, any>;
  createdAt: string;
}

// Governance
export type EnforcementLevel = 'advisory' | 'enforcing' | 'strict';
export type AuditStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type ComplianceScore = number;

export interface GovernancePolicy {
  id: string;
  organizationId?: string;
  organization?: any;
  isGlobal: boolean;
  policyType: string;
  title: string;
  description?: string;
  rules: Record<string, any>[];
  enforcementLevel: EnforcementLevel;
  complianceRequirements: Record<string, any>[];
  auditFrequency?: string;
  lastAuditAt?: string;
  nextAuditAt?: string;
  status: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface GovernanceAudit {
  id: string;
  policyId?: string;
  policy?: GovernancePolicy;
  organizationId: string;
  organization?: any;
  auditType: string;
  findings: Record<string, any>[];
  violations: Record<string, any>[];
  recommendations: Record<string, any>[];
  overallStatus: AuditStatus;
  complianceScore?: ComplianceScore;
  auditorId?: string;
  auditor?: any;
  auditPeriodStart?: string;
  auditPeriodEnd?: string;
  reportUrl?: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface GovernanceReport {
  id: string;
  organizationId: string;
  organization?: any;
  reportType: string;
  title: string;
  summary?: string;
  findings: Record<string, any>[];
  metrics: Record<string, any>;
  recommendations: Record<string, any>[];
  status: string;
  generatedBy?: string;
  generator?: any;
  approvedBy?: string;
  approver?: any;
  publishedAt?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Enterprise Memory
export type MemoryType = 'conversation' | 'mission' | 'project' | 'department' | 'organization' | 'knowledge' | 'learning' | 'historical';
export type Accessibility = 'public' | 'organization' | 'department' | 'private';

export interface EnterpriseMemory {
  id: string;
  organizationId?: string;
  organization?: any;
  departmentId?: string;
  department?: any;
  memoryType: MemoryType;
  title?: string;
  content: string;
  sourceType?: string;
  sourceId?: string;
  importance: number;
  accessibility: Accessibility;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryAssociation {
  id: string;
  memoryId: string;
  memory?: EnterpriseMemory;
  associatedId: string;
  associationType?: string;
  strength: number;
  metadata: Record<string, any>;
  createdAt: string;
}

// Organization Analytics
export interface OrganizationMetric {
  id: string;
  organizationId: string;
  organization?: any;
  metricType: string;
  metricName: string;
  value: number;
  unit?: string;
  dimensions: Record<string, any>;
  recordedAt: string;
  createdAt: string;
}

export interface DepartmentMetric {
  id: string;
  departmentId: string;
  department?: any;
  metricType: string;
  metricName: string;
  value: number;
  unit?: string;
  dimensions: Record<string, any>;
  recordedAt: string;
  createdAt: string;
}

export interface CollaborationMetric {
  id: string;
  organizationId: string;
  organization?: any;
  sourceDepartmentId?: string;
  sourceDepartment?: any;
  targetDepartmentId?: string;
  targetDepartment?: any;
  collaborationType: string;
  interactionCount: number;
  effectivenessScore?: number;
  qualityScore?: number;
  responseTimeAvg?: number;
  metadata: Record<string, any>;
  recordedAt: string;
  createdAt: string;
}

// Department Templates
export interface DepartmentTemplate {
  id: string;
  templateType: string;
  name: string;
  description?: string;
  defaultAgents: string[];
  defaultWorkflows: string[];
  defaultPolicies: string[];
  defaultKpis: string[];
  defaultTools: string[];
  structure: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Collaboration Workflows
export interface CollaborationWorkflow {
  id: string;
  organizationId: string;
  organization?: any;
  name: string;
  description?: string;
  workflowSteps: Record<string, any>[];
  departmentsInvolved: string[];
  status: string;
  currentStep: number;
  metrics: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Evolution Metrics
export interface EvolutionMetric {
  id: string;
  organizationId: string;
  organization?: any;
  metricType: string;
  beforeValue?: number;
  afterValue?: number;
  improvementPercentage?: number;
  changeReason?: string;
  approved: boolean;
  approvedBy?: string;
  approver?: any;
  metadata: Record<string, any>;
  createdAt: string;
}

// DTOs
export interface CreateChiefAIDto {
  organizationId: string;
  agentId: string;
  name: string;
  title?: string;
  responsibilities?: string[];
  strategicGoals?: string[];
}

export interface CreateDecisionDto {
  chiefAiId?: string;
  departmentId?: string;
  decisionType: string;
  title: string;
  description?: string;
  context?: Record<string, any>;
  rationale?: string;
  alternatives?: Record<string, any>[];
  priority?: number;
  riskLevel?: RiskLevel;
}

export interface CreateSimulationDto {
  organizationId: string;
  simulationType: SimulationType;
  title: string;
  description?: string;
  parameters: Record<string, any>;
  initialState?: Record<string, any>;
  iterations?: number;
  durationDays?: number;
  confidenceLevel?: number;
}

export interface SyncDigitalTwinDto {
  components: {
    componentType: string;
    componentId: string;
    state: Record<string, any>;
    metrics?: Record<string, any>;
  }[];
}
