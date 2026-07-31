# PriceBrain Phase 6: Autonomous Commerce Intelligence Platform

## Overview

Phase 6 transforms PriceBrain's AskBrain into an **Autonomous Commerce Intelligence Platform** that converts user goals into executable missions, coordinates specialized AI agents, monitors progress, automates repetitive commerce tasks, and safely executes approved actions.

## Architecture

### Backend Modules

```
backend/src/
├── missions/           # Mission Engine
│   ├── entities/       # Mission, MissionTask, MissionBudgetAllocation
│   ├── dto/           # Create/Update DTOs
│   ├── missions.service.ts
│   ├── missions.controller.ts
│   └── missions.module.ts
├── workflows/         # Autonomous Workflow Engine
│   ├── entities/      # Workflow, WorkflowInstance, WorkflowExecutionLog
│   ├── dto/
│   ├── workflows.service.ts
│   ├── workflows.controller.ts
│   └── workflows.module.ts
├── approvals/         # Approval Engine
│   ├── entities/      # Approval
│   ├── dto/
│   ├── approvals.service.ts
│   ├── approvals.controller.ts
│   └── approvals.module.ts
├── policies/          # Policy Engine
│   ├── entities/       # Policy
│   ├── dto/
│   ├── policies.service.ts
│   ├── policies.controller.ts
│   └── policies.module.ts
├── automation/        # Commerce Automation Engine
│   ├── entities/      # AutomationRule, AutomationExecution
│   ├── dto/
│   ├── automation.service.ts
│   ├── automation.controller.ts
│   └── automation.module.ts
├── monitoring/        # Monitoring Engine
│   ├── entities/      # MonitoringMetric, PriceAlert, WarrantyTracking, DeliveryTracking
│   ├── dto/
│   ├── monitoring.service.ts
│   ├── monitoring.controller.ts
│   └── monitoring.module.ts
├── plugins/           # Plugin SDK
│   ├── entities/       # Plugin, UserPlugin
│   ├── dto/
│   ├── plugins.service.ts
│   ├── plugins.controller.ts
│   └── plugins.module.ts
├── execution/          # Execution & Audit Engine
│   ├── entities/       # ExecutionLog, AuditLog
│   ├── execution.service.ts
│   ├── execution.controller.ts
│   └── execution.module.ts
├── decision/           # Decision Engine 2.0
│   ├── entities/       # AiDecisionLog, AgentMetric
│   ├── dto/
│   ├── decision.service.ts
│   ├── decision.controller.ts
│   └── decision.module.ts
└── shared/enums/      # Shared Enums
```

## Features Implemented

### 1. Mission Engine
- **Mission Types**: Wedding, Vacation, Study Abroad, First Job, Home Office, Gaming Setup, Photography Studio, Fitness Journey, Home Renovation, Baby Preparation, Business Launch, Festival Planning, Custom
- **Task Management**: Create, update, prioritize, and track tasks
- **Budget Tracking**: Allocate and track spending across categories
- **Progress Monitoring**: Automatic progress calculation based on task completion
- **Template System**: Pre-built mission templates with default tasks

### 2. Autonomous Workflow Engine
- **Workflow Definitions**: Templates for automated processes
- **Workflow Instances**: Running executions with context
- **Step Execution**: Configurable steps with retry logic
- **Scheduling**: Cron-based scheduling support
- **Pause/Resume/Cancel**: Full lifecycle management

### 3. Approval Engine
- **Approval Types**: Purchase, Subscription, Reminder, Tracking, Sharing, Automation, Plugin Install
- **Priority Levels**: Low, Medium, High
- **Expiration**: Automatic approval expiration
- **Verification**: Optional verification for sensitive actions
- **Audit Trail**: Complete approval history

### 4. Policy Engine
- **Policy Types**: Budget, Brand Preference, Seller Trust, Rating Threshold, Eco-Friendly, Approval Required
- **Conditions**: Configurable condition evaluation
- **Actions**: Policy-triggered actions
- **Priority**: Weighted policy evaluation
- **System Policies**: Built-in default policies

### 5. Commerce Automation Engine
- **Automation Types**: Price Tracking, Coupon Discovery, Warranty Tracking, Subscription Renewal, Product Recall, Deal Monitoring, Stock Alert, Price Drop Alert
- **Scheduling**: Flexible schedule configuration
- **Conditions**: Filter automation triggers
- **Execution History**: Track automation runs

### 6. Monitoring Engine
- **Metrics**: Custom metric recording and aggregation
- **Price Alerts**: Track price changes and notify users
- **Warranty Tracking**: Expiration reminders
- **Delivery Tracking**: Order delivery status
- **Dashboard Data**: Consolidated monitoring data

### 7. Plugin SDK
- **Plugin Registry**: Browse available plugins
- **Categories**: Finance, Healthcare, Insurance, Education, Travel, Restaurant, Real Estate
- **Installation**: User-specific plugin installation
- **Execution**: Sandboxed plugin execution
- **Permissions**: Granular permission system

### 8. Decision Engine 2.0
- **Product Evaluation**: AI-powered product recommendations
- **Purchase Decisions**: Buy/Wait/Consider recommendations
- **Comparison**: Multi-product comparison analysis
- **Recommendations**: Personalized suggestions based on context
- **Confidence Scoring**: Explainable AI decisions

### 9. Execution & Audit
- **Execution Logs**: Track all autonomous actions
- **Risk Assessment**: Automatic risk level classification
- **Audit Logs**: Security and compliance tracking
- **Statistics**: Success rate, execution time analytics

