#!/bin/bash

echo "🚀 Starting SmartFinancial AI..."
echo

echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "📦 Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi
cd ..

echo "🐍 Installing Python dependencies..."
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Some Python dependencies may not have installed correctly"
    echo "   You can try: python3 -m pip install -r requirements.txt"
fi

echo
echo "🔑 IMPORTANT: Make sure you have created a .env file with your TWELVE_API_KEY"
echo "   Copy env.example to .env and add your API key"
echo

echo "🚀 Starting the application..."
npm run dev-full
