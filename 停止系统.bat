@echo off
title System Stop

echo ========================================
echo   Management System - Stop Script
echo ========================================
echo.

echo Stopping backend service...
taskkill /F /FI "WINDOWTITLE eq Backend*" >nul 2>&1

echo Stopping frontend service...
taskkill /F /FI "WINDOWTITLE eq Frontend*" >nul 2>&1

echo.
echo Done!
pause
