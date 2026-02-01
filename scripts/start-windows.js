/**
 * Запуск PadelSense в отдельных консолях (Windows).
 * Backend, Mini App и Бот — в своих окнах; туннели — в этом окне.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const MINI_APP_DIR = path.join(ROOT, 'mini-app');
const CONFIG_FILE = path.join(MINI_APP_DIR, 'config.js');

const BACKEND_PORT = 8000;
const MINIAPP_PORT = 3000;

const isWindows = process.platform === 'win32';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(prefix, color, message) {
  console.log(`${color}[${prefix}]${colors.reset} ${message}`);
}

function waitForPort(port, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const req = http.request({ host: 'localhost', port, method: 'GET', path: '/', timeout: 1000 }, (res) => {
        resolve(true);
      });
      req.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error(`Порт ${port} не открылся за ${timeout}ms`));
        } else {
          setTimeout(check, 500);
        }
      });
      req.end();
    };
    check();
  });
}

function startTunnel(port, name) {
  return new Promise((resolve, reject) => {
    const cloudflared = isWindows ? path.join(ROOT, 'cloudflared.exe') : 'cloudflared';

    if (isWindows && !fs.existsSync(cloudflared)) {
      reject(new Error('cloudflared.exe не найден в корне проекта. Скачай с https://github.com/cloudflare/cloudflared/releases'));
      return;
    }

    const tunnel = spawn(cloudflared, ['tunnel', '--url', `http://localhost:${port}`], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let url = null;
    const urlRegex = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/;

    const onData = (data) => {
      const text = data.toString();
      const match = text.match(urlRegex);
      if (match && !url) {
        url = match[0];
        log(name, colors.green, `Туннель: ${url}`);
        resolve({ url, process: tunnel });
      }
    };

    tunnel.stdout.on('data', onData);
    tunnel.stderr.on('data', onData);
    tunnel.on('error', (err) => reject(new Error(`Ошибка туннеля ${name}: ${err.message}`)));

    setTimeout(() => {
      if (!url) {
        tunnel.kill();
        reject(new Error(`Таймаут получения URL туннеля ${name}`));
      }
    }, 30000);
  });
}

function writeConfig(apiUrl) {
  const config = `// Автогенерируемый файл — не редактировать!
// Создан: ${new Date().toISOString()}
window.API_BASE = '${apiUrl}';
window.DEBUG = true;
function debug(msg) {
  if (window.DEBUG) console.log('[PadelSense]', new Date().toISOString(), msg);
}
`;
  fs.writeFileSync(CONFIG_FILE, config);
  log('CONFIG', colors.cyan, `Записан ${CONFIG_FILE}`);
}

function updateIndexHtml() {
  const indexPath = path.join(MINI_APP_DIR, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf-8');
  if (!html.includes('config.js')) {
    html = html.replace(
      '<script src="app.js"></script>',
      '<script src="config.js"></script>\n  <script src="app.js"></script>'
    );
    fs.writeFileSync(indexPath, html);
    log('HTML', colors.cyan, 'Добавлен config.js в index.html');
  }
}

function cleanOldConfig() {
  const indexPath = path.join(MINI_APP_DIR, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf-8');
  const oldConfigRegex = /<script>\s*\/\/\s*===\s*КОНФИГУРАЦИЯ[\s\S]*?<\/script>\s*(?=<script src=")/;
  if (oldConfigRegex.test(html)) {
    html = html.replace(oldConfigRegex, '');
    fs.writeFileSync(indexPath, html);
    log('HTML', colors.yellow, 'Удалён старый inline конфиг');
  }
}

// Запустить команду в новом окне (Windows). Заголовок только ASCII — иначе cmd ломается.
function runInNewWindow(title, command) {
  const rootEsc = ROOT.replace(/"/g, '\\"');
  const fullCmd = `cd /d "${rootEsc}" && ${command}`;
  const inner = fullCmd.replace(/"/g, '\\"');
  try {
    execSync(`start "${title}" cmd /k "${inner}"`, { cwd: ROOT, stdio: 'inherit', shell: true });
  } catch (err) {
    throw new Error(`Не удалось открыть окно "${title}": ${err.message}`);
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log(colors.green + '  PadelSense — запуск в отдельных окнах' + colors.reset);
  console.log('='.repeat(60));
  console.log('ROOT:', ROOT);
  console.log('Node:', process.version);
  console.log('');

  const tunnelProcesses = [];

  try {
    if (!isWindows) {
      log('ERROR', colors.red, 'Скрипт только для Windows. Используй: npm start');
      process.exit(1);
    }

    // 1. PostgreSQL
    log('DB', colors.blue, 'Проверяю PostgreSQL...');
    try {
      execSync('docker compose up -d postgres', { cwd: ROOT, stdio: 'inherit' });
      log('DB', colors.green, 'PostgreSQL запущен');
    } catch (e) {
      log('DB', colors.yellow, 'Docker недоступен, продолжаю без БД');
    }

    // 2. Окно: Backend
    log('BACKEND', colors.blue, 'Открываю окно Backend...');
    runInNewWindow('PadelSense - Backend API', 'python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000');
    log('BACKEND', colors.blue, 'Жду запуска Backend...');
    await waitForPort(BACKEND_PORT, 30000);
    log('BACKEND', colors.green, `Backend готов на http://localhost:${BACKEND_PORT}`);

    // 3. Окно: Mini App
    log('MINIAPP', colors.blue, 'Открываю окно Mini App...');
    runInNewWindow('PadelSense - Mini App', `npx http-server "${MINI_APP_DIR}" -p ${MINIAPP_PORT} -c-1 --cors`);
    log('MINIAPP', colors.blue, 'Жду запуска Mini App...');
    await waitForPort(MINIAPP_PORT, 15000);
    log('MINIAPP', colors.green, `Mini App готов на http://localhost:${MINIAPP_PORT}`);

    // 4. Туннель Backend (в этом окне)
    log('TUNNEL', colors.blue, 'Запускаю туннель для Backend...');
    const backendTunnel = await startTunnel(BACKEND_PORT, 'API-TUNNEL');
    tunnelProcesses.push(backendTunnel.process);

    cleanOldConfig();
    updateIndexHtml();
    writeConfig(backendTunnel.url);

    // 5. Туннель Mini App (в этом окне)
    log('TUNNEL', colors.blue, 'Запускаю туннель для Mini App...');
    const miniappTunnel = await startTunnel(MINIAPP_PORT, 'APP-TUNNEL');
    tunnelProcesses.push(miniappTunnel.process);

    // 6. .env
    const envPath = path.join(ROOT, '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    if (envContent.includes('MINI_APP_URL=')) {
      envContent = envContent.replace(/MINI_APP_URL=.*/g, `MINI_APP_URL=${miniappTunnel.url}`);
    } else {
      envContent += `\nMINI_APP_URL=${miniappTunnel.url}`;
    }
    fs.writeFileSync(envPath, envContent);
    log('ENV', colors.cyan, `MINI_APP_URL=${miniappTunnel.url}`);

    // 7. Окно: Бот
    log('BOT', colors.blue, 'Открываю окно Telegram бота...');
    runInNewWindow('PadelSense - Telegram Bot', `set "MINI_APP_URL=${miniappTunnel.url}" && python -m bot.main`);

    console.log('\n' + '='.repeat(60));
    console.log(colors.green + '  ✅ Всё запущено в отдельных окнах!' + colors.reset);
    console.log('='.repeat(60));
    console.log(`
  📱 Mini App:  ${miniappTunnel.url}
  🔌 Backend:   ${backendTunnel.url}
  🏠 Local App: http://localhost:${MINIAPP_PORT}
  🏠 Local API: http://localhost:${BACKEND_PORT}

  Окна: Backend API | Mini App | Telegram Bot | это окно (туннели)

  Открой Telegram → @PadelSense_Bot → /start → "Открыть приложение"

  Закрой это окно или нажми Ctrl+C — остановятся только туннели.
  Остальные окна закрой вручную.
`);
    console.log('='.repeat(60) + '\n');

    const cleanup = () => {
      console.log('\n' + colors.yellow + 'Останавливаю туннели...' + colors.reset);
      tunnelProcesses.forEach(p => { try { p.kill(); } catch (e) {} });
      process.exit(0);
    };
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

  } catch (error) {
    log('ERROR', colors.red, error.message);
    tunnelProcesses.forEach(p => { try { p.kill(); } catch (e) {} });
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(colors.red + (err && err.message ? err.message : String(err)) + colors.reset);
  process.exit(1);
});
