import axios from 'axios';

/**
 * Get live stock quote for a given symbol (e.g., AAPL, TSLA)
 * @param {string} symbol - Stock ticker symbol
 * @returns {object} - Live quote data
 */

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export async function getStockQuote(symbol) {
    try{
        const response = await axios.get(`${API_BASE}/api/stock/${symbol}`)
        return response.data;
    }
    catch(error){
        console.log('Error fetching stock data:', error.message);
        throw error;
    }
} 