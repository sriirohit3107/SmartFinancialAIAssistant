// server/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const stockRoutes = require('./routes/stockRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/stock', stockRoutes);

app.get('/', (req, res) => {
  res.send('📈 SmartFinancial Backend is running');
});

module.exports = app;