## API Endpoints

### Missions
```
POST   /missions              - Create mission
GET    /missions              - List missions
GET    /missions/:id          - Get mission
PATCH  /missions/:id           - Update mission
DELETE /missions/:id          - Delete mission
POST   /missions/:id/progress - Update progress
POST   /missions/:id/tasks    - Create task
PATCH  /missions/tasks/:id     - Update task
```

### Workflows
```
POST   /workflows                    - Create workflow
GET    /workflows                    - List workflows
GET    /workflows/templates         - Get templates
POST   /workflows/:id/trigger       - Trigger workflow
GET    /workflows/instances/mine    - Get instances
POST   /workflows/instances/:id/pause   - Pause
POST   /workflows/instances/:id/resume  - Resume
```

### Approvals
```
POST   /approvals         - Create approval
GET    /approvals          - List approvals
GET    /approvals/pending - Get pending
POST   /approvals/:id/approve - Approve
POST   /approvals/:id/reject  - Reject
```

### Policies
```
POST   /policies            - Create policy
GET    /policies             - List policies
POST   /policies/evaluate    - Evaluate context
POST   /policies/:id/toggle  - Toggle active
```

### Automation
```
POST   /automation              - Create rule
GET    /automation              - List rules
POST   /automation/:id/trigger  - Trigger automation
GET    /automation/:id/executions - Get executions
```

### Plugins
```
GET    /plugins                 - List plugins
GET    /plugins/categories      - Get categories
POST   /plugins/install         - Install plugin
GET    /plugins/installed/mine  - My plugins
```

### Monitoring
```
POST   /monitoring/price-alerts      - Create alert
GET    /monitoring/warranties         - Get warranties
POST   /monitoring/deliveries         - Track delivery
GET    /monitoring/dashboard          - Dashboard data
```

### Decision
```
POST   /decision/product        - Evaluate product
POST   /decision/purchase       - Purchase decision
POST   /decision/compare        - Compare products
POST   /decision/recommend      - Generate recommendations
```

### Execution
```
GET    /execution/logs     - Get execution logs
GET    /execution/stats    - Get statistics
GET    /execution/audit    - Get audit logs
```

## Database Schema

New tables added:
- `missions` - User goals and life events
- `mission_tasks` - Task breakdown
- `mission_budget_allocations` - Budget categories
- `workflows` - Workflow definitions
- `workflow_instances` - Running executions
- `workflow_execution_logs` - Step logs
- `approvals` - Approval requests
- `policies` - User policies
- `automation_rules` - Automation definitions
- `automation_executions` - Automation runs
- `monitoring_metrics` - Custom metrics
- `price_alerts` - Price tracking
- `warranty_tracking` - Warranty info
- `delivery_tracking` - Delivery status
- `notification_preferences` - User preferences
- `plugins` - Plugin registry
- `user_plugins` - Installed plugins
- `execution_logs` - Action audit
- `audit_logs` - Security logs
- `ai_decision_logs` - AI decisions
- `agent_metrics` - Agent performance

## Frontend Pages

- `/dashboard` - Mission Control dashboard
- `/missions` - Mission list and management
- `/missions/[id]` - Mission details
- `/workflows` - Workflow management
- `/approvals` - Approval center
- `/policies` - Policy management
- `/automation` - Automation rules
- `/plugins` - Plugin marketplace

## Security Features

1. **Role-Based Access Control** - User permissions
2. **Approval Audit Logs** - All approvals are logged
3. **Encrypted Mission Data** - Sensitive data protection
4. **Permission Isolation** - User-specific data isolation
5. **Secure Plugin Sandbox** - Sandboxed plugin execution
6. **Policy Enforcement** - Policies influence all agents
7. **Rate Limiting** - Protection against abuse

## Observability

Track:
- Workflow Success Rate
- Mission Completion Rate
- Agent Contribution
- Execution Time
- Failure/Retry Counts
- Approval Rate
- Policy Violations
- Prediction Accuracy

## Mission Templates

Pre-built templates include:
- **Wedding**: Venue, catering, photographer, attire, invitations, honeymoon
- **Vacation**: Destination, flights, accommodation, itinerary, insurance
- **Home Office**: Desk, chair, computer, lighting, organization
- **Gaming Setup**: Console/PC, monitor, peripherals, audio, seating
- **Fitness Journey**: Equipment, workout space, nutrition, tracking
- **Business Launch**: Business plan, registration, website, marketing

## Next Steps (Future Phases)

- Automatic purchasing with approval
- Financial transaction integration
- Voice AI assistants
- Video AI capabilities
- AR product visualization
- IoT device control
- Advanced predictive analytics
- Multi-agent coordination

## Configuration

Environment variables required:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=pricebrain
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4o-mini
```

## Deployment

1. Run database migration:
```bash
psql -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME -f database/init/02-phase6-autonomous-commerce.sql
```

2. Install dependencies:
```bash
cd backend && npm install
```

3. Start backend:
```bash
cd backend && npm run start:dev
```

4. Build frontend:
```bash
cd frontend && npm run build
```

## Success Criteria

✅ Missions transform user goals into executable plans
✅ Workflows coordinate complex multi-step processes
✅ Approvals ensure user control over sensitive actions
✅ Policies influence AI behavior automatically
✅ Automations handle repetitive tasks
✅ Monitoring provides real-time insights
✅ Decisions are explainable and auditable
✅ Plugins extend the platform capabilities
✅ All actions are transparent and under user control
