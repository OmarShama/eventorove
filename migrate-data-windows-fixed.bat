@echo off
echo 🔄 Windows Data Migration for Eventorove
echo ==========================================

REM Configuration
set LOCAL_DB_HOST=127.0.0.1
set LOCAL_DB_PORT=5432
set LOCAL_DB_NAME=stagea
set LOCAL_DB_USER=postgres
set LOCAL_DB_PASS=postgres
set LOCAL_DB_SCHEMA=stagea_local

echo 📋 Migration Plan:
echo   1. Start fresh Docker database (PostgreSQL 16)
echo   2. Create backup from local database
echo   3. Restore data to Docker database
echo.

REM Step 1: Start Docker database
echo 🚀 Starting Docker database...
docker-compose up -d db

echo ⏳ Waiting for Docker database to be ready...
timeout /t 10 /nobreak >nul

REM Check if database is ready
:wait_loop
docker-compose exec -T db pg_isready -U postgres >nul 2>&1
if %errorlevel% neq 0 (
    echo    Waiting for database connection...
    timeout /t 2 /nobreak >nul
    goto wait_loop
)
echo ✅ Docker database is ready

REM Step 2: Create backup from local database
echo 📦 Creating backup from local database...

REM Create backup directory
if not exist "backups" mkdir backups

REM Set PGPASSWORD for local database
set PGPASSWORD=%LOCAL_DB_PASS%

REM Create backup using Docker
docker run --rm --network host ^
    -e PGPASSWORD=%LOCAL_DB_PASS% ^
    -v "%cd%\backups:/backups" ^
    postgres:16-alpine ^
    pg_dump -h %LOCAL_DB_HOST% -p %LOCAL_DB_PORT% -U %LOCAL_DB_USER% -d %LOCAL_DB_NAME% ^
    --schema=%LOCAL_DB_SCHEMA% --no-owner --no-privileges ^
    -f "/backups/migration_backup.sql"

if %errorlevel% neq 0 (
    echo ❌ Failed to create backup
    pause
    exit /b 1
)
echo ✅ Backup created successfully

REM Step 3: Restore to Docker database
echo 🚀 Restoring data to Docker database...

REM Copy backup to Docker container
docker cp "backups\migration_backup.sql" eventorove_db:/tmp/migration_backup.sql

REM Restore the backup
docker-compose exec -T db psql -U postgres -d stagea -f /tmp/migration_backup.sql

if %errorlevel% neq 0 (
    echo ❌ Failed to restore data
    pause
    exit /b 1
)
echo ✅ Data restored successfully

REM Step 4: Verify migration
echo 🔍 Verifying migration...

REM Count tables in local database
for /f %%i in ('docker run --rm --network host -e PGPASSWORD=%LOCAL_DB_PASS% postgres:16-alpine psql -h %LOCAL_DB_HOST% -p %LOCAL_DB_PORT% -U %LOCAL_DB_USER% -d %LOCAL_DB_NAME% -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '%LOCAL_DB_SCHEMA%';"') do set LOCAL_TABLES=%%i

REM Count tables in Docker database
for /f %%i in ('docker-compose exec -T db psql -U postgres -d stagea -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '%LOCAL_DB_SCHEMA%';"') do set DOCKER_TABLES=%%i

echo   Local database tables: %LOCAL_TABLES%
echo   Docker database tables: %DOCKER_TABLES%

if "%LOCAL_TABLES%"=="%DOCKER_TABLES%" if not "%LOCAL_TABLES%"=="0" (
    echo ✅ Migration verification successful!
    echo.
    echo 🎉 Data migration completed successfully!
    echo.
    echo Next steps:
    echo   1. Start all services: docker-compose up --build
    echo   2. Verify data: Check your application at http://localhost:3000
    echo   3. Clean up: del /s /q backups (optional)
) else (
    echo ❌ Migration verification failed
    echo    Local tables: %LOCAL_TABLES%
    echo    Docker tables: %DOCKER_TABLES%
    pause
    exit /b 1
)

echo.
pause

