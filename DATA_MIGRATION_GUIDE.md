# Data Migration Guide for MonoNestNext

This guide helps you migrate your existing local database data to the Docker containerized setup.

## 🎯 Overview

Your Docker setup already has **separate containers** for each service:
- **Database Container**: `mononestnext_db` (PostgreSQL)
- **Server Container**: `mononestnext_server` (NestJS API)
- **Client Container**: `mononestnext_client` (Next.js Frontend)

## 📋 Prerequisites

- Docker Desktop running
- Local PostgreSQL database with your data
- Database credentials (default: postgres/postgres)

## 🚀 Migration Options

### Option 1: Docker-based Migration (Recommended)

This method uses Docker containers to perform the migration, so you don't need PostgreSQL tools installed locally.

```bash
# Run the Docker-based migration script
./docker-migrate-data.sh
```

**What it does:**
1. ✅ Checks local database connectivity
2. ✅ Starts Docker database container
3. ✅ Creates backup from local database
4. ✅ Restores data to Docker database
5. ✅ Verifies migration success

### Option 2: Windows Batch Script

If you have PostgreSQL tools installed locally on Windows:

```cmd
# Run the Windows batch script
migrate-data-windows.bat
```

### Option 3: Manual Migration

If you prefer to do it manually:

```bash
# 1. Start only the database container
docker-compose up -d db

# 2. Create backup from local database
pg_dump -h 127.0.0.1 -p 5432 -U postgres -d stagea --schema=stagea_local --no-owner --no-privileges -f backup.sql

# 3. Restore to Docker database
docker cp backup.sql mononestnext_db:/tmp/backup.sql
docker-compose exec db psql -U postgres -d stagea -f /tmp/backup.sql
```

## 🔧 Configuration

The migration scripts use these default settings:

| Setting | Local Database | Docker Database |
|---------|----------------|-----------------|
| Host | 127.0.0.1 | localhost |
| Port | 5432 | 5432 |
| Database | stagea | stagea |
| Schema | stagea_local | stagea_local |
| User | postgres | postgres |
| Password | postgres | postgres |

To modify these settings, edit the variables at the top of the migration scripts.

## 🧪 Testing the Migration

After migration, test your setup:

```bash
# 1. Start all services
docker-compose up --build

# 2. Check container status
docker-compose ps

# 3. Test endpoints
curl http://localhost:3001/api/auth/user
curl http://localhost:3000
```

## 🔍 Verifying Separate Containers

Your setup already uses separate containers. Verify this:

```bash
# Check running containers
docker ps

# You should see:
# - mononestnext_db (PostgreSQL)
# - mononestnext_server (NestJS)
# - mononestnext_client (Next.js)
```

## 📁 Container Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Client        │  │   Server        │  │   Database  │ │
│  │   (Next.js)     │  │   (NestJS)      │  │ (PostgreSQL)│ │
│  │   Port: 3000    │  │   Port: 3001    │  │ Port: 5432  │ │
│  │                 │  │                 │  │             │ │
│  │ Container:      │  │ Container:      │  │ Container:  │ │
│  │ mononestnext_   │  │ mononestnext_   │  │ mononestnext│ │
│  │ client          │  │ server          │  │ _db         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Troubleshooting

### Port Conflicts

If you get port conflicts:

```bash
# Check what's using the ports
netstat -an | grep :3000
netstat -an | grep :3001
netstat -an | grep :5432

# Stop conflicting services or change ports in docker-compose.yml
```

### Database Connection Issues

```bash
# Check database container logs
docker-compose logs db

# Test database connection
docker-compose exec db psql -U postgres -d stagea -c "SELECT 1;"
```

### Migration Issues

```bash
# Check migration logs
docker-compose logs server

# Verify schema exists
docker-compose exec db psql -U postgres -d stagea -c "\dn"
```

## 🧹 Cleanup

After successful migration:

```bash
# Remove backup files (optional)
rm -rf ./backups

# Stop all services
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker-compose down -v
```

## 📚 Next Steps

1. **Run Migration**: Choose one of the migration options above
2. **Start Services**: `docker-compose up --build`
3. **Test Application**: Visit http://localhost:3000
4. **Verify Data**: Check that your data is accessible
5. **Development**: Use `docker-compose -f docker-compose.dev.yml up` for development

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Verify containers: `docker-compose ps`
3. Test database: `docker-compose exec db psql -U postgres -d stagea`
4. Check this guide for troubleshooting steps

Your application is now fully containerized with separate containers for each service! 🐳

