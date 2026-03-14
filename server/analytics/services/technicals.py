"""
Technical Analysis Service

Computes standard indicators from a pandas OHLCV DataFrame:
    - SMA  (Simple Moving Average)
    - EMA  (Exponential Moving Average)
    - RSI  (Relative Strength Index)
    - MACD (Moving Average Convergence Divergence)
    - Bollinger Bands

All methods return JSON-serialisable lists (matching the dates in the source data).
"""

import numpy as np
import pandas as pd
from typing import Optional


class TechnicalAnalysis:
    """Compute technical indicators from an OHLCV DataFrame."""

    def __init__(self, df: pd.DataFrame):
        # Normalise column names
        self.df = df.copy()
        if isinstance(self.df.columns, pd.MultiIndex):
            self.df.columns = self.df.columns.get_level_values(0)
        self.close: pd.Series = self.df["Close"].astype(float)
        self.dates = [d.strftime("%Y-%m-%d") for d in self.df.index]

    # ------------------------------------------------------------------
    # SMA
    # ------------------------------------------------------------------
    def sma(self, window: int = 20) -> dict:
        values = self.close.rolling(window=window).mean()
        return {
            "window": window,
            "dates": self.dates,
            "values": _to_list(values),
            "current": _last(values),
        }

    # ------------------------------------------------------------------
    # EMA
    # ------------------------------------------------------------------
    def ema(self, span: int = 12) -> dict:
        values = self.close.ewm(span=span, adjust=False).mean()
        return {
            "span": span,
            "dates": self.dates,
            "values": _to_list(values),
            "current": _last(values),
        }

    # ------------------------------------------------------------------
    # RSI
    # ------------------------------------------------------------------
    def rsi(self, window: int = 14) -> dict:
        delta = self.close.diff()
        gain = delta.where(delta > 0, 0.0)
        loss = -delta.where(delta < 0, 0.0)

        avg_gain = gain.rolling(window=window, min_periods=window).mean()
        avg_loss = loss.rolling(window=window, min_periods=window).mean()

        # Use Wilder's smoothing after the initial SMA seed
        for i in range(window, len(avg_gain)):
            avg_gain.iloc[i] = (avg_gain.iloc[i - 1] * (window - 1) + gain.iloc[i]) / window
            avg_loss.iloc[i] = (avg_loss.iloc[i - 1] * (window - 1) + loss.iloc[i]) / window

        rs = avg_gain / avg_loss
        rsi_values = 100 - (100 / (1 + rs))

        current = _last(rsi_values)
        signal = "neutral"
        if current is not None:
            if current >= 70:
                signal = "overbought"
            elif current <= 30:
                signal = "oversold"

        return {
            "window": window,
            "dates": self.dates,
            "values": _to_list(rsi_values),
            "current": current,
            "signal": signal,
        }

    # ------------------------------------------------------------------
    # MACD
    # ------------------------------------------------------------------
    def macd(self, fast: int = 12, slow: int = 26, signal_window: int = 9) -> dict:
        ema_fast = self.close.ewm(span=fast, adjust=False).mean()
        ema_slow = self.close.ewm(span=slow, adjust=False).mean()
        macd_line = ema_fast - ema_slow
        signal_line = macd_line.ewm(span=signal_window, adjust=False).mean()
        histogram = macd_line - signal_line

        current_macd = _last(macd_line)
        current_signal = _last(signal_line)
        trend = "neutral"
        if current_macd is not None and current_signal is not None:
            if current_macd > current_signal:
                trend = "bullish"
            elif current_macd < current_signal:
                trend = "bearish"

        return {
            "fast": fast,
            "slow": slow,
            "signal_window": signal_window,
            "dates": self.dates,
            "macd_line": _to_list(macd_line),
            "signal_line": _to_list(signal_line),
            "histogram": _to_list(histogram),
            "current_macd": current_macd,
            "current_signal": current_signal,
            "trend": trend,
        }

    # ------------------------------------------------------------------
    # Bollinger Bands
    # ------------------------------------------------------------------
    def bollinger_bands(self, window: int = 20, num_std: float = 2.0) -> dict:
        middle = self.close.rolling(window=window).mean()
        std = self.close.rolling(window=window).std()
        upper = middle + (std * num_std)
        lower = middle - (std * num_std)

        return {
            "window": window,
            "num_std": num_std,
            "dates": self.dates,
            "upper": _to_list(upper),
            "middle": _to_list(middle),
            "lower": _to_list(lower),
            "current_upper": _last(upper),
            "current_middle": _last(middle),
            "current_lower": _last(lower),
        }

    # ------------------------------------------------------------------
    # Summary snapshot (latest values only, no arrays)
    # ------------------------------------------------------------------
    def summary(self) -> dict:
        """
        Compact summary of the latest indicator values.
        Useful for the LLM context window — no need to send full arrays.
        """
        rsi_data = self.rsi(14)
        macd_data = self.macd()
        bb_data = self.bollinger_bands(20)
        current_price = _last(self.close)

        # Price position relative to Bollinger Bands
        bb_position = None
        if (
            current_price is not None
            and bb_data["current_upper"] is not None
            and bb_data["current_lower"] is not None
        ):
            bb_range = bb_data["current_upper"] - bb_data["current_lower"]
            if bb_range > 0:
                bb_position = round(
                    (current_price - bb_data["current_lower"]) / bb_range, 4
                )

        return {
            "current_price": current_price,
            "sma_20": _last(self.close.rolling(20).mean()),
            "sma_50": _last(self.close.rolling(50).mean()),
            "ema_12": _last(self.close.ewm(span=12, adjust=False).mean()),
            "ema_26": _last(self.close.ewm(span=26, adjust=False).mean()),
            "rsi_14": rsi_data["current"],
            "rsi_signal": rsi_data["signal"],
            "macd_value": macd_data["current_macd"],
            "macd_signal": macd_data["current_signal"],
            "macd_trend": macd_data["trend"],
            "bollinger_upper": bb_data["current_upper"],
            "bollinger_lower": bb_data["current_lower"],
            "bollinger_position": bb_position,
        }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _to_list(series: pd.Series) -> list:
    """Convert Series to list with NaN → None, rounded to 4 decimals."""
    return [
        None if (v is None or (isinstance(v, float) and np.isnan(v))) else round(float(v), 4)
        for v in series
    ]


def _last(series: pd.Series) -> Optional[float]:
    """Get the last non-NaN value from a Series."""
    if series is None or series.empty:
        return None
    val = series.iloc[-1]
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return None
    return round(float(val), 4)
