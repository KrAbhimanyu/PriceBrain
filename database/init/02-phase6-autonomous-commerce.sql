-- PriceBrain Phase 6: Autonomous Commerce Intelligence Platform
-- Database Schema for Missions, Workflows, Approvals, Policies, Automation, Monitoring, and Plugins

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MISSIONS
-- ============================================

-- Missions table - represents user goals/life events
CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'wedding', 'vacation', 'study_abroad', 'first_job', 'home_office',
        'gaming_setup', 'photography_studio', 'fitness_journey', 'home_renovation',
        'baby_preparation', 'business_launch', 'festival_planning', 'custom'
    )),
    status VARCHAR(30) DEFAULT 'planning' CHECK (status IN (
        'planning', 'active', 'paused', 'completed', 'cancelled'
    )),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    target_budget DECIMAL(12,2),
    current_spent DECIMAL(12,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    target_date DATE,
    progress DECIMAL(5,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_missions_user ON missions(user_id);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_type ON missions(type);
CREATE INDEX idx_missions_target_date ON missions(target_date);

-- Mission tasks - breakdown of mission into actionable items
CREATE TABLE IF NOT EXISTS mission_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES mission_tasks(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'blocked', 'waiting_approval', 'completed', 'cancelled'
    )),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    assigned_agent VARCHAR(100),
    dependencies JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mission_tasks_mission ON mission_tasks(mission_id);
CREATE INDEX idx_mission_tasks_status ON mission_tasks(status);
CREATE INDEX idx_mission_tasks_parent ON mission_tasks(parent_task_id);

-- Mission budget allocations
CREATE TABLE IF NOT EXISTS mission_budget_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    allocated_amount DECIMAL(12,2) NOT NULL,
    spent_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mission_id, category)
);

CREATE INDEX idx_mission_budget_mission ON mission_budget_allocations(mission_id);

-- ============================================
-- WORKFLOWS
-- ============================================

-- Workflow definitions - templates for automated processes
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    version INTEGER DEFAULT 1,
    is_template BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    trigger_config JSONB NOT NULL,
    steps_config JSONB NOT NULL,
    error_handling JSONB DEFAULT '{}',
    timeout_seconds INTEGER DEFAULT 3600,
    retry_config JSONB DEFAULT '{"maxRetries": 3, "backoffMultiplier": 2}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflows_user ON workflows(user_id);
CREATE INDEX idx_workflows_type ON workflows(type);
CREATE INDEX idx_workflows_active ON workflows(is_active);

-- Workflow instances - running executions
CREATE TABLE IF NOT EXISTS workflow_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE SET NULL,
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
        'pending', 'running', 'paused', 'completed', 'failed', 'cancelled'
    )),
    current_step VARCHAR(100),
    context JSONB DEFAULT '{}',
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    started_at TIMESTAMP,
    paused_at TIMESTAMP,
    completed_at TIMESTAMP,
    next_scheduled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_instances_workflow ON workflow_instances(workflow_id);
CREATE INDEX idx_workflow_instances_mission ON workflow_instances(mission_id);
CREATE INDEX idx_workflow_instances_user ON workflow_instances(user_id);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);

-- Workflow execution logs
CREATE TABLE IF NOT EXISTS workflow_execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
    step_name VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
        'pending', 'running', 'completed', 'failed', 'skipped'
    )),
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_logs_instance ON workflow_execution_logs(instance_id);

-- ============================================
-- APPROVALS
-- ============================================

-- Approvals - track user approvals for sensitive actions
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'purchase', 'subscription', 'reminder', 'tracking', 'sharing',
        'automation_create', 'automation_modify', 'automation_delete',
        'cart_create', 'plan_share', 'plugin_install'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    action_data JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'expired', 'cancelled'
    )),
    priority VARCHAR(20) DEFAULT 'medium',
    requires_verification BOOLEAN DEFAULT false,
    verification_method VARCHAR(50),
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    expires_at TIMESTAMP,
    approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approver_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approvals_user ON approvals(user_id);
CREATE INDEX idx_approvals_mission ON approvals(mission_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_type ON approvals(type);

-- ============================================
-- POLICIES
-- ============================================

-- User policies - rules that influence AI behavior
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'budget', 'brand_preference', 'seller_trust', 'rating_threshold',
        'product_preference', 'eco_friendly', 'approval_required', 'notification_preference'
    )),
    conditions JSONB NOT NULL,
    actions JSONB DEFAULT '[]',
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_policies_user ON policies(user_id);
CREATE INDEX idx_policies_type ON policies(type);
CREATE INDEX idx_policies_active ON policies(is_active);

-- ============================================
-- AUTOMATIONS
-- ============================================

-- Automation rules - automated tasks and monitoring
CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'price_tracking', 'coupon_discovery', 'warranty_tracking', 'subscription_renewal',
        'product_recall', 'inventory_monitoring', 'accessory_suggestion', 'upgrade_planning',
        'deal_monitoring', 'festival_preparation', 'stock_alert', 'price_drop_alert'
    )),
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled')),
    trigger_config JSONB NOT NULL,
    action_config JSONB NOT NULL,
    conditions JSONB DEFAULT '[]',
    schedule_config JSONB,
    last_triggered_at TIMESTAMP,
    trigger_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_automation_rules_user ON automation_rules(user_id);
