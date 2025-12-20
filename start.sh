#!/bin/bash
# JobVerse Quick Start Script for Linux/Mac

echo "================================================"
echo "  JobVerse - AI-Powered Job Portal"
echo "================================================"
echo ""

echo "[1/3] Checking prerequisites..."

# Check Java
if ! command -v java &> /dev/null; then
    echo "ERROR: Java 17+ is not installed"
    echo "Please install Java 17 from https://adoptium.net/"
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Java installed: $(java -version 2>&1 | head -n 1)"
echo "✓ Node.js installed: $(node -v)"
echo ""

echo "[2/3] Starting Backend (Spring Boot)..."
cd jobverse-backend
gnome-terminal --tab --title="JobVerse Backend" -- bash -c "mvn spring-boot:run; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && mvn spring-boot:run"' 2>/dev/null || \
mvn spring-boot:run &
cd ..

echo "Waiting for backend to initialize..."
sleep 15

echo "[3/3] Starting Frontend (React + Vite)..."
cd jobverse
gnome-terminal --tab --title="JobVerse Frontend" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && npm run dev"' 2>/dev/null || \
npm run dev &
cd ..

echo ""
echo "================================================"
echo "  JobVerse is starting up!"
echo "================================================"
echo ""
echo "Backend:  http://localhost:8080/api"
echo "Frontend: http://localhost:5173"
echo "Swagger:  http://localhost:8080/api/swagger-ui.html"
echo ""
echo "Press Ctrl+C to exit"

# Keep script running
wait
