"""
Модуль мониторинга и логирования для PadelSense Backend
"""
import logging
import time
import traceback
from typing import Dict, Any, Optional
from functools import wraps
from datetime import datetime

import sentry_sdk
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('padelsense.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Метрики производительности
class PerformanceMetrics:
    def __init__(self):
        self.metrics = {
            'requests_total': 0,
            'requests_success': 0,
            'requests_error': 0,
            'response_time_sum': 0.0,
            'cache_hits': 0,
            'cache_misses': 0,
            'db_queries': 0,
            'errors': []
        }
    
    def record_request(self, success: bool, response_time: float):
        """Запись метрик запроса"""
        self.metrics['requests_total'] += 1
        self.metrics['response_time_sum'] += response_time
        
        if success:
            self.metrics['requests_success'] += 1
        else:
            self.metrics['requests_error'] += 1
    
    def record_cache_hit(self):
        """Запись кэш хита"""
        self.metrics['cache_hits'] += 1
    
    def record_cache_miss(self):
        """Запись кэш мисса"""
        self.metrics['cache_misses'] += 1
    
    def record_db_query(self):
        """Запись запроса к БД"""
        self.metrics['db_queries'] += 1
    
    def record_error(self, error: Exception, context: str = ""):
        """Запись ошибки"""
        error_data = {
            'timestamp': datetime.now().isoformat(),
            'error': str(error),
            'context': context,
            'traceback': traceback.format_exc()
        }
        self.metrics['errors'].append(error_data)
        
        # Ограничиваем количество ошибок в памяти
        if len(self.metrics['errors']) > 100:
            self.metrics['errors'] = self.metrics['errors'][-50:]
    
    def get_stats(self) -> Dict[str, Any]:
        """Получение статистики"""
        total = self.metrics['requests_total']
        if total == 0:
            return self.metrics
        
        return {
            **self.metrics,
            'avg_response_time': self.metrics['response_time_sum'] / total,
            'success_rate': (self.metrics['requests_success'] / total) * 100,
            'cache_hit_rate': (
                self.metrics['cache_hits'] / 
                (self.metrics['cache_hits'] + self.metrics['cache_misses'])
            ) * 100 if (self.metrics['cache_hits'] + self.metrics['cache_misses']) > 0 else 0
        }

# Глобальный экземпляр метрик
metrics = PerformanceMetrics()

# Декоратор для мониторинга функций
def monitor_performance(func_name: Optional[str] = None):
    """Декоратор для мониторинга производительности функций"""
    def decorator(func):
        name = func_name or f"{func.__module__}.{func.__name__}"
        
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            success = True
            
            try:
                result = await func(*args, **kwargs)
                return result
            except Exception as e:
                success = False
                metrics.record_error(e, name)
                raise
            finally:
                response_time = time.time() - start_time
                metrics.record_request(success, response_time)
                logger.debug(f"⏱️ {name}: {response_time:.3f}s")
        
        return wrapper
    return decorator

# Middleware для мониторинга запросов
async def monitoring_middleware(request: Request, call_next):
    """Middleware для мониторинга всех запросов"""
    start_time = time.time()
    
    # Логирование запроса
    logger.info(f"📥 {request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
        
        # Запись успешного запроса
        response_time = time.time() - start_time
        metrics.record_request(True, response_time)
        
        # Добавление метрик в заголовки ответа
        response.headers["X-Response-Time"] = f"{response_time:.3f}"
        
        logger.info(f"📤 {request.method} {request.url.path} - {response.status_code} ({response_time:.3f}s)")
        return response
        
    except Exception as e:
        # Запись ошибки
        response_time = time.time() - start_time
        metrics.record_request(False, response_time)
        metrics.record_error(e, f"{request.method} {request.url.path}")
        
        logger.error(f"❌ {request.method} {request.url.path} - {str(e)}")
        raise

# Обработчик ошибок
async def global_exception_handler(request: Request, exc: Exception):
    """Глобальный обработчик исключений"""
    logger.error(f"💥 Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "Произошла внутренняя ошибка сервера",
            "timestamp": datetime.now().isoformat()
        }
    )

# Инициализация Sentry (опционально)
def init_sentry(dsn: Optional[str] = None):
    """Инициализация Sentry для отслеживания ошибок"""
    if dsn:
        sentry_sdk.init(
            dsn=dsn,
            traces_sample_rate=0.1,
            environment="production"
        )
        logger.info("✅ Sentry инициализирован")
    else:
        logger.info("⚠️ Sentry DSN не указан, отслеживание отключено")

# Health check endpoint
async def health_check() -> Dict[str, Any]:
    """Проверка здоровья системы"""
    try:
        stats = metrics.get_stats()
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "metrics": {
                "requests_total": stats.get("requests_total", 0),
                "avg_response_time": round(stats.get("avg_response_time", 0), 3),
                "success_rate": round(stats.get("success_rate", 100), 2),
                "cache_hit_rate": round(stats.get("cache_hit_rate", 0), 2),
                "db_queries": stats.get("db_queries", 0),
                "recent_errors": len(stats.get("errors", []))
            }
        }
    except Exception as e:
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "metrics": {
                "requests_total": 0,
                "avg_response_time": 0,
                "success_rate": 100,
                "cache_hit_rate": 0,
                "db_queries": 0,
                "recent_errors": 0
            },
            "monitoring_error": str(e)
        }

# Логирование важных событий
class EventLogger:
    @staticmethod
    def user_action(telegram_id: int, action: str, details: Dict[str, Any] = None):
        """Логирование действий пользователя"""
        logger.info(f"👤 User {telegram_id}: {action}", extra=details or {})
    
    @staticmethod
    def system_event(event: str, details: Dict[str, Any] = None):
        """Логирование системных событий"""
        logger.info(f"🔧 System: {event}", extra=details or {})
    
    @staticmethod
    def security_event(event: str, details: Dict[str, Any] = None):
        """Логирование событий безопасности"""
        logger.warning(f"🚨 Security: {event}", extra=details or {})
    
    @staticmethod
    def performance_warning(component: str, metric: str, value: float, threshold: float):
        """Логирование предупреждений производительности"""
        logger.warning(
            f"⚠️ Performance: {component} {metric}={value} (threshold={threshold})"
        )
