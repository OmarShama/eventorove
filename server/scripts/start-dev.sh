#!/bin/bash

# Start server in dev environment (Supabase)
echo "Starting server in DEV environment..."

# Copy dev environment file
cp env.dev .env

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
