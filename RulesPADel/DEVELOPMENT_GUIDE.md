# 🔧 PadelSense - Гайд Разработчика

**Дата:** 4 февраля 2026  
**Проект:** Умная система падел-кортов  
**Статус:** ✅ Руководство по разработке

---

## 🎯 **ЦЕЛЬ ГАЙДА:**

Показать как добавлять функции, исправлять баги и развивать PadelSense.

---

## 🏗️ **АРХИТЕКТУРА ПРОЕКТА:**

### **📱 Mini App (Telegram WebApp):**
```
mini-app/
├── index.html          # Главная страница
├── app.js             # Основная логика
├── performance.js     # Оптимизация
├── sw.js             # Service Worker
└── styles.css        # Стили
```

### **🤖 Telegram Bot:**
```
bot/
├── main.py           # Запуск бота
├── config.py         # Конфигурация
├── handlers/         # Обработчики команд
└── http_server.py    # HTTP сервер
```

### **🚀 Backend API:**
```
backend/
├── main.py           # FastAPI приложение
├── routers/          # API эндпоинты
├── db/              # Работа с БД
├── monitoring.py     # Метрики
└── services/        # Бизнес-логика
```

---

## 🔧 **ПРАВИЛА РАЗРАБОТКИ:**

### **📝 Кодинг стандарты:**
1. **Python** - type hints, async/await
2. **JavaScript** - ES6+, оптимизация
3. **HTML/CSS** - Telegram WebApp совместимость
4. **SQL** - PostgreSQL best practices

### **🎯 Философия проекта:**
1. **Telegram First** - все работает в Telegram
2. **Mobile Optimized** - адаптация под телефоны
3. **Real-time** - мгновенные обновления
4. **Simple UX** - интуитивный интерфейс

---

## 🚀 **ДОБАВЛЕНИЕ НОВЫХ ФУНКЦИЙ:**

### **📱 Mini App:**

#### **1. Новая страница:**
```html
<!-- в index.html -->
<div class="view" id="new-page">
  <h2>Новая страница</h2>
  <div class="content">
    <!-- контент -->
  </div>
</div>
```

#### **2. Новая вкладка:**
```html
<!-- в навигации -->
<button class="tab" data-view="new-page">Новая</button>
```

#### **3. JavaScript логика:**
```javascript
// в app.js
function handleNewPage() {
  showView('new-page');
  // логика страницы
}
```

### **🤖 Telegram Bot:**

#### **1. Новый handler:**
```python
# в bot/handlers/
from aiogram import Router, types

router = Router()

@router.message(Command("newcommand"))
async def handle_new_command(message: types.Message):
    await message.answer("Новая команда!")
```

#### **2. Подключение:**
```python
# в bot/main.py
from bot.handlers import new_handler
dp.include_router(new_handler.router)
```

### **🚀 Backend API:**

#### **1. Новый роутер:**
```python
# в backend/routers/new_feature.py
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/new-feature", tags=["new-feature"])

@router.get("/")
async def get_new_feature():
    return {"message": "New feature"}
```

#### **2. Подключение:**
```python
# в backend/main.py
from backend.routers import new_feature
app.include_router(new_feature.router)
```

---

## 🔄 **WORKFLOW РАЗРАБОТКИ:**

### **1. Планирование:**
- **Определи задачу**
- **Создай issue в GitHub**
- **Спланируй архитектуру**

### **2. Разработка:**
- **Создай branch**
- **Напиши код**
- **Протестируй локально**

### **3. Тестирование:**
- **Backend:** http://localhost:8000/docs
- **Mini App:** https://padelsense-mini-app.vercel.app
- **Telegram:** @PadelSenseTestBot

### **4. Деплой:**
```bash
git add .
git commit -m "✨ Feat: добавлена новая функция"
git push origin master
```

---

## 🗄️ **РАБОТА С БАЗОЙ ДАННЫХ:**

