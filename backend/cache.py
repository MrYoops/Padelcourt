"""
Модуль кэширования Redis для оптимизации производительности
"""
import json
import logging
from typing import Any, Optional, Union

import aioredis
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class RedisCache:
    """Класс для работы с Redis кэшем"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_url = redis_url
        self.redis: Optional[aioredis.Redis] = None
    
    async def connect(self) -> None:
        """Установка соединения с Redis"""
        try:
            self.redis = await aioredis.from_url(self.redis_url)
            await self.redis.ping()
            logger.info("✅ Redis подключен успешно")
        except Exception as e:
            logger.error(f"❌ Ошибка подключения Redis: {e}")
            raise HTTPException(status_code=500, detail="Сервис кэширования недоступен")
    
    async def disconnect(self) -> None:
        """Закрытие соединения с Redis"""
        if self.redis:
            await self.redis.close()
    
    async def get(self, key: str) -> Optional[Any]:
        """Получение значения из кэша"""
        try:
            if not self.redis:
                await self.connect()
            
            value = await self.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"❌ Ошибка получения из кэша {key}: {e}")
            return None
    
    async def set(self, key: str, value: Any, expire: int = 3600) -> bool:
        """Установка значения в кэш с истечением"""
        try:
            if not self.redis:
                await self.connect()
            
            serialized_value = json.dumps(value, default=str)
            await self.redis.setex(key, expire, serialized_value)
            logger.debug(f"✅ Кэш установлен: {key} (TTL: {expire}s)")
            return True
        except Exception as e:
            logger.error(f"❌ Ошибка установки кэша {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Удаление значения из кэша"""
        try:
            if not self.redis:
                await self.connect()
            
            result = await self.redis.delete(key)
            if result:
                logger.debug(f"✅ Кэш удален: {key}")
            return bool(result)
        except Exception as e:
            logger.error(f"❌ Ошибка удаления кэша {key}: {e}")
            return False
    
    async def clear_pattern(self, pattern: str) -> int:
        """Очистка кэша по паттерну"""
        try:
            if not self.redis:
                await self.connect()
            
            keys = await self.redis.keys(pattern)
            if keys:
                deleted = await self.redis.delete(*keys)
                logger.info(f"✅ Очищено {deleted} ключей по паттерну: {pattern}")
                return deleted
            return 0
        except Exception as e:
            logger.error(f"❌ Ошибка очистки кэша {pattern}: {e}")
            return 0

# Глобальный экземпляр кэша
cache = RedisCache()

# Декоратор для кэширования функций
def cache_key(prefix: str, expire: int = 3600):
    """Декоратор для автоматического кэширования результатов функций"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Создаем ключ кэша на основе имени функции и параметров
            key_data = f"{prefix}:{func.__name__}:{str(args)}:{str(kwargs)}"
            key = key_data.replace(" ", "_").replace("'", "").replace('"', "")
            
            # Пробуем получить из кэша
            cached_result = await cache.get(key)
            if cached_result is not None:
                logger.debug(f"🎯 Кэш hit: {key}")
                return cached_result
            
            # Выполняем функцию и кэшируем результат
            result = await func(*args, **kwargs)
            await cache.set(key, result, expire)
            logger.debug(f"💾 Кэш set: {key}")
            
            return result
        return wrapper
    return decorator
