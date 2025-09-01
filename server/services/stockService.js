const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');

const TWELVE_API_KEY = process.env.TWELVE_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

async function fetchStockQuote(symbol) {
    if (!TWELVE_API_KEY) {
        throw new Error('TWELVE_API_KEY is not configured. Please check your .env file.');
    }

    try {
        const response = await axios.get(`${BASE_URL}/quote`, {
            params: {
                symbol,
                apikey: TWELVE_API_KEY
            },
            timeout: 10000 // 10 second timeout
        });

        if (response.data.status === 'error') {
            throw new Error(response.data.message || 'API returned an error');
        }

        return response.data;
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout - please try again');
        }
        if (error.response?.status === 401) {
            throw new Error('Invalid API key - please check your configuration');
        }
        if (error.response?.status === 429) {
            throw new Error('API rate limit exceeded - please try again later');
        }
        if (error.response?.status === 404) {
            throw new Error(`Stock symbol '${symbol}' not found`);
        }
        
        console.error('❌ Error fetching stock quote:', error.message);
        throw new Error(`Failed to fetch stock data for ${symbol}: ${error.message}`);
    }
}

function generateStockGraph(symbol) {
    return new Promise((resolve, reject) => {
        // Check if Python is available
        const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
        
        exec(
            `${pythonCommand} scripts/stock_graph.py ${symbol}`,
            { 
                cwd: __dirname + '/../',
                timeout: 30000 // 30 second timeout
            },
            (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Error generating stock graph:', error);
                    if (error.code === 'ENOENT') {
                        return reject(new Error('Python not found. Please ensure Python is installed and in your PATH.'));
                    }
                    if (error.killed) {
                        return reject(new Error('Graph generation timed out. Please try again.'));
                    }
                    return reject(new Error(`Failed to generate graph: ${error.message}`));
                }

                if (stderr) {
                    console.warn('⚠️ Python script warnings:', stderr);
                }

                const filename = `${symbol}_graph.png`;
                const filePath = path.resolve(__dirname, '../', filename);
                
                // Check if file was actually created
                if (!fs.existsSync(filePath)) {
                    return reject(new Error('Graph file was not created'));
                }

                console.log(`✅ Graph generated successfully: ${filename}`);
                resolve(filename);
            }
        );
    });
}

module.exports = { fetchStockQuote, generateStockGraph };
