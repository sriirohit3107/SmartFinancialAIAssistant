/**
 * Stock Controller
 *
 * Handles all stock-related API requests.
 * Now proxies to the FastAPI analytics engine instead of spawning Python processes.
 */

const analyticsProxy = require('../services/analyticsProxy');

// Legacy: also keep the Twelve Data direct call as a fast path for quotes
const { fetchStockQuote } = require('../services/stockService');

/**
 * GET /api/stock/:symbol
 * Get real-time quote (backward compatible with existing frontend)
 */
async function getStockQuote(req, res) {
    const symbol = req.params.symbol.toUpperCase();
    try {
        // Try analytics engine first (has yfinance fallback built in)
        const data = await analyticsProxy.getQuote(symbol);
        res.json(data);
    } catch (error) {
        // If analytics engine is down, fall back to direct Twelve Data call
        try {
            console.warn(`⚠️ Analytics engine unavailable, falling back to direct API for ${symbol}`);
            const fallback = await fetchStockQuote(symbol);
            res.json(fallback);
        } catch (fallbackError) {
            const status = error.status || 500;
            res.status(status).json({ error: error.message || 'Failed to fetch stock quote' });
        }
    }
}

/**
 * GET /api/stock/:symbol/history?period=1mo&interval=1d
 * Get OHLCV history as JSON (replaces the old PNG graph endpoint)
 */
async function getStockHistory(req, res) {
    const symbol = req.params.symbol.toUpperCase();
    const { period = '1mo', interval = '1d' } = req.query;
    try {
        const data = await analyticsProxy.getHistory(symbol, period, interval);
        res.json(data);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ error: error.message || 'Failed to fetch history' });
    }
}

/**
 * GET /api/stock/:symbol/technicals?period=3mo
 * Get technical indicators (RSI, MACD, SMA, Bollinger Bands)
 */
async function getStockTechnicals(req, res) {
    const symbol = req.params.symbol.toUpperCase();
    const { period = '3mo' } = req.query;
    try {
        const data = await analyticsProxy.getTechnicals(symbol, period);
        res.json(data);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ error: error.message || 'Failed to fetch technicals' });
    }
}

/**
 * GET /api/stock/:symbol/news?limit=10
 * Get recent news articles
 */
async function getStockNews(req, res) {
    const symbol = req.params.symbol.toUpperCase();
    const limit = parseInt(req.query.limit) || 10;
    try {
        const data = await analyticsProxy.getNews(symbol, limit);
        res.json(data);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ error: error.message || 'Failed to fetch news' });
    }
}

/**
 * GET /api/stock/:symbol/full
 * Get the complete analysis: quote + history + technicals + news
 * This is the endpoint the frontend (and later the LLM agent) will use.
 */
async function getFullAnalysis(req, res) {
    const symbol = req.params.symbol.toUpperCase();
    try {
        const data = await analyticsProxy.getFullAnalysis(symbol);
        res.json(data);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ error: error.message || 'Failed to fetch full analysis' });
    }
}

module.exports = {
    getStockQuote,
    getStockHistory,
    getStockTechnicals,
    getStockNews,
    getFullAnalysis,
};
