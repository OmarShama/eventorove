# Eventorove Production Deployment Guide

This guide explains how to deploy your Eventorove application to production using the dev environment configuration.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Domain name configured (optional for local testing)
- Supabase database setup
- SSL certificates (optional for local testing)

### 1. Environment Setup

#### Server Environment (`server/env.deploy`)
```bash
# Copy and modify the deployment environment file
cp server/env.dev server/env.deploy

# Edit the file with your production values
nano server/env.deploy
```

**Required Configuration:**
- `DATABASE_URL`: Your Supabase PostgreSQL connection string
- `JWT_SECRET`: Strong secret for JWT tokens
- `CORS_ORIGIN`: Your production domain(s)
- `NEXT_PUBLIC_API_URL`: Your production API URL

#### Client Environment (`client/env.deploy`)
```bash
# Copy and modify the deployment environment file
cp client/env.dev client/env.deploy

# Edit the file with your production values
nano client/env.deploy
```

**Required Configuration:**
- `NEXT_PUBLIC_API_URL`: Your production API URL
- `NEXT_PUBLIC_ENV`: Set to "production"

### 2. SSL Certificates

#### Option A: Self-Signed (Development)
The deployment script will automatically generate self-signed certificates if none exist.

#### Option B: Real SSL Certificates (Production)
1. Obtain SSL certificates from a trusted CA (Let's Encrypt, etc.)
2. Place them in `nginx/ssl/`:
   - `cert.pem` - Certificate file
   - `key.pem` - Private key file

### 3. Domain Configuration

Update `nginx/nginx.conf` with your domain:
```nginx
server_name your-domain.com www.your-domain.com;
```

### 4. Deploy

#### Linux/macOS
```bash
# Make scripts executable
chmod +x scripts/deploy.sh scripts/stop-deploy.sh

# Deploy
./scripts/deploy.sh
```

#### Windows
```cmd
# Deploy
scripts\deploy-windows.bat
```

#### Manual Deployment
```bash
# Stop existing containers
docker-compose -f docker-compose.deploy.yml down

# Build and start
docker-compose -f docker-compose.deploy.yml up --build -d
```

## 📋 Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │────│  Next.js Client │────│  NestJS Server  │
│   (Port 80/443) │    │   (Port 3000)   │    │   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Supabase DB   │
                    │   (External)    │
                    └─────────────────┘
```

## 🔧 Configuration Details

### Nginx Configuration

The nginx configuration includes:
- **SSL/TLS termination** with modern security settings
- **Rate limiting** for API endpoints
- **Gzip compression** for better performance
- **Security headers** (HSTS, CSP, etc.)
- **Static file caching** for Next.js assets
- **Health check endpoints**

### Docker Services

#### Server Service
- **Image**: Custom NestJS build
- **Port**: 3001 (internal)
- **Health Check**: `/health` endpoint
- **Volumes**: Upload directory mounted

#### Client Service
- **Image**: Custom Next.js build
- **Port**: 3000 (internal)
- **Health Check**: Built-in Next.js health check
- **Dependencies**: Waits for server to be healthy

#### Nginx Service
- **Image**: nginx:alpine
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Configuration**: Custom nginx.conf
- **SSL**: Certificate mounting

## 🛠️ Management Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.deploy.yml logs -f

# Specific service
docker-compose -f docker-compose.deploy.yml logs -f server
docker-compose -f docker-compose.deploy.yml logs -f client
docker-compose -f docker-compose.deploy.yml logs -f nginx
```

### Check Status
```bash
# Container status
docker-compose -f docker-compose.deploy.yml ps

# Health checks
curl http://localhost/health
curl http://localhost:3001/health
```

### Stop Deployment
```bash
# Using script
./scripts/stop-deploy.sh

# Manual
docker-compose -f docker-compose.deploy.yml down
```

### Update Deployment
```bash
# Pull latest changes and redeploy
git pull
./scripts/deploy.sh
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Kill the process or change ports in docker-compose.deploy.yml
```

#### 2. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Regenerate self-signed certificate
rm nginx/ssl/cert.pem nginx/ssl/key.pem
./scripts/deploy.sh
```

#### 3. Database Connection Issues
- Verify `DATABASE_URL` in `server/env.deploy`
- Check Supabase connection settings
- Ensure database is accessible from your server

#### 4. Service Health Check Failures
```bash
# Check individual service logs
docker-compose -f docker-compose.deploy.yml logs server
docker-compose -f docker-compose.deploy.yml logs client

# Test endpoints directly
curl http://localhost:3001/health
curl http://localhost:3000
```

### Performance Optimization

#### 1. Enable Gzip Compression
Already configured in nginx.conf

#### 2. Static File Caching
Already configured for Next.js static assets

#### 3. Database Connection Pooling
Configure in your NestJS application

#### 4. CDN Integration
Update nginx.conf to serve static assets from CDN

## 🔒 Security Considerations

### Production Checklist

- [ ] Replace self-signed certificates with real SSL certificates
- [ ] Update all placeholder values in environment files
- [ ] Configure proper CORS origins
- [ ] Set strong JWT secrets
- [ ] Enable database SSL connections
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Enable automatic security updates
- [ ] Configure backup strategies

### Environment Variables Security

Never commit real production secrets to version control. Use:
- Environment variable injection
- Secret management services
- Docker secrets
- External configuration management

## 📊 Monitoring

### Health Endpoints
- **Application Health**: `https://your-domain.com/health`
- **API Health**: `https://your-domain.com/api/health`

### Log Monitoring
```bash
# Real-time logs
docker-compose -f docker-compose.deploy.yml logs -f --tail=100

# Log rotation (configure in nginx.conf)
```

## 🚀 Scaling

### Horizontal Scaling
1. Use a load balancer (HAProxy, AWS ALB, etc.)
2. Deploy multiple instances behind the load balancer
3. Use shared storage for uploads
4. Configure session affinity if needed

### Vertical Scaling
1. Increase container resources in docker-compose.deploy.yml
2. Optimize database queries
3. Enable caching layers
4. Use CDN for static assets

## 📝 Maintenance

### Regular Tasks
- [ ] Monitor application logs
- [ ] Check SSL certificate expiration
- [ ] Update dependencies
- [ ] Backup database
- [ ] Review security settings
- [ ] Performance monitoring

### Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and redeploy
./scripts/deploy.sh
```

---

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review container logs
3. Verify environment configuration
4. Check network connectivity
5. Consult the main project documentation

For additional help, refer to the main README.md or create an issue in the project repository.
