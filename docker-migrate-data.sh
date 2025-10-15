#!/bin/bash

echo "🐳 Docker-based Data Migration for MonoNestNext"
echo "=============================================="

# Configuration
LOCAL_DB_HOST="host.docker.internal"  # Docker Desktop host access
LOCAL_DB_PORT="5432"
LOCAL_DB_NAME="stagea"
LOCAL_DB_USER="postgres"
LOCAL_DB_PASS="postgres"
LOCAL_DB_SCHEMA="stagea_local"

DOCKER_DB_HOST="mononestnext_db"
DOCKER_DB_PORT="5432"
DOCKER_DB_NAME="stagea"
DOCKER_DB_USER="postgres"
DOCKER_DB_PASS="postgres"
DOCKER_DB_SCHEMA="stagea_local"

# Use PostgreSQL 16 to match local version
PG_VERSION="16"

echo "📋 Migration Plan:"
echo "  From: Local DB at host.docker.internal:$LOCAL_DB_PORT"
echo "  To:   Docker DB at $DOCKER_DB_HOST:$DOCKER_DB_PORT"
echo ""

# Function to check if local database is accessible
check_local_db() {
    echo "🔍 Checking local database connection..."
    docker run --rm --network host postgres:$PG_VERSION-alpine \
        pg_isready -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER"
    
    if [ $? -ne 0 ]; then
        echo "❌ Cannot connect to local database"
        echo "   Please ensure PostgreSQL is running locally on port 5432"
        exit 1
    fi
    echo "✅ Local database is accessible"
}

# Function to start Docker database
start_docker_db() {
    echo "🚀 Starting Docker database..."
    docker-compose up -d db
    
    echo "⏳ Waiting for Docker database to be ready..."
    until docker-compose exec -T db pg_isready -U "$DOCKER_DB_USER"; do
        echo "   Waiting for database connection..."
        sleep 2
    done
    echo "✅ Docker database is ready"
}

# Function to create backup from local database
create_local_backup() {
    echo "📦 Creating backup from local database..."
    
    # Create backup directory
    mkdir -p ./backups
    
    # Create schema-only backup
    docker run --rm --network host \
        -e PGPASSWORD="$LOCAL_DB_PASS" \
        -v "$(pwd)/backups:/backups" \
        postgres:$PG_VERSION-alpine \
        pg_dump -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
        --schema="$LOCAL_DB_SCHEMA" --schema-only --no-owner --no-privileges \
        -f "/backups/schema_backup.sql"
    
    # Create data-only backup
    docker run --rm --network host \
        -e PGPASSWORD="$LOCAL_DB_PASS" \
        -v "$(pwd)/backups:/backups" \
        postgres:$PG_VERSION-alpine \
        pg_dump -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
        --schema="$LOCAL_DB_SCHEMA" --data-only --no-owner --no-privileges \
        -f "/backups/data_backup.sql"
    
    # Create full backup
    docker run --rm --network host \
        -e PGPASSWORD="$LOCAL_DB_PASS" \
        -v "$(pwd)/backups:/backups" \
        postgres:$PG_VERSION-alpine \
        pg_dump -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
        --schema="$LOCAL_DB_SCHEMA" --no-owner --no-privileges \
        -f "/backups/full_backup.sql"
    
    echo "✅ Local database backup created in ./backups/"
}

# Function to restore to Docker database
restore_to_docker() {
    echo "🚀 Restoring data to Docker database..."
    
    # Drop and recreate schema in Docker database
    echo "🗑️  Preparing Docker database..."
    docker-compose exec -T db psql -U "$DOCKER_DB_USER" -d "$DOCKER_DB_NAME" \
        -c "DROP SCHEMA IF EXISTS $DOCKER_DB_SCHEMA CASCADE;"
    docker-compose exec -T db psql -U "$DOCKER_DB_USER" -d "$DOCKER_DB_NAME" \
        -c "CREATE SCHEMA $DOCKER_DB_SCHEMA;"
    
    # Copy backup files to Docker container
    echo "📋 Copying backup files to Docker container..."
    docker cp ./backups/schema_backup.sql mononestnext_db:/tmp/schema_backup.sql
    docker cp ./backups/data_backup.sql mononestnext_db:/tmp/data_backup.sql
    
    # Restore schema
    echo "📋 Restoring schema..."
    docker-compose exec -T db psql -U "$DOCKER_DB_USER" -d "$DOCKER_DB_NAME" \
        -f "/tmp/schema_backup.sql"
    
    # Restore data
    echo "📊 Restoring data..."
    docker-compose exec -T db psql -U "$DOCKER_DB_USER" -d "$DOCKER_DB_NAME" \
        -f "/tmp/data_backup.sql"
    
    echo "✅ Data migration completed successfully!"
}

# Function to verify migration
verify_migration() {
    echo "🔍 Verifying migration..."
    
    # Count tables in local database
    LOCAL_TABLES=$(docker run --rm --network host \
        -e PGPASSWORD="$LOCAL_DB_PASS" \
        postgres:$PG_VERSION-alpine \
        psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
        -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$LOCAL_DB_SCHEMA';" | tr -d ' ')
    
    # Count tables in Docker database
    DOCKER_TABLES=$(docker-compose exec -T db psql -U "$DOCKER_DB_USER" -d "$DOCKER_DB_NAME" \
        -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DOCKER_DB_SCHEMA';" | tr -d ' ')
    
    echo "  Local database tables: $LOCAL_TABLES"
    echo "  Docker database tables: $DOCKER_TABLES"
    
    if [ "$LOCAL_TABLES" = "$DOCKER_TABLES" ]; then
        echo "✅ Migration verification successful!"
    else
        echo "❌ Migration verification failed - table counts don't match"
        exit 1
    fi
}

# Main execution
main() {
    echo "Starting Docker-based data migration process..."
    echo ""
    
    # Check local database
    check_local_db
    
    # Start Docker database
    start_docker_db
    
    # Create backup
    create_local_backup
    
    # Restore to Docker
    restore_to_docker
    
    # Verify migration
    verify_migration
    
    echo ""
    echo "🎉 Data migration completed successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Start all services: docker-compose up --build"
    echo "  2. Verify data: Check your application at http://localhost:3000"
    echo "  3. Clean up backups: rm -rf ./backups (optional)"
}

# Run main function
main "$@"
