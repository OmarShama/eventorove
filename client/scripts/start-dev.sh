#!/bin/bash

# Start client in dev environment
echo "Starting client in DEV environment..."

# Copy dev environment file
cp env.dev .env.local

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Export PORT from environment file
export $(cat .env.local | grep -v '^#' | xargs)

# Set default port if not set
PORT=${PORT:-3000}

# Build and start the client
echo "Building and starting client on port $PORT..."
npm run build
npx next start -p $PORT
