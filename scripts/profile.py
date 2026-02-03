"""
Скрипт для профилирования Backend с помощью Scalene
"""
import subprocess
import sys
import os

def run_scalene_profile():
    """Запуск профилирования Backend через Scalene"""
    
    # Путь к main.py
    backend_main = os.path.join(os.path.dirname(__file__), "..", "backend", "main.py")
    
    # Команда для запуска Scalene
    cmd = [
        "scalene",
        "--reduced-profile",  # Уменьшенный профиль для быстрого анализа
        "--cpu-only",         # Только CPU профилирование
        "--memory",           # Включить профилирование памяти
        "--outfile", "scalene_profile.html",  # Вывод в HTML файл
        "--browser",          # Открыть в браузере
        backend_main
    ]
    
    print("🔍 Запускаю профилирование Backend с Scalene...")
    print(f"📊 Результат будет сохранен в scalene_profile.html")
    
    try:
        # Запуск профилирования
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("✅ Профилирование завершено!")
        print("📈 Открой scalene_profile.html в браузере для анализа")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Ошибка профилирования: {e}")
        print(f"Stdout: {e.stdout}")
        print(f"Stderr: {e.stderr}")
        sys.exit(1)
    except FileNotFoundError:
        print("❌ Scalene не найден. Установите: pip install scalene")
        sys.exit(1)

if __name__ == "__main__":
    run_scalene_profile()
