@echo off
echo ===============================================
echo    RESTART BACKEND - JobVerse
echo ===============================================
echo.

echo [1/3] Stopping old backend process...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    echo Killing process ID: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo [2/3] Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo [3/3] Starting backend...
cd jobverse-backend
start cmd /k "mvnw.cmd spring-boot:run"

echo.
echo ===============================================
echo Backend is restarting in a new window!
echo Wait ~30 seconds for it to fully start.
echo Then test at: http://localhost:8080/api/v1/ai/chat/guest
echo ===============================================
pause
