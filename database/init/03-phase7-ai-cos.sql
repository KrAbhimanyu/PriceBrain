-- PriceBrain Phase 7: AI Commerce Operating System (AI-COS)
-- Database Schema for AI Kernel, Event Mesh, Agent Marketplace, Enterprise Workspace, and Commerce Cloud

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AI KERNEL STATE
-- ============================================

-- Kernel state machine for managing platform state
CREATE TABLE IF NOT EXISTS kernel_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state_key VARCHAR(100) UNIQUE NOT NULL,
    state_value JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kernel_state_key ON kernel_state(state_key);

-- Agent registry
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID, -- Will reference organizations table
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    version VARCHAR(20) NOT NULL,
    agent_type VARCHAR(50) NOT NULL,
    capabilities JSONB DEFAULT '[]',
    permissions JSONB DEFAULT '[]',
    config JSONB DEFAULT '{}',
    status VARCHAR(30) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'running', 'paused', 'error')),
    health_status VARCHAR(30) DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
    health_checks JSONB DEFAULT '{"lastCheck": null, "failures": 0}',
    is_system BOOLEAN DEFAULT false,
    is_marketplace BOOLEAN DEFAULT false,
    marketplace_id UUID,
    parent_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    dependencies JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agents_owner ON agents(owner_id);
CREATE INDEX idx_agents_org ON agents(organization_id);
CREATE INDEX idx_agents_type ON agents(agent_type);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_marketplace ON agents(marketplace_id);

-- Agent instances
CREATE TABLE IF NOT EXISTS agent_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID,
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'paused')),
    state JSONB DEFAULT '{}',
    resources JSONB DEFAULT '{}',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_instances_agent ON agent_instances(agent_id);
CREATE INDEX idx_agent_instances_user ON agent_instances(user_id);
CREATE INDEX idx_agent_instances_mission ON agent_instances(mission_id);
CREATE INDEX idx_agent_instances_status ON agent_instances(status);

-- ============================================
-- EVENT MESH
-- ============================================

-- Event types
CREATE TABLE IF NOT EXISTS event_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    schema JSONB DEFAULT '{}',
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_types_name ON event_types(name);
CREATE INDEX idx_event_types_category ON event_types(category);

-- Events (append-only log)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL,
    source_id VARCHAR(100),
    correlation_id UUID,
    causation_id UUID,
    priority INTEGER DEFAULT 0,
    payload JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    status VARCHAR(30) DEFAULT 'published' CHECK (status IN ('published', 'processing', 'processed', 'failed', 'dead_letter')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    processed_at TIMESTAMP,
    error_message TEXT,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_source ON events(source);
CREATE INDEX idx_events_correlation ON events(correlation_id);
CREATE INDEX idx_events_causation ON events(causation_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_published ON events(published_at DESC);
CREATE INDEX idx_events_priority ON events(priority DESC, published_at ASC);

-- Subscriptions
CREATE TABLE IF NOT EXISTS event_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID,
    name VARCHAR(255) NOT NULL,
    event_pattern VARCHAR(255) NOT NULL,
    event_types JSONB DEFAULT '[]',
    filter_expression TEXT,
    endpoint_url VARCHAR(500),
    endpoint_type VARCHAR(30) DEFAULT 'webhook' CHECK (endpoint_type IN ('webhook', 'queue', 'function', 'email')),
    headers JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_subs_user ON event_subscriptions(user_id);
CREATE INDEX idx_event_subs_org ON event_subscriptions(organization_id);
CREATE INDEX idx_event_subs_active ON event_subscriptions(is_active);

-- ============================================
-- TOOL BUS
-- ============================================

-- Tool registry
CREATE TABLE IF NOT EXISTS tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    version VARCHAR(20) NOT NULL,
    input_schema JSONB NOT NULL,
    output_schema JSONB NOT NULL,
    permissions JSONB DEFAULT '[]',
    rate_limit INTEGER,
    timeout_ms INTEGER DEFAULT 30000,
    is_system BOOLEAN DEFAULT false,
    is_async BOOLEAN DEFAULT false,
    handler_path VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tools_name ON tools(name);
CREATE INDEX idx_tools_category ON tools(category);

-- Tool invocations
CREATE TABLE IF NOT EXISTS tool_invocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    agent_instance_id UUID REFERENCES agent_instances(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    correlation_id UUID,
    input_data JSONB NOT NULL,
    output_data JSONB,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'timeout')),
    error_message TEXT,
    execution_time_ms INTEGER,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tool_invocations_tool ON tool_invocations(tool_id);
CREATE INDEX idx_tool_invocations_agent ON tool_invocations(agent_instance_id);
CREATE INDEX idx_tool_invocations_user ON tool_invocations(user_id);
CREATE INDEX idx_tool_invocations_status ON tool_invocations(status);

-- ============================================
-- ENTERPRISE WORKSPACE
-- ============================================

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo VARCHAR(500),
    website VARCHAR(500),
    plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orgs_slug ON organizations(slug);
CREATE INDEX idx_orgs_active ON organizations(is_active);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    head_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_departments_org ON departments(organization_id);
CREATE INDEX idx_departments_parent ON departments(parent_department_id);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_org ON teams(organization_id);
CREATE INDEX idx_teams_dept ON teams(department_id);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    permissions JSONB DEFAULT '[]',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- Organization members
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    title VARCHAR(100),
    permissions JSONB DEFAULT '[]',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_team ON projects(team_id);

-- Project members
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- ============================================
-- AGENT MARKETPLACE
-- ============================================

-- Agent listings
CREATE TABLE IF NOT EXISTS agent_marketplace (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    short_description VARCHAR(255),
    long_description TEXT,
    icon VARCHAR(500),
    screenshots JSONB DEFAULT '[]',
    demo_url VARCHAR(500),
    pricing_model VARCHAR(30) DEFAULT 'free' CHECK (pricing_model IN ('free', 'subscription', 'one_time', 'usage')),
    price_amount DECIMAL(10,2),
    price_currency VARCHAR(10) DEFAULT 'USD',
    subscription_interval VARCHAR(20),
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    install_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    tags JSONB DEFAULT '[]',
    supported_platforms JSONB DEFAULT '["web"]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_marketplace_agent ON agent_marketplace(agent_id);
CREATE INDEX idx_agent_marketplace_category ON agent_marketplace(category);
CREATE INDEX idx_agent_marketplace_active ON agent_marketplace(is_active);
CREATE INDEX idx_agent_marketplace_featured ON agent_marketplace(is_featured);

-- Agent reviews
CREATE TABLE IF NOT EXISTS agent_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    marketplace_id UUID NOT NULL REFERENCES agent_marketplace(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(marketplace_id, user_id)
);

CREATE INDEX idx_agent_reviews_marketplace ON agent_reviews(marketplace_id);
CREATE INDEX idx_agent_reviews_user ON agent_reviews(user_id);

-- Agent installations
CREATE TABLE IF NOT EXISTS agent_installations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    marketplace_id UUID NOT NULL REFERENCES agent_marketplace(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    installed_agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    config JSONB DEFAULT '{}',
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'error', 'update_available')),
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(marketplace_id, user_id, organization_id)
);

