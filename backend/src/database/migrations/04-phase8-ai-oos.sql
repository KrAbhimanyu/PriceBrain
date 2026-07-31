-- ============================================================
-- Phase 8: AI Organization Operating System (AI-OOS)
-- PriceBrain - Final Architecture Phase
-- ============================================================

-- ============================================================
-- EXECUTIVE INTELLIGENCE
-- ============================================================

-- Chief AI agents (one per organization)
CREATE TABLE chief_ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) DEFAULT 'Chief AI Officer',
    responsibilities JSONB DEFAULT '[]',
    strategic_goals JSONB DEFAULT '[]',
    key_decisions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id)
);

-- Executive decisions
CREATE TABLE executive_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    chief_ai_id UUID REFERENCES chief_ai_agents(id),
    department_id UUID REFERENCES departments(id),
    decision_type VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    context JSONB DEFAULT '{}',
    rationale TEXT,
    alternatives JSONB DEFAULT '[]',
    outcome JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending',
    priority INTEGER DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'medium',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_by UUID REFERENCES users(id),
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_executive_decisions_org ON executive_decisions(organization_id);
CREATE INDEX idx_executive_decisions_status ON executive_decisions(status);
CREATE INDEX idx_executive_decisions_type ON executive_decisions(decision_type);

-- ============================================================
-- AI CONSTITUTION
-- ============================================================

-- AI Constitution rules
CREATE TABLE constitution_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    is_global BOOLEAN DEFAULT false,
    rule_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rule_text TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    is_immutable BOOLEAN DEFAULT false,
    is_enforced BOOLEAN DEFAULT true,
    exceptions JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_constitution_rules_org ON constitution_rules(organization_id);
CREATE INDEX idx_constitution_rules_type ON constitution_rules(rule_type);

-- Constitution violations
CREATE TABLE constitution_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES constitution_rules(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    violated_by UUID REFERENCES users(id),
    agent_instance_id UUID,
    workflow_id UUID,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'low',
    status VARCHAR(50) DEFAULT 'open',
    resolution TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_violations_rule ON constitution_violations(rule_id);
CREATE INDEX idx_violations_org ON constitution_violations(organization_id);
CREATE INDEX idx_violations_status ON constitution_violations(status);

-- ============================================================
-- DIGITAL TWIN ENGINE
-- ============================================================

-- Digital twins
CREATE TABLE digital_twins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    model_state JSONB DEFAULT '{}',
    sync_status VARCHAR(50) DEFAULT 'synced',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    health_score DECIMAL(5,2) DEFAULT 100.00,
    risk_score DECIMAL(5,2) DEFAULT 0.00,
    performance_score DECIMAL(5,2) DEFAULT 100.00,
    metrics JSONB DEFAULT '{}',
    configurations JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Digital twin components
CREATE TABLE twin_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID NOT NULL REFERENCES digital_twins(id) ON DELETE CASCADE,
    component_type VARCHAR(100) NOT NULL,
    component_id UUID NOT NULL,
    state JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    health_status VARCHAR(50) DEFAULT 'healthy',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(twin_id, component_type, component_id)
);

CREATE INDEX idx_twin_components_twin ON twin_components(twin_id);

-- Digital twin snapshots
CREATE TABLE twin_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID NOT NULL REFERENCES digital_twins(id) ON DELETE CASCADE,
    snapshot_data JSONB NOT NULL,
    health_score DECIMAL(5,2),
    risk_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_twin_snapshots_twin ON twin_snapshots(twin_id);

-- ============================================================
-- SIMULATION ENGINE
-- ============================================================

-- Simulations
CREATE TABLE simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    simulation_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    parameters JSONB NOT NULL DEFAULT '{}',
    initial_state JSONB DEFAULT '{}',
    iterations INTEGER DEFAULT 1000,
    duration_days INTEGER,
    confidence_level DECIMAL(5,2) DEFAULT 95.00,
    status VARCHAR(50) DEFAULT 'pending',
    results JSONB DEFAULT '{}',
    predictions JSONB DEFAULT '{}',
    risks JSONB DEFAULT '[]',
    alternatives JSONB DEFAULT '[]',
    success_probability DECIMAL(5,2),
    expected_cost DECIMAL(15,2),
    expected_timeline VARCHAR(100),
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_simulations_org ON simulations(organization_id);
CREATE INDEX idx_simulations_type ON simulations(simulation_type);
CREATE INDEX idx_simulations_status ON simulations(status);

