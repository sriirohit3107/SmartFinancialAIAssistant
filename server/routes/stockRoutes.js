/**
 * Stock Routes
 *
 * API endpoints:
 *   GET /api/stock/:symbol              → Real-time quote
 *   GET /api/stock/:symbol/history      → OHLCV history (JSON)
 *   GET /api/stock/:symbol/technicals   → Technical indicators
 *   GET /api/stock/:symbol/news         → Recent news
 *   GET /api/stock/:symbol/full         → Combined analysis (quote + history + technicals + news)
 *   GET /api/stock/:symbol/graph        → [LEGACY] Redirects to /history for backward compat
 */

const express = require('express');
const router = express.Router();
const {
    getStockQuote,
    getStockHistory,
    getStockTechnicals,
    getStockNews,
    getFullAnalysis,
} = require('../controllers/stockController');

// Core endpoints
router.get('/:symbol', getStockQuote);
router.get('/:symbol/history', getStockHistory);
router.get('/:symbol/technicals', getStockTechnicals);
router.get('/:symbol/news', getStockNews);
router.get('/:symbol/full', getFullAnalysis);

// Legacy: /graph used to return a PNG — now redirect to JSON history
router.get('/:symbol/graph', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    res.redirect(301, `/api/stock/${symbol}/history?period=1mo&interval=1d`);
});

module.exports = router;
