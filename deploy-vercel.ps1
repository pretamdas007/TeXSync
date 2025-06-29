# TeXSync Vercel Deployment Script (PowerShell)

Write-Host "🚀 Starting TeXSync deployment to Vercel..." -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm i -g vercel
}

# Login to Vercel (if not already logged in)
Write-Host "🔐 Checking Vercel authentication..." -ForegroundColor Blue
vercel whoami

# Deploy to Vercel
Write-Host "📦 Deploying to Vercel..." -ForegroundColor Blue
vercel --prod

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Post-deployment checklist:" -ForegroundColor Yellow
Write-Host "1. Set environment variables in Vercel dashboard:"
Write-Host "   - NEXT_PUBLIC_BACKEND_URL (your Render backend URL)"
Write-Host "   - GEMINI_API_KEY (for AI features)"
Write-Host "2. Update CORS settings in your backend with the new Vercel URL"
Write-Host "3. Test the compile functionality"
Write-Host ""
Write-Host "🌐 Your app should be live at: https://texsync.vercel.app" -ForegroundColor Cyan
