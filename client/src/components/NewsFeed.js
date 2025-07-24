import React from 'react';
import './NewsFeed.css';

function NewsFeed(){
    return(
        <div className='news-feed' style={{background: '#23272f', color: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem'}}>
            <h2 style={{color: '#007bff', marginBottom: '1rem'}}>Financial News</h2>
            <ul style={{listStyle: 'none', padding: 0}}>
                <li style={{marginBottom: '0.5rem', fontSize: '1.1rem'}}>📈 Tech stocks rally as earnings beat expectations</li>
                <li style={{marginBottom: '0.5rem', fontSize: '1.1rem'}}>💼 Federal Reserve hints at rate pause in September</li>
                <li style={{marginBottom: '0.5rem', fontSize: '1.1rem'}}>🛢 Oil prices jump 3% amid global demand recovery</li>
                <li style={{marginBottom: '0.5rem', fontSize: '1.1rem'}}>🏦 JPMorgan reports record quarterly profits</li>
                <li style={{marginBottom: '0.5rem', fontSize: '1.1rem'}}>🪙 Bitcoin stabilizes above $30,000 after volatility</li>
            </ul>
        </div>
    )
}
export default NewsFeed;