# ADR-003: Authentication & Authorization Strategy

## Status
Accepted

## Context
We need enterprise-grade authentication and authorization supporting:
- Multiple user roles (Buyer, Seller, Admin, Super Admin, AI Agent)
- JWT-based authentication
- OAuth2 for third-party integrations
- Fine-grained permissions
- Session management
- Security compliance (OWASP, GDPR)

## Decision

### Authentication Flow
```
┌─────────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Client Request                                                   │
│     │                                                               │
│     ▼                                                               │
│  2. API Gateway                                                     │
│     │                                                               │
│     ▼                                                               │
│  3. Auth Service                                                    │
│     │                                                               │
│     ├──────────────────────────────────────┐                        │
│     ▼                                      ▼                        │
│  ┌──────────┐                        ┌──────────┐                    │
│  │ Register │                        │  Login   │                    │
│  └────┬─────┘                        └────┬─────┘                    │
│       │                                      │                        │
│       ▼                                      ▼                        │
│  ┌──────────┐                        ┌──────────┐                    │
│  │ Validate │                        │ Validate │                    │
│  │ Password │                        │ Credentials│                   │
│  │ (BCrypt)│                        │ (BCrypt) │                    │
│  └────┬─────┘                        └────┬─────┘                    │
│       │                                      │                        │
│       │                                      ▼                        │
│       │                               ┌──────────┐                    │
│       │                               │ Generate │                    │
│       │                               │  JWTs   │                    │
│       │                               └────┬─────┘                    │
│       │                                      │                        │
│       ▼                                      ▼                        │
│  ┌──────────┐                        ┌──────────┐                    │
│  │ Create   │                        │  Return  │                    │
│  │ User     │                        │Tokens    │                    │
│  └────┬─────┘                        └────┬─────┘                    │
│       │                                      │                        │
│       ▼                                      ▼                        │
│  ┌──────────┐                        ┌──────────┐                    │
│  │  Send    │                        │ Store in │                    │
│  │ Welcome  │                        │  Redis   │                    │
│  │ Email    │                        │ Session  │                    │
│  └──────────┘                        └──────────┘                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Token Structure
```
JWT Access Token:
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "BUYER",
  "permissions": ["READ_PRODUCTS", "WRITE_CART"],
  "iat": 1699900000,
  "exp": 1699903600
}

JWT Refresh Token:
{
  "sub": "user-uuid",
  "type": "refresh",
  "iat": 1699900000,
  "exp": 1699907200
}
```

### Role Hierarchy
```
SUPER_ADMIN
    │
    ├── ADMIN
    │     │
    │     ├── SELLER
    │     │     │
    │     │     └── BUYER
    │     │
    │     └── AI_AGENT
    │
    └── INTERNAL_SERVICE
```

### Security Implementation
| Feature | Implementation |
|---------|----------------|
| Password Hashing | BCrypt (cost factor 12) |
| JWT Signing | RS256 (RSA 2048-bit) |
| Token Expiry | Access: 1 hour, Refresh: 7 days |
| Rate Limiting | 5 login attempts per minute |
| Account Lockout | 30 minutes after 5 failed attempts |
| Session Storage | Redis with TTL |

## Consequences

### Positive
- Industry-standard JWT authentication
- Stateless design enables horizontal scaling
- Fine-grained permissions per role
- Redis sessions allow instant logout
- BCrypt provides strong password security

### Negative
- JWT token management complexity on client
- Need secure key management
- Token refresh requires careful handling

## References
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
