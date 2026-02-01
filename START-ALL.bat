@echo off
chcp 65001 >nul
title PadelSense — запуск всего
cd /d "%~dp0"

echo.
echo ============================================================
echo   PadelSense — запуск в отдельных окнах
echo   (Backend, Mini App, Бот, Туннели)
echo ============================================================
echo.

if not exist "package.json" (
  echo [ОШИБКА] Запускай из папки padelsense-court (где лежит package.json)
  pause
  exit /b 1
)

set "NODE_EXE="
where node >nul 2>nul && set NODE_EXE=node
if not defined NODE_EXE if exist "C:\Program Files\nodejs\node.exe" set "PATH=%PATH%;C:\Program Files\nodejs" && set NODE_EXE=node
if not defined NODE_EXE if exist "%LOCALAPPDATA%\Programs\node\node.exe" set "PATH=%PATH%;%LOCALAPPDATA%\Programs\node" && set NODE_EXE=node
if not defined NODE_EXE (
  echo [ОШИБКА] Node.js не найден.
  echo.
  echo Используй ZAPUSK-PROSTO.bat - он запускает всё БЕЗ Node (5 окон).
  echo Или установи Node.js с https://nodejs.org/ и перезапусти.
  echo.
  pause
  exit /b 1
)

if not exist ".env" (
  echo [ВНИМАНИЕ] Файл .env не найден. Создай .env и укажи BOT_TOKEN.
  echo.
)

echo Запускаю node scripts/start-windows.js ...
echo.
node scripts/start-windows.js

echo.
if errorlevel 1 (
  echo [ОШИБКА] Скрипт завершился с ошибкой. Смотри сообщения выше.
) else (
  echo Готово. Закрой это окно когда захочешь остановить туннели.
)
echo.
pause