CREATE INDEX idx_automation_rules_mission ON automation_rules(mission_id);
CREATE INDEX idx_automation_rules_type ON automation_rules(type);
CREATE INDEX idx_automation_rules_status ON automation_rules(status);

-- Automation executions
CREATE TABLE IF NOT EXISTS automation_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    trigger_data JSONB DEFAULT '{}',
    result_data JSONB DEFAULT '{}',
    error_message TEXT,
    executed_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_automation_executions_rule ON automation_executions(rule_id);

-- ============================================
-- MONITORING
-- ============================================

-- Monitoring metrics
CREATE TABLE IF NOT EXISTS monitoring_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    metric_type VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_monitoring_metrics_user ON monitoring_metrics(user_id);
CREATE INDEX idx_monitoring_metrics_mission ON monitoring_metrics(mission_id);
CREATE INDEX idx_monitoring_metrics_type ON monitoring_metrics(metric_type);
CREATE INDEX idx_monitoring_metrics_recorded ON monitoring_metrics(recorded_at);

-- Price alerts
CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    target_price DECIMAL(10,2),
    current_price DECIMAL(10,2),
    price_change_percentage DECIMAL(5,2),
    alert_type VARCHAR(30) DEFAULT 'price_drop' CHECK (alert_type IN (
        'price_drop', 'price_increase', 'back_in_stock', 'out_of_stock', 'price_target_reached'
    )),
    is_triggered BOOLEAN DEFAULT false,
    triggered_at TIMESTAMP,
    notification_sent BOOLEAN DEFAULT false,
    notification_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_product ON price_alerts(product_id);
CREATE INDEX idx_price_alerts_triggered ON price_alerts(is_triggered);

-- Warranty tracking
CREATE TABLE IF NOT EXISTS warranty_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    purchase_date DATE NOT NULL,
    warranty_months INTEGER NOT NULL,
    warranty_end_date DATE NOT NULL,
    reminder_days_before INTEGER DEFAULT 30,
    reminder_sent BOOLEAN DEFAULT false,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_warranty_tracking_user ON warranty_tracking(user_id);
CREATE INDEX idx_warranty_tracking_end_date ON warranty_tracking(warranty_end_date);

-- Delivery tracking
CREATE TABLE IF NOT EXISTS delivery_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id VARCHAR(255),
    retailer VARCHAR(100),
    product_name VARCHAR(255) NOT NULL,
    tracking_number VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'
    )),
    estimated_delivery DATE,
    actual_delivery DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_delivery_tracking_user ON delivery_tracking(user_id);
CREATE INDEX idx_delivery_tracking_status ON delivery_tracking(status);

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- Enhanced notifications table (already exists, adding columns)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS mission_id UUID REFERENCES missions(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS automation_rule_id UUID REFERENCES automation_rules(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url VARCHAR(500);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_data JSONB DEFAULT '{}';

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_price_alerts BOOLEAN DEFAULT true,
    email_warranty_expiry BOOLEAN DEFAULT true,
    email_delivery_updates BOOLEAN DEFAULT true,
    email_deals BOOLEAN DEFAULT true,
    email_mission_updates BOOLEAN DEFAULT true,
    push_price_alerts BOOLEAN DEFAULT true,
    push_warranty_expiry BOOLEAN DEFAULT true,
    push_delivery_updates BOOLEAN DEFAULT true,
    push_deals BOOLEAN DEFAULT false,
    push_mission_updates BOOLEAN DEFAULT true,
    slack_enabled BOOLEAN DEFAULT false,
    slack_webhook_url VARCHAR(500),
    telegram_enabled BOOLEAN DEFAULT false,
    telegram_chat_id VARCHAR(100),
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_prefs_user ON notification_preferences(user_id);

-- ============================================
-- PLUGINS
-- ============================================

-- Plugin registry
CREATE TABLE IF NOT EXISTS plugins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    version VARCHAR(20) NOT NULL,
    author VARCHAR(255),
    author_url VARCHAR(500),
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'finance', 'healthcare', 'insurance', 'education', 'travel',
        'restaurant', 'real_estate', 'custom'
    )),
    icon VARCHAR(500),
    homepage_url VARCHAR(500),
    documentation_url VARCHAR(500),
    source_url VARCHAR(500),
    is_official BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    price DECIMAL(10,2),
    rating DECIMAL(3,2),
    download_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    manifest JSONB NOT NULL,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_plugins_slug ON plugins(slug);
CREATE INDEX idx_plugins_category ON plugins(category);
CREATE INDEX idx_plugins_active ON plugins(is_active);

-- User installed plugins
CREATE TABLE IF NOT EXISTS user_plugins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'error', 'update_available')),
    config JSONB DEFAULT '{}',
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, plugin_id)
);

