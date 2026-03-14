

from dotenv import load_dotenv
load_dotenv(dotenv_path="../../.env")

"""
SmartFinancial AI — Analytics Engine (FastAPI)

Endpoints:
    GET /health                     → Service health check
    GET /quote/{ticker}             → Real-time quote (Twelve Data → yfinance fallback)
    GET /history/{ticker}           → Historical OHLCV data as JSON
    GET /technicals/{ticker}        → Technical indicators (RSI, MACD, SMA, Bollinger)
    GET /news/{ticker}              → Recent news headlines
    GET /full/{ticker}              → Combined: quote + history + technicals + news
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from services.stock_data import StockDataService
from services.technicals import TechnicalAnalysis
from services.news import NewsService
# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Service singletons (created once at startup)
# ---------------------------------------------------------------------------
stock_svc: StockDataService | None = None
news_svc: NewsService | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    global stock_svc, news_svc
    twelve_key = os.getenv("TWELVE_API_KEY")
    finnhub_key = os.getenv("FINNHUB_API_KEY")
    stock_svc = StockDataService(twelve_api_key=twelve_key)
    news_svc = NewsService(finnhub_api_key=finnhub_key)
    logger.info("Analytics Engine started ✅")
    yield
    logger.info("Analytics Engine shutting down 🛑")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="SmartFinancial Analytics Engine",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok", "service": "analytics-engine"}


@app.get("/quote/{ticker}")
async def get_quote(ticker: str):
    """Return real-time quote for a ticker."""
    ticker = ticker.upper().strip()
    if not ticker:
        raise HTTPException(400, "Ticker symbol is required")

    data = stock_svc.get_quote(ticker)
    if data is None:
        raise HTTPException(404, f"No quote data found for {ticker}")
    return data


@app.get("/history/{ticker}")
async def get_history(
    ticker: str,
    period: str = Query("1mo", regex="^(1w|1mo|3mo|6mo|1y|2y|5y)$"),
    interval: str = Query("1d", regex="^(1h|1d|1wk|1mo)$"),
):
    """Return OHLCV history as JSON arrays."""
    ticker = ticker.upper().strip()
    data = stock_svc.get_history(ticker, period=period, interval=interval)
    if data is None:
        raise HTTPException(404, f"No history data found for {ticker}")
    return data


@app.get("/technicals/{ticker}")
async def get_technicals(
    ticker: str,
    period: str = Query("3mo", regex="^(1mo|3mo|6mo|1y|2y)$"),
):
    """Return technical indicators: SMA, EMA, RSI, MACD, Bollinger Bands."""
    ticker = ticker.upper().strip()
    history = stock_svc.get_history_dataframe(ticker, period=period, interval="1d")
    if history is None or history.empty:
        raise HTTPException(404, f"No data available for technicals on {ticker}")

    ta = TechnicalAnalysis(history)
    return {
        "ticker": ticker,
        "period": period,
        "sma_20": ta.sma(20),
        "sma_50": ta.sma(50),
        "ema_12": ta.ema(12),
        "ema_26": ta.ema(26),
        "rsi_14": ta.rsi(14),
        "macd": ta.macd(),
        "bollinger": ta.bollinger_bands(20),
        "summary": ta.summary(),
    }


@app.get("/news/{ticker}")
async def get_news(ticker: str, limit: int = Query(10, ge=1, le=50)):
    """Return recent news headlines for a ticker."""
    ticker = ticker.upper().strip()
    articles = news_svc.get_news(ticker, limit=limit)
    return {"ticker": ticker, "count": len(articles), "articles": articles}


@app.get("/full/{ticker}")
async def get_full_analysis(ticker: str):
    """
    Combined endpoint — returns everything the frontend (and later the LLM agent) needs:
    quote + history + technicals + news
    """
    ticker = ticker.upper().strip()

    # Quote
    quote = stock_svc.get_quote(ticker)
    if quote is None:
        raise HTTPException(404, f"No data found for {ticker}")

    # History (1 month for chart, daily)
    history = stock_svc.get_history(ticker, period="1mo", interval="1d")

    # Technicals (3 months of data for accurate indicators)
    tech = None
    df = stock_svc.get_history_dataframe(ticker, period="3mo", interval="1d")
    if df is not None and not df.empty:
        ta = TechnicalAnalysis(df)
        tech = {
            "sma_20": ta.sma(20),
            "sma_50": ta.sma(50),
            "ema_12": ta.ema(12),
            "ema_26": ta.ema(26),
            "rsi_14": ta.rsi(14),
            "macd": ta.macd(),
            "bollinger": ta.bollinger_bands(20),
            "summary": ta.summary(),
        }

    # News
    articles = news_svc.get_news(ticker, limit=8)

    return {
        "ticker": ticker,
        "quote": quote,
        "history": history,
        "technicals": tech,
        "news": {"count": len(articles), "articles": articles},
    }
