# PriceBrain Developer Setup Guide

## Prerequisites

### Required Software
| Software | Version | Purpose |
|----------|---------|---------|
| Java JDK | 21+ | Backend runtime |
| Maven | 3.9+ | Build tool |
| Docker | 24+ | Containerization |
| Docker Compose | 2.20+ | Local orchestration |
| Git | 2.40+ | Version control |
| VS Code / IntelliJ IDEA | Latest | IDE (recommended) |

### Optional Software
| Software | Purpose |
|----------|---------|
| kubectl | Kubernetes CLI |
| Helm | Kubernetes package manager |
| AWS CLI | AWS deployment |
| Azure CLI | Azure deployment |

---

## Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/pricebrain/pricebrain.git
cd pricebrain
```

### 2. Start Infrastructure

```bash
cd infrastructure/docker
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- MongoDB (port 27017)
- Redis (port 6379)
- Kafka + Zookeeper (port 9092)
- Prometheus (port 9090)
- Grafana (port 3001)
- Jaeger (port 16686)
- MailHog (ports 1025, 8025)
- Kafka UI (port 8090)

### 3. Build Backend

```bash
cd backend
mvn clean install
```

### 4. Start Services

Start each service in a separate terminal:

```bash
# Service Registry
cd backend/service-registry
mvn spring-boot:run

# Config Server
cd backend/config-server
mvn spring-boot:run

# API Gateway
cd backend/api-gateway
mvn spring-boot:run

# Auth Service
cd backend/auth-service
mvn spring-boot:run
```

### 5. Verify Installation

```bash
# Check Eureka (Service Registry)
curl http://localhost:8761

# Check API Gateway
curl http://localhost:8080/actuator/health

# Check Auth Service
curl http://localhost:8081/actuator/health
```

---

## Development Environment Setup

### Using IntelliJ IDEA

1. **Import Project**
   - File → Open → Select `backend` folder
   - Select "Import as Maven Project"

2. **Configure SDK**
   - File → Project Structure → Project
   - Set Project SDK to Java 21

3. **Run Configurations**
   Create run configurations for each service:
   
   | Service | Port | VM Options |
   |---------|------|------------|
   | Service Registry | 8761 | `-Dserver.port=8761` |
   | Config Server | 8888 | `-Dserver.port=8888` |
   | API Gateway | 8080 | `-Dserver.port=8080` |
   | Auth Service | 8081 | `-Dserver.port=8081` |
   | User Service | 8082 | `-Dserver.port=8082` |
   | Product Service | 8083 | `-Dserver.port=8083` |
   | Order Service | 8084 | `-Dserver.port=8084` |
   | AI Service | 8087 | `-Dserver.port=8087` |

4. **Environment Variables**
   Set these in run configurations:
   ```
   SPRING_PROFILES_ACTIVE=development
   EUREKA_SERVER=http://localhost:8761/eureka
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   REDIS_HOST=localhost
   REDIS_PORT=6379
   JWT_SECRET=dev-secret-key
   ```

### Using VS Code

1. **Install Extensions**
   - Extension Pack for Java
   - Spring Boot Extension Pack
   - Maven for Java
   - Docker

2. **Open Project**
   - File → Open Folder → Select `backend`

3. **Configure launch.json**
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "java",
         "name": "Auth Service",
         "request": "launch",
         "mainClass": "com.pricebrain.auth.AuthServiceApplication",
         "projectName": "auth-service",
         "env": {
           "SPRING_PROFILES_ACTIVE": "development"
         }
       }
     ]
   }
   ```

### Hot Reload

Spring Boot DevTools enables hot reload:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>
```

---

## Database Setup

### PostgreSQL

```bash
# Connect to PostgreSQL
psql -h localhost -U postgres -d pricebrain_auth

# Create databases
CREATE DATABASE pricebrain_auth;
CREATE DATABASE pricebrain_users;
CREATE DATABASE pricebrain_products;
CREATE DATABASE pricebrain_orders;
```

