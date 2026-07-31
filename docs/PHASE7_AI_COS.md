# Phase 7: AI Commerce Operating System (AI-COS)

## Overview

Phase 7 transforms PriceBrain into an AI Commerce Operating System - a comprehensive platform for orchestrating AI agents, managing events, invoking tools, and enabling enterprise-scale commerce automation.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRICEBRAIN AI-COS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   USERS     │  │   AGENTS    │  │  WORKFLOWS  │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    AI KERNEL                                 ││
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────┐   ││
│  │  │ Agent   │ │ Event    │ │ Tool     │ │ Memory          │   ││
│  │  │ Manager │ │ Publisher│ │ Invoker  │ │ Coordinator     │   ││
│  │  └─────────┘ └──────────┘ └──────────┘ └─────────────────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
│                          │                                      │
│         ┌────────────────┼────────────────┐                     │
│         ▼                ▼                ▼                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ EVENT MESH  │  │  TOOL BUS   │  │  MARKETPLACE│              │
│  │             │  │             │  │             │              │
│  │ • Pub/Sub   │  │ • Unified   │  │ • Agent     │              │
│  │ • Replay    │  │   Invocation│  │   Discovery│              │
│  │ • DLQ       │  │ • Schemas   │  │ • Install   │              │
│  │ • Routing   │  │ • Versioning│  │ • Reviews   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                  ENTERPRISE WORKSPACE                        ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐      ││
│  │  │Organizations │ │    Teams     │ │     Projects     │      ││
│  │  └──────────────┘ └──────────────┘ └──────────────────┘      ││
│  │  ┌──────────────┐ ┌──────────────┐                           ││
│  │  │ Departments  │ │   Members    │                          ││
│  │  └──────────────┘ └──────────────┘                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Module Breakdown

### 1. AI Kernel (`/kernel`)

The central runtime that manages all AI agent lifecycle and orchestration.

**Entities:**
- `Agent` - AI agent definitions with capabilities, permissions, and configuration
- `AgentInstance` - Runtime instances of agents with state and resources
- `KernelState` - Persistent kernel state for coordination

**Features:**
- Agent lifecycle management (create, start, pause, resume, cancel)
- Health monitoring and reporting
- Resource allocation and tracking
- Multi-agent coordination
- Event publishing for agent activities
- System agent registration (Mission Planner, Price Intelligence, etc.)

**API Endpoints:**
```
GET    /kernel/health           - Get kernel health status
GET    /kernel/metrics          - Get kernel metrics
GET    /kernel/agents           - List all agents
POST   /kernel/agents           - Create new agent
POST   /kernel/agents/:id/start - Start agent instance
POST   /kernel/instances/:id/pause   - Pause instance
POST   /kernel/instances/:id/resume  - Resume instance
```

### 2. Event Mesh (`/events`)

Event-driven architecture for loose coupling between services.

**Entities:**
- `Event` - Individual events with payload, metadata, and status
- `EventType` - Event type definitions with schemas
- `EventSubscription` - Subscription rules for event delivery

**Features:**
- Publish/subscribe messaging
- Event persistence and replay
- Dead letter queue for failed events
- Filtering and routing rules
- Webhook, queue, function, and email delivery
- Event correlation and causation tracking
- Priority-based processing

**API Endpoints:**
```
POST   /events              - Publish event
GET    /events              - Query events
POST   /events/:id/replay   - Replay event
GET    /events/stats         - Get event statistics
POST   /events/subscriptions - Create subscription
GET    /events/subscriptions/mine - Get my subscriptions
```

### 3. Tool Bus (`/tools`)

Unified capability invocation for all AI tools and services.

**Entities:**
- `Tool` - Tool definitions with input/output schemas
- `ToolInvocation` - Invocation records with execution tracking

**Features:**
- Unified tool invocation interface
- Schema-based input/output validation
- Rate limiting and timeout handling
- Invocation history and statistics
- Permission checking
- Async and sync execution modes
- Handler registration for custom tools

**API Endpoints:**
```
GET    /tools               - List tools
POST   /tools               - Register new tool
GET    /tools/:id           - Get tool details
POST   /tools/invoke/:name  - Invoke tool
GET    /tools/invocations/mine - Get invocation history
GET    /tools/stats/:name   - Get tool statistics
```

### 4. Agent Marketplace (`/marketplace/agents`)

Discovery, distribution, and installation of AI agents.

**Entities:**
- `AgentMarketplace` - Agent listings with pricing and metadata
- `AgentReview` - User reviews and ratings
- `AgentInstallation` - User installations with configuration

**Features:**
- Agent listings with categories, tags, and pricing
- Featured and verified agent badges
- Reviews and ratings system
- One-click installation
- Version management
- Install statistics and tracking

**API Endpoints:**
```
GET    /marketplace/agents                    - List agents
GET    /marketplace/agents/featured           - Get featured
POST   /marketplace/agents                    - Create listing
GET    /marketplace/agents/:id/reviews        - Get reviews
POST   /marketplace/agents/install           - Install agent
GET    /marketplace/agents/installations/mine - Get installations
```

