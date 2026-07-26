# PriceBrain Backend - Enterprise Microservices Platform

Enterprise-grade, AI-powered marketplace backend built with Spring Boot microservices architecture.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY (8080)                         │
│                   Spring Cloud Gateway + Redis Rate Limiting             │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│  AUTH SERVICE    │  │  USER SERVICE   │  │ PRODUCT SERVICE  │
│    (8081)        │  │    (8082)       │  │    (8083)        │
│  JWT + OAuth2    │  │                 │  │                  │
└────────┬─────────┘  └────────┬────────┘  └────────┬─────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          KAFKA EVENT BUS                                 │
│                    Apache Kafka Event Streaming                          │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│ORDER SERVICE     │  │  AI SERVICE      │  │NOTIFICATION SVC   │
│    (8084)        │  │    (8087)        │  │    (8086)         │
│                  │  │  Ask Brain AI   │  │                  │
└───────────────────┘  └───────────────────┘  └───────────────────┘
```

## 📦 Services

| Service | Port | Description |
|---------|------|-------------|
| `api-gateway` | 8080 | Central gateway, routing, security |
| `auth-service` | 8081 | Authentication, JWT, OAuth2 |
| `user-service` | 8082 | User management, profiles |
| `product-service` | 8083 | Product catalog, categories |
| `order-service` | 8084 | Orders, cart, checkout |
| `payment-service` | 8085 | Payment processing |
| `notification-service` | 8086 | Notifications, email, push |
| `ai-service` | 8087 | AI capabilities, Ask Brain |
| `analytics-service` | 8088 | Analytics, reporting |
| `search-service` | 8089 | Full-text search |
| `seller-service` | 8091 | Seller management |
| `inventory-service` | 8090 | Inventory management |
| `config-server` | 8888 | Centralized configuration |
| `service-registry` | 8761 | Service discovery (Eureka) |

## 🚀 Quick Start

### Prerequisites
- Java 21+
- Maven 3.9+
- Docker & Docker Compose

### Start Infrastructure

```bash
cd infrastructure/docker
docker-compose up -d
```

### Build All Services

```bash
cd backend
mvn clean install
```

### Run Services

```bash
# Service Registry
cd service-registry && mvn spring-boot:run

# Config Server
cd config-server && mvn spring-boot:run

# API Gateway
cd api-gateway && mvn spring-boot:run

# Auth Service
cd auth-service && mvn spring-boot:run
```

## 🔧 Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | Spring Boot 3.2 |
| Security | Spring Security 6 + JWT |
| Database | PostgreSQL 16, MongoDB 7, Redis 7 |
| Messaging | Apache Kafka |
| Search | OpenSearch |
| Monitoring | Prometheus, Grafana, Jaeger |
| Container | Docker, Kubernetes |

## 📚 Documentation

- [System Architecture](docs/architecture/SYSTEM_ARCHITECTURE.md)
- [ADR Documents](docs/adrs/)
- [Developer Setup Guide](docs/DEVELOPER_SETUP.md)
- [API Documentation](docs/api/)

## 🔒 Security

- **JWT Authentication** with RS256 signing
- **RBAC Authorization** with fine-grained permissions
- **Rate Limiting** using Redis
- **BCrypt Password Hashing** (strength 12)
- **Account Lockout** after 5 failed attempts
- **OWASP Top 10** protection

## 📊 Monitoring

Access monitoring tools at:
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
- **Jaeger**: http://localhost:16686
- **Kafka UI**: http://localhost:8090

## 🔄 CI/CD

GitHub Actions pipelines for:
- Code linting and testing
- Docker image builds
- Security scanning
- Multi-environment deployments

## 📁 Project Structure

```
backend/
├── api-gateway/          # API Gateway
├── auth-service/          # Authentication
├── user-service/         # User Management
├── product-service/      # Product Catalog
├── order-service/        # Order Processing
├── notification-service/ # Notifications
├── ai-service/           # AI Capabilities
├── analytics-service/    # Analytics
├── search-service/       # Search
├── seller-service/       # Seller Management
├── inventory-service/    # Inventory
├── config-server/        # Config Server
├── service-registry/     # Eureka Registry
└── shared-library/       # Shared Code
```

## 📄 License

Copyright © 2024 PriceBrain. All rights reserved.
