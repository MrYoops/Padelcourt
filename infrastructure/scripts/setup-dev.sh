#!/usr/bin/env bash
# Setup локальной разработки: проверка окружения, .env, docker-compose up

set -e
cd "$(dirname "$0")/../.."

echo "=== PadelSense: проверка окружения ==="

command -v docker >/dev/null 2>&1 || { echo "Установите Docker."; exit 1; }
command -v python3 >/dev/null 2>&1 || command -v python >/dev/null 2>&1 || { echo "Установите Python 3.11+."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Установите Node.js (для tablet-app)."; exit 1; }

if [ ! -f .env ]; then
  echo "Файл .env не найден. Копирую из .env.example..."
  cp .env.example .env
  echo "Отредактируйте .env и задайте BOT_TOKEN и при необходимости другие переменные."
fi

echo "=== Запуск PostgreSQL и Redis ==="
docker compose up -d

echo "Ожидание готовности PostgreSQL..."
for i in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U padelsense -d padelsense 2>/dev/null; then
    echo "PostgreSQL готов."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "Таймаут ожидания PostgreSQL."
    exit 1
  fi
  sleep 1
done

echo ""
echo "=== Готово ==="
echo "  • PostgreSQL: localhost:5432 (padelsense / devpass)"
echo "  • Redis: localhost:6379"
echo "  • Бот: cd bot && pip install -r requirements.txt && python main.py"
echo "  • Backend: (после создания) cd backend && uvicorn main:app --reload"
echo "  • Планшет: cd tablet-app && npx expo start"
