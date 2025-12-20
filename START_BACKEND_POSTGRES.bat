@echo off
REM Start backend with PostgreSQL (not H2)

echo ============================================================
echo   JobVerse Backend - PostgreSQL Mode
echo ============================================================
echo.

cd jobverse-backend

echo [INFO] Starting backend with PostgreSQL...
echo.
echo Profile: PRODUCTION (PostgreSQL + Flyway)
echo Database: localhost:5432/jobverse
echo.
echo ⏳ This will take 30-60 seconds...
echo.

REM Start with production profile (uses PostgreSQL)
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=prod"

pause
