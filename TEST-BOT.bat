@echo off
title PadelSense Court - Тест бота
color 0B

echo ========================================
echo   PadelSense Court - Тест Telegram бота
echo ========================================
echo.

echo Проверка токена и подключения к Telegram...
echo.

python test-bot-simple.py

echo.
echo ========================================
echo   Тест завершен!
echo ========================================
echo.
echo Нажмите любую клавишу для выхода...
pause >nul
