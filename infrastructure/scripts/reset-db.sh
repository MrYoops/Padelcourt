#!/usr/bin/env bash
# Сброс БД: удаление volumes, повторный подъём контейнеров

set -e
cd "$(dirname "$0")/../.."

echo "ВНИМАНИЕ: все данные PostgreSQL и Redis будут удалены."
read -p "Продолжить? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[yY]$ ]]; then
  echo "Отменено."
  exit 0
fi

echo "Останавливаю контейнеры и удаляю volumes..."
docker compose down -v

echo "Запускаю снова..."
docker compose up -d

echo "Ожидание PostgreSQL..."
sleep 5
for i in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U padelsense -d padelsense 2>/dev/null; then
    echo "БД сброшена и снова доступна."
    exit 0
  fi
  sleep 1
done
echo "Таймаут ожидания PostgreSQL."
exit 1
