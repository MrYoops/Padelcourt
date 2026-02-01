# 🎯 CURSOR — Задачи

> Читай также: `SYNC.md`, `shared/types.ts`

---

## ✅ Сделано

- [x] Mini App UI (index.html, app.js, styles.css)
- [x] Backend структура (FastAPI, routers, schemas)
- [x] Bot базовый (main.py, http_server.py)

---

## 📋 ТЕКУЩИЕ ЗАДАЧИ

### 1. Backend: добавить endpoint `/users/by-telegram/{id}`

**Файл:** `backend/routers/users.py`

```python
@router.get("/by-telegram/{telegram_id}", response_model=UserResponse)
async def get_user_by_telegram_id(
    telegram_id: int,
    session: AsyncSession = Depends(get_session),
):
    user = await get_user_by_telegram(session, telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

**Файл:** `backend/services/user_service.py` — добавить функцию:

```python
async def get_user_by_telegram(session: AsyncSession, telegram_id: int):
    result = await session.execute(
        select(User).where(User.telegram_id == telegram_id)
    )
    return result.scalar_one_or_none()
```

---

### 2. Mini App: регистрация через API

**Файл:** `mini-app/app.js` — добавить:

```javascript
async function registerUser() {
  const user = tg?.initDataUnsafe?.user;
  if (!user) return alert('Откройте через Telegram');
  
  const res = await fetch(API_BASE + '/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegram_id: user.id,
      name: [user.first_name, user.last_name].filter(Boolean).join(' '),
      photo_url: user.photo_url || null
    })
  });
  
  if (res.ok) showView('qr');
  else alert('Ошибка регистрации');
}
```

---

### 3. Mini App: проверка юзера при старте

```javascript
async function checkUser() {
  const telegramId = tg?.initDataUnsafe?.user?.id;
  if (!telegramId) return;
  
  const res = await fetch(API_BASE + '/api/users/by-telegram/' + telegramId);
  
  if (res.status === 404) {
    showView('register');  // Форма регистрации
  } else if (res.ok) {
    showView('qr');        // Сразу QR
  }
}

// Вызвать при старте
checkUser();
```

---

## 🧪 Как проверить

```bash
# 1. Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# 2. Проверить API
curl http://localhost:8000/api/users/by-telegram/123456789
# Должно вернуть 404 (пользователя нет)

# 3. Создать тестового
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{"telegram_id": 123456789, "name": "Тест"}'

# 4. Проверить снова
curl http://localhost:8000/api/users/by-telegram/123456789
# Теперь вернёт юзера
```

---

## ✅ Критерии готовности

- [ ] `GET /api/users/by-telegram/{id}` возвращает юзера или 404
- [ ] `POST /api/users` создаёт юзера с telegram_id
- [ ] Mini App при старте проверяет есть ли юзер
- [ ] Mini App регистрирует через API (не локально)
