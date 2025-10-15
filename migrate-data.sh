#!/bin/bash

echo "🔄 Data Migration Script for MonoNestNext"
echo "=========================================="

# Configuration
LOCAL_DB_HOST="127.0.0.1"
LOCAL_DB_PORT="5432"
LOCAL_DB_NAME="stagea"
LOCAL_DB_USER="postgres"
LOCAL_DB_PASS="postgres"
LOCAL_DB_SCHEMA="stagea_local"

DOCKER_DB_HOST="localhost"
DOCKER_DB_PORT="5432"
DOCKER_DB_NAME="stagea"
DOCKER_DB_USER="postgres"
DOCKER_DB_PASS="postgres"
DOCKER_DB_SCHEMA="stagea_local"

echo "📋 Migration Plan:"
echo "  From: Local DB at $LOCAL_DB_HOST:$LOCAL_DB_PORT"
echo "  To:   Docker DB at $DOCKER_DB_HOST:$DOCKER_DB_PORT"
echo ""

# Function to check if Docker containers are running
check_docker_containers() {
    echo "🔍 Checking Docker containers..."
    if ! docker-compose ps | grep -q "mononestnext_db.*Up"; then
        echo "❌ Docker database container is not running"
        echo "   Please run: docker-compose up -d db"
        exit 1
    fi
    echo "✅ Docker database container is running"
}

# Function to create backup from local database
create_local_backup() {
    echo "📦 Creating backup from local database..."
    
    # Set PGPASSWORD for non-interactive connection
    export PGPASSWORD="$LOCAL_DB_PASS"
    
    # Create backup directory
    mkdir -p ./backups
    
    # Create schema-only backup
    pg_dump -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
        --schema="$LOCAL_DB_SCHEMA" --schema-only --no-owner --no-privileges \
        -f "./backups/schema_backup.sql"
    
    # Create data-only backup
    pg_dump -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
        --schema="$LOCAL_DB_SCHEMA" --data-only --no-owner --no-privileges \
        -f "./backups/data_backup.sql"
    
    # Create full backup
    pg_dump -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
        --schema="$LOCAL_DB_SCHEMA" --no-owner --no-privileges \
        -f "./backups/full_backup.sql"
    
    echo "✅ Local database backup created in ./backups/"
}

# Function to restore to Docker database
restore_to_docker() {
    echo "🚀 Restoring data to Docker database..."
    
    # Set PGPASSWORD for Docker database
    export PGPASSWORD="$DOCKER_DB_PASS"
    
    # Wait for Docker database to be ready
    echo "⏳ Waiting for Docker database to be ready..."
    until pg_isready -h "$DOCKER_DB_HOST" -p "$DOCKER_DB_PORT" -U "$DOCKER_DB_USER"; do
        echo "   Waiting for database connection..."
        sleep 2
    done
    echo "✅ Docker database is ready"
    
    # Drop and recreate schema in Docker database
    echo "🗑️  Preparing Docker database..."
    psql -h "$DOCKER_DB_HOST" -p "$DOCKER_DB_PORT" -U "$DOCKER_DB_USER" -d "$DOCKER_DB_NAME" \
        -c "DROP SCHEMA IF EXISTS $DOCKER_DB_SCHEMA CASCADE;"
    psql -h "$DOCKER_DB_HOST" -p "$DOCKER_DB_PORT" -U "$DOCKER_DB_USER" -d "$DOCKER_DB_NAME" \
        -c "CREATE SCHEMA $DOCKER_DB_SCHEMA;"
    
    # Restore schema
    echo "📋 Restoring schema..."
    psql -h "$DOCKER_DB_HOST" -p "$DOCKER_DB_PORT" -U "$DOCKER_DB_USER" -d "$DOCKER_DB_NAME" \
        -f "./backups/schema_backup.sql"
    
    # Restore data
    echo "📊 Restoring data..."
    psql -h "$DOCKER_DB_HOST" -p "$DOCKER_DB_PORT" -U "$DOCKER_DB_USER" -d "$DOCKER_DB_NAME" \
        -f "./backups/data_backup.sql"
    
    echo "✅ Data migration completed successfully!"
}

# Function to verify migration
verify_migration() {
    echo "🔍 Verifying migration..."
    
    # Count tables in both databases
    export PGPASSWORD="$LOCAL_DB_PASS"
    LOCAL_TABLES=$(psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
        -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$LOCAL_DB_SCHEMA';")
    
    export PGPASSWORD="$DOCKER_DB_PASS"
    DOCKER_TABLES=$(psql -h "$DOCKER_DB_HOST" -p "$DOCKER_DB_PORT" -U "$DOCKER_DB_USER" -d "$DOCKER_DB_NAME" \
        -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DOCKER_DB_SCHEMA';")
    
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
    echo "Starting data migration process..."
    echo ""
    
    # Check if local database is accessible
    echo "🔍 Checking local database connection..."
    export PGPASSWORD="$LOCAL_DB_PASS"
    if ! pg_isready -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER"; then
        echo "❌ Cannot connect to local database"
        echo "   Please ensure PostgreSQL is running locally"
        exit 1
    fi
    echo "✅ Local database is accessible"
    
    # Check Docker containers
    check_docker_containers
    
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

