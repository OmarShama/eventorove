# Environment Setup Guide

This project supports three different environments with separate database schemas and configurations.

## Environments

### 1. Local Environment
- **Database**: `eventorove` (local PostgreSQL)
- **Schema**: `eventorove_local`
- **Server URL**: `http://localhost:5000`
- **Client URL**: `http://localhost:5001`

### 2. Docker Environment
- **Database**: `eventorove` (Docker PostgreSQL)
- **Schema**: `eventorove_docker`
- **Server URL**: `http://localhost:3000`
- **Client URL**: `http://localhost:3001`

### 3. Development Environment (Supabase)
- **Database**: `eventorove` (Supabase PostgreSQL)
- **Schema**: `eventorove_dev`
- **Server URL**: `https://your-app-name.vercel.app`
- **Client URL**: `https://your-app-name.vercel.app`

## Quick Start

### Local Environment
```bash
# Start local PostgreSQL (if not running)
# Make sure PostgreSQL is running on localhost:5432

# Start server
cd server
chmod +x scripts/start-local.sh
./scripts/start-local.sh

# Start client (in another terminal)
cd client
chmod +x scripts/start-local.sh
./scripts/start-local.sh
```

### Docker Environment
```bash
# Start all services with Docker Compose
docker-compose up --build

# Or start specific services
docker-compose up db server client
```

### Development Environment (Supabase)
```bash
# 1. Set up your Supabase project
# 2. Update server/env.dev with your Supabase connection string
# 3. Update client/env.dev with your production URL

# Start server
cd server
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh

# Start client (in another terminal)
cd client
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

## Environment Files

### Server Environment Files
- `server/env.local` - Local development configuration
- `server/env.docker` - Docker environment configuration
- `server/env.dev` - Development/Supabase environment configuration

### Client Environment Files
- `client/env.local` - Local development configuration
- `client/env.docker` - Docker environment configuration
- `client/env.dev` - Development environment configuration

## Database Schemas

Each environment uses a separate schema within the same database:

1. **Local**: `eventorove_local`
2. **Docker**: `eventorove_docker`
3. **Dev**: `eventorove_dev`

This allows you to:
- Test different configurations without conflicts
- Maintain separate data for each environment
- Deploy to different environments safely

## Configuration Details

### Server Configuration
The server automatically loads the appropriate environment file based on `NODE_ENV`:
- `NODE_ENV=development` → loads `env.local`
- `NODE_ENV=production` → loads `env.docker` or `env.dev`

### Client Configuration
The client uses `NEXT_PUBLIC_API_URL` to determine the server endpoint:
- Local: `http://localhost:5000` (client runs on port 5001)
- Docker: `http://localhost:3000` (client runs on port 3001)
- Dev: `https://your-app-name.vercel.app`

## Migration Management

Migrations are automatically run when starting the server. Each environment will:
1. Create its schema if it doesn't exist
2. Run all pending migrations
3. Set up the database structure

## Docker Compose Files

- `docker-compose.yml` - Main Docker environment
- `docker-compose.local.yml` - Local development with Docker
- `docker-compose.dev.yml` - Development environment (no local DB)

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000, 3001, and 5432 are available
2. **Database connection**: Verify your database credentials and connection strings
3. **Environment variables**: Ensure the correct environment file is being loaded
4. **Schema issues**: Check that the schema exists and migrations have run

### Reset Environment

To reset an environment:
```bash
# For local environment
docker-compose -f docker-compose.local.yml down -v
docker-compose -f docker-compose.local.yml up --build

# For docker environment
docker-compose down -v
docker-compose up --build
```

## Production Deployment

For production deployment:
1. Use the `env.dev` configuration
2. Set up your Supabase database
3. Update the `DATABASE_URL` in `env.dev`
4. Update the `NEXT_PUBLIC_API_URL` in `client/env.dev`
5. Deploy using your preferred platform (Vercel, Netlify, etc.)
