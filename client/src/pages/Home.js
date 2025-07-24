import React from 'react';
import Navbar from '../components/Navbar';
import MarketSummary from '../components/MarketSummary';
import NewsFeed from '../components/NewsFeed';

function Home(){
    return(
        <div>
            <h1>SmartFinancial AI</h1>
            <Navbar />
            <MarketSummary />
            <NewsFeed />
        </div>
    )
}
export default Home;