-- Simulation scenarios
CREATE TABLE simulation_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_id UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    scenario_data JSONB NOT NULL,
    outcomes JSONB DEFAULT '{}',
    probability DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scenarios_simulation ON simulation_scenarios(simulation_id);

-- ============================================================
-- GOVERNANCE ENGINE
-- ============================================================

-- Governance policies
CREATE TABLE governance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    is_global BOOLEAN DEFAULT false,
    policy_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rules JSONB DEFAULT '[]',
    enforcement_level VARCHAR(50) DEFAULT 'advisory',
    compliance_requirements JSONB DEFAULT '[]',
    audit_frequency VARCHAR(50),
    last_audit_at TIMESTAMP WITH TIME ZONE,
    next_audit_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_governance_policies_org ON governance_policies(organization_id);
CREATE INDEX idx_governance_policies_type ON governance_policies(policy_type);

-- Governance audits
CREATE TABLE governance_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES governance_policies(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    audit_type VARCHAR(100) NOT NULL,
    findings JSONB DEFAULT '[]',
    violations JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    overall_status VARCHAR(50) DEFAULT 'pending',
    compliance_score DECIMAL(5,2),
    auditor_id UUID REFERENCES users(id),
    audit_period_start TIMESTAMP WITH TIME ZONE,
    audit_period_end TIMESTAMP WITH TIME ZONE,
    report_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audits_policy ON governance_audits(policy_id);
CREATE INDEX idx_audits_org ON governance_audits(organization_id);

-- Governance reports
CREATE TABLE governance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    report_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    findings JSONB DEFAULT '[]',
    metrics JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'draft',
    generated_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_governance_reports_org ON governance_reports(organization_id);

-- ============================================================
-- ENTERPRISE MEMORY
-- ============================================================

-- Enterprise memory entries
CREATE TABLE enterprise_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    memory_type VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    source_type VARCHAR(50),
    source_id UUID,
    importance DECIMAL(3,2) DEFAULT 0.50,
    accessibility VARCHAR(50) DEFAULT 'organization',
    tags JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_enterprise_memory_org ON enterprise_memory(organization_id);
CREATE INDEX idx_enterprise_memory_dept ON enterprise_memory(department_id);
CREATE INDEX idx_enterprise_memory_type ON enterprise_memory(memory_type);
CREATE INDEX idx_enterprise_memory_tags ON enterprise_memory USING GIN(tags);

-- Memory associations
CREATE TABLE memory_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID NOT NULL REFERENCES enterprise_memory(id) ON DELETE CASCADE,
    associated_id UUID NOT NULL,
    association_type VARCHAR(100),
    strength DECIMAL(3,2) DEFAULT 0.50,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(memory_id, associated_id)
);

CREATE INDEX idx_memory_associations_memory ON memory_associations(memory_id);

-- ============================================================
-- ORGANIZATION ANALYTICS
-- ============================================================

-- Organization metrics
CREATE TABLE organization_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(50),
    dimensions JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_org_metrics_org ON organization_metrics(organization_id);
CREATE INDEX idx_org_metrics_type ON organization_metrics(metric_type);
CREATE INDEX idx_org_metrics_recorded ON organization_metrics(recorded_at);

-- Department metrics
CREATE TABLE department_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(50),
    dimensions JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dept_metrics_dept ON department_metrics(department_id);

-- Collaboration metrics
CREATE TABLE collaboration_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source_department_id UUID REFERENCES departments(id),
    target_department_id UUID REFERENCES departments(id),
    collaboration_type VARCHAR(100) NOT NULL,
    interaction_count INTEGER DEFAULT 0,
    effectiveness_score DECIMAL(5,2),
    quality_score DECIMAL(5,2),
    response_time_avg INTEGER,
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_collab_metrics_org ON collaboration_metrics(organization_id);

