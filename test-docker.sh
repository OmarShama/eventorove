#!/bin/bash

echo "🐳 Testing Docker setup for MonoNestNext..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"

# Test Docker Compose syntax
echo "🔍 Validating docker-compose.yml..."
if docker-compose config > /dev/null 2>&1; then
    echo "✅ docker-compose.yml is valid"
else
    echo "❌ docker-compose.yml has syntax errors"
    exit 1
fi

echo "🔍 Validating docker-compose.dev.yml..."
if docker-compose -f docker-compose.dev.yml config > /dev/null 2>&1; then
    echo "✅ docker-compose.dev.yml is valid"
else
    echo "❌ docker-compose.dev.yml has syntax errors"
    exit 1
fi

# Test Dockerfile syntax by building
echo "🔍 Testing Docker builds..."
echo "  Building client..."
if docker build -f client/Dockerfile client/ --quiet > /dev/null 2>&1; then
    echo "✅ client/Dockerfile builds successfully"
else
    echo "❌ client/Dockerfile has build errors"
fi

echo "  Building server..."
if docker build -f server/Dockerfile server/ --quiet > /dev/null 2>&1; then
    echo "✅ server/Dockerfile builds successfully"
else
    echo "❌ server/Dockerfile has build errors"
fi

echo ""
echo "🎉 Docker setup validation complete!"
echo ""
echo "To start the application:"
echo "  Production: docker-compose up --build"
echo "  Development: docker-compose -f docker-compose.dev.yml up --build"
echo ""
echo "To stop the application:"
echo "  docker-compose down"
echo "  docker-compose -f docker-compose.dev.yml down"
