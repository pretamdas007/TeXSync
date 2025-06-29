# TeXSync Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
- Node.js 18+ installed
- Git repository pushed to GitHub/GitLab/Bitbucket
- Vercel account

### Method 1: Using Vercel Dashboard (Recommended)

1. **Visit [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your TeXSync repository**
4. **Configure environment variables:**
   ```
   NEXT_PUBLIC_BACKEND_URL=https://texsync.onrender.com
   GEMINI_API_KEY=your_gemini_api_key
   ```
5. **Click "Deploy"**

### Method 2: Using Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy (from project root):**
   ```bash
   vercel --prod
   ```

4. **Or use the provided script:**
   ```bash
   # On Windows (PowerShell)
   .\deploy-vercel.ps1
   
   # On Mac/Linux
   ./deploy-vercel.sh
   ```

### Environment Variables Setup

In your Vercel dashboard, add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://your-backend.onrender.com` | Your Render backend URL |
| `GEMINI_API_KEY` | `your_api_key` | Google Gemini AI API key |
| `DATABASE_URL` | `file:./dev.db` | Database connection |

### Post-Deployment Steps

1. **Update Backend CORS:**
   - Add your Vercel URL to the CORS origins in your backend
   - Example: `https://texsync.vercel.app`

2. **Test Features:**
   - ✅ LaTeX editor loads
   - ✅ Compile button works
   - ✅ PDF preview displays
   - ✅ AI features work (if configured)

### Troubleshooting

#### Build Errors
```bash
# Clear cache and rebuild
vercel --prod --force
```

#### Environment Variables Not Working
- Check variable names are exactly correct
- Ensure `NEXT_PUBLIC_` prefix for client-side variables
- Redeploy after adding variables

#### CORS Errors
- Verify backend CORS configuration includes your Vercel URL
- Check browser console for specific error messages

### Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

### Performance Optimization

The deployment includes:
- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ CDN distribution
- ✅ Serverless functions
- ✅ Edge caching

### Support

If you encounter issues:
1. Check Vercel build logs
2. Verify all environment variables
3. Test backend connectivity
4. Check browser console for errors

---

**Your TeXSync app will be live at:** `https://your-project.vercel.app`