-- ============================================================
-- DEPARTMENT RUNTIME TEMPLATES
-- ============================================================

-- Department templates
CREATE TABLE department_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    default_agents JSONB DEFAULT '[]',
    default_workflows JSONB DEFAULT '[]',
    default_policies JSONB DEFAULT '[]',
    default_kpis JSONB DEFAULT '[]',
    default_tools JSONB DEFAULT '[]',
    structure JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CROSS-DEPARTMENT COLLABORATION
-- ============================================================

-- Collaboration workflows
CREATE TABLE collaboration_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_steps JSONB NOT NULL DEFAULT '[]',
    departments_involved JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'active',
    current_step INTEGER DEFAULT 0,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_collab_workflows_org ON collaboration_workflows(organization_id);

-- ============================================================
-- SELF EVOLUTION TRACKING
-- ============================================================

-- Evolution metrics
CREATE TABLE evolution_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL,
    before_value DECIMAL(15,4),
    after_value DECIMAL(15,4),
    improvement_percentage DECIMAL(5,2),
    change_reason TEXT,
    approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evolution_metrics_org ON evolution_metrics(organization_id);

-- ============================================================
-- INSERT DEFAULT DATA
-- ============================================================

-- Insert department templates
INSERT INTO department_templates (template_type, name, description, default_agents, default_kpis, structure) VALUES
('engineering', 'Engineering Department', 'Software development and technical operations', 
 '["software-engineer", "qa-engineer", "devops"]',
 '["velocity", "bug-rate", "deployment-frequency", "mttr"]',
 '{"roles": ["developer", "qa", "devops", "architect"], "tools": ["git", "ci-cd", "monitoring"]}'),

('commerce', 'Commerce Department', 'Sales, marketing, and customer acquisition',
 '["sales-agent", "marketing-agent", "customer-success"]',
 '["revenue", "conversion-rate", "customer-acquisition-cost", "lifetime-value"]',
 '{"roles": ["sales", "marketing", "customer-success"], "tools": ["crm", "analytics", "automation"]}'),

('finance', 'Finance Department', 'Financial planning, accounting, and reporting',
 '["accountant", "financial-analyst", "auditor"]',
 '["revenue", "expenses", "profit-margin", "cash-flow"]',
 '{"roles": ["accountant", "analyst", "controller"], "tools": ["erp", "accounting", "reporting"]}'),

('hr', 'Human Resources', 'Talent acquisition, development, and management',
 '["recruiter", "training-coordinator", "compliance-officer"]',
 '["turnover-rate", "employee-satisfaction", "hiring-time", "training-hours"]',
 '{"roles": ["recruiter", "hrbp", "training"], "tools": ["ats", "lms", "performance-management"]}'),

('operations', 'Operations Department', 'Day-to-day business operations and process optimization',
 '["operations-manager", "process-analyst", "project-manager"]',
 '["efficiency", "cost-per-transaction", "resolution-time", "uptime"]',
 '{"roles": ["manager", "analyst", "coordinator"], "tools": ["workflow", "project-management", "reporting"]}');

-- Insert global constitution rules
INSERT INTO constitution_rules (is_global, rule_type, title, description, rule_text, priority, is_immutable) VALUES
(true, 'human_approval', 'Human Approval Required', 'Critical actions require human approval', 
 'All financial transactions above threshold, personnel decisions, and policy changes require explicit human approval before execution.', 100, true),

(true, 'data_privacy', 'Data Privacy Protection', 'Protect confidential and personal data',
 'AI agents must never expose confidential information, personal data, or trade secrets without explicit authorization and need-to-know basis.', 90, true),

(true, 'transparency', 'Decision Transparency', 'Explain important decisions',
 'All significant AI decisions affecting organization operations must be explainable and documented with clear reasoning.', 80, true),

(true, 'compliance', 'Regulatory Compliance', 'Adhere to all applicable laws and regulations',
 'Organization operations must comply with applicable laws, regulations, and industry standards.', 95, true),

(true, 'security', 'Security First', 'Maintain security at all times',
 'Security vulnerabilities must be addressed immediately. No feature or optimization should compromise system security.', 95, true);
