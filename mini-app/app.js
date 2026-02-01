/**
 * PadelSense Mini App — навигация и интеграция с Telegram Web App
 */

(function () {
  const API_BASE = window.API_BASE || 'http://localhost:8000';

  // Telegram Web App
  const tg = window.Telegram && window.Telegram.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
    document.body.style.backgroundColor = tg.backgroundColor || '#0c0c0c';
  }

  // Глобальное состояние приложения
  window.PadelSense = {
    isAuthenticated: false,
    currentUser: null,
    isChecking: true
  };

  // Навигация по вкладкам
  const views = document.querySelectorAll('.view');
  const tabs = document.querySelectorAll('.tab');

  // Функция проверки авторизации
  function isAuthenticated() {
    return window.PadelSense.isAuthenticated && window.PadelSense.currentUser;
  }

  // Функция блокировки навигации
  function requireAuth(callback) {
    if (isAuthenticated()) {
      callback();
    } else {
      showView('register');
    }
  }

  // Показать индикатор загрузки
  function showLoadingIndicator() {
    var indicator = document.getElementById('loading-indicator');
    if (indicator) {
      indicator.style.display = 'flex';
    }
    var main = document.querySelector('.main');
    if (main) {
      main.style.opacity = '0.5';
      main.style.pointerEvents = 'none';
    }
  }

  // Скрыть индикатор загрузки
  function hideLoadingIndicator() {
    var indicator = document.getElementById('loading-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
    var main = document.querySelector('.main');
    if (main) {
      main.style.opacity = '1';
      main.style.pointerEvents = 'auto';
    }
  }

  function showView(viewId) {
    console.log('showView called with:', viewId);
    
    // Если идет проверка - не делать ничего
    if (window.PadelSense.isChecking) {
      console.log('Still checking auth, ignoring view change');
      return;
    }
    
    // Запрещенные view для неавторизованных
    var restrictedViews = ['qr', 'matches', 'highlights', 'analytics', 'subscription'];
    
    if (!isAuthenticated() && restrictedViews.includes(viewId)) {
      console.log('Access denied for view:', viewId, 'showing register');
      viewId = 'register';
    }
    
    // Показать view
    views.forEach(function (v) {
      v.classList.toggle('active', v.id === 'view-' + viewId);
    });
    tabs.forEach(function (t) {
      t.classList.toggle('active', t.dataset.view === viewId);
    });
    
    if (viewId === 'qr') renderQR();
  }

  // Получить текущего пользователя из localStorage
  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('padelsense_user') || 'null');
    } catch (e) {
      return null;
    }
  }

  // Показать/скрыть политику
  function showPersonalDataPolicy() {
    var modal = document.getElementById('policy-modal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  function closePolicyModal() {
    var modal = document.getElementById('policy-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Валидация телефона
  function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 0) {
      if (value[0] === '7') value = value.substring(1);
      if (value.length > 0) {
        let formatted = '+7';
        if (value.length > 0) formatted += ' (' + value.substring(0, 3);
        if (value.length > 3) formatted += ') ' + value.substring(3, 6);
        if (value.length > 6) formatted += '-' + value.substring(6, 8);
        if (value.length > 8) formatted += '-' + value.substring(8, 10);
        input.value = formatted;
      }
    }
  }

  // Улучшенная регистрация
  async function registerUser() {
    debug('Начало регистрации');
    var form = document.getElementById('register-form');
    var submitBtn = document.getElementById('btn-register-submit');
    
    if (!form) {
      debug('Форма не найдена!');
      return;
    }
    
    // Валидация формы
    if (!form.checkValidity()) {
      debug('Форма не прошла валидацию');
      form.reportValidity();
      return;
    }
    
    var formData = new FormData(form);
    var tgUser = null;
    
    // Безопасная проверка Telegram WebApp
    try {
      if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        tgUser = tg.initDataUnsafe.user;
      }
    } catch (e) {
      console.log('Telegram WebApp error:', e);
    }
    
    // ТЕСТОВЫЙ РЕЖИМ - если нет Telegram, создаём тестового пользователя
    if (!tgUser) {
      debug('Тестовый режим - создаем пользователя');
      tgUser = {
        id: 123456789,
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        photo_url: null
      };
    }
    
    debug('Данные формы валидны');
    
    // Показать загрузку
    var originalText = submitBtn.textContent;
    submitBtn.textContent = 'Регистрация...';
    submitBtn.disabled = true;
    
    try {
      var userData = {
        telegram_id: tgUser.id,
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        phone: formData.get('phone'),
        email: formData.get('email') || null,
        photo_url: tgUser.photo_url || null,
        marketing_consent: formData.get('marketing') === 'on'
      };
      
      debug('Отправка данных: ' + JSON.stringify(userData));
      
      var res = await fetch(API_BASE + '/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      debug('Статус ответа: ' + res.status);
      
      if (res.ok) {
        var result = await res.json();
        localStorage.setItem('padelsense_user', JSON.stringify(result));
        
        // Установить состояние авторизации
        window.PadelSense.isAuthenticated = true;
        window.PadelSense.currentUser = result;
        
        debug('Регистрация успешна');
        alert('Регистрация успешна! Добро пожаловать в PadelSense!');
        showView('qr');
      } else {
        var err = await res.json();
        debug('Ошибка регистрации: ' + JSON.stringify(err));
        if (res.status === 409) {
          // Пользователь уже существует - установить состояние и показать QR
          var existingUser = err.user || {
            id: 'test-id',
            telegram_id: tgUser.id,
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            name: formData.get('first_name') + ' ' + formData.get('last_name')
          };
          localStorage.setItem('padelsense_user', JSON.stringify(existingUser));
          window.PadelSense.isAuthenticated = true;
          window.PadelSense.currentUser = existingUser;
          alert('Вы уже зарегистрированы!');
          showView('qr');
        } else {
          alert('Ошибка: ' + (err.detail || 'Попробуйте позже'));
        }
      }
    } catch (e) {
      debug('Ошибка сети: ' + e.message);
      alert('Нет связи с сервером. Проверьте интернет-соединение.');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  // Проверка авторизации пользователя
  async function checkUserExists() {
    showLoadingIndicator();
    window.PadelSense.isChecking = true;
    
    var telegramId = null;
    
    // Безопасная проверка Telegram WebApp
    try {
      if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id) {
        telegramId = tg.initDataUnsafe.user.id;
      }
    } catch (e) {
      console.log('Telegram WebApp error:', e);
    }
    
    console.log('checkUserExists - telegramId:', telegramId);
    
    if (!telegramId) {
      console.log('No telegramId, showing register');
      window.PadelSense.isAuthenticated = false;
      window.PadelSense.currentUser = null;
      showView('register');
      hideLoadingIndicator();
      window.PadelSense.isChecking = false;
      return;
    }
    
    // Проверить localStorage
    var cachedUser = localStorage.getItem('padelsense_user');
    if (cachedUser) {
      try {
        var user = JSON.parse(cachedUser);
        if (user.telegram_id === telegramId) {
          console.log('Found cached user, showing QR');
          window.PadelSense.isAuthenticated = true;
          window.PadelSense.currentUser = user;
          showView('qr');
          hideLoadingIndicator();
          window.PadelSense.isChecking = false;
          return;
        }
      } catch (e) {
        localStorage.removeItem('padelsense_user');
      }
    }
    
    // Проверить на сервере
    try {
      var res = await fetch(API_BASE + '/api/users/by-telegram/' + telegramId);
      if (res.status === 404) {
        console.log('User not found, showing register');
        window.PadelSense.isAuthenticated = false;
        window.PadelSense.currentUser = null;
        showView('register');
      } else if (res.ok) {
        var userData = await res.json();
        localStorage.setItem('padelsense_user', JSON.stringify(userData));
        window.PadelSense.isAuthenticated = true;
        window.PadelSense.currentUser = userData;
        showView('qr');
      } else {
        console.log('Server error, showing register');
        window.PadelSense.isAuthenticated = false;
        window.PadelSense.currentUser = null;
        showView('register');
      }
    } catch (e) {
      console.error('Ошибка проверки:', e);
      window.PadelSense.isAuthenticated = false;
      window.PadelSense.currentUser = null;
      showView('register');
    }
    
    hideLoadingIndicator();
    window.PadelSense.isChecking = false;
  }

  // Навигация с проверкой авторизации
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var viewId = this.dataset.view;
      console.log('Navigation clicked:', viewId);
      
      // Проверить авторизацию для защищенных view
      if (['qr', 'matches', 'highlights', 'analytics', 'subscription'].includes(viewId)) {
        requireAuth(function() { showView(viewId); });
      } else {
        showView(viewId);
      }
    });
  });

  // Навигация по data-nav
  document.querySelectorAll('[data-nav]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var nav = this.dataset.nav;
      console.log('Data-nav clicked:', nav);
      
      if (['qr', 'matches', 'highlights', 'analytics', 'subscription'].includes(nav)) {
        requireAuth(function() { showView(nav); });
      } else {
        showView(nav);
      }
    });
  });

  // QR-код с использованием сохранённых данных
  function renderQR() {
    var container = document.getElementById('qr-canvas');
    var hint = document.getElementById('qr-hint');
    if (!container || !hint) return;

    var user = getCurrentUser();
    var telegramId = user ? user.telegram_id : null;
    
    if (!telegramId && tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      telegramId = tg.initDataUnsafe.user.id;
    }
    
    if (!telegramId) {
      hint.textContent = 'Войдите через Telegram — здесь появится ваш QR для входа на корт.';
      container.innerHTML = '';
      return;
    }

    container.innerHTML = '';
    var qrValue = 'user:' + telegramId;
    if (typeof QRCode !== 'undefined') {
      new QRCode(container, { text: qrValue, width: 180, height: 180 });
    } else {
      var placeholder = document.createElement('div');
      placeholder.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;word-break:break-all;padding:8px;';
      placeholder.textContent = 'QR: ' + qrValue;
      container.appendChild(placeholder);
    }
    
    // Показать имя пользователя если есть
    if (user && user.name) {
      hint.textContent = user.name + ', покажите этот экран планшету у корта.';
    } else if (user && user.first_name) {
      hint.textContent = user.first_name + ', покажите этот экран планшету у корта.';
    } else {
      hint.textContent = 'Покажите этот экран планшету у корта.';
    }
  }

  // Загрузка матчей (заглушка)
  function loadMatches() {
    var list = document.getElementById('matches-list');
    var empty = document.getElementById('matches-empty');
    if (!list || !empty) return;
    // TODO: GET /users/me/matches с initData
    empty.style.display = 'block';
  }

  // Загрузка хайлайтов (заглушка)
  function loadHighlights() {
    var empty = document.getElementById('highlights-empty');
    if (empty) empty.style.display = 'block';
  }

  // При первом показе матчей/хайлайтов — загрузить
  document.querySelector('.tab[data-view="matches"]').addEventListener('click', loadMatches, { once: true });
  document.querySelector('.tab[data-view="highlights"]').addEventListener('click', loadHighlights, { once: true });

  // Кнопка «Оформить PRO»
  var btnUpgrade = document.getElementById('btn-upgrade');
  if (btnUpgrade) {
    btnUpgrade.addEventListener('click', function (e) {
      e.preventDefault();
      requireAuth(function() { showView('subscription'); });
    });
  }

  // Обработчик формы регистрации
  document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('register-form');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        registerUser();
      });
    }
    
    // Форматирование телефона
    var phoneInput = document.getElementById('phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', function() {
        formatPhone(this);
      });
    }
  });

  // Инициализация: проверить пользователя по Telegram
  checkUserExists();

  // Экспортируем функции для глобального доступа
  window.showPersonalDataPolicy = showPersonalDataPolicy;
  window.closePolicyModal = closePolicyModal;
})();
