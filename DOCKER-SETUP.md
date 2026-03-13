# 🐳 Docker Compose Setup Guide

## 📋 Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ (for local development)

## 🚀 Quick Start

### Step 1: Stop Existing Containers
```bash
# Stop any running containers
docker-compose down

# Remove old containers and networks
docker system prune -f
```

### Step 2: Start Full Stack
```bash
# Build and start all services
docker-compose up --build

# View logs (optional)
docker-compose logs -f
```

### Step 3: Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## 📁 Project Structure

```
Data-visualization/
├── docker-compose.yml          # Main orchestration file
├── backend/
│   ├── Dockerfile            # Backend container config
│   ├── prisma/
│   │   └── dev.db          # SQLite database
│   └── src/
│       └── services/
│           └── salesService.ts # Fixed for foreign key issues
└── frontend/
    ├── Dockerfile            # Frontend container config
    ├── src/
    │   ├── services/
    │   │   └── api.js     # API service configuration
    │   └── script.js         # Main application logic
    └── index.html           # Main HTML file
```

## 🔧 Service Configuration

### Backend Service
- **Container**: `sales_analytics_backend`
- **Port**: `3001:3001`
- **Database**: SQLite (file-based)
- **Volume**: `./backend/prisma:/app/prisma`
- **Environment**: Development mode
- **Health Check**: Every 30 seconds

### Frontend Service
- **Container**: `sales_analytics_frontend`
- **Port**: `3000:3000`
- **API URL**: `http://backend:3001/api`
- **Depends On**: Backend service
- **Volumes**: Source code and node_modules

## 🛠️ Development Workflow

### 1. Make Changes
```bash
# Backend changes
cd backend
# Edit files...

# Frontend changes  
cd frontend
# Edit files...
```

### 2. Rebuild Services
```bash
# Rebuild specific service
docker-compose up --build backend

# Rebuild all services
docker-compose up --build
```

### 3. View Logs
```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# All logs
docker-compose logs -f
```

## 🔍 Troubleshooting

### Port Conflicts
```bash
# Check what's using ports
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill processes
taskkill /f /im node.exe
```

### Database Issues
```bash
# Access container shell
docker exec -it sales_analytics_backend sh

# Check database
ls -la /app/prisma/

# Reset database
docker exec sales_analytics_backend npx prisma db push --force-reset
```

### Network Issues
```bash
# Check network
docker network ls

# Inspect containers
docker inspect sales_analytics_backend
docker inspect sales_analytics_frontend
```

## 🎯 Common Commands

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# Rebuild and start
docker-compose up --build --force-recreate

# View running containers
docker-compose ps

# Remove volumes (WARNING: deletes data)
docker-compose down -v
```

## 📊 Expected Results

✅ **Backend Running**: API accessible at http://localhost:3001/api  
✅ **Frontend Running**: App at http://localhost:3000  
✅ **Database Working**: SQLite with Prisma migrations  
✅ **Upload Feature**: CSV files import successfully  
✅ **Real-time Updates**: Hot reload on file changes  
✅ **Health Monitoring**: Automatic health checks  

## 🔄 Production Considerations

For production deployment:
1. Change `NODE_ENV=production`
2. Use PostgreSQL instead of SQLite
3. Add Redis for session management
4. Implement proper secrets management
5. Add SSL/TLS termination
6. Set up proper logging
7. Configure backup strategies

## 🚀 Ready to Go!

Your Sales Analytics Dashboard is now fully containerized and ready for development!
