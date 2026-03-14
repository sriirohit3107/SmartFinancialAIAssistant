// server/production.js - Production server configuration
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const stockRoutes = require('./routes/stockRoutes');
const analyticsProxy = require('./services/analyticsProxy');

dotenv.config();

const app = express();

// Production CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || [
    'http://localhost:3000',
    'https://smart-financial-eight.vercel.app',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// API Routes
app.use('/api/stock', stockRoutes);

// Health check — includes analytics engine status
app.get('/api/health', async (req, res) => {
  const analyticsHealth = await analyticsProxy.healthCheck();
  res.json({
    status: 'ok',
    service: 'smartfinancial-api',
    analytics_engine: analyticsHealth,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
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
  console.log(`📊 Analytics Engine: ${process.env.ANALYTICS_URL || 'http://localhost:8000'}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`📱 Frontend served from: ${path.join(__dirname, '../client/build')}`);
  }
});

module.exports = app;
