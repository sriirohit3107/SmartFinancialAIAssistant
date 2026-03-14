// server/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const stockRoutes = require('./routes/stockRoutes');
const analyticsProxy = require('./services/analyticsProxy');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/stock', stockRoutes);

// Health check — includes analytics engine status
app.get('/api/health', async (req, res) => {
    const analyticsHealth = await analyticsProxy.healthCheck();
    res.json({
        status: 'ok',
        service: 'smartfinancial-api',
        analytics_engine: analyticsHealth,
        timestamp: new Date().toISOString(),
    });
});

app.get('/', (req, res) => {
    res.send('📈 SmartFinancial Backend is running');
});

module.exports = app;
