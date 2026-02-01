// Этот файл перезаписывается при npm start
// Для локальной разработки без туннеля:
// URL туннеля Backend API (чтобы Mini App из Telegram могла слать запросы)
window.API_BASE = 'https://fifth-monster-systems-geography.trycloudflare.com';
window.DEBUG = true;
function debug(msg) {
  if (window.DEBUG) console.log('[PadelSense]', new Date().toISOString(), msg);
}
