#!/bin/bash

# Start server in docker environment
echo "Starting server in DOCKER environment..."

# Copy docker environment file
cp env.docker .env

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run migrations
echo "Running migrations..."
npm run migration:run

# Start the server
echo "Starting server..."
npm run start:prod
