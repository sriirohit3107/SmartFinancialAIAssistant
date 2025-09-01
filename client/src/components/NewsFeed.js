import React from 'react';
import './NewsFeed.css';

function NewsFeed(){
    const newsItems = [
        {
            id: 1,
            title: "📈 Tech stocks rally as earnings beat expectations",
            category: "Technology",
            time: "2 hours ago"
        },
        {
            id: 2,
            title: "💼 Federal Reserve hints at rate pause in September",
            category: "Federal Reserve",
            time: "4 hours ago"
        },
        {
            id: 3,
            title: "🛢 Oil prices jump 3% amid global demand recovery",
            category: "Commodities",
            time: "6 hours ago"
        },
        {
            id: 4,
            title: "🏦 JPMorgan reports record quarterly profits",
            category: "Banking",
            time: "8 hours ago"
        },
        {
            id: 5,
            title: "🪙 Bitcoin stabilizes above $30,000 after volatility",
            category: "Cryptocurrency",
            time: "10 hours ago"
        },
        {
            id: 6,
            title: "🌍 European markets open higher on positive economic data",
            category: "Global Markets",
            time: "12 hours ago"
        }
    ];

    return(
        <div className='news-feed'>
            <div className="news-header">
                <h2>📰 Financial News</h2>
                <span className="news-subtitle">Latest market updates and financial insights</span>
            </div>
            <div className="news-grid">
                {newsItems.map((item) => (
                    <div key={item.id} className="news-item">
                        <div className="news-content">
                            <h3 className="news-title">{item.title}</h3>
                            <div className="news-meta">
                                <span className="news-category">{item.category}</span>
                                <span className="news-time">{item.time}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="news-footer">
                <button className="load-more-btn">Load More News</button>
            </div>
        </div>
    )
}
export default NewsFeed;