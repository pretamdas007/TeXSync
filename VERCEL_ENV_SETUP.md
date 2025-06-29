# Instructions for setting up environment variables in Vercel Dashboard

## Go to: https://vercel.com/dashboard
## Select your TeXSync project
## Go to Settings > Environment Variables
## Add these variables:

# IMPORTANT: Backend URL for LaTeX compilation
NEXT_PUBLIC_BACKEND_URL=https://texsync.onrender.com

# Server-side API key (DO NOT use NEXT_PUBLIC_ prefix)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Database (for Prisma)
DATABASE_URL=file:./dev.db

# After adding these variables, redeploy your app:
# vercel --prod --force