CREATE INDEX idx_agent_installations_user ON agent_installations(user_id);
CREATE INDEX idx_agent_installations_org ON agent_installations(organization_id);
CREATE INDEX idx_agent_installations_agent ON agent_installations(installed_agent_id);

-- ============================================
-- COMMERCE CLOUD
-- ============================================

-- Connectors
CREATE TABLE IF NOT EXISTS commerce_connectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    connector_type VARCHAR(50) NOT NULL CHECK (connector_type IN (
        'marketplace', 'brand', 'retailer', 'supplier', 'payment', 'shipping',
        'erp', 'crm', 'inventory', 'analytics', 'custom'
    )),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo VARCHAR(500),
    api_endpoint VARCHAR(500),
    api_key_encrypted TEXT,
    webhook_url VARCHAR(500),
    webhook_secret_encrypted TEXT,
    config JSONB DEFAULT '{}',
    status VARCHAR(30) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'pending')),
    is_verified BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    is_official BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commerce_connectors_type ON commerce_connectors(connector_type);
CREATE INDEX idx_commerce_connectors_owner ON commerce_connectors(owner_id);
CREATE INDEX idx_commerce_connectors_org ON commerce_connectors(organization_id);
CREATE INDEX idx_commerce_connectors_status ON commerce_connectors(status);

-- Connector sync logs
CREATE TABLE IF NOT EXISTS connector_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connector_id UUID NOT NULL REFERENCES commerce_connectors(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    items_processed INTEGER DEFAULT 0,
    items_created INTEGER DEFAULT 0,
    items_updated INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_connector_sync_connector ON connector_sync_logs(connector_id);
CREATE INDEX idx_connector_sync_status ON connector_sync_logs(status);

-- ============================================
-- WORKFLOW STUDIO
-- ============================================

-- Workflow templates
CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50),
    version VARCHAR(20) NOT NULL,
    template_data JSONB NOT NULL,
    thumbnail VARCHAR(500),
    is_marketplace BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    pricing_model VARCHAR(30) DEFAULT 'free',
    price_amount DECIMAL(10,2),
    tags JSONB DEFAULT '[]',
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_templates_author ON workflow_templates(author_id);
CREATE INDEX idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX idx_workflow_templates_marketplace ON workflow_templates(is_marketplace);

-- ============================================
-- AI APP STORE
-- ============================================

