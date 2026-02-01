@echo off
title PadelSense Court - Запуск проекта
color 0A

echo ========================================
echo   PadelSense Court - Запуск проекта
echo ========================================
echo.

echo [1/5] Запуск PostgreSQL...
docker compose up -d postgres
timeout /t 5 >nul

echo.
echo [2/5] Запуск Backend API...
start cmd /k "title Backend API && python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"
timeout /t 3 >nul

echo.
echo [3/5] Запуск Mini App...
start cmd /k "title Mini App && cd mini-app && npx serve -l 3000"
timeout /t 3 >nul

echo.
echo [4/5] Запуск Cloudflare Tunnel...
start cmd /k "title Cloudflare Tunnel && npx cloudflared tunnel --url http://localhost:3000"
timeout /t 3 >nul

echo.
echo [5/5] Запуск Telegram бота...
start cmd /k "title Telegram Bot && cd bot && python -m main"

echo.
echo ========================================
echo   Проект запущен!
echo ========================================
echo.
echo Backend API:    http://localhost:8000
echo Mini App:       http://localhost:3000
echo Telegram Bot:   @PadelSenseTestBot
echo.
echo Нажмите любую клавишу для выхода...
pause >nul
