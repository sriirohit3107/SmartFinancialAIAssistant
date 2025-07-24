const express = require('express');
const router = express.Router();
const { getStockQuote, getStockGraph } = require('../controllers/stockController');

router.get('/:symbol', getStockQuote);
router.get('/:symbol/graph', getStockGraph);

module.exports = router;