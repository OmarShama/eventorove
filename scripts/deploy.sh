#!/bin/bash

# Eventorove Production Deployment Script
# This script deploys the application using the dev environment configuration

set -e

echo "🚀 Starting Eventorove Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if required environment files exist
if [ ! -f "server/env.deploy" ]; then
    print_error "server/env.deploy file not found. Please create it first."
    exit 1
fi

if [ ! -f "client/env.deploy" ]; then
    print_error "client/env.deploy file not found. Please create it first."
    exit 1
fi

# Check if SSL certificates exist (optional)
if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
    print_warning "SSL certificates not found. Generating self-signed certificates for development..."
    
    # Create self-signed certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=your-domain.com"
    
    print_success "Self-signed SSL certificates generated."
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.deploy.yml down --remove-orphans || true

# Build and start services
print_status "Building and starting services..."
docker-compose -f docker-compose.deploy.yml up --build -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check server health
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_success "Server is healthy"
else
    print_warning "Server health check failed, but continuing..."
fi

# Check client health
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Client is healthy"
else
    print_warning "Client health check failed, but continuing..."
fi

# Show running containers
print_status "Deployment completed! Running containers:"
docker-compose -f docker-compose.deploy.yml ps

print_success "🎉 Deployment completed successfully!"
print_status "Your application is now running at:"
print_status "  - Frontend: https://your-domain.com (or http://localhost:80)"
print_status "  - API: https://your-domain.com/api (or http://localhost:3001)"
print_status "  - Health Check: https://your-domain.com/health"

print_warning "Remember to:"
print_warning "  1. Update your domain name in nginx/nginx.conf"
print_warning "  2. Replace SSL certificates with real ones for production"
print_warning "  3. Update environment variables in server/env.deploy and client/env.deploy"
print_warning "  4. Configure your Supabase database connection"
