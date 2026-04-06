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
app.use(cors());
app.use('/api', limiter);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const recordRoutes = require('./routes/recordRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import Global Error Handler
const errorHandler = require('./middlewares/errorHandler');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Fallback: serve index.html for all non-API routes (SPA support)
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Use Global Error Handler (must be after all routes)
app.use(errorHandler);

// ─── MongoDB Connection ───────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance_dashboard';

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
  console.log('Connected to MongoDB');
}

// ─── Local Development: Start server normally ─────────────
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Backend API Server is running on port ${PORT}`);
      console.log(`API Base URL: http://localhost:${PORT}/api`);
    });
  }).catch(err => console.error('Failed to connect to MongoDB', err));
}

// ─── Vercel Serverless: Connect DB then export app ────────
connectDB().catch(err => console.error('MongoDB connection error:', err));

module.exports = app;
