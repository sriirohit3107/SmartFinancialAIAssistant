import sys
import yfinance as yf
import matplotlib.pyplot as plt
import os

symbol = sys.argv[1]
data = yf.download(symbol, period="1mo")  # 1 month of data

plt.figure(figsize=(10, 4))
plt.plot(data.index, data['Close'], label='Close Price')
plt.title(f"{symbol} - Last Month")
plt.xlabel("Date")
plt.ylabel("Close Price")
plt.legend()
plt.tight_layout()
filename = f"{symbol}_graph.png"
plt.savefig(filename)
plt.close()

# Optionally, clean up old images (not implemented here) 