const { fetchStockQuote, generateStockGraph } = require('../services/stockService');
const path = require('path');

async function getStockQuote(req, res){
    const symbol = req.params.symbol.toUpperCase();
    try{
        const data = await fetchStockQuote(symbol);
        res.json(data);
    }
    catch(error){
        console.error('Error fetching stock quote:', error);
        res.status(500).json({error: 'Failed to fetch stock quote'});
    }
}

async function getStockGraph(req, res) {
    const symbol = req.params.symbol.toUpperCase();
    try {
        const filename = await generateStockGraph(symbol);
        const filePath = path.resolve(__dirname, '../', filename);
        res.sendFile(filePath);
    } catch (error) {
        res.status(500).send('Failed to generate stock graph');
    }
}

module.exports = { getStockQuote, getStockGraph };