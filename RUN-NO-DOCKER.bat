@echo off

echo 🗄️ Запуск без Docker (используем существующую базу)

start cmd /k "python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

start cmd /k "cd mini-app && npx serve -l 3000"

start cmd /k "npx cloudflared tunnel --url http://localhost:3000"

start cmd /k "python -m bot.main"

pause
