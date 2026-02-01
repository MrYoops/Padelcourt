# PadelSense Mini App

Мини-приложение для Telegram: премиальный интерфейс для игроков (QR, матчи, хайлайты, аналитика, подписка).

## Как открыть Mini App в Telegram (пошагово)

Telegram открывает Mini App по **публичному HTTPS-адресу**. Локальный `localhost` доступен только на вашем компьютере, поэтому в боте сейчас стоит заглушка `padelsense.example.com` — её нужно заменить на реальный URL.

### Вариант A: Туннель (быстрый тест на своём ПК)

1. **Запустите Mini App локально** (в корне проекта):
   ```bash
   cd mini-app
   python -m http.server 3000
   ```
   Или: `npx serve mini-app -l 3000`  
   Сайт будет на http://localhost:3000

2. **Поднимите туннель с HTTPS** (в новом терминале):
   - **Рекомендуется:** из корня проекта `npm start` — поднимет мини-апп, туннель **Cloudflare** и бота; URL будет вида `https://xxxx.trycloudflare.com`, **без страницы с паролем**.
   - **ngrok:** `ngrok http 3000` → URL вида `https://xxxx.ngrok-free.app`.
   - **cloudflared:** `cloudflared tunnel --url http://localhost:3000` → URL вида `https://xxxx.trycloudflare.com`.
   - **Не используйте localtunnel** (`loca.lt`) для бота — при открытии из Telegram показывается страница «Tunnel Password», мини-апп не откроется.

3. **Пропишите URL в боте** (если не используете `npm start`):
   - Откройте `.env` в корне проекта.
   - Замените/добавьте (подставьте свой URL из шага 2):
     ```
     MINI_APP_URL=https://xxxx.trycloudflare.com
     ```
     или `https://xxxx.ngrok-free.app`. Не используйте `https://xxxx.loca.lt`.

4. **Перезапустите бота:** при ручном запуске — `python -m bot.main` (из корня проекта). Или используйте `npm start` — бот подхватит URL сам.

5. В Telegram нажмите «Открыть приложение» — откроется ваш Mini App по туннелю.

Пока терминал с туннелем и сервером (шаги 1 и 2) открыты, приложение будет доступно в Telegram по этому URL.

### Вариант B: Деплой (постоянный URL)

Залить папку `mini-app/` на хостинг с HTTPS и указать этот URL в `MINI_APP_URL`:

- **Vercel:** перетащить папку `mini-app` в [vercel.com](https://vercel.com) или подключить репозиторий.
- **Netlify:** загрузить папку в Netlify Drop или подключить репозиторий.
- **GitHub Pages:** залить содержимое `mini-app/` в ветку `gh-pages` или в папку `docs/` и указать URL вида `https://username.github.io/repo/`.

В `.env` бота указать: `MINI_APP_URL=https://ваш-проект.vercel.app` (или ваш домен).

---

## Дизайн

- Тёмная тема, премиальный стиль
- Шрифт Inter, акцент emerald (#10b981), PRO — золотой (#d4af37)
- Разделы: Главная, QR, Матчи, Хайлайты, Аналитика (PRO), Подписка, Помощь

## Запуск только локально (без Telegram)

- **Python:** `cd mini-app && python -m http.server 8080` — откроется на http://localhost:8080
- **npx serve:** `npx serve mini-app -l 3000`
- В браузере откройте этот адрес — переход по сайту работает, но в Telegram без туннеля или деплоя не откроется.

## Файлы

- `index.html` — разметка и все экраны
- `styles.css` — премиальный тёмный дизайн
- `app.js` — навигация, Telegram Web App, генерация QR (qrcode.js с CDN)

## API

Mini App рассчитан на backend по адресу из `window.API_BASE` (по умолчанию `http://localhost:8000`). В продакшене задайте переменную перед загрузкой `app.js` или встройте в сборку.
