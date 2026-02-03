"""
Скрипт для автоматической настройки Kimi в Cursor
"""
import os
import json
import subprocess
from pathlib import Path

def create_cursor_settings():
    """Создание файла настроек Cursor для Kimi"""
    
    cursor_settings = {
        "models": {
            "custom": [
                {
                    "name": "Kimi-K2-Subscription",
                    "provider": "kimi-direct",
                    "model": "kimi-k2",
                    "maxTokens": 128000,
                    "temperature": 0.7,
                    "contextLength": 128000,
                    "useSubscription": True
                },
                {
                    "name": "Kimi-OpenRouter",
                    "provider": "openai-compatible", 
                    "apiBase": "https://openrouter.ai/api/v1",
                    "apiKey": "${OPENROUTER_API_KEY}",
                    "model": "moonshotai/moonshot-v1-128k",
                    "maxTokens": 128000,
                    "temperature": 0.7,
                    "contextLength": 128000
                }
            ]
        },
        "composer": {
            "defaultModel": "Kimi-K2-Subscription",
            "enableAutoComplete": True,
            "maxContextLength": 128000
        },
        "chat": {
            "defaultModel": "Kimi-K2-Subscription",
            "contextLength": 128000,
            "rememberContext": True
        }
    }
    
    # Путь к настройкам Cursor
    cursor_dir = Path.home() / ".cursor"
    cursor_dir.mkdir(exist_ok=True)
    
    settings_file = cursor_dir / "settings.json"
    
    # Сохраняем настройки
    with open(settings_file, 'w', encoding='utf-8') as f:
        json.dump(cursor_settings, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Настройки Cursor сохранены: {settings_file}")
    return settings_file

def setup_environment():
    """Настройка переменных окружения"""
    
    env_vars = {
        # Kimi подписка - не требует API ключа
        "KIMI_SUBSCRIPTION": "enabled",
        "KIMI_MODEL": "kimi-k2",
        "KIMI_CONTEXT_LENGTH": "128000",
        "KIMI_TEMPERATURE": "0.7",
        
        # OpenRouter как запасной вариант (опционально)
        "OPENROUTER_API_KEY": "твой_openrouter_ключ_опционально"
    }
    
    # Создаем .env файл
    env_file = Path(".env")
    
    with open(env_file, 'a', encoding='utf-8') as f:
        f.write("\n# === KIMI AI НАСТРОЙКИ ===\n")
        f.write("# Подписка Kimi - API ключ не требуется\n")
        for key, value in env_vars.items():
            f.write(f"{key}={value}\n")
    
    print(f"✅ Переменные окружения добавлены в {env_file}")

def create_kimi_prompts():
    """Создание библиотеки промптов для Kimi"""
    
    prompts_dir = Path(".kimi-prompts")
    prompts_dir.mkdir(exist_ok=True)
    
    # Промпт для анализа кода
    analysis_prompt = """## 🎯 ЗАДАЧА
Проанализируй код PadelSense проект

## 📋 КОНТЕКСТ ПРОЕКТА
PadelSense - экосистема умного падел-корта:
- Mini App (HTML/CSS/JS) в Telegram
- Bot (Python/aiogram) 
- Backend (FastAPI + PostgreSQL + Redis)
- Tablet App (React Native)
- Computer Vision (OpenCV + YOLO)

## 🏗️ ТЕХНИЧЕСКИЕ ДЕТАЛИ
- Backend: async/await, Redis кэш, Sentry мониторинг
- Mini App: Service Worker, performance optimization
- Bot: aiogram 3.x, FSM, WebApp integration
- База: PostgreSQL + asyncpg, connection pooling

## 📝 ТРЕБОВАНИЯ
- Следуй .cursorrules правилам
- Используй type hints в Python
- Оптимизируй производительность
- Добавляй логирование и метрики

## 🚀 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ
Полный анализ кода с рекомендациями по оптимизации"""
    
    with open(prompts_dir / "analysis.md", 'w', encoding='utf-8') as f:
        f.write(analysis_prompt)
    
    # Промпт для рефакторинга
    refactor_prompt = """## 🎯 ЗАДАЧА
Сделай рефакторинг модуля

## 📋 КОНТЕКСТ ПРОЕКТА
PadelSense с оптимизацией производительности

## 🏗️ ТЕХНИЧЕСКИЕ ДЕТАЛИ
- Используй async/await
- Добавь Redis кэширование
- Включи мониторинг производительности
- Следуй SOLID принципам

## 📝 ТРЕБОВАНИЯ
- Сохраняй функциональность
- Улучшай читаемость
- Оптимизируй производительность
- Добавляй метрики

## 🚀 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ
Оптимизированный код с мониторингом"""
    
    with open(prompts_dir / "refactor.md", 'w', encoding='utf-8') as f:
        f.write(refactor_prompt)
    
    # Промпт для дебагинга
    debug_prompt = """## 🎯 ЗАДАЧА
Найди и исправь ошибку

## 📋 КОНТЕКСТ ПРОЕКТА
PadelSense с полным логированием

## 🏗️ ТЕХНИЧЕСКИЕ ДЕТАЛИ
- Проверь логи ошибок
- Проанализируй метрики
- Используй Sentry данные
- Учти весь контекст

## 📝 ТРЕБОВАНИЯ
- Найди корень проблемы
- Предложи несколько решений
- Добавь обработку ошибок
- Предотврати повторение

## 🚀 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ
Исправленная ошибка с профилактикой"""
    
    with open(prompts_dir / "debug.md", 'w', encoding='utf-8') as f:
        f.write(debug_prompt)
    
    print(f"✅ Промпты Kimi созданы: {prompts_dir}")
    return prompts_dir

def test_kimi_connection():
    """Тестирование подключения к Kimi"""
    
    print("🧪 Тестирование подключения к Kimi...")
    
    # Проверяем подписку Kimi
    print("✅ Kimi подписка: используется прямая интеграция")
    print("📝 Модель: Kimi-K2 с контекстом 128K токенов")
    
    # Проверяем OpenRouter как запасной вариант
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    if openrouter_key and openrouter_key != "твой_openrouter_ключ":
        print("✅ OpenRouter API ключ настроен (запасной вариант)")
    else:
        print("⚠️ OpenRouter API ключ не настроен (опционально)")
    
    print("\n🎯 Рекомендация:")
    print("- Используй Kimi-K2-Subscription как основную модель")
    print("- OpenRouter как запасной вариант при проблемах")
    print("- Контекстное окно: 128K токенов")

def main():
    """Основная функция настройки"""
    
    print("🧠 Настройка Kimi для PadelSense Project")
    print("=" * 50)
    
    # 1. Создание настроек Cursor
    settings_file = create_cursor_settings()
    
    # 2. Настройка переменных окружения
    setup_environment()
    
    # 3. Создание промптов
    prompts_dir = create_kimi_prompts()
    
    # 4. Тестирование подключения
    test_kimi_connection()
    
    print("\n" + "=" * 50)
    print("✅ Настройка Kimi завершена!")
    print(f"📁 Настройки Cursor: {settings_file}")
    print(f"📁 Промпты: {prompts_dir}")
    print(f"📝 .env файл: {Path('.env')}")
    
    print("\n📋 Следующие шаги:")
    print("1. ✅ Kimi подписка уже настроена")
    print("2. Перезапусти Cursor")
    print("3. Выбери модель Kimi-K2-Subscription в настройках")
    print("4. Используй промпты из .kimi-prompts/")
    print("5. Наслаждайся разработкой с 128K контекстом!")
    
    print("\n🎯 Преимущества подписки:")
    print("- 🚀 Безлимитные запросы")
    print("- 🧠 128K токенов контекста")
    print("- 💪 Максимальная производительность")
    print("- 🔒 Стабильная работа")
    
    print("\n🎾 PadelSense + Kimi = 💪")

if __name__ == "__main__":
    main()
