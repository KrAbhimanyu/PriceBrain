# PriceBrain AI Marketplace - System Architecture

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENTS                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │   Web    │  │Mobile iOS│  │Mobile    │  │  Admin   │  │AI Agent │                 │
│  │  App     │  │  App     │  │ Android  │  │Dashboard │  │Clients  │                 │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘                 │
└───────┼─────────────┼─────────────┼─────────────┼─────────────┼──────────────────────┘
        │             │             │             │             │
        └─────────────┴─────────────┴─────────────┴─────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CLOUD FRONT (CDN)                                       │
└─────────────────────────────────┬───────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │Auth/Filter │  │Rate Limiter │  │ LoadBalancer│  │CircuitBrk   │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │API Version  │  │Request Valid│  │Response Cach│  │API Logging  │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────┬───────────────────────────────────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│   AUTH SERVICE    │  │   USER SERVICE   │  │  PRODUCT SERVICE  │
│   (JWT/OAuth2)   │  │                  │  │                   │
│                   │  │                  │  │                   │
│  ┌─────────────┐ │  │  ┌───────────┐  │  │  ┌───────────┐   │
│  │JWT Issuer   │ │  │  │Users CRUD│  │  │  │Products  │   │
│  │Token Refresh│ │  │  │Addresses │  │  │  │Categories│   │
│  │MFA Manager │ │  │  │Profiles  │  │  │  │Brands    │   │
│  │Session Mgmt│ │  │  │Preferences│ │  │  │Reviews   │   │
│  └─────────────┘ │  │  └───────────┘  │  │  └───────────┘   │
└────────┬──────────┘  └───────┬───────┘  └───────┬───────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│   PostgreSQL      │  │   PostgreSQL      │  │   PostgreSQL      │
│   (Auth DB)      │  │   (Users DB)      │  │   (Products DB)   │
└───────────────────┘  └───────────────────┘  └───────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              KAFKA EVENT BUS                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                          Event Topics                                         │   │
│  │  user.* │ product.* │ order.* │ payment.* │ notification.* │ ai.* │ analytics.* │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CORE SERVICES                                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐      │
│  │ORDER SERVICE   │  │PAYMENT SERVICE│  │ NOTIFICATION   │  │ AI SERVICE     │      │
│  │               │  │               │  │    SERVICE     │  │                │      │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌───────────┐ │  │ ┌───────────┐ │      │
│  │ │ Orders   │ │  │ │Payments │ │  │  │ │Email/SMS │ │  │  │ │ Ask Brain│ │      │
│  │ │ Cart     │ │  │ │Refunds  │ │  │  │ │Push Notif│ │  │  │ │ Fashion  │ │      │
│  │ │Wishlist  │ │  │ │Wallet   │ │  │  │ │In-App   │ │  │  │ │ Stylist  │ │      │
│  │ └──────────┘ │  │ └──────────┘ │  │  │ └───────────┘ │  │  │ └───────────┘ │      │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘      │
│          │                  │                  │                  │              │
│          ▼                  ▼                  ▼                  ▼              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │PostgreSQL  │    │PostgreSQL  │    │  MongoDB    │    │  MongoDB    │       │
│  │ (Orders)   │    │ (Payments)  │    │ (Notif DB)  │    │  (AI DB)    │       │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘       │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              AI-SOS LAYER                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ AI-SOS      │  │  AI Agent   │  │ Knowledge    │  │  Simulation │             │
│  │ Kernel      │  │  Manager    │  │   Graph      │  │   Engine    │             │
│  │             │  │             │  │  (Neo4j)    │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │Trust Engine│  │  Memory     │  │ Event Mesh  │  │  Executive  │             │
│  │             │  │  Engine     │  │             │  │     AI      │             │
│  │             │  │  (Redis)   │  │             │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              SEARCH & ANALYTICS                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │  OpenSearch    │  │  Redis Cache   │  │  Analytics     │  │  Prometheus     │   │
│  │  (Products)    │  │  (Sessions)    │  │  Service       │  │  Metrics       │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
│                                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                      │
│  │  Neo4j         │  │  Grafana       │  │  Jaeger        │                      │
│  │  (Knowledge)   │  │  Dashboards   │  │  Tracing       │                      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              AWS INFRASTRUCTURE                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │EC2/K8s   │  │   RDS    │  │ ElastiC  │  │   S3     │  │CloudFron│         │
│  │Cluster   │  │PostgreSQL│  │  Cache   │  │ Storage  │  │  CDN     │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 2. Service Architecture

