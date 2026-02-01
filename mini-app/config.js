// Начальная конфигурация — будет перезаписана при npm start
window.API_BASE = 'http://localhost:8000';
window.DEBUG = true;

function debug(msg) {
  if (window.DEBUG) console.log('[PadelSense]', msg);
}
