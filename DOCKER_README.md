# TeXSync Docker Deployment Guide

This guide will help you deploy TeXSync with full authentication and backend services using Docker.

## 🏗️ Architecture

The containerized TeXSync consists of three main services:

1. **Frontend** - Next.js application with authentication
2. **Backend** - LaTeX compilation service 
3. **Database** - PostgreSQL for user data and sessions

## 📋 Prerequisites

- Docker Desktop installed and running
- At least 4GB of available RAM
- 10GB of free disk space

## 🚀 Quick Start

### Windows PowerShell
```powershell
.\docker-setup.ps1
```

### Linux/Mac Bash
```bash
chmod +x docker-setup.sh
./docker-setup.sh
```

### Manual Setup
```bash
# Start all services
docker-compose up --build -d

# Wait for database to be ready, then run migrations
docker-compose exec frontend npx prisma migrate deploy
docker-compose exec frontend npx prisma generate
```

## 🔧 Configuration

### Environment Variables

The application uses these environment variables in production:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `NEXTAUTH_URL` - Application base URL
- `BACKEND_URL` - LaTeX backend service URL

### Default Credentials

The PostgreSQL database uses these default credentials:
- **Username**: `texsync`
- **Password**: `texsync_password`
- **Database**: `texsync`

## 📊 Services

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Frontend | 3000 | http://localhost:3000 | Main TeXSync application |
| Backend | 5000 | http://localhost:5000 | LaTeX compilation service |
| Database | 5432 | localhost:5432 | PostgreSQL database |

## 🔍 Health Checks

All services include health checks:

- **Frontend**: `GET /api/health`
- **Backend**: `GET /health`
- **Database**: `pg_isready` command

## 📝 Common Commands

```bash
# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f frontend
docker-compose logs -f latex-backend
docker-compose logs -f database

# Stop all services
docker-compose down

# Stop and remove all data
docker-compose down -v

# Rebuild specific service
docker-compose build frontend
docker-compose up -d frontend

# Access database
docker-compose exec database psql -U texsync -d texsync

# Run Prisma commands
docker-compose exec frontend npx prisma studio
docker-compose exec frontend npx prisma migrate reset
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check database status
docker-compose exec database pg_isready -U texsync

# Reset database
docker-compose down -v
docker-compose up -d database
# Wait for database to be ready, then run migrations
docker-compose exec frontend npx prisma migrate deploy
```

### Prisma Client Issues
```bash
# Regenerate Prisma client
docker-compose exec frontend npx prisma generate

# Reset and regenerate
docker-compose exec frontend npx prisma migrate reset
docker-compose exec frontend npx prisma generate
```

### LaTeX Compilation Issues
```bash
# Check backend logs
docker-compose logs latex-backend

# Test LaTeX engines
docker-compose exec latex-backend pdflatex --version
docker-compose exec latex-backend xelatex --version
```

### Frontend Build Issues
```bash
# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

## 🔐 Security Notes

- Change default database credentials in production
- Update JWT secrets with strong random values
- Use HTTPS in production environments
- Regular security updates for base images

## 🚀 Production Deployment

For production deployment:

1. Update environment variables in `.env.docker`
2. Use proper secrets management
3. Configure reverse proxy (nginx/Traefik)
4. Set up SSL certificates
5. Configure backup strategies
6. Monitor resource usage

## 📦 Data Persistence

User data and documents are persisted in PostgreSQL. To backup:

```bash
# Backup database
docker-compose exec database pg_dump -U texsync texsync > backup.sql

# Restore database
docker-compose exec -T database psql -U texsync texsync < backup.sql
```

## 🆘 Support

If you encounter issues:

1. Check service logs: `docker-compose logs -f`
2. Verify all services are healthy: `docker-compose ps`
3. Try rebuilding: `docker-compose build --no-cache`
4. Reset everything: `docker-compose down -v && docker-compose up --build -d`
