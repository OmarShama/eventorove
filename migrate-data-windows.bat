@echo off
echo 🔄 Data Migration Script for MonoNestNext (Windows)
echo ==================================================

REM Configuration
set LOCAL_DB_HOST=127.0.0.1
set LOCAL_DB_PORT=5432
set LOCAL_DB_NAME=stagea
set LOCAL_DB_USER=postgres
set LOCAL_DB_PASS=postgres
set LOCAL_DB_SCHEMA=stagea_local

set DOCKER_DB_HOST=localhost
set DOCKER_DB_PORT=5432
set DOCKER_DB_NAME=stagea
set DOCKER_DB_USER=postgres
set DOCKER_DB_PASS=postgres
set DOCKER_DB_SCHEMA=stagea_local

echo 📋 Migration Plan:
echo   From: Local DB at %LOCAL_DB_HOST%:%LOCAL_DB_PORT%
echo   To:   Docker DB at %DOCKER_DB_HOST%:%DOCKER_DB_PORT%
echo.

REM Check if Docker containers are running
echo 🔍 Checking Docker containers...
docker-compose ps | findstr "mononestnext_db.*Up" >nul
if %errorlevel% neq 0 (
    echo ❌ Docker database container is not running
    echo    Please run: docker-compose up -d db
    pause
    exit /b 1
)
echo ✅ Docker database container is running

REM Create backup directory
if not exist "backups" mkdir backups

REM Set PGPASSWORD for local database
set PGPASSWORD=%LOCAL_DB_PASS%

echo 📦 Creating backup from local database...

REM Create schema-only backup
pg_dump -h %LOCAL_DB_HOST% -p %LOCAL_DB_PORT% -U %LOCAL_DB_USER% -d %LOCAL_DB_NAME% --schema=%LOCAL_DB_SCHEMA% --schema-only --no-owner --no-privileges -f "backups\schema_backup.sql"
if %errorlevel% neq 0 (
    echo ❌ Failed to create schema backup
    pause
    exit /b 1
)

REM Create data-only backup
pg_dump -h %LOCAL_DB_HOST% -p %LOCAL_DB_PORT% -U %LOCAL_DB_USER% -d %LOCAL_DB_NAME% --schema=%LOCAL_DB_SCHEMA% --data-only --no-owner --no-privileges -f "backups\data_backup.sql"
if %errorlevel% neq 0 (
    echo ❌ Failed to create data backup
    pause
    exit /b 1
)

REM Create full backup
pg_dump -h %LOCAL_DB_HOST% -p %LOCAL_DB_PORT% -U %LOCAL_DB_USER% -d %LOCAL_DB_NAME% --schema=%LOCAL_DB_SCHEMA% --no-owner --no-privileges -f "backups\full_backup.sql"
if %errorlevel% neq 0 (
    echo ❌ Failed to create full backup
    pause
    exit /b 1
)

echo ✅ Local database backup created in .\backups\

REM Set PGPASSWORD for Docker database
set PGPASSWORD=%DOCKER_DB_PASS%

echo ⏳ Waiting for Docker database to be ready...
:wait_loop
pg_isready -h %DOCKER_DB_HOST% -p %DOCKER_DB_PORT% -U %DOCKER_DB_USER% >nul 2>&1
if %errorlevel% neq 0 (
    echo    Waiting for database connection...
    timeout /t 2 /nobreak >nul
    goto wait_loop
)
echo ✅ Docker database is ready

echo 🗑️  Preparing Docker database...
psql -h %DOCKER_DB_HOST% -p %DOCKER_DB_PORT% -U %DOCKER_DB_USER% -d %DOCKER_DB_NAME% -c "DROP SCHEMA IF EXISTS %DOCKER_DB_SCHEMA% CASCADE;"
psql -h %DOCKER_DB_HOST% -p %DOCKER_DB_PORT% -U %DOCKER_DB_USER% -d %DOCKER_DB_NAME% -c "CREATE SCHEMA %DOCKER_DB_SCHEMA%;"

echo 📋 Restoring schema...
psql -h %DOCKER_DB_HOST% -p %DOCKER_DB_PORT% -U %DOCKER_DB_USER% -d %DOCKER_DB_NAME% -f "backups\schema_backup.sql"
if %errorlevel% neq 0 (
    echo ❌ Failed to restore schema
    pause
    exit /b 1
)

echo 📊 Restoring data...
psql -h %DOCKER_DB_HOST% -p %DOCKER_DB_PORT% -U %DOCKER_DB_USER% -d %DOCKER_DB_NAME% -f "backups\data_backup.sql"
if %errorlevel% neq 0 (
    echo ❌ Failed to restore data
    pause
    exit /b 1
)

echo ✅ Data migration completed successfully!
echo.
echo Next steps:
echo   1. Start all services: docker-compose up --build
echo   2. Verify data: Check your application at http://localhost:3000
echo   3. Clean up backups: del /s /q backups (optional)
echo.
pause

