# Phase 1: Foundation & FastAPI Transition — Setup Guide

## What Changed

Phase 1 replaces the old "spawn Python on every request" approach with a proper microservices architecture.

### Before (Old Architecture)
```
React → Node.js → child_process.exec(python stock_graph.py) → PNG image
```
**Problems:** Slow (new Python process per request), returns images instead of data, hardcoded localhost URLs, fake news feed.

### After (New Architecture)
```
React → Node.js (Orchestrator) → FastAPI (Analytics Engine) → JSON data
```
**Improvements:** Persistent Python service, JSON data (interactive charts), technical indicators, real news, proper error handling.

---

## New Files

| File | Purpose |
|------|---------|
| `server/analytics/main.py` | FastAPI app with all analytics endpoints |
| `server/analytics/services/stock_data.py` | Quote & history data (Twelve Data + yfinance) |
| `server/analytics/services/technicals.py` | RSI, MACD, SMA, EMA, Bollinger Bands |
| `server/analytics/services/news.py` | Financial news (Finnhub + yfinance fallback) |
| `server/analytics/requirements.txt` | Python dependencies for analytics engine |
| `server/services/analyticsProxy.js` | Node.js HTTP proxy to FastAPI |

## Modified Files

| File | What Changed |
|------|-------------|
| `server/controllers/stockController.js` | Uses analyticsProxy instead of child_process; added history, technicals, news, full endpoints |
| `server/routes/stockRoutes.js` | Added routes for /history, /technicals, /news, /full; legacy /graph redirects |
| `server/app.js` | Added health check with analytics engine status |
| `server/production.js` | Added analytics proxy and health check |
| `client/src/services/stockService.js` | Added getStockHistory, getStockTechnicals, getStockNews, getFullAnalysis; fixed API_BASE |
| `client/src/components/SearchResult.js` | Replaced hardcoded img tag with JSON-based SVG sparkline chart |
| `client/src/components/NewsFeed.js` | Replaced hardcoded news with real API-fetched news |
| `client/src/components/MarketSummary.js` | Added auto-refresh (60s), Promise.allSettled, better error handling |
| `env.example` | Added FINNHUB_API_KEY and ANALYTICS_URL |
| `requirements.txt` | Added fastapi, uvicorn |
| `start.sh` / `start.bat` | Now starts all 3 services |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- npm

### Step 1: Get API Keys (Free Tiers)

1. **Twelve Data** (stock quotes): https://twelvedata.com/ → Sign up → Copy API key
2. **Finnhub** (news): https://finnhub.io/ → Sign up → Copy API key

Both are optional — the app falls back to yfinance if keys aren't set.

### Step 2: Configure Environment

```bash
cp env.example .env
```

Edit `.env`:
```
TWELVE_API_KEY=your_key_here
FINNHUB_API_KEY=your_key_here
PORT=5000
ANALYTICS_URL=http://localhost:8000
```

### Step 3: Install Dependencies

```bash
# Node.js dependencies
npm install
cd client && npm install && cd ..

# Python dependencies
pip install -r requirements.txt
```

### Step 4: Start All Services

**Option A — One command (Linux/Mac):**
```bash
./start.sh
```

**Option B — One command (Windows):**
```batch
start.bat
```

**Option C — Manual (3 terminals):**

Terminal 1 — Analytics Engine:
```bash
cd server/analytics
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Terminal 2 — Node.js API:
```bash
cd server
node server.js
```

Terminal 3 — React Frontend:
```bash
cd client
npm start
```

### Step 5: Verify

- Analytics Engine health: http://localhost:8000/health
- Node.js API health: http://localhost:5000/api/health
- Frontend: http://localhost:3000

Try the full analysis endpoint:
```bash
curl http://localhost:8000/full/AAPL | python -m json.tool
```

---

## API Endpoints

### Analytics Engine (FastAPI, port 8000)

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Service health check |
| `GET /quote/{ticker}` | Real-time quote |
| `GET /history/{ticker}?period=1mo&interval=1d` | OHLCV history as JSON |
| `GET /technicals/{ticker}?period=3mo` | RSI, MACD, SMA, EMA, Bollinger |
| `GET /news/{ticker}?limit=10` | Recent news articles |
| `GET /full/{ticker}` | Everything combined |

### Node.js API (Express, port 5000)

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check (includes analytics engine status) |
| `GET /api/stock/:symbol` | Quote (proxied to analytics engine) |
| `GET /api/stock/:symbol/history` | History (proxied) |
| `GET /api/stock/:symbol/technicals` | Technicals (proxied) |
| `GET /api/stock/:symbol/news` | News (proxied) |
| `GET /api/stock/:symbol/full` | Full analysis (proxied) |
| `GET /api/stock/:symbol/graph` | **LEGACY** — redirects to /history |

---

## What's Next (Phase 2)

Phase 2 will replace the simple SVG sparkline with interactive Recharts components, add technical indicator overlays, and build the chatbot UI panel.
