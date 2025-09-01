import React from 'react';
import Navbar from '../components/Navbar';
import MarketSummary from '../components/MarketSummary';
import NewsFeed from '../components/NewsFeed';
import './Home.css';

function Home(){
    return(
        <div className="home">
            <div className="hero-section">
                <h1 className="hero-title">💼 SmartFinancial AI</h1>
                <p className="hero-subtitle">
                    Your intelligent financial companion for stock analysis, market insights, and investment guidance
                </p>
            </div>
            <Navbar />
            <MarketSummary />
            <NewsFeed />
        </div>
    )
}
export default Home;