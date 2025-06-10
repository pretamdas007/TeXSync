#!/bin/bash

# TeXSync Docker Setup and Deployment Script

echo "🚀 Starting TeXSync containerized deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down -v 2>/dev/null || true

# Remove existing images to ensure fresh build
echo "🗑️ Removing existing images..."
docker rmi texsync-frontend texsync-latex-backend 2>/dev/null || true

# Build and start services
echo "🏗️ Building and starting services..."
docker-compose up --build -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker-compose exec -T database pg_isready -U texsync -d texsync; do
    echo "Database is unavailable - sleeping"
    sleep 2
done

echo "✅ Database is ready!"

# Run database migrations
echo "🔄 Running database migrations..."
docker-compose exec frontend npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
docker-compose exec frontend npx prisma generate

echo "🎉 TeXSync is now running!"
echo ""
echo "📊 Service Status:"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo "Database: localhost:5432"
echo ""
echo "🔍 To check logs:"
echo "docker-compose logs -f"
echo ""
echo "🛑 To stop:"
echo "docker-compose down"
