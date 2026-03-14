import React, { useState, useEffect } from 'react';
import { getStockQuote } from '../services/stockService';
import './Market.css';

function MarketSummary() {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const INDICES = [
    { name: 'S&P 500 (SPY)', symbol: 'SPY' },
    { name: 'Dow Jones (DIA)', symbol: 'DIA' },
    { name: 'Nasdaq (QQQ)', symbol: 'QQQ' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setError('');
      setLoading(true);
      try {
        const results = await Promise.allSettled(
          INDICES.map(idx => getStockQuote(idx.symbol))
        );

        const data = INDICES.map((idx, i) => ({
          ...idx,
          data: results[i].status === 'fulfilled' ? results[i].value : null,
          error: results[i].status === 'rejected' ? results[i].reason?.message : null,
        }));

        setMarketData(data);

        // If all failed, show a general error
        if (data.every(d => d.data === null)) {
          setError('Market data unavailable. Check that the backend and analytics engine are running.');
        }
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to load market data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '--';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatChange = (percent) => {
    const num = parseFloat(percent);
    if (isNaN(num)) return '--';
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className='market-summary'>
        <h2>📊 Market Summary</h2>
        <div className='loading-message'>Loading Market Summary...</div>
      </div>
    );
  }

  return (
    <div className='market-summary'>
      <h2>📊 Market Summary</h2>

      {error && (
        <div className='error-message'>{error}</div>
      )}

      <div className='market-cards'>
        {marketData.map(({ name, data, error: itemError }) => (
          <div key={name} className='card'>
            <h3>{name}</h3>
            {data ? (
              <>
                <p>{formatPrice(data.close)}</p>
                <span className={parseFloat(data.percent_change) >= 0 ? 'up' : 'down'}>
                  {formatChange(data.percent_change)}
                </span>
              </>
            ) : (
              <p style={{ fontSize: '1rem', color: '#888' }}>
                {itemError || 'Unavailable'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MarketSummary;
