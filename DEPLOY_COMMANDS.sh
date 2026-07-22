#!/bin/bash
# PriceBrain Kubernetes Deployment Script
# Usage: bash DEPLOY_COMMANDS.sh

set -e

echo "=============================================="
echo " PRICE BRAIN - KUBERNETES DEPLOYMENT"
echo "=============================================="

# 1. Create KIND cluster
echo ""
echo "[1/6] Creating KIND cluster..."
kind create cluster --name pricebrain

# 2. Install cert-manager
echo ""
echo "[2/6] Installing cert-manager..."
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml
kubectl wait --for=condition=Ready pods -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=120s

# 3. Install NGINX Ingress
echo ""
echo "[3/6] Installing NGINX Ingress Controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl wait --for=condition=Ready pods -l app.kubernetes.io/component=controller -n ingress-nginx --timeout=120s

# 4. Deploy PriceBrain
echo ""
echo "[4/6] Deploying PriceBrain..."
kubectl apply -k .

# 5. Wait for pods
echo ""
echo "[5/6] Waiting for pods to be ready..."
kubectl wait --for=condition=Ready pods -l app=backend -n pricebrain --timeout=300s
kubectl wait --for=condition=Ready pods -l app=frontend -n pricebrain --timeout=300s

# 6. Summary
echo ""
echo "[6/6] Deployment complete!"
echo ""
echo "=============================================="
echo " STATUS:"
kubectl get pods -n pricebrain
echo ""
echo " ACCESS:"
echo "  Frontend: http://localhost:8080/"
echo "  Backend:  http://localhost:8080/api"
echo ""
echo " Run: kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80"
echo "=============================================="
