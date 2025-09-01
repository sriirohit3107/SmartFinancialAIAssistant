# 🚀 Deploying SmartFinancial AI to Streamlit Cloud

This repository now includes a Streamlit app (`streamlit_app.py`) that replicates the core experience: market summary (SPY, DIA, QQQ), stock search, and last-month price chart.

## ✅ What you need
- A GitHub repository with this code
- Streamlit Cloud account: https://share.streamlit.io/

## 📦 Files used by Streamlit
- `streamlit_app.py`
- `requirements.txt` (includes streamlit, requests, yfinance, matplotlib, pandas, numpy)

## 🔧 Secrets (optional, recommended)
Add a Twelve Data API key for more accurate real-time quotes.

Streamlit Cloud → App → Settings → Secrets, then paste:
```
TWELVE_API_KEY="your_twelve_data_api_key"
```

If no key is provided, the app falls back to `yfinance` for quotes.

## 🌐 Deploy Steps
1. Push your repository to GitHub
2. Go to https://share.streamlit.io/
3. New app → Select this repo
4. Main file path: `streamlit_app.py`
5. Deploy

## 🧪 Local run (optional)
```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```

## 🔍 Notes
- Streamlit app is Python-only and does not require the Node/Express server
- The original Node backend remains useful for REST APIs and can be deployed separately (Railway/Render)
- You can host both: Streamlit for UI, Node for APIs, if needed

---

You’re ready to go live on Streamlit Cloud! 🎉
