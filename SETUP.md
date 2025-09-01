# 🚀 SmartFinancial AI - Setup Guide

This guide will help you set up and run the SmartFinancial AI project on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://www.python.org/downloads/)
- **Git** - [Download here](https://git-scm.com/)

## 🔑 API Key Setup

### 1. Get Twelve Data API Key

1. Visit [Twelve Data](https://twelvedata.com/)
2. Sign up for a free account
3. Navigate to your dashboard and copy your API key
4. Create a `.env` file in the project root with:

```bash
TWELVE_API_KEY=your_api_key_here
PORT=5000
NODE_ENV=development
```

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/SmartFinancialAIAssistant.git
cd SmartFinancialAIAssistant
```

### 2. Install Dependencies

#### Install Node.js Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

#### Install Python Dependencies
```bash
pip install -r requirements.txt
```

**Note:** If you're on Windows and `pip` doesn't work, try:
```bash
python -m pip install -r requirements.txt
```

## 🚀 Running the Application

### Option 1: Run Both Frontend and Backend (Recommended)

```bash
# From the project root
npm run dev-full
```

This will start both the backend server and React frontend concurrently.

### Option 2: Run Separately

#### Start Backend Server
```bash
# From the project root
npm run dev
# or
npm start
```

#### Start Frontend (in a new terminal)
```bash
# From the project root
cd client
npm start
```

## 🌐 Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## 📊 Testing the Application

1. **Market Summary**: The dashboard will automatically load major market indices (S&P 500, Dow Jones, Nasdaq)
2. **Stock Search**: Use the search bar to look up any stock symbol (e.g., AAPL, TSLA, GOOGL)
3. **Stock Charts**: Click on a stock to view its price chart for the last month

## 🔧 Troubleshooting

### Common Issues

#### 1. "Python not found" Error
- Ensure Python is installed and added to your system PATH
- On Windows, try using `python` instead of `python3`
- Verify installation: `python --version` or `python3 --version`

#### 2. "TWELVE_API_KEY is not configured" Error
- Check that your `.env` file exists in the project root
- Verify the API key is correct and not wrapped in quotes
- Restart the server after making changes

#### 3. "Failed to fetch stock data" Error
- Verify your Twelve Data API key is valid
- Check if you've exceeded your API rate limit
- Ensure the stock symbol exists

#### 4. Graph Generation Issues
- Ensure all Python dependencies are installed: `pip install -r requirements.txt`
- Check that matplotlib can create files in the current directory
- Verify Python has write permissions

#### 5. Port Already in Use
- Change the port in your `.env` file: `PORT=5001`
- Or kill the process using the port: `lsof -ti:5000 | xargs kill -9`

### Debug Mode

To run with more verbose logging:

```bash
# Set debug environment variable
set DEBUG=* && npm run dev  # Windows
DEBUG=* npm run dev         # Mac/Linux
```

## 📁 Project Structure

```
SmartFinancialAIAssistant/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── ...
│   └── public/
├── server/                 # Node.js backend
│   ├── controllers/        # Express controllers
│   ├── routes/            # Express routes
│   ├── services/          # Business logic
│   ├── scripts/           # Python scripts
│   └── ...
├── requirements.txt        # Python dependencies
├── package.json           # Node.js dependencies
└── .env                   # Environment variables
```

## 🧪 Development

### Adding New Features

1. **Frontend Components**: Add new components in `client/src/components/`
2. **Backend Routes**: Add new routes in `server/routes/`
3. **Python Scripts**: Add new scripts in `server/scripts/`

### Code Style

- **JavaScript**: Use ES6+ features, consistent indentation
- **Python**: Follow PEP 8 guidelines
- **CSS**: Use BEM methodology for class naming

## 📚 API Documentation

### Stock Endpoints

- `GET /api/stock/:symbol` - Get stock quote data
- `GET /api/stock/:symbol/graph` - Get stock price chart

### Example Usage

```bash
# Get stock quote for Apple
curl http://localhost:5000/api/stock/AAPL

# Get stock chart for Apple
curl http://localhost:5000/api/stock/AAPL/graph
```

## 🚀 Deployment

### Environment Variables for Production

```bash
NODE_ENV=production
PORT=5000
TWELVE_API_KEY=your_production_api_key
```

### Build for Production

```bash
# Build React app
cd client
npm run build
cd ..

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Include your operating system, Node.js version, and Python version

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy coding! 🎉**
