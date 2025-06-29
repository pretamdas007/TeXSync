const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Middleware - Configure CORS for Vercel frontend
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://texsync-3gh0kf37d-pretamdas007s-projects.vercel.app', // Your previous Vercel URL
    'https://texsync-bg151fei9-pretamdas007s-projects.vercel.app', // Your current Vercel URL
    'https://texsync.vercel.app', // If you set up a custom domain
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static PDF files with proper headers
app.use('/pdfs', express.static(path.join(__dirname, '..', 'temp'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Legacy static serving for backward compatibility
app.use(express.static(path.join(__dirname, '..', 'temp')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'texsync-latex-backend'
  });
});

// Health check for API
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'texsync-latex-backend-api'
  });
});

// Routes
app.use('/api', apiRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});