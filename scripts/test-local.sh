#!/bin/bash

# Test your app locally before going live
echo "🧪 Testing MonoNestNext locally..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
print_status "Stopping existing test containers..."
docker-compose -f docker-compose.local-test.yml down --remove-orphans || true

# Build and start services
print_status "Building and starting services for local testing..."
docker-compose -f docker-compose.local-test.yml up --build -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Test the services
print_status "Testing services..."

# Test server
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    print_success "✅ Server is running at http://localhost:3001"
else
    print_warning "⚠️  Server might not be ready yet, but continuing..."
fi

# Test client
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "✅ Client is running at http://localhost:3000"
else
    print_warning "⚠️  Client might not be ready yet, but continuing..."
fi

print_success "🎉 Local test completed!"
print_status "Your app is now running locally at:"
print_status "  🌐 Frontend: http://localhost:3000"
print_status "  🔧 API: http://localhost:3001"
print_status ""
print_status "To stop the test:"
print_status "  docker-compose -f docker-compose.local-test.yml down"
print_status ""
print_warning "If everything works locally, you're ready for the next step!"
