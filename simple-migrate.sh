#!/bin/bash

echo "🔄 Simple Data Migration for MonoNestNext"
echo "========================================="

# Configuration
LOCAL_DB_HOST="127.0.0.1"
LOCAL_DB_PORT="5432"
LOCAL_DB_NAME="stagea"
LOCAL_DB_USER="postgres"
LOCAL_DB_PASS="postgres"
LOCAL_DB_SCHEMA="stagea_local"

echo "📋 Migration Plan:"
echo "  1. Start fresh Docker database (PostgreSQL 16)"
echo "  2. Create backup from local database"
echo "  3. Restore data to Docker database"
echo ""

# Step 1: Start Docker database
echo "🚀 Starting Docker database..."
docker-compose up -d db

echo "⏳ Waiting for Docker database to be ready..."
sleep 10

# Check if database is ready
until docker-compose exec -T db pg_isready -U postgres; do
    echo "   Waiting for database connection..."
    sleep 2
done
echo "✅ Docker database is ready"

# Step 2: Create backup from local database
echo "📦 Creating backup from local database..."

# Create backup directory
mkdir -p ./backups

# Use Docker to create backup from local database
docker run --rm --network host \
    -e PGPASSWORD="$LOCAL_DB_PASS" \
    -v "$(pwd)/backups:/backups" \
    postgres:16-alpine \
    pg_dump -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
    --schema="$LOCAL_DB_SCHEMA" --no-owner --no-privileges \
    -f "/backups/migration_backup.sql"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully"
else
    echo "❌ Failed to create backup"
    exit 1
fi

# Step 3: Restore to Docker database
echo "🚀 Restoring data to Docker database..."

# Copy backup to Docker container
docker cp ./backups/migration_backup.sql mononestnext_db:/tmp/migration_backup.sql

# Restore the backup
docker-compose exec -T db psql -U postgres -d stagea -f /tmp/migration_backup.sql

if [ $? -eq 0 ]; then
    echo "✅ Data restored successfully"
else
    echo "❌ Failed to restore data"
    exit 1
fi

# Step 4: Verify migration
echo "🔍 Verifying migration..."

# Count tables in both databases
LOCAL_TABLES=$(docker run --rm --network host \
    -e PGPASSWORD="$LOCAL_DB_PASS" \
    postgres:16-alpine \
    psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
    -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$LOCAL_DB_SCHEMA';" | tr -d ' ')

DOCKER_TABLES=$(docker-compose exec -T db psql -U postgres -d stagea \
    -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$LOCAL_DB_SCHEMA';" | tr -d ' ')

echo "  Local database tables: $LOCAL_TABLES"
echo "  Docker database tables: $DOCKER_TABLES"

if [ "$LOCAL_TABLES" = "$DOCKER_TABLES" ] && [ "$LOCAL_TABLES" != "0" ]; then
    echo "✅ Migration verification successful!"
    echo ""
    echo "🎉 Data migration completed successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Start all services: docker-compose up --build"
    echo "  2. Verify data: Check your application at http://localhost:3000"
    echo "  3. Clean up: rm -rf ./backups (optional)"
else
    echo "❌ Migration verification failed"
    echo "   Local tables: $LOCAL_TABLES"
    echo "   Docker tables: $DOCKER_TABLES"
    exit 1
fi

