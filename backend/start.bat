@echo off
echo ========================================
echo   C4 Payments - Server Startup
echo ========================================
echo.

cd /d "%~dp0"

echo Checking if port 4000 is in use...
netstat -ano | findstr :4000 >nul
if %errorlevel% == 0 (
    echo.
    echo WARNING: Port 4000 is already in use!
    echo Please stop the existing server first.
    echo.
    echo To find and stop the process:
    echo   netstat -ano ^| findstr :4000
    echo   taskkill /PID ^<process_id^> /F
    echo.
    pause
    exit /b 1
)

echo Port 4000 is available.
echo.
echo Starting server...
echo.
node src/server.js

pause

