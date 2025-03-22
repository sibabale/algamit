#!/bin/bash

# Set project ID explicitly
PROJECT_ID="algamit"
echo "Using project ID: $PROJECT_ID"

# Deploy a service
deploy_service() {
    local service_name=$1
    echo "Deploying $service_name service..."
    
    gcloud run deploy $service_name \
        --image gcr.io/$PROJECT_ID/$service_name:latest \
        --platform managed \
        --timeout 3600s \
        --region africa-south1 \
        --allow-unauthenticated \
        --project $PROJECT_ID
}

# Deploy services in order
echo "Starting deployments..."
deploy_service "accounts"
# deploy_service "transactions"
# deploy_service "gateway"

echo "Deployment completed!"