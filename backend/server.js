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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 reqs per window
  message: { error: 'Too many requests, please try again later.' }
});

// Middlewares
app.use(morgan('dev')); // Logging
app.use(express.json());
app.use(cors());
app.use('/api', limiter);

// Serve frontend static files from ../frontend/
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

// Use Global Error Handler (must be after all routes)
app.use(errorHandler);

// Database connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance_dashboard';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Backend API Server is running on port ${PORT}`);
      console.log(`API Base URL: http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
