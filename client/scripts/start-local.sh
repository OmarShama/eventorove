#!/bin/bash

# Start client in local environment
echo "Starting client in LOCAL environment..."

# Copy local environment file
cp env.local .env.local

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Export PORT from environment file
export $(cat .env.local | grep -v '^#' | xargs)

# Set default port if not set
PORT=${PORT:-5001}

# Start the client
echo "Starting client on port $PORT..."
npx next dev -p $PORT
