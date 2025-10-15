@echo off
REM MonoNestNext Production Deployment Script for Windows
REM This script deploys the application using the dev environment configuration

echo 🚀 Starting MonoNestNext Production Deployment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Check if required environment files exist
if not exist "server\env.deploy" (
    echo [ERROR] server\env.deploy file not found. Please create it first.
    exit /b 1
)

if not exist "client\env.deploy" (
    echo [ERROR] client\env.deploy file not found. Please create it first.
    exit /b 1
)

REM Check if SSL certificates exist (optional)
if not exist "nginx\ssl\cert.pem" (
    echo [WARNING] SSL certificates not found. Generating self-signed certificates for development...
    
    REM Create self-signed certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx\ssl\key.pem -out nginx\ssl\cert.pem -subj "/C=US/ST=State/L=City/O=Organization/CN=your-domain.com"
    
    echo [SUCCESS] Self-signed SSL certificates generated.
)

REM Stop existing containers
echo [INFO] Stopping existing containers...
docker-compose -f docker-compose.deploy.yml down --remove-orphans

REM Build and start services
echo [INFO] Building and starting services...
docker-compose -f docker-compose.deploy.yml up --build -d

REM Wait for services to be healthy
echo [INFO] Waiting for services to be healthy...
timeout /t 30 /nobreak >nul

REM Check service health
echo [INFO] Checking service health...

REM Check server health
curl -f http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Server is healthy
) else (
    echo [WARNING] Server health check failed, but continuing...
)

REM Check client health
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Client is healthy
) else (
    echo [WARNING] Client health check failed, but continuing...
)

REM Show running containers
echo [INFO] Deployment completed! Running containers:
docker-compose -f docker-compose.deploy.yml ps

echo [SUCCESS] 🎉 Deployment completed successfully!
echo [INFO] Your application is now running at:
echo [INFO]   - Frontend: https://your-domain.com (or http://localhost:80)
echo [INFO]   - API: https://your-domain.com/api (or http://localhost:3001)
echo [INFO]   - Health Check: https://your-domain.com/health

echo [WARNING] Remember to:
echo [WARNING]   1. Update your domain name in nginx\nginx.conf
echo [WARNING]   2. Replace SSL certificates with real ones for production
echo [WARNING]   3. Update environment variables in server\env.deploy and client\env.deploy
echo [WARNING]   4. Configure your Supabase database connection

pause
