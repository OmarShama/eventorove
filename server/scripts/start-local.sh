#!/bin/bash

# Start server in local environment
echo "Starting server in LOCAL environment..."

# Copy local environment file
cp env.local .env

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
npm run start:dev
