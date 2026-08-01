# ADR-002: API Gateway Design

## Status
Accepted

## Context
We need a central entry point for all client requests that handles:
- Authentication & Authorization
- Rate limiting
- Request routing
- API versioning
- Monitoring & logging

## Decision

We will use **Spring Cloud Gateway** as our API Gateway solution.

### Gateway Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Global Filters                          │   │
│   │  • CORS Filter                                      │   │
│   │  • Security Headers Filter                           │   │
│   │  • Request Logging Filter                            │   │
│   └─────────────────────────────────────────────────────┘   │
│                              │                                 │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Routing Layer                            │   │
│   │                                                      │   │
│   │  /api/v1/auth/*    → auth-service:8081              │   │
│   │  /api/v1/users/*   → user-service:8082              │   │
│   │  /api/v1/products/* → product-service:8083           │   │
│   │  /api/v1/orders/*   → order-service:8084            │   │
│   │  /api/v1/ai/*      → ai-service:8087                │   │
│   │                                                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                              │                                 │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Security Layer                          │   │
│   │                                                      │   │
│   │  • JWT Validation                                    │   │
│   │  • RBAC Authorization                               │   │
│   │  • Rate Limiting (Redis)                           │   │
│   │  • Circuit Breaker (Resilience4j)                   │   │
│   │                                                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Route Configuration
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: auth-service
          uri: lb://auth-service
          predicates:
            - Path=/api/v1/auth/**
          filters:
            - StripPrefix=2
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 100
                redis-rate-limiter.burstCapacity: 200
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/v1/users/**
          filters:
            - StripPrefix=2
            - name: CircuitBreaker
              args:
                name: userServiceCircuitBreaker
                fallbackUri: forward:/fallback/user
```

## Consequences

### Positive
- Single entry point simplifies client integration
- Centralized security and monitoring
- Dynamic routing based on Eureka discovery
- Built-in rate limiting and circuit breaker
- Spring ecosystem integration

### Negative
- Single point of failure (mitigated with redundancy)
- Additional latency (minimal with proper configuration)
- More complex configuration

## References
- [Spring Cloud Gateway Documentation](https://spring.io/projects/spring-cloud-gateway)
- [Resilience4j Circuit Breaker](https://resilience4j.readme.io/)
