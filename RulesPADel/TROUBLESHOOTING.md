# 🐛 PadelSense - Решение Проблем

**Дата:** 4 февраля 2026  
**Проект:** Умная система падел-кортов  
**Статус:** ✅ Руководство по отладке

---

## 🎯 **ЦЕЛЬ ГАЙДА:**

Помочь быстро найти и исправить проблемы в PadelSense.

---

## 🚨 **ЧАСТЫЕ ПРОБЛЕМЫ:**

### **❌ НЕ ЗАПУСКАЕТСЯ BACKEND:**

#### **Проблема:**
```bash
ModuleNotFoundError: No module named 'aioredis'
```

#### **Решение:**
```bash
# 1. Удали проблемные зависимости
pip uninstall aioredis fastapi-cache2

# 2. Установи базовые
pip install fastapi uvicorn asyncpg pydantic

# 3. Запусти без кэша
python -m backend.main
```

#### **Проверка:**
```bash
curl http://localhost:8000/health
```

---

### **❌ TELEGRAM BOT КОНФЛИКТ:**

#### **Проблема:**
```
TelegramConflictError: terminated by other getUpdates request
```

#### **Решение:**
```bash
# 1. Останови все процессы Python
taskkill /f /im python.exe

# 2. Подожди 1 минуту
timeout /t 60

# 3. Запусти бота
python -m bot.main
```

#### **Проверка:**
```
@PadelSenseTestBot → /start
```

---

### **❌ MINI APP НЕ РАБОТАЕТ В TELEGRAM:**

#### **Проблема:**
- Белый экран
- Ошибки в консоли
- API не отвечает

#### **Решение:**
```bash
# 1. Проверь API туннель
npx localtunnel --port 8000 --subdomain padelsense-api

# 2. Проверь Backend
curl http://localhost:8000/health

# 3. Проверь CORS в backend/main.py
ALLOWED_ORIGINS = [
    "https://padelsense-mini-app.vercel.app",
    "https://padelsense-api.loca.lt"
]
```

#### **Отладка в браузере:**
```javascript
// F12 → Console
console.log('[PadelSense] API_BASE:', API_BASE);
console.log('[PadelSense] Telegram WebApp:', window.Telegram?.WebApp);
```

---

### **❌ РЕГИСТРАЦИЯ НЕ РАБОТАЕТ:**

#### **Проблема:**
- Кнопка не нажимается
- Ошибка сети
- 500 статус

#### **Решение:**
```javascript
// 1. Проверь API_BASE в app.js
const API_BASE = 'https://padelsense-api.loca.lt';

// 2. Проверь CORS в Backend
// 3. Проверь API эндпоинт
curl -X POST https://padelsense-api.loca.lt/api/users \
  -H "Content-Type: application/json" \
  -d '{"telegram_id": 123, "first_name": "Test"}'
```

---

### **❌ POSTGRESQL НЕ ЗАПУСКАЕТСЯ:**

#### **Проблема:**
```
Connection refused
Database unavailable
```

#### **Решение:**
```bash
# 1. Проверь Docker
docker compose ps

# 2. Перезапусти контейнер
docker compose restart postgres

# 3. Проверь логи
docker compose logs postgres

# 4. Создай БД если нужно
docker exec -it postgres psql -U padelsense -c "CREATE DATABASE padelsense;"
```

---

## 🔍 **DIAGNOSTICS TOOLS:**

### **📊 Backend Health Check:**
```bash
# Health endpoint
curl http://localhost:8000/health

# Metrics
curl http://localhost:8000/metrics

# Docs
http://localhost:8000/docs
```

### **📱 Mini App Debug:**
```javascript
// В консоли браузера
console.log('API_BASE:', API_BASE);
console.log('Telegram User:', tg.initDataUnsafe?.user);
console.log('Network requests:', performance.getEntriesByType('resource'));
```

### **🤖 Bot Debug:**
```python
# В bot/main.py добавь логи
logger.info("Bot token: %s...", token[:10])
logger.info("Mini App URL: %s", mini_app_url)
```

---

## 🛠️ **ADVANCED TROUBLESHOOTING:**

### **🔥 Полная перезагрузка:**
```bash
# 1. Останови все
taskkill /f /im python.exe
docker compose down

# 2. Почисти кэш
pip cache purge

# 3. Переустанови зависимости
pip install -r backend/requirements.txt

# 4. Запусти все заново
docker compose up -d postgres
python -m backend.main
python -m bot.main
```

### **🔍 Логирование:**
```python
# В backend/main.py
import logging
logging.basicConfig(level=logging.DEBUG)

# В bot/main.py
logger.info("Debug info: %s", debug_data)
```

### **📡 Network тесты:**
```bash
# Тест API
curl -v http://localhost:8000/health

# Тест туннеля
curl -v https://padelsense-api.loca.lt/health

# Тест Vercel
curl -v https://padelsense-mini-app.vercel.app
```

---

## 🐛 **DEBUG WORKFLOW:**

### **🎯 Шаг 1: Определи проблему**
- Что не работает?
- Когда началось?
- Что менялось?

### **🔍 Шаг 2: Собери информацию**
- Логи ошибок
- Статусы сервисов
- Network запросы

### **🛠️ Шаг 3: Примени решение**
- Попробуй простое решение
- Проверь результат
- Итерируй если нужно

### **📋 Шаг 4: Задокументируй**
- Запиши проблему
- Добавь решение
- Обнови CHANGELOG

---

## 📞 **GETTING HELP:**

### **🔧 Самопомощь:**
1. **Прочитай этот гайд**
2. **Проверь CHANGELOG**
3. **Посмотри PROJECT_STATUS**
4. **Используй Kimi AI**

### **🤖 AI Assistant:**
```
Используй Kimi AI с контекстом проекта:
"Проанализируй ошибку в PadelSense и предложи решение"
```

### **📚 Документация:**
- **📋 Main Rules:** RulesPADel/PADEL_RULES_READ_FIRST.md
- **🚀 Quick Start:** RulesPADel/QUICK_START.md
- **🔧 Development:** RulesPADel/DEVELOPMENT_GUIDE.md

---

## 🎯 **PREVENTION:**

### **🔧 Лучшие практики:**
1. **Проверяй зависимости** перед запуском
2. **Используй health checks** для мониторинга
3. **Логируй важные события**
4. **Тестируй изменения** локально

### **📦 Environment:**
- Используй **.env** для конфигурации
- Проверяй **порты** на конфликты
- Следи за **ресурсами** системы

### **🔄 Updates:**
- **Обновляй документацию** после изменений
- **Тестируй** перед деплоем
- **Следи за CHANGELOG**

---

## 🚀 **QUICK FIXES:**

### **⚡ One-line fixes:**
```bash
# Bot conflict
taskkill /f /im python.exe && timeout /t 60 && python -m bot.main

# Backend restart
python -m backend.main

# Docker restart
docker compose restart postgres

# Tunnel restart
npx localtunnel --port 8000 --subdomain padelsense-api
```

### **🔧 Environment reset:**
```bash
# Полный сброс
docker compose down && docker compose up -d postgres && python -m backend.main
```

---

**🐛 Не паникуй! Большинство проблем решаются перезапуском!** 🚀
