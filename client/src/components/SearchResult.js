import React from 'react';

function SearchResult({ data, symbol }) {
  if (!data) return null;

  return (
    <div className="card" style={{ background: '#2d2d2d', padding: '1rem', borderRadius: '8px', margin: '1rem auto', maxWidth: '600px', color: 'white' }}>
      <h3>{symbol.toUpperCase()} - {data.name}</h3>
      <p>Exchange: {data.exchange}</p>
      <p>Date: {data.datetime}</p>
      <p>Open: ${data.open}</p>
      <p>High: ${data.high}</p>
      <p>Low: ${data.low}</p>
      <p>Close: ${data.close}</p>
      <p>Previous Close: ${data.previous_close}</p>
      <p>Change: {data.change}</p>
      <p>Percent Change: {parseFloat(data.percent_change).toFixed(2)}%</p>
      <p>Volume: {data.volume}</p>
      <p>Average Volume: {data.average_volume}</p>
      <p>Currency: {data.currency}</p>
      <p>52 Week Range: {data.fifty_two_week?.range}</p>
      <img src={`http://localhost:5000/api/stock/AAPL/graph`} alt="Stock graph" />
    </div>
  );
}

export default SearchResult;