CREATE INDEX idx_user_plugins_user ON user_plugins(user_id);
CREATE INDEX idx_user_plugins_plugin ON user_plugins(plugin_id);

-- ============================================
-- EXECUTION LOGS
-- ============================================

-- Execution logs - audit trail for all autonomous actions
CREATE TABLE IF NOT EXISTS execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE SET NULL,
    automation_rule_id UUID REFERENCES automation_rules(id) ON DELETE SET NULL,
    execution_type VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('success', 'failure', 'pending', 'cancelled')),
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    approval_id UUID REFERENCES approvals(id) ON DELETE SET NULL,
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_execution_logs_user ON execution_logs(user_id);
CREATE INDEX idx_execution_logs_mission ON execution_logs(mission_id);
CREATE INDEX idx_execution_logs_type ON execution_logs(execution_type);
CREATE INDEX idx_execution_logs_status ON execution_logs(status);
CREATE INDEX idx_execution_logs_created ON execution_logs(created_at);

-- ============================================
-- AUDIT LOGS
-- ============================================

-- Audit logs - security and compliance tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- AI OBSERVABILITY
-- ============================================

-- AI decision logs
CREATE TABLE IF NOT EXISTS ai_decision_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    decision_type VARCHAR(100) NOT NULL,
    input_data JSONB NOT NULL,
    output_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    reasoning TEXT,
    model_used VARCHAR(100),
    tokens_used INTEGER,
    execution_time_ms INTEGER,
    is_explained BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_decision_logs_user ON ai_decision_logs(user_id);
CREATE INDEX idx_ai_decision_logs_mission ON ai_decision_logs(mission_id);
CREATE INDEX idx_ai_decision_logs_type ON ai_decision_logs(decision_type);
CREATE INDEX idx_ai_decision_logs_created ON ai_decision_logs(created_at);

-- Agent performance metrics
CREATE TABLE IF NOT EXISTS agent_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(100) NOT NULL,
    agent_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_metrics_agent ON agent_metrics(agent_id);
CREATE INDEX idx_agent_metrics_type ON agent_metrics(agent_type);
CREATE INDEX idx_agent_metrics_recorded ON agent_metrics(recorded_at);

-- ============================================
-- INSERTS: Default Mission Templates
-- ============================================

INSERT INTO workflows (name, description, type, is_template, trigger_config, steps_config) VALUES
    ('Price Drop Monitor', 'Monitor product prices and alert on drops', 'price_monitoring', true, 
     '{"type": "scheduled", "schedule": "*/30 * * * *"}', 
     '{"steps": [{"name": "check_prices", "action": "check_current_prices"}, {"name": "compare_history", "action": "compare_with_history"}, {"name": "send_alert", "action": "notify_if_dropped"}]}'),
    ('Warranty Expiry Checker', 'Check for expiring warranties monthly', 'warranty_check', true,
     '{"type": "scheduled", "schedule": "0 9 1 * *"}',
     '{"steps": [{"name": "query_warranties", "action": "find_expiring"}, {"name": "send_reminder", "action": "create_notifications"}]}'),
    ('Deal Hunter', 'Scan for special deals and sales', 'deal_monitoring', true,
     '{"type": "scheduled", "schedule": "0 */4 * * *"}',
     '{"steps": [{"name": "fetch_deals", "action": "get_current_deals"}, {"name": "match_preferences", "action": "filter_by_preferences"}, {"name": "send_deals", "action": "notify_user"}]}')
ON CONFLICT DO NOTHING;

-- Insert default plugins
INSERT INTO plugins (name, slug, description, version, author, category, manifest, is_official, is_verified) VALUES
    ('Finance Tracker', 'finance-tracker', 'Track spending, budgets, and financial goals', '1.0.0', 'PriceBrain', 'finance',
     '{"name": "finance-tracker", "version": "1.0.0", "permissions": ["read_user_data"], "endpoints": []}', true, true),
    ('Health Reminders', 'health-reminders', 'Track health products and supplements', '1.0.0', 'PriceBrain', 'healthcare',
     '{"name": "health-reminders", "version": "1.0.0", "permissions": ["read_user_data"], "endpoints": []}', true, true),
    ('Travel Planner', 'travel-planner', 'Plan trips and track travel deals', '1.0.0', 'PriceBrain', 'travel',
     '{"name": "travel-planner", "version": "1.0.0", "permissions": ["read_user_data"], "endpoints": []}', true, true),
    ('Restaurant Deals', 'restaurant-deals', 'Find food discounts and restaurant offers', '1.0.0', 'PriceBrain', 'restaurant',
     '{"name": "restaurant-deals", "version": "1.0.0", "permissions": ["read_user_data"], "endpoints": []}', true, true),
    ('Education Supplies', 'education-supplies', 'Track school and office supplies', '1.0.0', 'PriceBrain', 'education',
     '{"name": "education-supplies", "version": "1.0.0", "permissions": ["read_user_data"], "endpoints": []}', true, true)
ON CONFLICT (slug) DO NOTHING;
