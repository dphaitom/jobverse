@echo off
echo =============================================
echo   START BACKEND - JobVerse
echo =============================================
echo.

cd jobverse-backend

echo Starting backend server...
echo Please wait ~30 seconds...
echo.

start "JobVerse Backend" mvnw.cmd spring-boot:run

echo.
echo =============================================
echo Backend is starting in a new window!
echo Wait 30 seconds, then test AI Chat
echo =============================================
echo.
pause
