# Kubernetes Deployment Guide

## Prerequisites

- Kubernetes cluster (v1.28+)
- kubectl configured
- Helm 3 (optional for cert-manager)
- DNS configured for your domain

## Quick Start

### 1. Install cert-manager (for SSL)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml
```

Or use the deploy script:
```bash
./k8s/deploy.sh
```

### 2. Apply all manifests

```bash
kubectl apply -k k8s/
```

### 3. Verify deployment

```bash
kubectl get pods -n pricebrain
kubectl get svc -n pricebrain
kubectl get certificate -n pricebrain
```

## Domain & HTTPS Configuration

### 1. Configure DNS

Point your domains to your ingress IP:

| Domain | Type | Value |
|--------|------|-------|
| `pricebrain.example.com` | A | `<INGRESS_IP>` |
| `api.pricebrain.example.com` | A | `<INGRESS_IP>` |

### 2. Update Secrets

Edit `01-secrets.yaml` with your actual secrets:
```yaml
stringData:
  JWT_SECRET: "your-secure-jwt-secret"
  OPENAI_API_KEY: "sk-..."
```

### 3. SSL Certificate

Certificates are automatically provisioned by cert-manager via Let's Encrypt.

Check certificate status:
```bash
kubectl get certificate -n pricebrain
kubectl describe certificate pricebrain-tls -n pricebrain
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 3000 | Next.js web application |
| backend | 3001 | NestJS API |
| postgres | 5432 | PostgreSQL database |
| redis | 6379 | Redis cache |
| elasticsearch | 9200 | Elasticsearch search |

## SSL/TLS Features

- **Automatic SSL**: Let's Encrypt certificates via cert-manager
- **HTTP → HTTPS**: Automatic redirect enabled
- **TLS 1.2/1.3**: Modern TLS protocols only
- **HSTS**: Enabled for secure connections
- **OCSP Stapling**: Configured for valid certificates

## CDN Configuration

Static assets are configured with aggressive caching:

| Asset Type | Cache Duration | Headers |
|------------|----------------|---------|
| Images | 1 year | `public, immutable` |
| CSS/JS | 1 year | `public, immutable` |
| Fonts | 1 year | `public, immutable` |
| HTML | No cache | `no-cache` |

## Environment Variables

See `env.production.template` for all configuration options.

Key variables for domain/HTTPS:
- `APP_URL` - Frontend URL (e.g., `https://pricebrain.example.com`)
- `API_URL` - Backend URL (e.g., `https://api.pricebrain.example.com`)
- `CORS_ORIGIN` - Allowed origins for CORS

## Scaling

```bash
kubectl scale deployment backend -n pricebrain --replicas=3
kubectl scale deployment frontend -n pricebrain --replicas=3
```

## Monitoring

```bash
kubectl logs -f deployment/backend -n pricebrain
kubectl top pods -n pricebrain
kubectl get ingress -n pricebrain
```

## Cleanup

```bash
kubectl delete -k k8s/
```
