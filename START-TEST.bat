@echo off
title PadelSense - Тестовый запуск
color 0B

echo ========================================
echo   PadelSense - Тестовый запуск
echo ========================================
echo.

echo [1/4] Запуск PostgreSQL...
docker compose up -d postgres
timeout /t 3 >nul

echo.
echo [2/4] Запуск Backend API...
start "Backend API" cmd /k "title Backend API && python -m backend.main"
timeout /t 3 >nul

echo.
echo [3/4] Запуск Telegram бота...
start "Telegram Bot" cmd /k "title Telegram Bot && python -m bot.main"
timeout /t 3 >nul

echo.
echo [4/4] Запуск туннеля для API...
start "API Tunnel" cmd /k "title API Tunnel && npx localtunnel --port 8000 --subdomain padelsense-api"

echo.
echo ========================================
echo   Проект запущен для тестирования!
echo ========================================
echo.
echo Backend API:    http://localhost:8000
echo Health Check:   http://localhost:8000/health
echo Metrics:        http://localhost:8000/metrics
echo Mini App Vercel: https://padelsense-mini-app.vercel.app
echo API Tunnel:     https://padelsense-api.loca.lt
echo Telegram Bot:   @PadelSenseTestBot
echo.
echo Тестирование:
echo 1. Проверь http://localhost:8000/health
echo 2. Открой https://padelsense-mini-app.vercel.app
echo 3. Протестируй регистрацию
echo 4. Проверь в Telegram: /start
echo.
echo Нажми любую клавишу для выхода...
pause >nul
