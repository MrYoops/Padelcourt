@echo off
chcp 65001 >nul
title PadelSense - zapusk vsego
cd /d "%~dp0"

set "DIR=%~dp0"
set "DIR=%DIR:~0,-1%"

rem Добавить Node и Python в PATH, если есть в стандартных местах
if exist "C:\Program Files\nodejs\node.exe" set "PATH=%PATH%;C:\Program Files\nodejs"
if exist "%LOCALAPPDATA%\Programs\node\node.exe" set "PATH=%PATH%;%LOCALAPPDATA%\Programs\node"
if exist "C:\Python313\python.exe" set "PATH=%PATH%;C:\Python313"
if exist "C:\Python312\python.exe" set "PATH=%PATH%;C:\Python312"
if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" set "PATH=%PATH%;%LOCALAPPDATA%\Programs\Python\Python313"
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" set "PATH=%PATH%;%LOCALAPPDATA%\Programs\Python\Python312"

echo.
echo ============================================================
echo   PadelSense - Zapusk vsego (5 okon)
echo ============================================================
echo.

if not exist "package.json" (
  echo [OSHIBKA] Zapuskaj iz papki padelsense-court.
  pause
  exit /b 1
)

echo [1/6] PostgreSQL...
docker compose up -d postgres 2>nul
timeout /t 2 >nul

echo [2/6] Okno Backend...
start "PadelSense - Backend" cmd /k "cd /d ""%DIR%"" && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"
timeout /t 5 >nul

echo [3/6] Okno Mini App...
start "PadelSense - Mini App" cmd /k "cd /d ""%DIR%"" && npx http-server mini-app -p 3000 -c-1 --cors"
timeout /t 3 >nul

echo [4/6] Okno Tunnel Backend...
if exist "cloudflared.exe" (
  start "PadelSense - Tunnel API" cmd /k "cd /d ""%DIR%"" && cloudflared.exe tunnel --url http://localhost:8000"
) else (
  start "PadelSense - Tunnel API" cmd /k "cd /d ""%DIR%"" && cloudflared tunnel --url http://localhost:8000"
)
timeout /t 2 >nul

echo [5/6] Okno Tunnel Mini App...
if exist "cloudflared.exe" (
  start "PadelSense - Tunnel App" cmd /k "cd /d ""%DIR%"" && cloudflared.exe tunnel --url http://localhost:3000"
) else (
  start "PadelSense - Tunnel App" cmd /k "cd /d ""%DIR%"" && cloudflared tunnel --url http://localhost:3000"
)
timeout /t 8 >nul

echo [6/6] Okno Bot...
start "PadelSense - Bot" cmd /k "cd /d ""%DIR%"" && python -m bot.main"

echo.
echo ============================================================
echo   Otkryto 5 okon: Backend, Mini App, 2 tunelya, Bot.
echo   Esli okna ne poyavilis - otkroj cmd, vvedi: cd /d ""%DIR%""
echo   Potom: ZAPUSK-PROSTO.bat
echo ============================================================
echo.
pause
