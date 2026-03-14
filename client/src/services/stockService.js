import axios from 'axios';

/**
 * Stock API Service
 *
 * Communicates with the Node.js backend.
 * Uses REACT_APP_API_BASE env var or falls back to localhost.
 */

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
});

/**
 * Get live stock quote for a given symbol
 */
export async function getStockQuote(symbol) {
    const { data } = await api.get(`/api/stock/${symbol}`);
    return data;
}

/**
 * Get OHLCV history for charting
 * @param {string} symbol - Stock ticker
 * @param {string} period - 1w, 1mo, 3mo, 6mo, 1y, 2y, 5y
 * @param {string} interval - 1h, 1d, 1wk, 1mo
 */
export async function getStockHistory(symbol, period = '1mo', interval = '1d') {
    const { data } = await api.get(`/api/stock/${symbol}/history`, {
        params: { period, interval },
    });
    return data;
}

/**
 * Get technical indicators
 */
export async function getStockTechnicals(symbol, period = '3mo') {
    const { data } = await api.get(`/api/stock/${symbol}/technicals`, {
        params: { period },
    });
    return data;
}

/**
 * Get news articles for a ticker
 */
export async function getStockNews(symbol, limit = 10) {
    const { data } = await api.get(`/api/stock/${symbol}/news`, {
        params: { limit },
    });
    return data;
}

/**
 * Get full analysis (quote + history + technicals + news) in one call
 */
export async function getFullAnalysis(symbol) {
    const { data } = await api.get(`/api/stock/${symbol}/full`);
    return data;
}

/**
 * Health check
 */
export async function checkHealth() {
    const { data } = await api.get('/api/health');
    return data;
}
