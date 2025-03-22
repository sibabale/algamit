#!/bin/bash

# Set your project ID
export PROJECT_ID=algamit
echo "Setting up project: $PROJECT_ID"

# Configure Docker for GCR
echo "Configuring Docker for Google Container Registry..."
gcloud auth configure-docker gcr.io

# Function to build and push with retries
build_and_push() {
    local service_name=$1
    local max_attempts=3
    local attempt=1

    echo "Building and pushing $service_name service..."
    
    while [ $attempt -le $max_attempts ]; do
        echo "Attempt $attempt of $max_attempts"
        
        # Try to build
        if docker build -t gcr.io/$PROJECT_ID/$service_name ./$service_name; then
            # Try to push
            if docker push gcr.io/$PROJECT_ID/$service_name; then
                echo "$service_name successfully built and pushed!"
                return 0
            fi
        fi
        
        echo "Attempt $attempt failed. Waiting before retry..."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    echo "Failed to build/push $service_name after $max_attempts attempts"
    return 1
}

# Build and push each service
# build_and_push "transactions" || exit 1
build_and_push "accounts" || exit 1
build_and_push "gateway" || exit 1

echo "All services have been processed"