# Запуск PadelSense одной командой

Чтобы бот открывал Mini App в Telegram по кнопке «Открыть приложение», нужен **публичный HTTPS-URL**. Скрипт `npm start` сначала пробует туннель **Cloudflare**; если не получилось — автоматически поднимает **localtunnel** и выводит пароль (ваш внешний IP), который нужно ввести при открытии мини-апп в Telegram.

## Одна команда (Mini App + туннель + бот)

1. **Установите cloudflared** (один раз). Проще всего — положить в корень проекта (PATH не нужен):
   - Скачайте для Windows: [cloudflared-windows-amd64.exe](https://github.com/cloudflare/cloudflared/releases/latest) (на странице Releases — файл `cloudflared-windows-amd64.exe`).
   - Переименуйте в `cloudflared.exe` и скопируйте в папку `padelsense-court` (туда, где лежат `package.json` и папка `bot`). Скрипт `npm start` сам найдёт его там.
   - Альтернатива: установить через PATH ([инструкция](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)) или `winget install Cloudflare.cloudflared` (после установки может понадобиться перезапустить терминал).

2. **В корне проекта** создайте `.env` и пропишите токен бота:
   ```
   BOT_TOKEN=ваш_токен_от_BotFather
   ```
   Для `npm start` **не задавайте** `MINI_APP_URL` в `.env` — скрипт подставит URL туннеля сам.

3. Запустите:
   ```bash
   npm install
   npm start
   ```

4. В терминале появится строка вида:
   ```
   Mini App URL: https://xxxx-xx-xx-xx-xx.trycloudflare.com
   ```
   Бот уже запущен с этим URL. В Telegram нажмите «Открыть приложение» — мини-апп откроется **без запроса пароля**.

5. Остановка: **Ctrl+C** в том же терминале.

---

### Запуск только бота (без туннеля)

Из **корня проекта** (не из папки `bot`):

```bash
cd C:\Users\dkuzm\Desktop\padelsense-court
python -m bot.main
```

Если запускать из папки `bot`, будет ошибка `ModuleNotFoundError: No module named 'bot'`.

---

**Что делает `npm start`:** поднимает Mini App на порту 3000, создаёт туннель **Cloudflare** (trycloudflare.com), запускает бота с этим URL. Каждый запуск — новый URL. Для постоянного адреса залейте `mini-app/` на Vercel или Netlify и укажите этот URL в `.env` как `MINI_APP_URL`.
