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
      <nav className="navbar">
        <h1>SmartFinancial Assistant</h1>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            aria-label="Stock Symbol"
            placeholder="Search for any stocks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button
            type="submit"
            className="search-button"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </nav>

      {error && <div className="error-message">{error}</div>}
      {searchedData && <SearchResult data={searchedData} symbol={searchInput.trim().toUpperCase()} />}
    </div>
  );
}

export default Navbar;
