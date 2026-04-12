const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Load env variables
dotenv.config();

const app = express();

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

// Middlewares
app.use(morgan('dev'));
app.use(express.json());

// ─── Request Timeout (Render free tier ~30s gateway limit) ───────────────────
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) return next();
  const timeout = parseInt(process.env.REQUEST_TIMEOUT_MS) || 15000;
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        error: 'Request timed out. The server is under load — please try again.',
        code: 'SEARCH_TIMEOUT'
      });
    }
  }, timeout);
  res.on('finish', () => clearTimeout(timer));
  res.on('close',  () => clearTimeout(timer));
  next();
});

// CORS — allow localhost (dev) + Render domains + custom FRONTEND_URL
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:3000',
    /\.vercel\.app$/,
    /\.onrender\.com$/,
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use('/api', limiter);

// ─── Serve Frontend Static Files ─────────────────────────────────────────────
// Render is a persistent Node server (not serverless), so we serve the
// frontend directly from Express in both dev and production.
app.use(express.static(path.join(__dirname, '../frontend')));

// Import Routes
const authRoutes      = require('./routes/authRoutes');
const userRoutes      = require('./routes/userRoutes');
const recordRoutes    = require('./routes/recordRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import Global Error Handler
const errorHandler = require('./middlewares/errorHandler');

// Use Routes
app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/records',   recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// SPA Fallback — serve index.html for all non-API routes
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Global Error Handler (must be last)
app.use(errorHandler);

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance_dashboard';

if (!MONGODB_URI && process.env.NODE_ENV === 'production') {
  console.error('❌ FATAL: MONGODB_URI environment variable is not set!');
}

let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }).then((m) => {
      console.log('✅ Connected to MongoDB');
      return m;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Ensure DB is connected before every API request
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    return res.status(503).json({
      success: false,
      error: 'Database unavailable. Please check MONGODB_URI in Render environment variables and ensure MongoDB Atlas allows connections from all IPs (0.0.0.0/0).'
    });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
// Render sets process.env.PORT automatically (default 10000); locally defaults to 5000.
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🌐 App: http://localhost:${PORT}`);
  });
}).catch(err => console.error('Failed to connect to MongoDB:', err));

module.exports = app;
