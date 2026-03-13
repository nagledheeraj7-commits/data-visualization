# 🚀 Production Setup Guide

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ 
- **npm** 8+ or **yarn** 1.22+
- **Docker** & **Docker Compose** (recommended)
- **PostgreSQL** 14+ (if not using Docker)
- **Redis** 6+ (if not using Docker)

### Development Tools (Recommended)
- **VS Code** with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Docker
  - GitLens
  - Thunder Client (for API testing)

## 🏗️ Project Setup

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd Data-visualization

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 2: Manual Setup

#### Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up database
npm run db:generate
npm run db:migrate
npm run db:seed  # Optional: seed with sample data

# Start development server
npm run dev
```

#### Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with API URL

# Start development server
npm run dev
```

## 🔧 Configuration

### Database Setup

#### PostgreSQL (Manual)
```sql
-- Create database
CREATE DATABASE sales_analytics_dev;

-- Create user (optional)
CREATE USER sales_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sales_analytics_dev TO sales_user;
```

#### Redis (Manual)
```bash
# Install Redis
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis
```

### Environment Variables

Edit the `.env` file with your specific configuration:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/sales_analytics_dev

# JWT Secrets
JWT_SECRET=your-super-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# CORS
CORS_ORIGIN=http://localhost:3000

# Frontend
VITE_API_URL=http://localhost:3001/api
```

## 🧪 Testing Setup

### Backend Tests
```bash
cd backend

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Frontend Tests
```bash
cd frontend

# Run unit tests
npm test

# Run tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e
```

## 📊 Sample Data

### Seed Database
```bash
cd backend

# Seed with sample data
npm run db:seed
```

### Manual Data Import
```bash
# Use API endpoint
curl -X POST \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample-data.csv" \
  http://localhost:3001/api/sales/import
```

## 🔒 Security Setup

### SSL/HTTPS Setup
```bash
# Generate SSL certificates (development)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/private.key \
  -out ssl/certificate.crt

# Update .env for production
ENABLE_HTTPS=true
SSL_CERT_PATH=./ssl/certificate.crt
SSL_KEY_PATH=./ssl/private.key
```

### Environment-Specific Security
```bash
# Development
NODE_ENV=development
ENABLE_PLAYGROUND=true
DEBUG_SQL=true

# Production
NODE_ENV=production
ENABLE_PLAYGROUND=false
DEBUG_SQL=false
BCRYPT_ROUNDS=12
```

## 🚀 Deployment

### Development Deployment
```bash
# Using Docker Compose
docker-compose up -d

# Check status
docker-compose ps

# Stop services
docker-compose down
```

### Production Deployment

#### Option 1: Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

#### Option 2: Manual Backend Deployment
```bash
cd backend

# Build for production
npm run build

# Start production server
NODE_ENV=production npm start
```

#### Option 3: Frontend Deployment
```bash
cd frontend

# Build for production
npm run build

# Deploy dist/ folder to your web server
# The dist/ folder contains static files
```

## 🔍 Monitoring & Debugging

### Application Logs
```bash
# Backend logs
cd backend && npm run dev

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Database Logs
```bash
# PostgreSQL logs
docker-compose logs -f postgres

# Redis logs
docker-compose logs -f redis
```

### Performance Monitoring
```bash
# Check resource usage
docker stats

# Monitor API responses
curl -w "@curl-format.txt" http://localhost:3001/api/sales
```

## 🛠️ Development Workflow

### Daily Development
```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/new-feature

# 3. Start development environment
docker-compose up -d

# 4. Make changes
# Edit files in your IDE

# 5. Test changes
npm test

# 6. Commit changes
git add .
git commit -m "feat: add new feature"

# 7. Push to remote
git push origin feature/new-feature

# 8. Create Pull Request
# Through GitHub/GitLab interface
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Format code
npm run format
```

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Check database status
docker-compose logs postgres

# Test connection
psql postgresql://postgres:postgres@localhost:5432/sales_analytics_dev

# Reset database
npm run db:reset
```

#### Frontend Build Issues
```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist
npm run build
```

### Performance Issues
```bash
# Check memory usage
docker stats --no-stream

# Profile API endpoints
npm run profile

# Analyze bundle size
npm run analyze
```

## 📚 Useful Commands

### Docker Commands
```bash
# Rebuild containers
docker-compose build --no-cache

# Remove all containers and volumes
docker-compose down -v

# Execute commands in container
docker-compose exec backend npm run db:migrate
docker-compose exec frontend npm run build
```

### Database Commands
```bash
# Access database
docker-compose exec postgres psql -U postgres -d sales_analytics_dev

# View database schema
npm run db:studio

# Reset database
npm run db:reset
```

### Development Commands
```bash
# Generate API documentation
npm run docs:generate

# Run in watch mode
npm run dev:watch

# Clean build artifacts
npm run clean
```

## 🌐 Access Points

### Application URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Documentation**: http://localhost:3001/api/docs
- **Database Studio**: http://localhost:3001 (if enabled)

### Health Checks
```bash
# Backend health
curl http://localhost:3001/api/health

# Frontend health
curl http://localhost:3000

# Database health
docker-compose exec postgres pg_isready -U postgres
```

## 📞 Support

### Getting Help
1. Check this guide first
2. Review logs for error messages
3. Search existing issues in repository
4. Check documentation in `/docs` folder
5. Contact development team with detailed error information

### Reporting Issues
When reporting issues, include:
- Operating system and version
- Node.js version
- Docker version (if applicable)
- Complete error message
- Steps to reproduce
- Expected vs actual behavior

This setup guide will help you get the production-grade Sales Analytics Dashboard running in any environment! 🚀
