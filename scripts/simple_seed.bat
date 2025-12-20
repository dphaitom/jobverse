@echo off
REM Simple seed script - No psql required!

echo ============================================================
echo   JobVerse Database Seeder - Simple Version
echo ============================================================
echo.

echo [1/2] Checking if backend is running...
curl -s http://localhost:8080/api/health >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ BACKEND IS NOT RUNNING!
    echo.
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║  PLEASE START BACKEND FIRST!                              ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo Open a NEW terminal and run:
    echo   cd jobverse-backend
    echo   mvn spring-boot:run
    echo.
    echo Wait 60 seconds for backend to fully start, then run this script again.
    echo.
    pause
    exit /b 1
)

echo ✅ Backend is running!
echo.
echo [2/2] Running seed script...
echo.
echo ⏳ Please wait, this may take 10-30 seconds...
echo.

python seed_database.py

echo.
if errorlevel 1 (
    echo.
    echo ❌ Seeding failed!
    echo.
    echo Possible reasons:
    echo   1. Backend just started - wait 30 more seconds and try again
    echo   2. Database password wrong - check seed_database.py line 304
    echo   3. PostgreSQL not running - start PostgreSQL service
    echo.
) else (
    echo.
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║  ✅ SEEDING COMPLETED SUCCESSFULLY!                       ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo Next steps:
    echo   1. Refresh your browser (Ctrl+Shift+R)
    echo   2. Or open: http://localhost:3000
    echo   3. Browse companies and jobs!
    echo.
)

pause