-- App listings (generalized for plugins, agents, templates, etc.)
CREATE TABLE IF NOT EXISTS app_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    app_type VARCHAR(30) NOT NULL CHECK (app_type IN ('plugin', 'agent', 'template', 'workflow', 'policy_pack', 'automation_pack', 'connector', 'theme')),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description VARCHAR(255),
    long_description TEXT,
    category VARCHAR(50) NOT NULL,
    icon VARCHAR(500),
    screenshots JSONB DEFAULT '[]',
    demo_url VARCHAR(500),
    documentation_url VARCHAR(500),
    support_url VARCHAR(500),
    pricing_model VARCHAR(30) DEFAULT 'free' CHECK (pricing_model IN ('free', 'subscription', 'one_time', 'usage')),
    price_amount DECIMAL(10,2),
    price_currency VARCHAR(10) DEFAULT 'USD',
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    install_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    manifest JSONB NOT NULL,
    tags JSONB DEFAULT '[]',
    supported_platforms JSONB DEFAULT '["web"]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_app_listings_type ON app_listings(app_type);
CREATE INDEX idx_app_listings_category ON app_listings(category);
CREATE INDEX idx_app_listings_active ON app_listings(is_active);
CREATE INDEX idx_app_listings_featured ON app_listings(is_featured);

-- App installations
CREATE TABLE IF NOT EXISTS app_installations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES app_listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    installed_item_id UUID, -- References the actual installed item (agent, plugin, etc.)
    version VARCHAR(20) NOT NULL,
    config JSONB DEFAULT '{}',
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'error', 'update_available')),
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(listing_id, user_id, organization_id)
);

CREATE INDEX idx_app_installations_user ON app_installations(user_id);
CREATE INDEX idx_app_installations_org ON app_installations(organization_id);

-- ============================================
-- OBSERVABILITY
-- ============================================

-- System metrics
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(50),
    dimensions JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_metrics_type ON system_metrics(metric_type);
CREATE INDEX idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX idx_system_metrics_timestamp ON system_metrics(timestamp DESC);

-- Distributed traces
CREATE TABLE IF NOT EXISTS traces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trace_id UUID NOT NULL,
    span_id UUID NOT NULL,
    parent_span_id UUID,
    operation_name VARCHAR(255) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    status_code VARCHAR(20),
    duration_ms INTEGER,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    tags JSONB DEFAULT '{}',
    logs JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_traces_trace ON traces(trace_id);
CREATE INDEX idx_traces_span ON traces(span_id);
CREATE INDEX idx_traces_parent ON traces(parent_span_id);
CREATE INDEX idx_traces_service ON traces(service_name);
CREATE INDEX idx_traces_time ON traces(start_time DESC);

-- Alert rules
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    metric_type VARCHAR(100) NOT NULL,
    condition VARCHAR(50) NOT NULL,
    threshold DECIMAL(15,4) NOT NULL,
    evaluation_window VARCHAR(20) DEFAULT '5m',
    notification_channels JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alert_rules_active ON alert_rules(is_active);

-- Alert instances
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    metric_value DECIMAL(15,4),
    threshold_value DECIMAL(15,4),
    status VARCHAR(30) DEFAULT 'firing' CHECK (status IN ('firing', 'acknowledged', 'resolved')),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_rule ON alerts(rule_id);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);

-- ============================================
-- KNOWLEDGE GRAPH
-- ============================================

-- Knowledge graph nodes
CREATE TABLE IF NOT EXISTS kg_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    properties JSONB DEFAULT '{}',
    embeddings JSONB,
    confidence_score DECIMAL(3,2),
    source VARCHAR(100),
    source_id VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entity_type, entity_id)
);

CREATE INDEX idx_kg_nodes_type ON kg_nodes(entity_type);
CREATE INDEX idx_kg_nodes_entity ON kg_nodes(entity_id);
CREATE INDEX idx_kg_nodes_name ON kg_nodes(name);

-- Knowledge graph relationships
CREATE TABLE IF NOT EXISTS kg_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_node_id UUID NOT NULL REFERENCES kg_nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES kg_nodes(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL,
    properties JSONB DEFAULT '{}',
    confidence_score DECIMAL(3,2),
    weight DECIMAL(5,4) DEFAULT 1.0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_node_id, target_node_id, relationship_type)
);

CREATE INDEX idx_kg_rel_source ON kg_relationships(source_node_id);
CREATE INDEX idx_kg_rel_target ON kg_relationships(target_node_id);
CREATE INDEX idx_kg_rel_type ON kg_relationships(relationship_type);

-- ============================================
-- DEVELOPER PLATFORM
-- ============================================

-- API keys
CREATE TABLE IF NOT EXISTS developer_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    scopes JSONB DEFAULT '[]',
    rate_limit INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_user ON developer_api_keys(user_id);