### MongoDB

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017 -u mongoadmin -p password

# Create database
use pricebrain_ai
```

### Redis

```bash
# Test Redis connection
redis-cli -h localhost -p 6379 -a pricebrain-redis
```

---

## Kafka Topics

Create required Kafka topics:

```bash
# Create topics
kafka-topics.sh --create --topic user.created --bootstrap-server localhost:9092
kafka-topics.sh --create --topic user.updated --bootstrap-server localhost:9092
kafka-topics.sh --create --topic product.created --bootstrap-server localhost:9092
kafka-topics.sh --create --topic product.updated --bootstrap-server localhost:9092
kafka-topics.sh --create --topic order.created --bootstrap-server localhost:9092
kafka-topics.sh --create --topic order.updated --bootstrap-server localhost:9092
kafka-topics.sh --create --topic payment.processed --bootstrap-server localhost:9092
kafka-topics.sh --create --topic notification.email --bootstrap-server localhost:9092
kafka-topics.sh --create --topic notification.push --bootstrap-server localhost:9092
kafka-topics.sh --create --topic ai.mission.started --bootstrap-server localhost:9092
kafka-topics.sh --create --topic ai.mission.completed --bootstrap-server localhost:9092
```

---

## Testing

### Run All Tests

```bash
cd backend
mvn test
```

### Run Service Tests

```bash
mvn test -pl auth-service
mvn test -pl user-service
mvn test -pl product-service
```

### Run Integration Tests

```bash
mvn verify -P integration-tests
```

### Test Coverage

```bash
mvn test jacoco:report
# View report at: target/site/jacoco/index.html
```

---

## API Documentation

### Swagger UI

Access Swagger UI for each service:

| Service | Swagger URL |
|---------|-------------|
| Auth Service | http://localhost:8081/swagger-ui.html |
| User Service | http://localhost:8082/swagger-ui.html |
| Product Service | http://localhost:8083/swagger-ui.html |
| Order Service | http://localhost:8084/swagger-ui.html |

### OpenAPI Specs

```bash
# Generate OpenAPI spec
mvn spring-boot:run -Dspring-boot.run.arguments="--springdoc.api-docs.path=/api-docs"

# View spec
curl http://localhost:8081/api-docs
```

---

## Monitoring

### Prometheus

Access: http://localhost:9090

### Grafana

Access: http://localhost:3001
- Username: admin
- Password: admin

### Jaeger (Distributed Tracing)

Access: http://localhost:16686

### Kafka UI

Access: http://localhost:8090

### MailHog (Development Email)

Access: http://localhost:8025

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>
```

### Docker Issues

```bash
# Restart Docker
sudo systemctl restart docker

# Clean up Docker
docker system prune -a
```

### Maven Cache Issues

```bash
# Clear Maven cache
rm -rf ~/.m2/repository

# Rebuild
mvn clean install
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker restart pricebrain-postgres
```

### Kafka Issues

```bash
# Check Kafka is healthy
docker exec pricebrain-kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# Recreate topics
docker exec pricebrain-kafka kafka-topics --delete --topic <topic> --bootstrap-server localhost:9092
```

---

## Common Tasks

### Create New Service

1. Create service module in `backend/{service-name}`
2. Add to parent POM `<modules>`
3. Copy structure from existing service
4. Update configurations
5. Register in API Gateway

### Add New API Endpoint

1. Create DTO in `dto/` package
2. Create Controller in `controller/` package
3. Add validation annotations
4. Document with OpenAPI annotations
5. Add tests

### Create New Kafka Event

1. Create event class in `events/` package
2. Extend `DomainEvent`
3. Implement `getTopic()` method
4. Add event listener
5. Configure topic in Kafka

---

## Support

- **Documentation**: [docs.pricebrain.com](https://docs.pricebrain.com)
- **Slack**: #pricebrain-dev
- **Email**: dev@pricebrain.com
