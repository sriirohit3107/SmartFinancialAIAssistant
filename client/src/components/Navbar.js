import React, { useState } from 'react';
import './Navbar.css';
import { getStockQuote } from '../services/stockService';
import SearchResult from './SearchResult';

function Navbar() {
  const [searchInput, setSearchInput] = useState('');
  const [searchedData, setSearchedData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setError(null);
    setSearchedData(null);
    setLoading(true);
    try {
      const data = await getStockQuote(searchInput.trim().toUpperCase());
      setSearchedData(data);
    } catch (err) {
      console.error('❌ Error fetching stock:', err.message);
      setError('Invalid symbol or data unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <nav
        className="navbar"
        style={{
          background: '#1e1e1e',
          color: 'white',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '8px',
          marginBottom: '2rem',
        }}
      >
        <h1>SmartFinancial Assistant</h1>
        <form
          onSubmit={handleSearch}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <input
            type="text"
            aria-label="Stock Symbol"
            placeholder="Search for any stocks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: 'none',
              width: '200px',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              background: '#007bff',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </nav>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {searchedData && <SearchResult data={searchedData} symbol={searchInput.trim().toUpperCase()} />}
    </div>
  );
}

export default Navbar;
