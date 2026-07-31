# PriceBrain - AI Organization Operating System

<p align="center">
  <img src="https://img.shields.io/badge/Version-8.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/Node-20.x-green.svg" alt="Node">
  <img src="https://img.shields.io/badge/NestJS-10.x-red.svg" alt="NestJS">
  <img src="https://img.shields.io/badge/NextJS-14.x-purple.svg" alt="NextJS">
  <img src="https://img.shields.io/badge/TypeScript-5.x-yellow.svg" alt="TypeScript">
</p>

PriceBrain is the world's first **AI Organization Operating System** - a comprehensive platform that transforms commerce into an intelligent, autonomous, and enterprise-grade experience.

---

## 🎯 Overview

PriceBrain evolved through 8 major phases to become a complete AI-powered platform:

| Phase | Name | Description |
|-------|------|-------------|
| 1-5 | Core Commerce | Products, search, wishlist, compare, affiliates |
| 6 | Autonomous Commerce | Missions, workflows, policies, automation |
| 7 | AI Commerce OS | AI Kernel, Event Mesh, Tool Bus, Marketplace |
| **8** | **AI Organization OS** | Executive AI, Digital Twin, Simulations, Governance |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRICEBRAIN AI-OOS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      EXECUTIVE INTELLIGENCE                           │   │
│  │   Chief AI Agent • Strategic Planning • Decision Management         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    AI COMMERCE OPERATING SYSTEM                       │   │
│  │   AI Kernel • Event Mesh • Tool Bus • Agent Marketplace            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    AUTONOMOUS COMMERCE PLATFORM                       │   │
│  │   Missions • Workflows • Policies • Automation • Monitoring           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         CORE COMMERCE                                 │   │
│  │   Products • Search • Wishlist • Compare • Coupons • Analytics      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Features

### Executive Intelligence (Phase 8)
- **Chief AI Agent**: Strategic AI that manages organization decisions
- **Digital Twin**: Real-time organization modeling and monitoring
- **Simulation Engine**: Test scenarios before execution
- **AI Constitution**: Immutable governance rules for AI behavior
- **Governance Engine**: Policy enforcement and compliance
- **Enterprise Memory**: Multi-level organizational memory

### AI Commerce Operating System (Phase 7)
- **AI Kernel**: Agent lifecycle management and orchestration
- **Event Mesh**: Event-driven architecture with pub/sub
- **Tool Bus**: Unified capability invocation
- **Agent Marketplace**: Discover and install AI agents

### Autonomous Commerce (Phase 6)
- **Missions**: Convert goals into executable missions
- **Workflows**: Visual workflow automation
- **Policies**: Rule-based policy engine
- **Automation**: Commerce automation engine
- **Monitoring**: Real-time monitoring and alerts

### Core Commerce (Phase 1-5)
- **Products**: Full product catalog with price tracking
- **Search**: Intelligent product search with filters
- **Wishlist**: Price alerts and wishlist management
- **Compare**: Multi-product comparison
- **Coupons**: Coupon discovery and validation
- **Analytics**: Comprehensive analytics dashboard

---

## 📦 Tech Stack

### Backend
- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 16 with TypeORM
- **Cache**: Redis 7
- **Search**: Elasticsearch 8
- **Queue**: Bull (Redis-based)
- **Auth**: JWT with Passport

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **UI**: Shadcn/UI + Tailwind CSS
- **State**: React Query + Zustand
- **Forms**: React Hook Form + Zod

### Infrastructure
- **Container**: Docker + Docker Compose
- **Orchestration**: Kubernetes (optional)
- **CI/CD**: GitHub Actions
- **Reverse Proxy**: Nginx

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 20.x
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/pricebrain.git
cd pricebrain

# Copy environment variables
cp .env.example .env

# Start infrastructure
docker-compose up -d postgres redis elasticsearch

# Install dependencies
npm install

# Run migrations
cd backend && npm run migration:run

# Start development servers
npm run dev
```

### Environment Variables

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=pricebrain

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# API Keys
OPENAI_API_KEY=your-openai-key
```

---

## 📁 Project Structure

