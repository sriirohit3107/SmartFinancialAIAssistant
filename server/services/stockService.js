const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const axios = require('axios');
const { exec } = require('child_process');
const TWELVE_API_KEY = process.env.TWELVE_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

async function fetchStockQuote(symbol){
    try{
        const response = await axios.get(`${BASE_URL}/quote`, {
            params: {
                symbol,
                apikey: TWELVE_API_KEY
            }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching stock quote:', error);
        throw error;
    }
}

function generateStockGraph(symbol) {
    return new Promise((resolve, reject) => {
        exec(
            `python scripts/stock_graph.py ${symbol}`,
            { cwd: __dirname + '/../' },
            (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Error generating stock graph:', error);
                    return reject(error);
                }
                resolve(`${symbol}_graph.png`);
            }
        );
    });
}

module.exports = { fetchStockQuote, generateStockGraph };