CREATE INDEX idx_api_keys_org ON developer_api_keys(organization_id);
CREATE INDEX idx_api_keys_active ON developer_api_keys(is_active);

-- Webhook endpoints
CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    secret_encrypted TEXT,
    events JSONB DEFAULT '[]',
    headers JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    failure_count INTEGER DEFAULT 0,
    last_success_at TIMESTAMP,
    last_failure_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhooks_user ON webhook_endpoints(user_id);
CREATE INDEX idx_webhooks_org ON webhook_endpoints(organization_id);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert default event types
INSERT INTO event_types (name, description, category, is_system) VALUES
    ('mission.created', 'A new mission has been created', 'mission', true),
    ('mission.updated', 'A mission has been updated', 'mission', true),
    ('mission.completed', 'A mission has been completed', 'mission', true),
    ('workflow.started', 'A workflow has started execution', 'workflow', true),
    ('workflow.completed', 'A workflow has completed', 'workflow', true),
    ('workflow.failed', 'A workflow has failed', 'workflow', true),
    ('approval.requested', 'An approval has been requested', 'approval', true),
    ('approval.granted', 'An approval has been granted', 'approval', true),
    ('approval.rejected', 'An approval has been rejected', 'approval', true),
    ('price.dropped', 'A product price has dropped', 'commerce', true),
    ('price.alert', 'A price alert has been triggered', 'commerce', true),
    ('agent.started', 'An agent has started', 'agent', true),
    ('agent.completed', 'An agent has completed', 'agent', true),
    ('agent.failed', 'An agent has failed', 'agent', true),
    ('system.health_changed', 'System health status changed', 'system', true),
    ('policy.violated', 'A policy has been violated', 'policy', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default system tools
INSERT INTO tools (name, description, category, version, input_schema, output_schema, is_system, is_async) VALUES
    ('search.products', 'Search for products', 'search', '1.0.0', '{"type": "object", "properties": {"query": {"type": "string"}}}', '{"type": "object"}', true, false),
    ('get.price_history', 'Get price history for a product', 'price', '1.0.0', '{"type": "object", "properties": {"productId": {"type": "string"}}}', '{"type": "object"}', true, false),
    ('compare.products', 'Compare multiple products', 'comparison', '1.0.0', '{"type": "object", "properties": {"productIds": {"type": "array", "items": {"type": "string"}}}}', '{"type": "object"}', true, false),
    ('get.recommendations', 'Get product recommendations', 'recommendation', '1.0.0', '{"type": "object", "properties": {"context": {"type": "object"}}}', '{"type": "object"}', true, false),
    ('send.notification', 'Send a notification', 'notification', '1.0.0', '{"type": "object", "properties": {"userId": {"type": "string"}, "title": {"type": "string"}, "message": {"type": "string"}}}', '{"type": "object"}', true, true),
    ('create.wishlist', 'Add item to wishlist', 'wishlist', '1.0.0', '{"type": "object", "properties": {"userId": {"type": "string"}, "productId": {"type": "string"}}}', '{"type": "object"}', true, false),
    ('check.policy', 'Check policy compliance', 'policy', '1.0.0', '{"type": "object", "properties": {"userId": {"type": "string"}, "context": {"type": "object"}}}', '{"type": "object"}', true, false),
    ('create.approval', 'Create an approval request', 'approval', '1.0.0', '{"type": "object", "properties": {"userId": {"type": "string"}, "type": {"type": "string"}, "data": {"type": "object"}}}', '{"type": "object"}', true, false),
    ('record.metric', 'Record a metric', 'monitoring', '1.0.0', '{"type": "object", "properties": {"metricType": {"type": "string"}, "metricName": {"type": "string"}, "value": {"type": "number"}}}', '{"type": "object"}', true, true),
    ('query.knowledge_graph', 'Query the knowledge graph', 'knowledge', '1.0.0', '{"type": "object", "properties": {"query": {"type": "string"}, "filters": {"type": "object"}}}', '{"type": "object"}', true, false),
    ('store.memory', 'Store information in memory', 'memory', '1.0.0', '{"type": "object", "properties": {"userId": {"type": "string"}, "key": {"type": "string"}, "value": {"type": "any"}}}', '{"type": "object"}', true, false),
    ('recall.memory', 'Recall information from memory', 'memory', '1.0.0', '{"type": "object", "properties": {"userId": {"type": "string"}, "key": {"type": "string"}}}', '{"type": "object"}', true, false)
ON CONFLICT (name) DO NOTHING;

-- Insert default kernel state
INSERT INTO kernel_state (state_key, state_value) VALUES
    ('platform.status', '{"status": "running", "version": "1.0.0"}'),
    ('platform.config', '{"features": {"marketplace": true, "enterprise": true, "aiAgents": true}}'),
    ('platform.health', '{"overall": "healthy", "components": {}}')
ON CONFLICT (state_key) DO NOTHING;
