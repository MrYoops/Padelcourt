# PadelSense Backend

## Запуск

Из **корня проекта**:

```powershell
python -m uvicorn backend.main:app --reload --host 0.0.0.0
```

Бекенд будет на http://localhost:8000.

## База данных (PostgreSQL)

Если в логе есть «База данных недоступна»:

1. Запустите **Docker Desktop** (иконка в трее).
2. В корне проекта: `docker compose up -d postgres`.
3. Перезапустите бекенд.

Без Docker — установите PostgreSQL отдельно и укажите `DATABASE_URL` в `.env`.

## Как проверить

### Без базы (только что бекенд поднялся)

- В браузере или curl: **http://localhost:8000/health**  
  Ожидается: `{"status":"ok"}`.

### С базой (после `docker compose up -d postgres`)

```powershell
# Проверка здоровья
curl http://localhost:8000/health

# Пользователь по Telegram ID (сначала 404)
curl http://localhost:8000/api/users/by-telegram/123

# Создать пользователя
curl -X POST http://localhost:8000/api/users -H "Content-Type: application/json" -d "{\"telegram_id\":123,\"name\":\"Тест\"}"

# Снова по Telegram ID — должен вернуть пользователя
curl http://localhost:8000/api/users/by-telegram/123
```

Документация API (Swagger): **http://localhost:8000/docs**.
