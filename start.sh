#!/bin/bash
# ============================================
# SmartFinancial AI — Start All Services
# ============================================
# Starts:
#   1. FastAPI Analytics Engine (port 8000)
#   2. Node.js API Server (port 5000)
#   3. React Dev Server (port 3000)

set -e

echo "🚀 Starting SmartFinancial AI..."
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# 1. Start Analytics Engine (background)
echo "🐍 Starting Analytics Engine on port 8000..."
cd server/analytics
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
ANALYTICS_PID=$!
cd ../..
echo "   Analytics Engine PID: $ANALYTICS_PID"

# Wait for analytics engine to be ready
echo "   Waiting for Analytics Engine..."
sleep 3

# 2. Start Node.js backend (background)
echo "🖥️  Starting Node.js API on port 5000..."
cd server
node server.js &
NODE_PID=$!
cd ..
echo "   Node.js PID: $NODE_PID"

# 3. Start React frontend
echo "🌐 Starting React frontend on port 3000..."
cd client
npm start &
REACT_PID=$!
cd ..
echo "   React PID: $REACT_PID"

echo ""
echo "✅ All services running:"
echo "   📊 Analytics Engine: http://localhost:8000"
echo "   🖥️  API Server:      http://localhost:5000"
echo "   🌐 Frontend:         http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services."

# Trap Ctrl+C to kill all background processes
trap "echo '🛑 Stopping...'; kill $ANALYTICS_PID $NODE_PID $REACT_PID 2>/dev/null; exit" SIGINT SIGTERM

# Wait for any process to exit
wait
