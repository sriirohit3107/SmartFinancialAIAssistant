"""
News Service

Fetches recent financial news for a given ticker.
Primary: Finnhub API (free tier: 60 calls/min)
Fallback: yfinance news (no API key needed, but less reliable)
"""

import logging
from datetime import datetime, timedelta
from typing import Optional

import requests
import yfinance as yf

logger = logging.getLogger(__name__)


class NewsService:
    """Fetch financial news headlines for a ticker."""

    def __init__(self, finnhub_api_key: Optional[str] = None):
        self.finnhub_key = finnhub_api_key
        if self.finnhub_key:
            logger.info("Finnhub API key configured ✅")
        else:
            logger.warning("No Finnhub API key — using yfinance news fallback")

    def get_news(self, ticker: str, limit: int = 10) -> list[dict]:
        """Get news articles. Tries Finnhub first, then yfinance."""
        articles = []

        if self.finnhub_key:
            articles = self._finnhub_news(ticker, limit)

        if not articles:
            articles = self._yfinance_news(ticker, limit)

        return articles[:limit]

    # ------------------------------------------------------------------
    # Finnhub
    # ------------------------------------------------------------------

    def _finnhub_news(self, ticker: str, limit: int) -> list[dict]:
        try:
            today = datetime.utcnow()
            from_date = (today - timedelta(days=7)).strftime("%Y-%m-%d")
            to_date = today.strftime("%Y-%m-%d")

            resp = requests.get(
                "https://finnhub.io/api/v1/company-news",
                params={
                    "symbol": ticker,
                    "from": from_date,
                    "to": to_date,
                    "token": self.finnhub_key,
                },
                timeout=10,
            )

            if resp.status_code != 200:
                logger.warning(f"Finnhub returned {resp.status_code}")
                return []

            raw = resp.json()
            if not isinstance(raw, list):
                return []

            articles = []
            for item in raw[:limit]:
                articles.append({
                    "title": item.get("headline", ""),
                    "summary": item.get("summary", ""),
                    "source": item.get("source", ""),
                    "url": item.get("url", ""),
                    "image": item.get("image", ""),
                    "published": _format_timestamp(item.get("datetime")),
                    "category": item.get("category", "general"),
                    "related": item.get("related", ticker),
                })

            logger.info(f"Finnhub: {len(articles)} articles for {ticker}")
            return articles

        except Exception as e:
            logger.error(f"Finnhub news failed for {ticker}: {e}")
            return []

    # ------------------------------------------------------------------
    # yfinance fallback
    # ------------------------------------------------------------------

    def _yfinance_news(self, ticker: str, limit: int) -> list[dict]:
        try:
            t = yf.Ticker(ticker)
            raw_news = t.news or []

            articles = []
            for item in raw_news[:limit]:
                # yfinance news structure can vary between versions
                title = item.get("title", "")
                link = item.get("link", "") or item.get("url", "")
                publisher = item.get("publisher", "")
                pub_time = item.get("providerPublishTime") or item.get("publishedDate")
                thumbnail = ""

                # Try to extract thumbnail
                thumbs = item.get("thumbnail", {})
                if isinstance(thumbs, dict):
                    resolutions = thumbs.get("resolutions", [])
                    if resolutions:
                        thumbnail = resolutions[0].get("url", "")

                articles.append({
                    "title": title,
                    "summary": "",
                    "source": publisher,
                    "url": link,
                    "image": thumbnail,
                    "published": _format_timestamp(pub_time) if pub_time else "",
                    "category": "general",
                    "related": ticker,
                })

            logger.info(f"yfinance: {len(articles)} articles for {ticker}")
            return articles

        except Exception as e:
            logger.error(f"yfinance news failed for {ticker}: {e}")
            return []


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _format_timestamp(ts) -> str:
    """Convert a unix timestamp or string to ISO date string."""
    if ts is None:
        return ""
    try:
        if isinstance(ts, (int, float)):
            return datetime.utcfromtimestamp(ts).strftime("%Y-%m-%d %H:%M:%S")
        return str(ts)
    except Exception:
        return str(ts)
