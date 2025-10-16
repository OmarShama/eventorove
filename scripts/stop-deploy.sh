#!/bin/bash

# Stop Eventorove Production Deployment

set -e

echo "🛑 Stopping Eventorove Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Stop and remove containers
print_status "Stopping and removing containers..."
docker-compose -f docker-compose.deploy.yml down --remove-orphans

# Remove unused images (optional)
read -p "Do you want to remove unused Docker images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Removing unused Docker images..."
    docker image prune -f
fi

print_success "🎉 Deployment stopped successfully!"
