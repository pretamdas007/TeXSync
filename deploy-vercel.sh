#!/bin/bash

# TeXSync Vercel Deployment Script

echo "🚀 Starting TeXSync deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo ""
echo "📋 Post-deployment checklist:"
echo "1. Set environment variables in Vercel dashboard:"
echo "   - NEXT_PUBLIC_BACKEND_URL (your Render backend URL)"
echo "   - GEMINI_API_KEY (for AI features)"
echo "2. Update CORS settings in your backend with the new Vercel URL"
echo "3. Test the compile functionality"
echo ""
echo "🌐 Your app should be live at: https://texsync.vercel.app"
