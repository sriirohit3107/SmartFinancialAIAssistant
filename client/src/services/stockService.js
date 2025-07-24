import axios from 'axios';

/**
 * Get live stock quote for a given symbol (e.g., AAPL, TSLA)
 * @param {string} symbol - Stock ticker symbol
 * @returns {object} - Live quote data
 */

export async function getStockQuote(symbol) {
    try{
        const response = await axios.get(`http://localhost:5000/api/stock/${symbol}`)
        return response.data;
    }
    catch(error){
        console.log('Error fetching stock data:', error.message);
        throw error;
    }
} 