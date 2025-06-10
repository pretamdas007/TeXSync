# TeXSync Docker Setup and Deployment Script for Windows

Write-Host "🚀 Starting TeXSync containerized deployment..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Clean up any existing containers
Write-Host "🧹 Cleaning up existing containers..." -ForegroundColor Yellow
docker-compose down -v 2>$null

# Remove existing images to ensure fresh build
Write-Host "🗑️ Removing existing images..." -ForegroundColor Yellow
docker rmi texsync-frontend texsync-latex-backend 2>$null

# Build and start services
Write-Host "🏗️ Building and starting services..." -ForegroundColor Cyan
docker-compose up --build -d

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
do {
    Start-Sleep -Seconds 2
    $dbReady = docker-compose exec -T database pg_isready -U texsync -d texsync 2>$null
} while ($LASTEXITCODE -ne 0)

Write-Host "✅ Database is ready!" -ForegroundColor Green

# Run database migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Cyan
docker-compose exec frontend npx prisma migrate deploy

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Cyan
docker-compose exec frontend npx prisma generate

Write-Host "🎉 TeXSync is now running!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Database: localhost:5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 To check logs:" -ForegroundColor White
Write-Host "docker-compose logs -f" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 To stop:" -ForegroundColor White
Write-Host "docker-compose down" -ForegroundColor Gray
