import React, { useState, useEffect } from 'react';
import { getStockNews } from '../services/stockService';
import './NewsFeed.css';

function NewsFeed() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch news for major market ETFs to get general market news
                const [spyNews, qqqNews] = await Promise.allSettled([
                    getStockNews('SPY', 4),
                    getStockNews('QQQ', 4),
                ]);

                const allArticles = [];

                if (spyNews.status === 'fulfilled' && spyNews.value?.articles) {
                    allArticles.push(...spyNews.value.articles);
                }
                if (qqqNews.status === 'fulfilled' && qqqNews.value?.articles) {
                    allArticles.push(...qqqNews.value.articles);
                }

                // Deduplicate by title
                const seen = new Set();
                const unique = allArticles.filter(a => {
                    if (!a.title || seen.has(a.title)) return false;
                    seen.add(a.title);
                    return true;
                });

                // Sort by published date (newest first)
                unique.sort((a, b) => {
                    if (!a.published) return 1;
                    if (!b.published) return -1;
                    return new Date(b.published) - new Date(a.published);
                });

                setArticles(unique.slice(0, 8));

                if (unique.length === 0) {
                    setError('No news available right now. Ensure the analytics engine is running.');
                }
            } catch (err) {
                console.error('Failed to fetch news:', err);
                setError('Unable to load news. Is the analytics engine running?');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    const formatTime = (published) => {
        if (!published) return '';
        try {
            const date = new Date(published);
            const now = new Date();
            const diffMs = now - date;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffHours / 24);

            if (diffHours < 1) return 'Just now';
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return date.toLocaleDateString();
        } catch {
            return published;
        }
    };

    if (loading) {
        return (
            <div className='news-feed'>
                <div className="news-header">
                    <h2>📰 Financial News</h2>
                    <span className="news-subtitle">Loading latest market news...</span>
                </div>
                <div style={{ textAlign: 'center', padding: '2rem', color: '#b0b0b0' }}>
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className='news-feed'>
            <div className="news-header">
                <h2>📰 Financial News</h2>
                <span className="news-subtitle">Latest market updates and financial insights</span>
            </div>

            {error && (
                <div style={{
                    textAlign: 'center',
                    padding: '1rem',
                    color: '#ff4444',
                    background: 'rgba(255, 68, 68, 0.1)',
                    borderRadius: '8px',
                    margin: '0 0 1.5rem',
                }}>
                    {error}
                </div>
            )}

            <div className="news-grid">
                {articles.map((article, index) => (
                    <a
                        key={index}
                        href={article.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <div className="news-item">
                            {article.image && (
                                <div style={{
                                    width: '100%',
                                    height: '140px',
                                    borderRadius: '8px',
                                    marginBottom: '0.75rem',
                                    overflow: 'hidden',
                                    background: '#1a1a1a',
                                }}>
                                    <img
                                        src={article.image}
                                        alt=""
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            )}
                            <div className="news-content">
                                <h3 className="news-title">{article.title}</h3>
                                <div className="news-meta">
                                    <span className="news-category">
                                        {article.source || article.category || 'Market'}
                                    </span>
                                    <span className="news-time">{formatTime(article.published)}</span>
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}

export default NewsFeed;
