#!/bin/bash

# Exit on any error
set -e

# Determine the script's directory
SCRIPT_DIR=$(dirname "$(realpath "$0")")

# Define the location of the .env file relative to the script's directory
ENV_FILE="$SCRIPT_DIR/../.env"
FULL_ENV_PATH=$(realpath "$ENV_FILE")

echo "Looking for .env file at: $FULL_ENV_PATH"

# Load environment variables from .env file located one directory up from the script's location
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | xargs)
else
  echo "$FULL_ENV_PATH file not found. Please create one with APP_NAME and STAGE variables."
  exit 1
fi

# Check if APP_NAME and STAGE are set
if [ -z "$APP_NAME" ]; then
  echo "APP_NAME is not set or is empty in the .env file."
  exit 1
fi

if [ -z "$STAGE" ]; then
  echo "STAGE is not set or is empty in the .env file."
  exit 1
fi

# Check if the image name is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <image-name>"
  exit 1
fi

# Variables
IMAGE_NAME=$1
TAG=${2:-"latest"}         # Default tag is 'latest'
FULL_IMAGE_NAME="$ECR_REGISTRY/$APP_NAME-$STAGE-$IMAGE_NAME:$TAG"

# Check if the user is already logged in to the ECR registry
echo "Checking Docker authentication for ECR registry: $ECR_REGISTRY"
if ! docker system info | grep -q "$ECR_REGISTRY"; then
  echo "Not authenticated. Logging in to ECR..."
  # Authenticate with AWS ECR
  aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin "$ECR_REGISTRY"
else
  echo "Already authenticated with Docker for ECR registry: $ECR_REGISTRY"
fi


LAMBDA_BASE="$ECR_REGISTRY/$APP_NAME-$STAGE-lambda-base:latest"

# Ensure the base image for the Dockerfile is accessible, unless the image being built is lambda-base
if [ "$IMAGE_NAME" != "lambda-base" ]; then
  echo "Pulling $LAMBDA_BASE from ECR..."
  docker pull "$LAMBDA_BASE"
fi

# Build the Docker image with OCI compatibility
echo "Building Docker image: $FULL_IMAGE_NAME"
docker buildx build \
  --build-arg LAMBDA_BASE="$LAMBDA_BASE" \
  --output=type=registry \
  --provenance=false \
  --platform linux/amd64 \
  -t "$FULL_IMAGE_NAME" . \
  --no-cache

# Push the Docker image to the registry
echo "Pushing Docker image to $ECR_REGISTRY"
docker push "$FULL_IMAGE_NAME"

echo "Docker image $FULL_IMAGE_NAME successfully pushed."
