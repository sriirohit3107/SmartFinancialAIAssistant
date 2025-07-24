import React, { useState, useEffect } from 'react';
import { getStockQuote } from '../services/stockService';
import './Market.css';

function MarketSummary() {
  const [spData, setSpData] = useState(null);
  const [dowData, setDowData] = useState(null);
  const [nasdaqData, setNasdaqData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setError('');
      setLoading(true);
      try {
        const [sp, dow, nasdaq] = await Promise.all([
          getStockQuote('SPY'),     // S&P 500 ETF
          getStockQuote('DIA'),     // Dow Jones ETF
          getStockQuote('QQQ'),     // Nasdaq ETF
        ]);
        setSpData(sp);
        setDowData(dow);
        setNasdaqData(nasdaq);
      } catch (err) {
        console.error('❌ Error fetching index data:', err.message);
        setError('Market data unavailable at the moment.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatChange = (percent) => {
    const num = parseFloat(percent);
    if (isNaN(num)) return '--';
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const marketItems = [
    { name: 'S&P 500 (SPY)', data: spData },
    { name: 'Dow Jones (DIA)', data: dowData },
    { name: 'Nasdaq (QQQ)', data: nasdaqData },
  ];

  return (
    <div className='market-summary'>
      <h2>📊 Market Summary</h2>
      {loading && <p>Loading Market Summary...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className='market-cards'>
        {marketItems.map(({ name, data }) => (
          <div key={name} className='card'>
            <h3>{name}</h3>
            <p>{data?.price ? `$${parseFloat(data.price).toFixed(2)}` : '--'}</p>
            <span className={parseFloat(data?.percent_change) >= 0 ? 'up' : 'down'}>
              {formatChange(data?.percent_change)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MarketSummary;
