"""
Stock Data Service

Fetches real-time quotes and historical OHLCV data.
Primary source: Twelve Data API
Fallback: yfinance (always available, no API key needed)
"""

import logging
from datetime import datetime
from typing import Optional

import requests
import yfinance as yf
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

# Map our period strings to yfinance period strings
PERIOD_MAP = {
    "1w": "5d",
    "1mo": "1mo",
    "3mo": "3mo",
    "6mo": "6mo",
    "1y": "1y",
    "2y": "2y",
    "5y": "5y",
}


class StockDataService:
    """Unified stock data provider with Twelve Data → yfinance fallback."""

    def __init__(self, twelve_api_key: Optional[str] = None):
        self.twelve_api_key = twelve_api_key
        self.twelve_base = "https://api.twelvedata.com"
        if self.twelve_api_key:
            logger.info("Twelve Data API key configured ✅")
        else:
            logger.warning("No Twelve Data API key — using yfinance only")

    # ------------------------------------------------------------------
    # Quote
    # ------------------------------------------------------------------

    def get_quote(self, ticker: str) -> Optional[dict]:
        """Get a real-time quote. Tries Twelve Data first, then yfinance."""
        data = self._quote_twelvedata(ticker) if self.twelve_api_key else None
        if data is None:
            data = self._quote_yfinance(ticker)
        return data

    def _quote_twelvedata(self, ticker: str) -> Optional[dict]:
        try:
            resp = requests.get(
                f"{self.twelve_base}/quote",
                params={"symbol": ticker, "apikey": self.twelve_api_key},
                timeout=10,
            )
            raw = resp.json()
            if isinstance(raw, dict) and raw.get("status") == "error":
                logger.warning(f"Twelve Data error for {ticker}: {raw.get('message')}")
                return None
            return {
                "symbol": raw.get("symbol"),
                "name": raw.get("name"),
                "exchange": raw.get("exchange"),
                "currency": raw.get("currency"),
                "datetime": raw.get("datetime"),
                "open": _safe_float(raw.get("open")),
                "high": _safe_float(raw.get("high")),
                "low": _safe_float(raw.get("low")),
                "close": _safe_float(raw.get("close")),
                "previous_close": _safe_float(raw.get("previous_close")),
                "change": _safe_float(raw.get("change")),
                "percent_change": _safe_float(raw.get("percent_change")),
                "volume": _safe_float(raw.get("volume")),
                "average_volume": _safe_float(raw.get("average_volume")),
                "fifty_two_week": raw.get("fifty_two_week"),
                "source": "twelvedata",
            }
        except Exception as e:
            logger.error(f"Twelve Data request failed for {ticker}: {e}")
            return None

    def _quote_yfinance(self, ticker: str) -> Optional[dict]:
        try:
            t = yf.Ticker(ticker)
            info = t.fast_info
            price = info.get("last_price") or info.get("lastPrice")
            prev = info.get("previous_close") or info.get("previousClose")
            if price is None:
                return None

            change = (price - prev) if prev else None
            pct = (change / prev * 100) if (change is not None and prev) else None

            # Try to get full info for name/exchange (may be slow)
            full_info = {}
            try:
                full_info = t.info or {}
            except Exception:
                pass

            return {
                "symbol": ticker.upper(),
                "name": full_info.get("shortName") or ticker.upper(),
                "exchange": full_info.get("exchange", ""),
                "currency": info.get("currency", "USD"),
                "datetime": datetime.utcnow().strftime("%Y-%m-%d"),
                "open": _safe_float(info.get("open")),
                "high": _safe_float(info.get("dayHigh")),
                "low": _safe_float(info.get("dayLow")),
                "close": _safe_float(price),
                "previous_close": _safe_float(prev),
                "change": _safe_float(change),
                "percent_change": _safe_float(pct),
                "volume": _safe_float(info.get("volume")),
                "average_volume": _safe_float(info.get("tenDayAverageVolume")),
                "fifty_two_week": {
                    "high": _safe_float(full_info.get("fiftyTwoWeekHigh")),
                    "low": _safe_float(full_info.get("fiftyTwoWeekLow")),
                },
                "source": "yfinance",
            }
        except Exception as e:
            logger.error(f"yfinance quote failed for {ticker}: {e}")
            return None

    # ------------------------------------------------------------------
    # History (JSON response)
    # ------------------------------------------------------------------

    def get_history(
        self, ticker: str, period: str = "1mo", interval: str = "1d"
    ) -> Optional[dict]:
        """Return OHLCV history as JSON-serialisable dict of arrays."""
        df = self.get_history_dataframe(ticker, period, interval)
        if df is None or df.empty:
            return None
        return self._dataframe_to_json(df, ticker)

    def get_history_dataframe(
        self, ticker: str, period: str = "1mo", interval: str = "1d"
    ) -> Optional[pd.DataFrame]:
        """Return raw pandas DataFrame of OHLCV data."""
        yf_period = PERIOD_MAP.get(period, period)
        try:
            df = yf.download(ticker, period=yf_period, interval=interval, progress=False)
            if df is None or df.empty:
                return None
            # Flatten MultiIndex columns if present (yfinance sometimes returns these)
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)
            return df
        except Exception as e:
            logger.error(f"yfinance history failed for {ticker}: {e}")
            return None

    def _dataframe_to_json(self, df: pd.DataFrame, ticker: str) -> dict:
        """Convert a pandas OHLCV DataFrame to a JSON-friendly dict."""
        # Replace NaN with None for JSON serialisation
        df = df.where(pd.notnull(df), None)

        return {
            "ticker": ticker,
            "count": len(df),
            "dates": [d.strftime("%Y-%m-%d") for d in df.index],
            "open": _series_to_list(df.get("Open")),
            "high": _series_to_list(df.get("High")),
            "low": _series_to_list(df.get("Low")),
            "close": _series_to_list(df.get("Close")),
            "volume": _series_to_list(df.get("Volume")),
        }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _safe_float(val) -> Optional[float]:
    try:
        if val is None:
            return None
        f = float(val)
        return None if (np.isnan(f) or np.isinf(f)) else round(f, 4)
    except (ValueError, TypeError):
        return None


def _series_to_list(series) -> list:
    """Convert a pandas Series to a list, replacing NaN with None."""
    if series is None:
        return []
    return [None if (v is None or (isinstance(v, float) and np.isnan(v))) else round(float(v), 4) for v in series]
