# TeXSync - Vercel + Render Deployment Guide

## 🌐 Deployment Architecture

- **Frontend**: Vercel (Next.js)
- **Backend**: Render (Node.js + LaTeX)
- **Database**: Render PostgreSQL

## 🚀 Frontend Deployment (Vercel)

### 1. Prepare for Vercel

Your frontend is already configured for Vercel with:
- `next.config.js` with `output: 'standalone'`
- Environment variable support
- Static file optimization

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect your GitHub repo to Vercel dashboard
```

### 3. Environment Variables on Vercel

In your Vercel dashboard, add these environment variables:

```
NEXTAUTH_SECRET=your-production-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
JWT_SECRET=your-production-jwt-secret
NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-key-here
```

## 🔧 Backend Deployment (Render)

### 1. Create render.yaml

Create `render.yaml` in your project root:

```yaml
services:
  - type: web
    name: texsync-backend
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
    disk:
      name: texsync-data
      mountPath: /opt/render/project/src/server/temp
      sizeGB: 2
```

### 2. Backend Package.json Scripts

Your `server/package.json` should have:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### 3. Deploy Backend

1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && npm start`
5. Add environment variables if needed

## 📊 Database Options

### Option 1: Render PostgreSQL

1. Create PostgreSQL database on Render
2. Update your backend to use PostgreSQL instead of file-based DB
3. Set `DATABASE_URL` environment variable

### Option 2: Keep SQLite (Simple)

- Your current setup uses SQLite (`file:./dev.db`)
- Works for small applications
- Data persists on Render's disk storage

## 🔄 CORS Configuration

Update your backend's CORS settings for production:

```javascript
// In server/src/server.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app'
  ],
  credentials: true
}));
```

## 🧪 Testing Deployment

1. **Local test with production URLs**:
   ```bash
   # Update .env
   NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
   
   # Test locally
   npm run dev
   ```

2. **Check compilation**:
   - Open your deployed app
   - Go to `/editor`
   - Try compiling a LaTeX document
   - Verify PDF generation works

## 📋 Deployment Checklist

### Frontend (Vercel)
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] Build succeeds
- [ ] Routes work correctly

### Backend (Render)
- [ ] LaTeX packages installed
- [ ] API endpoints responding
- [ ] File upload/compilation working
- [ ] CORS configured for your domain

### Integration
- [ ] Frontend can connect to backend
- [ ] LaTeX compilation works end-to-end
- [ ] PDF download/viewing works
- [ ] Authentication flow works (if implemented)

## 🛠️ Troubleshooting

### Frontend Issues
- Check Vercel function logs
- Verify environment variables
- Test API calls in browser dev tools

### Backend Issues
- Check Render service logs
- Verify LaTeX installation
- Test API endpoints directly

### CORS Errors
- Update backend CORS configuration
- Verify frontend URL in CORS origins
- Check for proper preflight handling

## 🔗 Useful Commands

```bash
# Check deployment status
vercel --prod

# View logs
vercel logs your-app-name

# Redeploy
vercel --prod --force
```

## 📈 Performance Tips

1. **Frontend**: Use Vercel's Edge Functions for API routes
2. **Backend**: Enable gzip compression on Render
3. **Assets**: Optimize images and fonts
4. **Caching**: Configure proper cache headers
