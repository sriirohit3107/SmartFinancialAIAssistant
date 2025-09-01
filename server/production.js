// server/production.js - Production server configuration
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const stockRoutes = require('./routes/stockRoutes');

dotenv.config();

const app = express();

// Production CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'https://your-domain.vercel.app'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// API Routes
app.use('/api/stock', stockRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve React app for all non-API routes (SPA routing)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('📈 SmartFinancial Backend is running');
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`📱 Frontend served from: ${path.join(__dirname, '../client/build')}`);
  }
});

module.exports = app;
