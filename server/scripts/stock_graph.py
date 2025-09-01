import sys
import yfinance as yf
import matplotlib.pyplot as plt
import os
from datetime import datetime, timedelta
import matplotlib.dates as mdates

def generate_stock_graph(symbol):
    try:
        # Download stock data for the last month
        stock = yf.Ticker(symbol)
        data = stock.download(period="1mo", interval="1d")
        
        if data.empty:
            print(f"❌ No data available for {symbol}")
            return None
        
        # Create figure with dark theme
        plt.style.use('dark_background')
        fig, ax = plt.subplots(figsize=(12, 6))
        
        # Plot the closing price
        ax.plot(data.index, data['Close'], 
                color='#00ff88', 
                linewidth=2.5, 
                label='Close Price')
        
        # Customize the plot
        ax.set_title(f"{symbol.upper()} - Last Month Price Chart", 
                    fontsize=16, 
                    fontweight='bold', 
                    color='white',
                    pad=20)
        
        ax.set_xlabel("Date", fontsize=12, color='#b0b0b0')
        ax.set_ylabel("Price (USD)", fontsize=12, color='#b0b0b0')
        
        # Format x-axis dates
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%m/%d'))
        ax.xaxis.set_major_locator(mdates.WeekdayLocator(interval=1))
        plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha='right')
        
        # Customize grid
        ax.grid(True, alpha=0.2, color='#444')
        ax.set_facecolor('#1e1e1e')
        
        # Add legend
        ax.legend(loc='upper left', framealpha=0.8, facecolor='#2d2d2d')
        
        # Add current price annotation
        current_price = data['Close'].iloc[-1]
        ax.annotate(f'${current_price:.2f}', 
                   xy=(data.index[-1], current_price),
                   xytext=(10, 10), 
                   textcoords='offset points',
                   bbox=dict(boxstyle='round,pad=0.5', facecolor='#00ff88', alpha=0.8),
                   fontsize=10, 
                   color='black',
                   fontweight='bold')
        
        # Tight layout and save
        plt.tight_layout()
        filename = f"{symbol}_graph.png"
        plt.savefig(filename, 
                   dpi=300, 
                   bbox_inches='tight', 
                   facecolor='#1e1e1e',
                   edgecolor='none')
        plt.close()
        
        print(f"✅ Graph generated successfully for {symbol}")
        return filename
        
    except Exception as e:
        print(f"❌ Error generating graph for {symbol}: {str(e)}")
        return None

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("❌ Usage: python stock_graph.py <SYMBOL>")
        sys.exit(1)
    
    symbol = sys.argv[1].upper()
    result = generate_stock_graph(symbol)
    
    if result:
        print(f"📊 Graph saved as: {result}")
    else:
        print(f"❌ Failed to generate graph for {symbol}")
        sys.exit(1) 