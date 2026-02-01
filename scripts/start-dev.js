/**
 * Локальная разработка: запускает только Backend + Bot
 * Mini App берётся с Vercel (или локально если нужно)
 */

const { spawn, execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKEND_PORT = 8000;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(prefix, color, msg) {
  console.log(`${color}[${prefix}]${colors.reset} ${msg}`);
}

async function main() {
  console.log('\n========================================');
  console.log('  PadelSense — Локальная разработка');
  console.log('========================================\n');

  // 1. PostgreSQL
  log('DB', colors.blue, 'Запускаю PostgreSQL...');
  try {
    execSync('docker compose up -d postgres', { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {
    log('DB', colors.yellow, 'Docker недоступен, продолжаю...');
  }

  // 2. Backend
  log('BACKEND', colors.blue, 'Запускаю Backend...');
  const backend = spawn(
    process.platform === 'win32' ? 'python' : 'python3',
    ['-m', 'uvicorn', 'backend.main:app', '--reload', '--host', '0.0.0.0', '--port', String(BACKEND_PORT)],
    { cwd: ROOT, stdio: 'inherit' }
  );

  // 3. Bot
  log('BOT', colors.blue, 'Запускаю Telegram бота...');
  const bot = spawn(
    process.platform === 'win32' ? 'python' : 'python3',
    ['-m', 'bot.main'],
    { cwd: ROOT, stdio: 'inherit' }
  );

  console.log(`
========================================
  Запущено!

  Backend: http://localhost:${BACKEND_PORT}
  Mini App: https://padelcourt-ruddy.vercel.app

  Бот готов — напиши /start в @PadelSense_Bot
========================================
`);

  // Cleanup
  process.on('SIGINT', () => {
    backend.kill();
    bot.kill();
    process.exit(0);
  });
}

main();
