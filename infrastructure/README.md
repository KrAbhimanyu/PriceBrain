# PriceBrain Infrastructure

This directory contains all infrastructure configuration for the PriceBrain microservices platform.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                     │
│                   Web App, Mobile App, etc.                         │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY (8080)                          │
│              Spring Cloud Gateway + Rate Limiting                     │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  SERVICE        │  │  CONFIG         │  │  MONITORING     │
│  REGISTRY       │  │  SERVER         │  │  STACK          │
│  (8761)         │  │  (8888)         │  │                 │
│  Eureka         │  │  Spring Cloud   │  │  Prometheus     │
│                 │  │  Config         │  │  Grafana        │
└─────────────────┘  └─────────────────┘  │  Jaeger         │
                                           └─────────────────┘

                        MICROSERVICES (14 services)
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Auth     │ User     │ Product  │ Order    │ Payment  │ Cart     │
│ (8081)   │ (8082)   │ (8083)   │ (8084)   │ (8085)   │ (8086)   │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Notif.  │ AI       │ Analytics│ Search   │ Inventory│ Seller   │
│ (8087)  │ (8088)   │ (8089)   │ (8090)   │ (8091)   │ (8092)   │
├──────────┼──────────┴──────────┼──────────┼──────────┴──────────┤
│ Review   │ Wishlist           │ ...      │                    │
│ (8093)   │ (8094)             │          │                    │
└──────────┴────────────────────┴──────────┴────────────────────┘

                           DATA STORES
┌──────────┬──────────┬──────────┬──────────┬──────────────────┐
│ Postgres │ MongoDB  │ Redis    │ Kafka    │ Elasticsearch    │
│ (5432)   │ (27017)  │ (6379)   │ (9092)   │ (9200)          │
└──────────┴──────────┴──────────┴──────────┴──────────────────┘
```

## Quick Start

### Start All Infrastructure

```bash
cd infrastructure
docker-compose up -d
```

### Access Points

| Service | URL | Credentials |
|---------|-----|------------|
| API Gateway | http://localhost:8080 | - |
| Eureka Dashboard | http://localhost:8761 | - |
| Config Server | http://localhost:8888 | - |
| Grafana | http://localhost:3000 | admin/admin123 |
| Prometheus | http://localhost:9090 | - |
| Jaeger UI | http://localhost:16686 | - |

## Services

### Service Registry (Eureka)
- **Port**: 8761
- **Purpose**: Service discovery and registration
- **Dashboard**: http://localhost:8761

### Config Server
- **Port**: 8888
- **Purpose**: Centralized configuration management
- **Config Repo**: Git-based configuration

### Monitoring Stack

#### Prometheus
- **Port**: 9090
- **Purpose**: Metrics collection
- **Config**: `monitoring/prometheus/prometheus.yml`

#### Grafana
- **Port**: 3000
- **Credentials**: admin / admin123
- **Dashboards**: `monitoring/grafana/dashboards/`
- **Datasources**: Prometheus (auto-provisioned)

#### Jaeger
- **Port**: 16686
- **Purpose**: Distributed tracing

## Data Stores

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Primary database |
| MongoDB | 27017 | Document storage |
| Redis | 6379 | Caching & sessions |
| Kafka | 9092 | Event streaming |
| Zookeeper | 2181 | Kafka coordination |

## Development

### Start Only Infrastructure
```bash
docker-compose up -d postgres mongodb redis kafka zookeeper prometheus grafana jaeger
```

### View Logs
```bash
docker-compose logs -f [service-name]
```

### Stop All
```bash
docker-compose down
```

### Clean Volumes
```bash
docker-compose down -v
```

## API Gateway Routes

All requests go through the API Gateway at port 8080:

| Service | Endpoint | Port |
|---------|----------|------|
| Auth | `/api/v1/auth/**` | 8081 |
| User | `/api/v1/users/**` | 8082 |
| Product | `/api/v1/products/**` | 8083 |
| Order | `/api/v1/orders/**` | 8084 |
| Payment | `/api/v1/payments/**` | 8085 |
| Cart | `/api/v1/cart/**` | 8086 |
| Notification | `/api/v1/notifications/**` | 8087 |
| AI | `/api/v1/ai/**` | 8088 |
| Analytics | `/api/v1/analytics/**` | 8089 |
| Search | `/api/v1/search/**` | 8090 |
| Inventory | `/api/v1/inventory/**` | 8091 |
| Seller | `/api/v1/sellers/**` | 8092 |
| Review | `/api/v1/reviews/**` | 8093 |
| Wishlist | `/api/v1/wishlists/**` | 8094 |

## Health Checks

All services expose health endpoints at `/actuator/health`.

Check all services:
```bash
curl http://localhost:8080/actuator/health
```

## Troubleshooting

### Service Not Registering
1. Check Eureka Dashboard at http://localhost:8761
2. Verify service has `eureka.client.enabled=true`
3. Check network connectivity

### Prometheus Not Scraping
1. Verify targets: http://localhost:9090/targets
2. Check service has `/actuator/prometheus` endpoint
3. Review Prometheus logs

### Gateway 502 Errors
1. Verify service is running
2. Check service URL in routes config
3. Review gateway logs

## Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Eureka
EUREKA_SERVER=http://localhost:8761/eureka
```
