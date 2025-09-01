import os
import time
from datetime import datetime

import streamlit as st
import pandas as pd
import yfinance as yf
import requests
import matplotlib.pyplot as plt

# ---------- Config ----------
st.set_page_config(
    page_title="SmartFinancial AI - Streamlit",
    page_icon="💼",
    layout="wide",
)

PRIMARY_ETFS = {
    "S&P 500 (SPY)": "SPY",
    "Dow Jones (DIA)": "DIA",
    "Nasdaq (QQQ)": "QQQ",
}

TWELVE_API_KEY = None
try:
    TWELVE_API_KEY = st.secrets.get("TWELVE_API_KEY")
except Exception:
    TWELVE_API_KEY = os.getenv("TWELVE_API_KEY")

# ---------- Helpers ----------

def fetch_quote_twelvedata(symbol: str):
    if not TWELVE_API_KEY:
        return None
    try:
        resp = requests.get(
            "https://api.twelvedata.com/quote",
            params={"symbol": symbol, "apikey": TWELVE_API_KEY},
            timeout=10,
        )
        data = resp.json()
        if isinstance(data, dict) and data.get("status") == "error":
            return None
        return data
    except Exception:
        return None


def fetch_quote_yfinance(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.fast_info
        price = info.get("last_price") or info.get("lastPrice")
        previous_close = info.get("previous_close") or info.get("previousClose")
        currency = info.get("currency") or "USD"
        change = None
        percent_change = None
        if price is not None and previous_close:
            change = price - previous_close
            if previous_close:
                percent_change = (change / previous_close) * 100
        return {
            "symbol": symbol.upper(),
            "name": ticker.info.get("shortName") or symbol.upper(),
            "exchange": ticker.info.get("exchange") or "",
            "currency": currency,
            "datetime": datetime.utcnow().strftime("%Y-%m-%d"),
            "open": info.get("open"),
            "high": info.get("dayHigh"),
            "low": info.get("dayLow"),
            "close": price,
            "previous_close": previous_close,
            "change": change,
            "percent_change": percent_change,
            "volume": info.get("volume"),
            "average_volume": info.get("tenDayAverageVolume"),
        }
    except Exception:
        return None


def fetch_quote(symbol: str):
    data = fetch_quote_twelvedata(symbol)
    if data:
        # Normalize Twelve Data payload
        return {
            "symbol": data.get("symbol"),
            "name": data.get("name"),
            "exchange": data.get("exchange"),
            "currency": data.get("currency"),
            "datetime": data.get("datetime"),
            "open": _safe_float(data.get("open")),
            "high": _safe_float(data.get("high")),
            "low": _safe_float(data.get("low")),
            "close": _safe_float(data.get("close")),
            "previous_close": _safe_float(data.get("previous_close")),
            "change": _safe_float(data.get("change")),
            "percent_change": _safe_float(data.get("percent_change")),
            "volume": _safe_float(data.get("volume")),
            "average_volume": _safe_float(data.get("average_volume")),
        }
    # fallback to yfinance
    return fetch_quote_yfinance(symbol)


def _safe_float(val):
    try:
        if val is None:
            return None
        return float(val)
    except Exception:
        return None


def plot_last_month(symbol: str):
    data = yf.download(symbol, period="1mo", interval="1d")
    if data is None or data.empty:
        st.warning("No data available for chart.")
        return

    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.plot(data.index, data['Close'], color="#00ff88", linewidth=2.0)
    ax.set_title(f"{symbol} - Last Month", color="white")
    ax.set_xlabel("Date", color="#b0b0b0")
    ax.set_ylabel("Close Price", color="#b0b0b0")
    ax.grid(True, alpha=0.2, color="#444")
    st.pyplot(fig, clear_figure=True)


# ---------- UI ----------
st.markdown(
    """
    <div style="text-align:center;">
      <h1>💼 SmartFinancial AI</h1>
      <p>Your intelligent financial companion for stock analysis, market insights, and investment guidance</p>
    </div>
    """,
    unsafe_allow_html=True,
)

# Market Summary
with st.container():
    st.subheader("📊 Market Summary")
    cols = st.columns(len(PRIMARY_ETFS))
    for (label, symbol), col in zip(PRIMARY_ETFS.items(), cols):
        with col:
            data = fetch_quote(symbol)
            if not data:
                st.info(f"{label}: unavailable")
                continue
            price = data.get("close")
            pct = data.get("percent_change")
            delta_str = ""
            if pct is not None:
                delta_str = f" ({pct:+.2f}%)"
            st.metric(label=label, value=f"${price:.2f}" if price else "--", delta=delta_str)

st.divider()

# Search
with st.container():
    st.subheader("🔎 Search Any Stock")
    col1, col2 = st.columns([3, 1])
    with col1:
        symbol = st.text_input("Symbol", value="AAPL", max_chars=10).upper().strip()
    with col2:
        search = st.button("Search")

    if search and symbol:
        with st.spinner("Fetching quote..."):
            quote = fetch_quote(symbol)
            time.sleep(0.2)
        if not quote:
            st.error("Invalid symbol or data unavailable.")
        else:
            st.markdown(f"### {symbol} - {quote.get('name') or ''}")
            c1, c2, c3, c4 = st.columns(4)
            c1.metric("Price", f"${quote.get('close'):.2f}" if quote.get('close') else "--")
            c2.metric("Change", f"{quote.get('change'):+.2f}" if quote.get('change') is not None else "--")
            pct = quote.get('percent_change')
            c3.metric("% Change", f"{pct:+.2f}%" if pct is not None else "--")
            c4.metric("Volume", f"{int(quote.get('volume')):,}" if quote.get('volume') else "--")

            st.caption(f"Exchange: {quote.get('exchange') or ''} | Currency: {quote.get('currency') or ''} | Date: {quote.get('datetime')}")

            st.subheader("📈 Price Chart (Last Month)")
            plot_last_month(symbol)

st.divider()

st.caption("Tip: Add TWELVE_API_KEY to Streamlit Secrets for more accurate real-time quotes.")
