@echo off
title PadelSense Court - Остановка проекта
color 0C

echo ========================================
echo   PadelSense Court - Остановка проекта
echo ========================================
echo.

echo [1/4] Остановка PostgreSQL...
docker compose down

echo.
echo [2/4] Остановка всех Python процессов...
taskkill /f /im python.exe 2>nul

echo.
echo [3/4] Остановка всех Node.js процессов...
taskkill /f /im node.exe 2>nul

echo.
echo [4/4] Остановка Cloudflare Tunnel...
taskkill /f /im cloudflared.exe 2>nul

echo.
echo ========================================
echo   Проект остановлен!
echo ========================================
echo.
echo Нажмите любую клавишу для выхода...
pause >nul
