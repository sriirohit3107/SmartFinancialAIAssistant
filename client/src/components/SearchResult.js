import React, { useState, useEffect } from 'react';
import { getStockHistory } from '../services/stockService';

function SearchResult({ data, symbol }) {
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    if (symbol && data) {
      setHistoryLoading(true);
      setHistoryError(null);
      getStockHistory(symbol, '1mo', '1d')
        .then((histData) => {
          setHistory(histData);
        })
        .catch((err) => {
          console.error('Failed to load history:', err);
          setHistoryError('Failed to load chart data. Is the analytics engine running?');
        })
        .finally(() => setHistoryLoading(false));
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

  /**
   * Simple SVG sparkline chart from history data.
   * This will be replaced with Recharts in Phase 2.
   */
  const renderSparkline = () => {
    if (!history || !history.close || history.close.length === 0) return null;

    const prices = history.close.filter(p => p !== null);
    const dates = history.dates || [];
    if (prices.length < 2) return null;

    const width = 700;
    const height = 250;
    const padding = 40;

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const points = prices.map((price, i) => {
      const x = padding + (i / (prices.length - 1)) * (width - padding * 2);
      const y = height - padding - ((price - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    });

    const polyline = points.join(' ');

    // Create area fill path
    const firstX = padding;
    const lastX = padding + ((prices.length - 1) / (prices.length - 1)) * (width - padding * 2);
    const areaPath = `M ${firstX},${height - padding} L ${polyline.split(' ').join(' L ')} L ${lastX},${height - padding} Z`;

    const isUp = prices[prices.length - 1] >= prices[0];
    const lineColor = isUp ? '#00ff88' : '#ff4444';

    // Y-axis labels
    const yLabels = [min, min + range * 0.25, min + range * 0.5, min + range * 0.75, max];

    // X-axis labels (show ~5 dates)
    const xStep = Math.max(1, Math.floor(dates.length / 5));
    const xLabels = dates.filter((_, i) => i % xStep === 0 || i === dates.length - 1);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxHeight: '250px' }}>
        {/* Grid lines */}
        {yLabels.map((val, i) => {
          const y = height - padding - ((val - min) / range) * (height - padding * 2);
          return (
            <g key={`grid-${i}`}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#333" strokeWidth="1" strokeDasharray="4 4" />
              <text x={padding - 5} y={y + 4} textAnchor="end" fill="#888" fontSize="10">
                ${val.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill={lineColor} opacity="0.1" />

        {/* Price line */}
        <polyline
          points={polyline}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current price dot */}
        {(() => {
          const lastPrice = prices[prices.length - 1];
          const cx = padding + ((prices.length - 1) / (prices.length - 1)) * (width - padding * 2);
          const cy = height - padding - ((lastPrice - min) / range) * (height - padding * 2);
          return (
            <g>
              <circle cx={cx} cy={cy} r="5" fill={lineColor} />
              <circle cx={cx} cy={cy} r="8" fill={lineColor} opacity="0.3" />
            </g>
          );
        })()}

        {/* X-axis labels */}
        {xLabels.map((date, i) => {
          const idx = dates.indexOf(date);
          const x = padding + (idx / (dates.length - 1)) * (width - padding * 2);
          return (
            <text key={`x-${i}`} x={x} y={height - 10} textAnchor="middle" fill="#888" fontSize="10">
              {date.slice(5)} {/* Show MM-DD */}
            </text>
          );
        })}
      </svg>
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
          {data.exchange} {data.currency ? `• ${data.currency}` : ''}
          {data.source ? <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem' }}>via {data.source}</span> : ''}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ color: '#00ff88', marginBottom: '1rem' }}>Current Price</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {formatCurrency(data.close)}
          </div>
          {data.change !== null && data.percent_change !== null && formatChange(data.change, data.percent_change)}
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
              <span>{data.datetime ? new Date(data.datetime).toLocaleDateString() : '--'}</span>
            </div>
            {data.fifty_two_week && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>52W Range:</span>
                <span>
                  {data.fifty_two_week.low ? `$${data.fifty_two_week.low}` : '--'}
                  {' — '}
                  {data.fifty_two_week.high ? `$${data.fifty_two_week.high}` : '--'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ color: '#00ff88', marginBottom: '1rem' }}>Price Chart (Last Month)</h3>
        {historyLoading ? (
          <div style={{ padding: '2rem', color: '#ccc' }}>Loading chart data...</div>
        ) : historyError ? (
          <div style={{
            padding: '1.5rem',
            color: '#ff4444',
            background: 'rgba(255, 68, 68, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 68, 68, 0.3)'
          }}>
            {historyError}
          </div>
        ) : (
          <div style={{
            background: '#1e1e1e',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #444'
          }}>
            {renderSparkline() || (
              <div style={{ padding: '2rem', color: '#ccc' }}>No chart data available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResult;
