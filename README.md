# 💼 SmartFinancial AI

SmartFinancial AI is a financial analyst agent designed to help users make intelligent investment decisions using deep learning, real-time data, and a conversational chatbot interface.

---

## 🧠 Project Goal
To build a system that:
- 📈 Predicts stock prices using deep learning models
- 📰 Gathers real-time financial news and ratios
- 🧾 Explains predictions with reasoning
- 💬 Acts as a chatbot for investment queries
- 📊 Recommends actions (Buy/Sell/Hold)

---

## 🔧 System Components

### 1. 🔮 Prediction Engine
- **Input:** OHLCV historical stock data
- **Models:** LSTM / XGBoost / ARIMA
- **Output:** 1–7 day price forecasts

### 2. 🤖 LLM Reasoning Agent
- Uses GPT-4 via OpenAI API
- **Tools used:**
  - Yahoo Finance (real-time data)
  - NewsAPI / Finviz (financial news)
  - Custom-trained ML model output
- **Generates:**
  - Summary of predictions
  - Reasoned explanations
  - Buy/Sell/Hold recommendations
  - Confidence scores

### 3. 🧠 Memory Module
- Tracks model prediction accuracy
- Learns over time using feedback

### 4. 🌐 Frontend Chatbot
- Ask questions like:
  - “What will be the price of AAPL tomorrow?”
  - “Which stock is best to buy tomorrow?”
- Backend fetches real-time data + model forecast
- Returns intuitive response from LLM

---

## 💬 Sample Chatbot Queries

**User:** "What’s the price prediction for AAPL tomorrow?"

**Bot:** "Based on our LSTM model and recent market trends, AAPL is expected to close at $192.34, showing slight bullish momentum. Recommendation: Hold."

**User:** "Which S&P 500 stock is best to buy tomorrow?"

**Bot:** "Analyzing current price momentum, RSI, and technical patterns, NVDA appears favorable with strong earnings sentiment. Recommendation: Buy."

---

## 🚀 Tech Stack

| Layer         | Tools                                 |
|--------------|---------------------------------------|
| LLM Agent    | GPT-4 (OpenAI), LangChain             |
| ML Engine    | TensorFlow, Scikit-learn              |
| Data Sources | Yahoo Finance, NewsAPI, Finviz        |
| Memory       | FAISS, Redis, JSON Logs               |
| Chatbot      | Python / Streamlit (Optional)         |
| Visualization| Streamlit, Matplotlib                 |

---

## 📁 Folder Structure

```
SmartFinancialAI/
├── agent/           # GPT-4 reasoning agent logic
├── predictor/       # Price prediction models
├── memory/          # Optional memory and logging
├── dashboard/       # Streamlit UI
├── main.py          # Main CLI or chatbot interface
├── prediction.ipynb # Notebook for model training
├── requirements.txt
└── README.md
```

---

## 📦 Setup Instructions

```sh
git clone https://github.com/sriirohit3107/SmartFinancialAI.git
cd SmartFinancialAI
pip install -r requirements.txt
python main.py
```

---

## ✅ Features Done
- SP500 historical data + indicators
- LSTM model for next-day price prediction
- Binary classification (Up/Down)
- Reasoning agent using GPT-4
- Chatbot answering financial queries

---

## 🚧 Future Work
- Reinforcement Learning for portfolio optimization
- Improve LLM accuracy via function-calling
- Interactive dashboard for live charts and explanations
- Add fine-tuned model on sentiment analysis

