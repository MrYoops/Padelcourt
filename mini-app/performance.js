/**
 * Модуль оптимизации производительности Mini App
 */

// Service Worker для кэширования
const CACHE_NAME = 'padelsense-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js'
];

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ ServiceWorker зарегистрирован:', registration);
      })
      .catch(error => {
        console.log('❌ Ошибка ServiceWorker:', error);
      });
  });
}

// Оптимизация запросов с кэшированием
class OptimizedAPI {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 минут
  }

  async request(url, options = {}) {
    const cacheKey = `${url}:${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    // Проверяем кэш
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('🎯 API Cache hit:', url);
      return cached.data;
    }

    try {
      // Оптимизированный fetch с таймаутом
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10с таймаут

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Сохраняем в кэш
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      console.log('💾 API Cache set:', url);
      return data;

    } catch (error) {
      console.error('❌ API Error:', error);
      
      // Пробуем вернуть устаревшие данные из кэша
      if (cached) {
        console.log('⚠️ Используем устаревшие данные из кэша');
        return cached.data;
      }
      
      throw error;
    }
  }

  // Очистка кэша
  clearCache() {
    this.cache.clear();
    console.log('🧹 API кэш очищен');
  }

  // Предзагрузка данных
  async preload(urls) {
    console.log('🚀 Предзагрузка данных...');
    const promises = urls.map(url => 
      this.request(url).catch(error => 
        console.warn(`⚠️ Ошибка предзагрузки ${url}:`, error)
      )
    );
    
    await Promise.allSettled(promises);
    console.log('✅ Предзагрузка завершена');
  }
}

// Оптимизация рендеринга
class PerformanceOptimizer {
  constructor() {
    this.rafId = null;
    this.pendingUpdates = new Set();
  }

  // Batch DOM обновления
  scheduleUpdate(updateFn) {
    this.pendingUpdates.add(updateFn);
    
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.flushUpdates();
      });
    }
  }

  flushUpdates() {
    for (const updateFn of this.pendingUpdates) {
      try {
        updateFn();
      } catch (error) {
        console.error('❌ Ошибка обновления DOM:', error);
      }
    }
    
    this.pendingUpdates.clear();
    this.rafId = null;
  }

  // Ленивая загрузка изображений
  lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback для старых браузеров
      images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    }
  }

  // Оптимизация скролла
  optimizeScroll() {
    let ticking = false;
    
    const updateScroll = () => {
      // Обновление UI при скролле
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }
}

// Мониторинг производительности
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiCalls: 0,
      cacheHits: 0,
      errors: 0,
      renderTime: 0
    };
  }

  // Замер времени выполнения
  measure(name, fn) {
    return async (...args) => {
      const start = performance.now();
      try {
        const result = await fn(...args);
        const duration = performance.now() - start;
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
        return result;
      } catch (error) {
        this.metrics.errors++;
        throw error;
      }
    };
  }

  // Получение метрик
  getMetrics() {
    return {
      ...this.metrics,
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
      } : null
    };
  }

  // Логирование метрик
  logMetrics() {
    const metrics = this.getMetrics();
    console.log('📊 Performance Metrics:', metrics);
  }
}

// Глобальные экземпляры
window.PadelSenseAPI = new OptimizedAPI();
window.PadelSensePerf = new PerformanceOptimizer();
window.PadelSenseMonitor = new PerformanceMonitor();

// Автоматическая оптимизация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  // Оптимизация скролла
  window.PadelSensePerf.optimizeScroll();
  
  // Ленивая загрузка изображений
  window.PadelSensePerf.lazyLoadImages();
  
  // Логирование метрик каждые 30 секунд
  setInterval(() => {
    window.PadelSenseMonitor.logMetrics();
  }, 30000);
});

// Обработка ошибок производительности
window.addEventListener('error', (event) => {
  console.error('❌ Performance Error:', event.error);
  window.PadelSenseMonitor.metrics.errors++;
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled Promise Rejection:', event.reason);
  window.PadelSenseMonitor.metrics.errors++;
});