```
pricebrain/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── auth/             # Authentication
│   │   ├── users/             # User management
│   │   ├── products/          # Product catalog
│   │   ├── search/             # Search functionality
│   │   ├── kernel/             # AI Kernel (Phase 7)
│   │   ├── event-mesh/        # Event Mesh (Phase 7)
│   │   ├── tool-bus/          # Tool Bus (Phase 7)
│   │   ├── executive/         # Executive Intelligence (Phase 8)
│   │   ├── digital-twin/       # Digital Twin (Phase 8)
│   │   ├── simulation/        # Simulation Engine (Phase 8)
│   │   └── ...                # More modules
│   └── test/                  # E2E tests
│
├── frontend/                  # Next.js Frontend
│   ├── app/                   # App Router pages
│   │   ├── dashboard/         # Main dashboard
│   │   ├── organization/      # Organization (Phase 8)
│   │   ├── ai-cos/           # AI COS (Phase 7)
│   │   └── ...               # More pages
│   ├── components/           # UI components
│   ├── services/              # API services
│   └── types/                 # TypeScript types
│
├── database/                 # Database migrations
│   └── init/                 # Initialization scripts
│
├── docs/                    # Documentation
│
├── infrastructure/          # Terraform/Kubernetes configs
│
└── docker-compose.yml      # Docker orchestration
```

---

## 🔌 API Documentation

### Authentication
```bash
POST /auth/login          # User login
POST /auth/register       # User registration
POST /auth/refresh        # Refresh token
```

### Products
```bash
GET /products             # List products
GET /products/:id        # Get product
GET /products/trending    # Trending products
GET /products/deals       # Deal products
```

### AI Organization (Phase 8)
```bash
# Executive Intelligence
POST /executive/chief-ai                 # Create Chief AI
GET  /executive/chief-ai/:orgId         # Get Chief AI
POST /executive/decisions                # Create decision
POST /executive/decisions/:id/approve    # Approve decision

# Digital Twin
POST /digital-twin                      # Create twin
POST /digital-twin/:orgId/sync         # Sync twin
GET  /digital-twin/:orgId/status       # Get twin status

# Simulations
POST /simulations                       # Create simulation
POST /simulations/:id/run              # Run simulation
GET  /simulations/:orgId              # List simulations
```

Full API documentation available at `/api/docs` when running.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Run specific test suite
npm test -- --grep "ExecutiveService"
```

---

## 📊 Database Schema

The system uses PostgreSQL with the following main tables:

### Core
- `users` - User accounts
- `products` - Product catalog
- `categories` - Product categories
- `brands` - Brands
- `wishlists` - User wishlists

### Phase 6 (Autonomous Commerce)
- `missions` - User missions
- `mission_tasks` - Mission tasks
- `workflows` - Workflow definitions
- `workflow_instances` - Workflow executions
- `policies` - Policy rules
- `automation_rules` - Automation rules

### Phase 7 (AI Commerce OS)
- `agents` - AI agent definitions
- `agent_instances` - Agent instances
- `events` - Event log
- `event_subscriptions` - Event subscriptions
- `tools` - Tool registry
- `tool_invocations` - Tool calls

### Phase 8 (AI Organization OS)
- `chief_ai_agents` - Organization Chief AI
- `executive_decisions` - Tracked decisions
- `digital_twins` - Organization digital twins
- `simulations` - Simulation runs
- `constitution_rules` - AI Constitution rules
- `governance_policies` - Governance policies

---

## 🔒 Security

- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Encryption at rest and in transit
- **Rate Limiting**: API throttling with NestJS Throttler
- **Helmet**: Security headers
- **CORS**: Configured for frontend domain

---

## 📈 Monitoring

- **Health Checks**: `/health` endpoint
- **Metrics**: Prometheus-compatible metrics endpoint
- **Logging**: Structured JSON logs
- **Tracing**: OpenTelemetry integration (optional)

---

## 🚢 Deployment

### Docker

```bash
# Production build
docker-compose -f docker-compose.prod.yml build

# Start production
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes

```bash
# Apply configurations
kubectl apply -f k8s/

# Check status
kubectl get pods
```

---

## 📝 Documentation

- [Phase 6 Documentation](./docs/PHASE6-AUTONOMOUS-COMMERCE.md)
- [Phase 7 Documentation](./docs/PHASE7_AI_COS.md)
- [Phase 8 Documentation](./docs/PHASE8_AI_OOS.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🙏 Acknowledgments

- NestJS Team
- Next.js Team
- Shadcn/UI
- All contributors

---

<p align="center">
  <strong>PriceBrain</strong> - The Future of AI-Powered Commerce
</p>