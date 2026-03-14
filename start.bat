@echo off
REM ============================================
REM SmartFinancial AI — Start All Services (Windows)
REM ============================================
REM Starts:
REM   1. FastAPI Analytics Engine (port 8000)
REM   2. Node.js API Server (port 5000)
REM   3. React Dev Server (port 3000)

echo 🚀 Starting SmartFinancial AI...
echo.

REM 1. Start Analytics Engine
echo 🐍 Starting Analytics Engine on port 8000...
cd server\analytics
start "Analytics Engine" cmd /k "uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
cd ..\..
timeout /t 3 /nobreak >nul

REM 2. Start Node.js backend
echo 🖥️  Starting Node.js API on port 5000...
cd server
start "Node API" cmd /k "node server.js"
cd ..

REM 3. Start React frontend
echo 🌐 Starting React frontend on port 3000...
cd client
start "React App" cmd /k "npm start"
cd ..

echo.
echo ✅ All services starting:
echo    📊 Analytics Engine: http://localhost:8000
echo    🖥️  API Server:      http://localhost:5000
echo    🌐 Frontend:         http://localhost:3000
echo.
echo Close the individual command windows to stop services.
pause
