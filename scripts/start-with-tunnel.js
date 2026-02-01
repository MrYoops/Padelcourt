const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_FILE = path.join(ROOT, 'mini-app', 'config.js');
const BACKEND_PORT = 8000;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(prefix, color, msg) {
  console.log(`${color}[${prefix}]${colors.reset} ${msg}`);
}

// Ждать пока порт станет доступен
function waitForPort(port, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const req = http.request({ host: 'localhost', port, method: 'GET', path: '/health', timeout: 1000 }, (res) => {
        resolve(true);
      });
      req.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error(`Port ${port} not ready after ${timeout}ms`));
        } else {
          setTimeout(check, 500);
        }
      });
      req.end();
    };
    check();
  });
}

// Запустить cloudflared и получить URL
function startCloudflaredTunnel(port) {
  return new Promise((resolve, reject) => {
    // Ищем cloudflared
    let cloudflaredPath = 'cloudflared';
    const localPath = path.join(ROOT, 'cloudflared.exe');
    if (fs.existsSync(localPath)) {
      cloudflaredPath = localPath;
    }

    log('TUNNEL', colors.blue, `Запускаю туннель для порта ${port}...`);

    const tunnel = spawn(cloudflaredPath, ['tunnel', '--url', `http://localhost:${port}`], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let url = null;
    const urlRegex = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/;

    const handleData = (data) => {
      const text = data.toString();
      const match = text.match(urlRegex);
      if (match && !url) {
        url = match[0];
        log('TUNNEL', colors.green, `✅ Туннель готов: ${url}`);
        resolve({ url, process: tunnel });
      }
    };

    tunnel.stdout.on('data', handleData);
    tunnel.stderr.on('data', handleData);

    tunnel.on('error', (err) => {
      reject(new Error(`Не удалось запустить cloudflared: ${err.message}`));
    });

    setTimeout(() => {
      if (!url) {
        tunnel.kill();
        reject(new Error('Таймаут: не удалось получить URL туннеля за 30 сек'));
      }
    }, 30000);
  });
}

// Обновить config.js с новым URL
function updateConfig(apiUrl) {
  const config = `// ===== АВТОГЕНЕРИРУЕМЫЙ ФАЙЛ =====
// Создан: ${new Date().toISOString()}
// НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ — перезаписывается при запуске!

// URL Backend API (через Cloudflare туннель)
window.API_BASE = '${apiUrl}';

// Debug режим
window.DEBUG = true;

function debug(msg) {
  if (window.DEBUG) {
    console.log('[PadelSense]', new Date().toISOString(), msg);
  }
}

console.log('[PadelSense] API_BASE =', window.API_BASE);
`;

  fs.writeFileSync(CONFIG_FILE, config, 'utf-8');
  log('CONFIG', colors.cyan, `Обновлён config.js → ${apiUrl}`);
}

// Git commit и push
function gitPush(apiUrl) {
  try {
    log('GIT', colors.blue, 'Коммичу изменения...');
    execSync('git add mini-app/config.js', { cwd: ROOT, stdio: 'pipe' });
    execSync(`git commit -m "Update API_BASE to ${apiUrl}" --allow-empty`, { cwd: ROOT, stdio: 'pipe' });

    log('GIT', colors.blue, 'Пушу в GitHub...');
    execSync('git push origin master', { cwd: ROOT, stdio: 'pipe' });

    log('GIT', colors.green, '✅ Запушено! Vercel передеплоит через ~1 мин');
    return true;
  } catch (err) {
    log('GIT', colors.yellow, `Ошибка git: ${err.message}`);
    log('GIT', colors.yellow, 'Попробуй вручную: git add . && git commit -m "update" && git push');
    return false;
  }
}

// Главная функция
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log(colors.green + '  🎾 PadelSense — Запуск с туннелем' + colors.reset);
  console.log('='.repeat(60) + '\n');

  const processes = [];

  try {
    // 1. Запустить PostgreSQL
    log('DB', colors.blue, 'Проверяю PostgreSQL...');
    try {
      execSync('docker compose up -d postgres', { cwd: ROOT, stdio: 'pipe' });
      log('DB', colors.green, '✅ PostgreSQL запущен');
    } catch (e) {
      log('DB', colors.yellow, '⚠️ Docker недоступен — регистрация не будет работать!');
    }

    // 2. Запустить Backend
    log('BACKEND', colors.blue, 'Запускаю Backend на порту ' + BACKEND_PORT + '...');
    const backend = spawn(
      process.platform === 'win32' ? 'python' : 'python3',
      ['-m', 'uvicorn', 'backend.main:app', '--host', '0.0.0.0', '--port', String(BACKEND_PORT)],
      { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }
    );
    processes.push(backend);

    backend.stdout.on('data', (d) => {
      const msg = d.toString().trim();
      if (msg) log('BACKEND', colors.blue, msg);
    });
    backend.stderr.on('data', (d) => {
      const msg = d.toString().trim();
      if (msg && !msg.includes('Uvicorn running')) {
        log('BACKEND', colors.blue, msg);
      }
    });

    // Ждать запуска Backend
    log('BACKEND', colors.blue, 'Жду готовности Backend...');
    await waitForPort(BACKEND_PORT, 30000);
    log('BACKEND', colors.green, '✅ Backend готов');

    // 3. Запустить туннель
    const tunnel = await startCloudflaredTunnel(BACKEND_PORT);
    processes.push(tunnel.process);

    // 4. Обновить config.js
    updateConfig(tunnel.url);

    // 5. Git push для Vercel
    gitPush(tunnel.url);

    // 6. Запустить бота
    log('BOT', colors.blue, 'Запускаю Telegram бота...');
    const bot = spawn(
      process.platform === 'win32' ? 'python' : 'python3',
      ['-m', 'bot.main'],
      { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }
    );
    processes.push(bot);

    bot.stdout.on('data', (d) => {
      const msg = d.toString().trim();
      if (msg) log('BOT', colors.green, msg);
    });
    bot.stderr.on('data', (d) => {
      const msg = d.toString().trim();
      if (msg) log('BOT', colors.yellow, msg);
    });

    // Готово!
    console.log('\n' + '='.repeat(60));
    console.log(colors.green + '  ✅ ВСЁ ЗАПУЩЕНО!' + colors.reset);
    console.log('='.repeat(60));
    console.log(`
  🔌 Backend API:  ${tunnel.url}
  📱 Mini App:     https://padelcourt-ruddy.vercel.app

  ⏳ Подожди ~1-2 минуты пока Vercel передеплоит Mini App

  Затем в Telegram:
  1. Открой @PadelSense_Bot
  2. Напиши /start
  3. Нажми "Открыть приложение"
  4. Заполни форму регистрации

  Для остановки нажми Ctrl+C
`);
    console.log('='.repeat(60) + '\n');

    // Обработка завершения
    const cleanup = () => {
      console.log('\n' + colors.yellow + 'Останавливаю процессы...' + colors.reset);
      processes.forEach(p => {
        try { p.kill(); } catch (e) {}
      });
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

  } catch (error) {
    log('ERROR', colors.red, error.message);
    processes.forEach(p => {
      try { p.kill(); } catch (e) {}
    });
    process.exit(1);
  }
}

main();
