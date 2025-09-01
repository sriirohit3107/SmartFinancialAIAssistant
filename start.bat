@echo off
echo 🚀 Starting SmartFinancial AI...
echo.

echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo 📦 Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install client dependencies
    pause
    exit /b 1
)
cd ..

echo 🐍 Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ⚠️  Warning: Some Python dependencies may not have installed correctly
    echo    You can try: python -m pip install -r requirements.txt
)

echo.
echo 🔑 IMPORTANT: Make sure you have created a .env file with your TWELVE_API_KEY
echo    Copy env.example to .env and add your API key
echo.

echo 🚀 Starting the application...
npm run dev-full

pause