### 5. Enterprise Workspace (`/enterprise`)

Multi-tenant organization management with teams and projects.

**Entities:**
- `Organization` - Organizations with plans and settings
- `OrganizationMember` - Member roles and permissions
- `Department` - Organizational departments with hierarchy
- `Team` - Teams within departments
- `TeamMember` - Team membership with roles
- `Project` - Projects with timelines and status
- `ProjectMember` - Project membership

**Features:**
- Multi-tenant architecture
- Role-based access control (Owner, Admin, Member, Viewer)
- Department hierarchy
- Team management
- Project tracking with progress
- Permission inheritance

**API Endpoints:**
```
GET    /enterprise/organizations         - Get my organizations
POST   /enterprise/organizations         - Create organization
GET    /enterprise/organizations/:id/members - Get members
POST   /enterprise/organizations/:id/teams   - Create team
GET    /enterprise/organizations/:id/projects - Get projects
POST   /enterprise/organizations/:id/projects - Create project
```

---

## Database Schema

### Phase 7 Tables

```sql
-- AI Kernel
CREATE TABLE agents (...);
CREATE TABLE agent_instances (...);
CREATE TABLE kernel_state (...);

-- Event Mesh
CREATE TABLE events (...);
CREATE TABLE event_types (...);
CREATE TABLE event_subscriptions (...);

-- Tool Bus
CREATE TABLE tools (...);
CREATE TABLE tool_invocations (...);

-- Marketplace
CREATE TABLE agent_marketplace (...);
CREATE TABLE agent_reviews (...);
CREATE TABLE agent_installations (...);

-- Enterprise
CREATE TABLE organizations (...);
CREATE TABLE organization_members (...);
CREATE TABLE departments (...);
CREATE TABLE teams (...);
CREATE TABLE team_members (...);
CREATE TABLE projects (...);
CREATE TABLE project_members (...);
```

---

## Frontend Pages

### AI-COS Dashboard (`/ai-cos`)
- System health overview
- Module cards with navigation
- Quick actions
- Platform capabilities
- Architecture diagram

### Event Mesh (`/ai-cos/events`)
- Event list with filtering
- Event detail panel
- Event type browser
- Subscription management
- Statistics dashboard

### Tool Bus (`/ai-cos/tools`)
- Tool list with categories
- Invocation history
- Schema browser
- Tool testing interface
- Performance metrics

### Agent Marketplace (`/marketplace`)
- Featured agents
- Category filtering
- Search functionality
- Agent cards with ratings
- Installation management

### Enterprise Workspace (`/enterprise`)
- Organization switcher
- Members management
- Teams management
- Projects with progress tracking
- Role-based permissions

---

## TypeScript Types

Comprehensive type definitions at `/frontend/types/ai-cos/index.ts`:
- Agent, AgentInstance, AgentStatus
- Event, EventType, EventSubscription
- Tool, ToolInvocation
- AgentListing, AgentReview, AgentInstallation
- Organization, Department, Team, Project
- All request/response DTOs

---

## API Services

Modular service layer at `/frontend/services/ai-cos/index.ts`:
- `kernelService` - AI Kernel operations
- `eventService` - Event Mesh operations
- `toolService` - Tool Bus operations
- `marketplaceService` - Marketplace operations
- `enterpriseService` - Enterprise operations

---

## Security Features

1. **Role-Based Access Control**
   - Owner, Admin, Member, Viewer roles
   - Permission-based authorization

2. **Audit Logging**
   - All sensitive operations logged
   - User attribution

3. **Plugin Sandboxing**
   - Isolated execution environment
   - Resource limits

4. **Rate Limiting**
   - Per-tool rate limits
   - Configurable thresholds

---

## Performance Considerations

1. **Event Processing**
   - Priority-based queue
   - Parallel delivery
   - Retry with exponential backoff

2. **Tool Invocation**
   - Timeout handling
   - Connection pooling
   - Async execution support

3. **Agent Instances**
   - Resource tracking
   - Memory limits
   - CPU quotas

---

## Future Phases

- **Phase 8**: Voice AI and Natural Language Interface
- **Phase 9**: Video AI and Visual Commerce
- **Phase 10**: AR/VR Commerce Experiences
- **Phase 11**: IoT Integration and Smart Home
- **Phase 12**: Global Expansion and Localization

---

## Migration Commands

```bash
# Run Phase 7 migrations
npm run migration:run -- -- -- src/database/migrations/03-phase7-ai-cos.sql

# Verify tables
npx ts-node -e "import('./src/database/verify-tables').then(m => m.verifyTables())"
```

---

## Testing

```bash
# Unit tests
npm run test -- --grep "KernelService"
npm run test -- --grep "EventMeshService"
npm run test -- --grep "ToolBusService"

# Integration tests
npm run test:e2e -- --grep "ai-cos"
```
