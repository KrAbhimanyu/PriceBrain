#!/bin/bash
set -e

echo "=== PriceBrain Kubernetes Deployment ==="

# Check prerequisites
command -v kubectl >/dev/null 2>&1 || { echo "kubectl is required but not installed."; exit 1; }

# Install cert-manager if not present
echo "Checking cert-manager..."
if ! kubectl get namespace cert-manager &>/dev/null; then
    echo "Installing cert-manager..."
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml
    echo "Waiting for cert-manager to be ready..."
    kubectl wait --for=condition=Ready pods -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=120s
fi

# Create namespace and apply manifests
echo "Deploying PriceBrain..."
kubectl apply -k ./

# Wait for deployments
echo "Waiting for deployments..."
kubectl rollout status deployment/backend -n pricebrain --timeout=300s
kubectl rollout status deployment/frontend -n pricebrain --timeout=300s

echo "=== Deployment Complete ==="
echo ""
echo "Checking certificate status..."
kubectl get certificate -n pricebrain
