# 🚀 TRAE — ПЕРВОЕ ЗАДАНИЕ

> Скопируй этот промт в Trae и начни работу

---

## Промт для Trae (скопируй целиком):

```
Ты работаешь над проектом PadelSense — система умного корта для падел-клубов.

ПРОЧИТАЙ ФАЙЛЫ:
1. PADELSENSE_MASTER.md — полная спецификация
2. .trae-rules — правила

ТВОЯ ЗОНА: infrastructure/, docs/, конфиги

═══════════════════════════════════════════════════════════════
ЗАДАНИЕ 1: Создай инфраструктуру для локальной разработки
═══════════════════════════════════════════════════════════════

Создай файлы для быстрого старта разработки:

1. docker-compose.yml в корне:
   - PostgreSQL 15 (порт 5432)
   - Redis 7 (порт 6379)
   - Healthcheck для postgres
   - Volumes для данных

2. .env.example с ВСЕМИ переменными:
   # Telegram Bot
   BOT_TOKEN=
   
   # Database
   DATABASE_URL=postgresql://padelsense:devpass@localhost:5432/padelsense
   
   # Redis
   REDIS_URL=redis://localhost:6379
   
   # Supabase (production)
   SUPABASE_URL=
   SUPABASE_KEY=
   
   # Cloudflare R2
   R2_ACCOUNT_ID=
   R2_ACCESS_KEY=
   R2_SECRET_KEY=
   R2_BUCKET=padelsense-videos
   
   # ЮKassa
   YOOKASSA_SHOP_ID=
   YOOKASSA_SECRET=
   
   # Court
   COURT_ID=court-1
   COURT_NAME=Корт 1
   CLUB_NAME=PadelClub

3. .gitignore:
   - node_modules, __pycache__, .env, .venv
   - Видео файлы (*.mp4)
   - IDE файлы
   - Логи

4. infrastructure/scripts/setup-dev.sh:
   - Проверка что установлен Docker, Node, Python
   - Копирование .env.example → .env если нет
   - docker-compose up -d
   - Ожидание postgres
   - Вывод инструкций

5. infrastructure/scripts/reset-db.sh:
   - Предупреждение
   - docker-compose down -v
   - docker-compose up -d
   - Сброс БД

Сделай скрипты исполняемыми (chmod +x).
```

---

## Как использовать:

1. Открой корень проекта в Trae
2. Убедись что `.trae-rules` на месте
3. Вставь промт
4. Trae создаст файлы
5. Запусти: `docker-compose up -d`

---

## Следующие задания для Trae:

### ЗАДАНИЕ 2: Dockerfile'ы
```
Создай Dockerfile для каждого сервиса:

1. bot/Dockerfile:
   - python:3.11-slim
   - Установка requirements.txt
   - CMD python main.py

2. backend/Dockerfile:
   - python:3.11-slim
   - Установка requirements.txt
   - EXPOSE 8000
   - CMD uvicorn main:app --host 0.0.0.0 --port 8000

3. Обнови docker-compose.yml:
   - Добавь сервисы bot и backend
   - Зависимости от postgres
   - Volumes для hot reload
   - Environment из .env
```

### ЗАДАНИЕ 3: GitHub Actions CI
```
Создай .github/workflows/ci.yml:
1. Триггер на push в main и develop
2. Job для bot/:
   - Python 3.11
   - pip install
   - black --check
   - pytest (если есть тесты)
3. Job для backend/:
   - Аналогично
4. Job для tablet-app/:
   - Node 20
   - npm ci
   - tsc --noEmit
   - npm run lint
```

### ЗАДАНИЕ 4: Документация
```
Создай docs/:
1. docs/setup.md — как поднять проект с нуля
2. docs/api.md — документация API (из PADELSENSE_MASTER.md)
3. docs/deployment.md — как деплоить на Railway
```
