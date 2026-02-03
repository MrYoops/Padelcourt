@echo off
title PadelSense - Быстрый фикс
color 0C

echo ========================================
echo   PadelSense - Быстрый фикс регистрации
echo ========================================
echo.

echo [1/3] Обновление Mini App на Vercel...
echo Загружаем исправления в GitHub...
git add .
git commit -m "🔧 Fix: Исправлена регистрация в Mini App

- Исправлен API_BASE для Vercel
- Добавлен локальный туннель в CORS
- Исправлена интеграция с Telegram WebApp
- Добавлено логирование ошибок"
git push origin master

echo.
echo [2/3] Ожидание деплоя на Vercel...
echo Vercel автоматически обновится в течение 1-2 минут
timeout /t 10 >nul

echo.
echo [3/3] Запуск компонентов...
start "Backend API" cmd /k "title Backend API && python -m backend.main"
timeout /t 3 >nul
start "API Tunnel" cmd /k "title API Tunnel && npx localtunnel --port 8000 --subdomain padelsense-api"
timeout /t 3 >nul
start "Telegram Bot" cmd /k "title Telegram Bot && python -m bot.main"

echo.
echo ========================================
echo   Фикс завершен! Проверяй:
echo ========================================
echo.
echo 1. Mini App: https://padelsense-mini-app.vercel.app
echo 2. API: https://padelsense-api.loca.lt
echo 3. Telegram: @PadelSenseTestBot → /start
echo.
echo Открой Mini App в Telegram и протестируй регистрацию!
echo.
echo Нажми любую клавишу для выхода...
pause >nul
