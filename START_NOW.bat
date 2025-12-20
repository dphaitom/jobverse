@echo off
cls
echo ============================================================
echo   JobVerse - Quick Start
echo ============================================================
echo.

echo [1/3] Stopping old backend...
taskkill /F /IM java.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo Done!

echo.
echo [2/3] Starting fresh backend...
cd jobverse-backend
start "JobVerse Backend" cmd /k "mvn spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=prod"
cd ..

echo.
echo [3/3] Waiting for backend to start...
echo.
echo ┌────────────────────────────────────────────────────┐
echo │                                                    │
echo │  ⏳ Please wait 30-40 seconds...                   │
echo │                                                    │
echo │  Backend is starting up with all fixes applied:   │
echo │    ✅ Fixed LazyInitializationException           │
echo │    ✅ Added @Transactional annotations            │
echo │    ✅ All enum values corrected                   │
echo │    ✅ All controllers created                     │
echo │                                                    │
echo └────────────────────────────────────────────────────┘
echo.
echo After 30-40 seconds:
echo   1. Open browser: http://localhost:3000
echo   2. Or test APIs: .\TEST_APIS.bat
echo.
echo Press any key to close this window...
pause >nul
