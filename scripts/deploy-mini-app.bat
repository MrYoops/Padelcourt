@echo off
chcp 65001 >nul
:: Скрипт для обновления API_BASE и деплоя на Vercel

echo ===================================
echo 🚀 PadelSense Mini App Deploy
echo ===================================
echo.

:: Проверка аргументов
if "%~1"=="" (
  echo ⚠️  Использование: deploy-mini-app.bat [API_URL]
  echo.
  echo Примеры:
  echo   deploy-mini-app.bat http://localhost:8000
  echo   deploy-mini-app.bat https://abc.trycloudflare.com
  exit /b 1
)

set API_URL=%~1
echo 📍 API_URL: %API_URL%

:: Создание config.js
echo 📝 Создание mini-app/config.js...
(
echo // ===== АВТОГЕНЕРИРУЕМЫЙ ФАЙЛ =====
echo // Создан: %date% %time%
echo // НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ!
echo.
echo window.API_BASE = '%API_URL%';
echo window.DEBUG = true;
echo.
echo function debug(msg) {
echo   if (window.DEBUG) {
echo     console.log('[PadelSense]', new Date().toISOString(), msg);
echo   }
echo }
echo.
echo console.log('[PadelSense] API_BASE =', window.API_BASE);
) > mini-app\config.js

echo ✅ config.js создан

:: Проверка Vercel CLI
where vercel >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo ⚠️  Vercel CLI не найден. Установка...
  npm install -g vercel
)

:: Деплой
echo.
echo 🚀 Деплой на Vercel...
cd mini-app
vercel --prod

cd ..
echo.
echo ===================================
echo ✅ Деплой завершен!
echo ===================================
echo.
echo 🔗 Проверьте URL выше
echo 📝 API_BASE: %API_URL%
echo.
pause
