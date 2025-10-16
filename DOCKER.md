# Docker Setup for Eventorove

This document provides instructions for running the Eventorove application using Docker.

## Prerequisites

- Docker Desktop installed on your machine
- Docker Compose (included with Docker Desktop)

## Project Structure

The application consists of three main components:
- **Client**: Next.js frontend application (port 3000)
- **Server**: NestJS backend API (port 3001)
- **Database**: PostgreSQL database (port 5432)

## Quick Start

### Production Mode

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Development Mode

1. **Start development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000 (with hot reload)
   - Backend API: http://localhost:3001 (with hot reload)
   - Database: localhost:5432

## Environment Variables

### Server Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
NODE_ENV=production
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=stagea
DB_SCHEMA=stagea_local
DB_SYNC=false
JWT_SECRET=your-secure-jwt-secret-key
PORT=3001
```

### Client Environment Variables

Create a `.env.local` file in the `client` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Available Commands

### Production Commands

```bash
# Start all services
docker-compose up

# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Rebuild and start services
docker-compose up --build

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs server
docker-compose logs client
docker-compose logs db
```

### Development Commands

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# Stop development environment
docker-compose -f docker-compose.dev.yml down

# Rebuild development environment
docker-compose -f docker-compose.dev.yml up --build
```

## Database Management

### Accessing the Database

```bash
# Connect to PostgreSQL container
docker-compose exec db psql -U postgres -d stagea

# Run migrations (if needed)
docker-compose exec server npm run migration:run
```

### Database Schema

The database uses the `stagea_local` schema. The initialization script (`init-db.sql`) creates this schema automatically.

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000, 3001, and 5432 are not in use by other applications.

2. **Permission issues**: On Linux/macOS, you might need to fix file permissions:
   ```bash
   sudo chown -R $USER:$USER .
   ```

3. **Database connection issues**: Ensure the database container is fully started before the server container. The `depends_on` directive handles this automatically.

4. **Build failures**: Clear Docker cache and rebuild:
   ```bash
   docker-compose down
   docker system prune -a
   docker-compose up --build
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs -f server
```

### Container Management

```bash
# List running containers
docker ps

# Stop specific container
docker-compose stop server

# Restart specific container
docker-compose restart server

# Remove specific container
docker-compose rm server
```

## Production Deployment

For production deployment, consider:

1. **Environment Variables**: Use proper environment variable management (e.g., Docker secrets, external config management)

2. **Security**: 
   - Change default database passwords
   - Use strong JWT secrets
   - Enable SSL/TLS

3. **Performance**:
   - Use production-optimized images
   - Configure resource limits
   - Set up monitoring and logging

4. **Data Persistence**: Ensure database volumes are properly backed up

## File Structure

```
.
├── docker-compose.yml          # Production Docker Compose
├── docker-compose.dev.yml      # Development Docker Compose
├── init-db.sql                 # Database initialization script
├── client/
│   ├── Dockerfile
│   └── .dockerignore
├── server/
│   ├── Dockerfile
│   └── .dockerignore
└── .dockerignore
```

## Support

If you encounter any issues with the Docker setup, please check the logs and ensure all prerequisites are met.