### Core Services
| Service | Port | Database | Description |
|---------|------|----------|-------------|
| api-gateway | 8080 | - | API Gateway & Routing |
| auth-service | 8081 | PostgreSQL | Authentication & Authorization |
| user-service | 8082 | PostgreSQL | User Management |
| product-service | 8083 | PostgreSQL | Product Catalog |
| order-service | 8084 | PostgreSQL | Order Management |
| payment-service | 8085 | PostgreSQL | Payment Processing |
| notification-service | 8086 | MongoDB | Notifications |
| ai-service | 8087 | MongoDB | AI Capabilities |
| analytics-service | 8088 | PostgreSQL | Analytics |
| search-service | 8089 | OpenSearch | Search Engine |
| inventory-service | 8090 | PostgreSQL | Inventory |
| seller-service | 8091 | PostgreSQL | Seller Management |
| recommendation-service | 8092 | MongoDB | Recommendations |

### Support Services
| Service | Port | Description |
|---------|------|-------------|
| config-server | 8888 | Centralized Configuration |
| service-registry | 8761 | Service Discovery (Eureka) |

## 3. Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|--------|---------|
| Java | 21 | Primary Language |
| Spring Boot | 3.2.x | Application Framework |
| Spring Cloud | 2023.x | Microservices |
| Spring Security | 6.x | Security |
| Spring Data JPA | 3.x | Data Access |
| Spring AI | 2024.x | AI Integration |
| Maven | 3.9.x | Build Tool |

### Databases
| Technology | Purpose |
|------------|---------|
| PostgreSQL 16 | Primary Data Store |
| MongoDB 7 | Document Storage |
| Redis 7 | Caching & Sessions |
| Neo4j 5 | Knowledge Graph |
| OpenSearch 2.x | Search Engine |

### Communication
| Technology | Purpose |
|------------|---------|
| REST | Synchronous Communication |
| Apache Kafka | Event-Driven Communication |
| gRPC | High-Performance Internal Calls |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Kubernetes | Orchestration |
| AWS EKS | Cloud Kubernetes |
| AWS RDS | Managed Databases |
| AWS ElastiCache | Managed Redis |
| AWS S3 | Object Storage |
| CloudFront | CDN |

### Monitoring
| Technology | Purpose |
|------------|---------|
| Prometheus | Metrics Collection |
| Grafana | Visualization |
| Loki | Log Aggregation |
| Jaeger | Distributed Tracing |
| OpenTelemetry | Observability |

## 4. Request Flow

```
1. Client Request
   │
   ▼
2. CloudFront CDN (Static Assets) / API Gateway (API)
   │
   ▼
3. API Gateway - Authentication Filter
   │  - Validate JWT Token
   │  - Extract User Claims
   │  - Check Rate Limits
   │
   ▼
4. Route to Target Service
   │
   ├──► Auth Service (login, register, token refresh)
   ├──► User Service (profile, addresses, preferences)
   ├──► Product Service (catalog, search, details)
   ├──► Order Service (cart, checkout, orders)
   └──► AI Service (ask brain, recommendations)
   │
   ▼
5. Service Processing
   │
   ├──► Database Operation
   │
   ▼
6. Publish Domain Event to Kafka
   │
   ▼
7. Return Response
   │
   ▼
8. Monitoring & Logging
```

## 5. Event Flow

```
User Action
    │
    ▼
┌─────────────────┐
│  Domain Event  │
│  (OrderPlaced) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Kafka Topic   │
│  order.*       │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│Notify │ │Analytics│
│Service│ │Service │
└───────┘ └───────┘
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│Email  │ │Dashboard│
│Push   │ │Reports │
└───────┘ └───────┘
```

