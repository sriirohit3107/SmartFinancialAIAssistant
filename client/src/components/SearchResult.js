import React, { useState, useEffect } from 'react';

function SearchResult({ data, symbol }) {
  const [graphUrl, setGraphUrl] = useState('');
  const [graphLoading, setGraphLoading] = useState(false);

  useEffect(() => {
    if (symbol && data) {
      setGraphLoading(true);
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      setGraphUrl(`http://localhost:5000/api/stock/${symbol}/graph?t=${timestamp}`);
      setGraphLoading(false);
    }
  }, [symbol, data]);

  if (!data) return null;

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '--';
    return parseFloat(num).toLocaleString();
  };

  const formatCurrency = (num) => {
    if (num === null || num === undefined) return '--';
    return `$${parseFloat(num).toFixed(2)}`;
  };

  const formatChange = (change, percentChange) => {
    const changeNum = parseFloat(change);
    const percentNum = parseFloat(percentChange);
    const isPositive = changeNum >= 0;
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ 
          color: isPositive ? '#00ff88' : '#ff4444',
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }}>
          {isPositive ? '+' : ''}{formatCurrency(change)}
        </span>
        <span style={{ 
          color: isPositive ? '#00ff88' : '#ff4444',
          fontSize: '0.9rem'
        }}>
          ({isPositive ? '+' : ''}{percentNum.toFixed(2)}%)
        </span>
      </div>
    );
  };

  return (
    <div className="search-result" style={{ 
      background: '#2d2d2d', 
      padding: '2rem', 
      borderRadius: '12px', 
      margin: '2rem auto', 
      maxWidth: '800px', 
      color: 'white',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
          {symbol.toUpperCase()} - {data.name || 'Stock Information'}
        </h2>
        <p style={{ margin: '0', color: '#ccc', fontSize: '1.1rem' }}>
          {data.exchange} • {data.currency}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ color: '#00ff88', marginBottom: '1rem' }}>Current Price</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {formatCurrency(data.close)}
          </div>
          {formatChange(data.change, data.percent_change)}
        </div>
        
        <div>
          <h3 style={{ color: '#00ff88', marginBottom: '1rem' }}>Trading Details</h3>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Open:</span>
              <span>{formatCurrency(data.open)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>High:</span>
              <span>{formatCurrency(data.high)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Low:</span>
              <span>{formatCurrency(data.low)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Previous Close:</span>
              <span>{formatCurrency(data.previous_close)}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ color: '#00ff88', marginBottom: '1rem' }}>Volume Information</h3>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Volume:</span>
              <span>{formatNumber(data.volume)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Average Volume:</span>
              <span>{formatNumber(data.average_volume)}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 style={{ color: '#00ff88', marginBottom: '1rem' }}>Additional Info</h3>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Date:</span>
              <span>{new Date(data.datetime).toLocaleDateString()}</span>
            </div>
            {data.fifty_two_week?.range && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>52 Week Range:</span>
                <span>{data.fifty_two_week.range}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h3 style={{ color: '#00ff88', marginBottom: '1rem' }}>Price Chart (Last Month)</h3>
        {graphLoading ? (
          <div style={{ padding: '2rem', color: '#ccc' }}>Generating chart...</div>
        ) : (
          <div style={{ 
            background: '#1e1e1e', 
            padding: '1rem', 
            borderRadius: '8px',
            border: '1px solid #444'
          }}>
            <img 
              src={graphUrl} 
              alt={`${symbol} price chart`}
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                borderRadius: '4px'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div style={{ 
              display: 'none', 
              padding: '2rem', 
              color: '#ccc',
              textAlign: 'center'
            }}>
              Chart generation failed. Please try again.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResult;
