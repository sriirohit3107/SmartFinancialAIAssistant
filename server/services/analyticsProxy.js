/**
 * Analytics Proxy Service
 *
 * Proxies requests from the Express API to the FastAPI analytics engine.
 * This replaces the old child_process.exec approach with a persistent HTTP service.
 */

const axios = require('axios');

const ANALYTICS_URL = process.env.ANALYTICS_URL || 'http://localhost:8000';

const analyticsClient = axios.create({
    baseURL: ANALYTICS_URL,
    timeout: 30000,  // 30s — some yfinance calls can be slow
});

/**
 * Get real-time quote from the analytics engine
 */
async function getQuote(symbol) {
    try {
        const { data } = await analyticsClient.get(`/quote/${symbol}`);
        return data;
    } catch (error) {
        handleError('getQuote', symbol, error);
    }
}

/**
 * Get OHLCV history data as JSON
 */
async function getHistory(symbol, period = '1mo', interval = '1d') {
    try {
        const { data } = await analyticsClient.get(`/history/${symbol}`, {
            params: { period, interval },
        });
        return data;
    } catch (error) {
        handleError('getHistory', symbol, error);
    }
}

/**
 * Get technical indicators (RSI, MACD, SMA, Bollinger)
 */
async function getTechnicals(symbol, period = '3mo') {
    try {
        const { data } = await analyticsClient.get(`/technicals/${symbol}`, {
            params: { period },
        });
        return data;
    } catch (error) {
        handleError('getTechnicals', symbol, error);
    }
}

/**
 * Get recent news for a ticker
 */
async function getNews(symbol, limit = 10) {
    try {
        const { data } = await analyticsClient.get(`/news/${symbol}`, {
            params: { limit },
        });
        return data;
    } catch (error) {
        handleError('getNews', symbol, error);
    }
}

/**
 * Get the full analysis (quote + history + technicals + news) in one call
 */
async function getFullAnalysis(symbol) {
    try {
        const { data } = await analyticsClient.get(`/full/${symbol}`);
        return data;
    } catch (error) {
        handleError('getFullAnalysis', symbol, error);
    }
}

/**
 * Health check for the analytics engine
 */
async function healthCheck() {
    try {
        const { data } = await analyticsClient.get('/health');
        return data;
    } catch (error) {
        return { status: 'down', error: error.message };
    }
}

/**
 * Shared error handler
 */
function handleError(method, symbol, error) {
    if (error.response) {
        const status = error.response.status;
        const msg = error.response.data?.detail || error.response.data?.message || error.message;
        console.error(`❌ analyticsProxy.${method}(${symbol}): ${status} — ${msg}`);

        const err = new Error(msg);
        err.status = status;
        throw err;
    }

    if (error.code === 'ECONNREFUSED') {
        console.error(`❌ Analytics engine not reachable at ${ANALYTICS_URL}`);
        const err = new Error('Analytics engine is not running. Start it with: uvicorn main:app --reload');
        err.status = 503;
        throw err;
    }

    console.error(`❌ analyticsProxy.${method}(${symbol}):`, error.message);
    throw error;
}

module.exports = {
    getQuote,
    getHistory,
    getTechnicals,
    getNews,
    getFullAnalysis,
    healthCheck,
};