### **📝 Новая таблица:**
```sql
-- в migrations/
CREATE TABLE new_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT NOT NULL,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### **🐍 Python модель:**
```python
# в backend/models/
class NewTable(BaseModel):
    id: UUID
    telegram_id: int
    data: dict
    created_at: datetime
```

### **🔍 Запросы:**
```python
# в backend/services/
async def create_new_item(telegram_id: int, data: dict):
    conn = await get_db_connection()
    await conn.execute(
        "INSERT INTO new_table (telegram_id, data) VALUES ($1, $2)",
        telegram_id, data
    )
```

---

## 📱 **TELEGRAM WEBAPP ИНТЕГРАЦИЯ:**

### **🔧 WebApp API:**
```javascript
// Проверка Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    
    // Получение данных пользователя
    const user = tg.initDataUnsafe?.user;
    if (user) {
        console.log('User ID:', user.id);
        console.log('Name:', user.first_name);
    }
}
```

### **📡 API запросы:**
```javascript
// Запрос к Backend
async function apiRequest(endpoint, data) {
    const response = await fetch(`https://padelsense-api.loca.lt${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}
```

---

## 🔍 **ОТЛАДКА И ТЕСТИРОВАНИЕ:**

### **🐛 Backend отладка:**
```python
# Логирование
logger.info("Processing request: %s", request_data)

# Health check
@app.get("/debug")
async def debug_info():
    return {
        "status": "ok",
        "database": await check_db(),
        "services": await check_services()
    }
```

### **📱 Mini App отладка:**
```javascript
// Console логи
console.log('[PadelSense] App initialized');
console.log('[PadelSense] User data:', user);

// Network запросы
fetch('/api/test')
    .then(response => console.log('Response:', response))
    .catch(error => console.error('Error:', error));
```

### **🤖 Bot отладка:**
```python
# Логирование команд
logger.info("Command: %s from user: %s", message.text, message.from_user.id)

# Тестовый режим
if os.getenv("TEST_MODE"):
    await message.answer("🧪 Test mode")
```

---

## 🚀 **OPTIMIZATION:**

### **⚡ Mini App:**
- **Lazy loading** изображений
- **Service Worker** кэширование
- **Batch DOM** обновления
- **Debounce** событий

### **🔧 Backend:**
- **Connection pooling** для БД
- **CORS** оптимизация
- **Async/await** везде
- **Monitoring** метрик

### **📱 Telegram:**
- **WebApp** оптимизация
- **Bot** rate limiting
- **Message** batching

---

## 📋 **CHECKLIST ПЕРЕД DEPLOY:**

### **✅ Backend:**
- [ ] Все эндпоинты работают
- [ ] CORS настроен
- [ ] Логирование включено
- [ ] Health check отвечает

### **✅ Mini App:**
- [ ] Загружается в Telegram
- [ ] API запросы работают
- [ ] Ошибки обработаны
- [ ] Performance оптимизация

### **✅ Bot:**
- [ ] Команды работают
- [ ] WebApp интеграция
- [ ] Обработка ошибок
- [ ] Rate limiting

---

## 🔄 **CI/CD:**

### **🚀 Vercel (Mini App):**
- **Автоматический деплой** при пуше
- **Preview** для PR
- **Analytics** включены

### **🔧 Backend:**
- **Локальный запуск**
- **Docker** для продакшена
- **Monitoring** активен

### **🤖 Bot:**
- **Локальный запуск**
- **Systemd** для продакшена
- **Logging** настроен

---

## 📞 **ПОДДЕРЖКА:**

### **🔧 Инструменты:**
- **Kimi AI** - для кодинга
- **GitHub** - для версий
- **Vercel** - для хостинга
- **Docker** - для БД

### **📚 Документация:**
- **PADEL_RULES_READ_FIRST.md** - навигатор
- **QUICK_START.md** - быстрый старт
- **TROUBLESHOOTING.md** - проблемы

---

**🎾 Разрабатывай PadelSense с умом!** 🚀
