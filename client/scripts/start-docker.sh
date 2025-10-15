#!/bin/bash

# Start client in docker environment
echo "Starting client in DOCKER environment..."

# Copy docker environment file
cp env.docker .env.local

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Export PORT from environment file
export $(cat .env.local | grep -v '^#' | xargs)

# Set default port if not set
PORT=${PORT:-3001}

# Build and start the client
echo "Building and starting client on port $PORT..."
npm run build
npx next start -p $PORT