## 6. Security Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         ZERO TRUST MODEL                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐               │
│   │ External │────▶│   API    │────▶│  Target   │               │
│   │ Request  │     │ Gateway  │     │  Service  │               │
│   └──────────┘     └────┬─────┘     └──────────┘               │
│                           │                                          │
│                    ┌──────┴──────┐                                 │
│                    │ Auth Filter │                                 │
│                    │             │                                 │
│                    │ • JWT Valid │                                 │
│                    │ • RBAC Check│                                 │
│                    │ • Rate Limit│                                 │
│                    └─────────────┘                                 │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────┐     │
│   │                    SECURITY LAYERS                       │     │
│   ├──────────────────────────────────────────────────────────┤     │
│   │ • TLS 1.3 Encryption in Transit                         │     │
│   │ • AES-256 Encryption at Rest                           │     │
│   │ • AWS KMS for Key Management                            │     │
│   │ • OAuth 2.0 + JWT for Authentication                  │     │
│   │ • RBAC + Fine-Grained Permissions                      │     │
│   │ • API Key Management for Services                       │     │
│   │ • Audit Logging (All Security Events)                  │     │
│   │ • WAF + DDoS Protection                                  │     │
│   │ • OWASP Top 10 Protection                               │     │
│   └──────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────┘
```

## 7. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AWS REGIONS                                       │
│                                                                               │
│  ┌─────────────────────────── INDIA (MUMBAI) ───────────────────────────┐  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    EKS CLUSTER (PRODUCTION)                      │  │  │
│  │  │                                                                  │  │  │
│  │  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │  │  │
│  │  │  │Node │ │Node │ │Node │ │Node │ │Node │ │Node │  ...        │  │  │
│  │  │  │Grp1 │ │Grp2 │ │Grp1 │ │Grp2 │ │Grp1 │ │Grp2 │            │  │  │
│  │  │  └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘            │  │  │
│  │  │     │       │       │       │       │       │               │  │  │
│  │  │     └───────┴───────┴───────┴───────┴───────┘               │  │  │
│  │  │                                                                  │  │  │
│  │  │  SERVICES:                                                       │  │  │
│  │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │  │  │
│  │  │  │Auth  │ │User  │ │Product│ │Order │ │Payment│ │AI    │     │  │  │
│  │  │  │Svc   │ │Svc   │ │Svc   │ │Svc   │ │Svc   │ │Svc   │     │  │  │
│  │  │  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘     │  │  │
│  │  └─────┼────────┼────────┼────────┼────────┼────────┼──────────┘  │  │
│  └────────┼────────┼────────┼────────┼────────┼────────┼────────────┘  │
│           │        │        │        │        │        │               │
│           ▼        ▼        ▼        ▼        ▼        ▼               │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                      AWS SERVICES                                 │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │    │
│  │  │  RDS   │ │DocumentDB│ │ElastiCache│ │   S3   │ │CloudFron│      │    │
│  │  │(PgSQL) │ │(MongoDB)│ │ (Redis) │ │        │ │  CDN   │      │    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘      │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

## 8. Service Communication

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SYNCHRONOUS (REST/gRPC)                           │
│                                                                     │
│   API Gateway ──────▶ Auth Service                                 │
│         │             │                                              │
│         │             ▼                                              │
│         │         User Service                                       │
│         │             │                                              │
│         │             ▼                                              │
│         └──────────▶ Product Service                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   ASYNCHRONOUS (KAFKA)                              │
│                                                                     │
│   Product Svc ───────▶ Kafka ───────▶ Notification Svc           │
│        │                            │                                │
│        │                            ▼                                │
│        │                     Analytics Svc                          │
│        │                            │                                │
│        │                            ▼                                │
│        └────────────────────▶ AI Service                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 9. Database Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE STRATEGY                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PostgreSQL (Relational)                                           │
│  ├── Auth Service: Users, Roles, Permissions, Sessions            │
│  ├── User Service: Users, Addresses, Preferences                    │
│  ├── Product Service: Products, Categories, Brands, Reviews          │
│  ├── Order Service: Orders, OrderItems, Cart                        │
│  ├── Payment Service: Payments, Transactions, Refunds               │
│  └── Analytics: Events, Metrics, Reports                            │
│                                                                     │
│  MongoDB (Document)                                                 │
│  ├── Notification Service: Notifications, Templates, Preferences     │
│  ├── AI Service: Conversations, Recommendations, Memory             │
│  └── Search Service: Search Logs, Suggestions                       │
│                                                                     │
│  Redis (Cache/Session)                                             │
│  ├── Session Store: User Sessions, JWT Blacklist                    │
│  ├── Cache: Product Catalog, User Preferences, Search Results        │
│  └── Rate Limiting: API Rate Limits, Throttling                      │
│                                                                     │
│  Neo4j (Graph)                                                     │
│  └── Knowledge Graph: User-Product-Order Relationships, AI Memory    │
│                                                                     │
│  OpenSearch (Search)                                                │
│  └── Full-Text Search: Products, Users, Orders                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 10. Monitoring Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      OBSERVABILITY STACK                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    METRICS (Prometheus)                     │   │
│   │  • JVM Metrics (Heap, GC, Threads)                        │   │
│   │  • HTTP Metrics (Latency, Error Rate)                     │   │
│   │  • Business Metrics (Orders, Revenue)                     │   │
│   │  • AI Metrics (Response Time, Accuracy)                    │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                        │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                      LOGS (Loki)                             │   │
│   │  • Structured JSON Logs                                    │   │
│   │  • Correlation IDs                                          │   │
│   │  • Service Logs                                            │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                        │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    TRACES (Jaeger)                           │   │
│   │  • Distributed Tracing                                      │   │
│   │  • End-to-End Request Flow                                  │   │
│   │  • Performance Bottlenecks                                  │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                        │
│                              ▼                                        │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                   DASHBOARDS (Grafana)                       │   │
│   │  • Application Dashboard                                    │   │
│   │  • Infrastructure Dashboard                                   │   │
│   │  • Business Dashboard                                       │   │
│   │  • AI Performance Dashboard                                  │   │
│   │  • Security Dashboard                                        │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 11. AI-SOS Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          AI-SOS LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                     AI-SOS KERNEL                           │   │
│   │                                                               │   │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │   │
│   │  │ Scheduler  │  │  Executor  │  │ Monitor    │            │   │
│   │  │            │  │            │  │            │            │   │
│   │  │ • Mission  │  │ • Task     │  │ • Health   │            │   │
│   │  │   Queue   │  │   Exec    │  │ • Alerts   │            │   │
│   │  └────────────┘  └────────────┘  └────────────┘            │   │
│   │                                                              │   │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │   │
│   │  │  Router   │  │  Policy   │  │  Logger    │            │   │
│   │  │            │  │  Engine   │  │            │            │   │
│   │  │ • Request │  │ • Rules   │  │ • Audit    │            │   │
│   │  │   Route  │  │ • Limits  │  │ • History  │            │   │
│   │  └────────────┘  └────────────┘  └────────────┘            │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                        │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                     AI AGENTS                                │   │
│   │                                                              │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│   │  │ Executive│  │ Worker   │  │Specialist│  │ Monitor  │  │   │
│   │  │   AI     │  │  Agents  │  │  Agents  │  │  Agent   │  │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │   │
│   │                                                              │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│   │  │ Ask Brain│  │  Price   │  │ Fashion  │  │Customer  │  │   │
│   │  │   AI     │  │ Monitor  │  │ Stylist  │  │  Support │  │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                        │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                     MEMORY ENGINE                           │   │
│   │                                                              │   │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │   │
│   │  │ Short-Term│  │ Long-Term │  │ Knowledge  │            │   │
│   │  │  Memory   │  │  Memory    │  │   Graph    │            │   │
│   │  │  (Redis)  │  │ (Neo4j)   │  │  (Neo4j)   │            │   │
│   │  └────────────┘  └────────────┘  └────────────┘            │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Status:** Approved
