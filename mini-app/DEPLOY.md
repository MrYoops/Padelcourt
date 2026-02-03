# 🚀 Деплой Mini App на Vercel

## Быстрый старт

### 1. Настройка Backend (localhost:8000)

```bash
# В корне проекта
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend должен быть доступен по `http://localhost:8000`

### 2. Настройка Vercel

#### Вариант A: Через Vercel CLI

```bash
# Установить Vercel CLI
npm i -g vercel

# В корне проекта (где vercel.json)
vercel --prod
```

#### Вариант B: Через GitHub

1. Запушьте код на GitHub
2. Подключите репозиторий в Vercel Dashboard
3. Vercel автоматически найдет `vercel.json`

### 3. Проброс Backend через туннель (для разработки)

Так как Mini App на Vercel (HTTPS), а backend на localhost (HTTP), нужен туннель:

```bash
# Установить cloudflared
# Windows: скачать с https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# Запустить туннель
cd backend
cloudflared tunnel --url http://localhost:8000
```

Скопируйте HTTPS URL (например, `https://abc-xyz.trycloudflare.com`)

### 4. Обновление API_BASE в Mini App

#### Способ 1: Через config.js (автоматический)

Создайте `mini-app/config.js`:
```javascript
window.API_BASE = 'https://your-tunnel.trycloudflare.com';
```

И подключите в `index.html` перед `app.js`:
```html
<script src="config.js"></script>
<script src="app.js"></script>
```

#### Способ 2: Через переменные окружения Vercel

В Vercel Dashboard → Settings → Environment Variables:
```
API_BASE_URL=https://your-tunnel.trycloudflare.com
```

И используйте в `index.html`:
```html
<script>
  window.API_BASE = '{{ API_BASE_URL }}' || 'http://localhost:8000';
</script>
```

### 5. Проверка CORS

Backend уже настроен с CORS для всех origins. Проверьте:

```bash
curl -H "Origin: https://your-vercel-app.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8000/api/users
```

Должен вернуть заголовки с `Access-Control-Allow-Origin: *`

### 6. Тестирование регистрации

1. Откройте Mini App на Vercel
2. Откройте DevTools (F12) → Console
3. Заполните форму регистрации
4. Нажмите "Зарегистрироваться"
5. Проверьте логи:
   - В консоли браузера: `[PadelSense] API_BASE = ...`
   - В консоли backend: `📝 Регистрация пользователя: ...`

## 🔧 Отладка

### Проблема: "API_BASE не задан"

**Решение**: Добавьте в `index.html` перед `app.js`:
```html
<script>
  window.API_BASE = window.API_BASE || 'http://localhost:8000';
</script>
```

### Проблема: CORS ошибка

**Решение**: 
1. Проверьте что backend запущен
2. Проверьте CORS в `backend/main.py`:
   ```python
   allow_origins=["*"]
   ```
3. Используйте туннель (cloudflared/ngrok) для HTTPS

### Проблема: "Failed to fetch"

**Решение**:
1. HTTPS страница не может обращаться к HTTP API
2. Используйте туннель для backend: `cloudflared tunnel --url http://localhost:8000`
3. Обновите `API_BASE` на HTTPS URL туннеля

### Проблема: Telegram WebApp не работает

**Решение**:
1. Mini App должна открываться через Telegram Bot
2. Проверьте `MINI_APP_URL` в настройках бота
3. Домен должен быть HTTPS

## 📁 Структура деплоя

```
padelsense-court/
├── mini-app/           ← Статические файлы (HTML/CSS/JS)
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── config.js      ← API_BASE (опционально)
├── vercel.json        ← Конфигурация Vercel
└── backend/           ← FastAPI (отдельно)
```

## 🌐 Продакшен

Для продакшена:

1. **Backend**: Задеплойте на Railway/Render/AWS с HTTPS
2. **Mini App**: Обновите `API_BASE` на продакшен URL
3. **Database**: Используйте облачную PostgreSQL
4. **Redis**: Используйте Redis Cloud

```javascript
// config.js для продакшена
window.API_BASE = 'https://api.padelsense.com';
window.DEBUG = false;
```

## 📞 Поддержка

При проблемах проверьте:
1. Логи браузера (F12 → Console)
2. Логи backend
3. Сетевые запросы (F12 → Network)
4. Доступность API: `GET /api/health`
