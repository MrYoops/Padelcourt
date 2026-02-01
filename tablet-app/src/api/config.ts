// API конфигурация для PadelSense
// Для разработки - локальный backend или туннель
export const API_BASE = __DEV__ 
  ? 'http://192.168.1.100:8000'  // IP твоего компа в локальной сети
  : 'https://api.padelsense.ru';

// Или если используешь туннель:
// export const API_BASE = 'https://padelsense.loca.lt';

// Для Android emulator используй 10.0.2.2:8000
// Для iOS simulator localhost работает
export const FALLBACK_API_BASE = "http://localhost:8000";
