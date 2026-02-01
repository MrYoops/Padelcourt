/**
 * Одна команда: Mini App + туннель + бот.
 * Сначала пробует Cloudflare; если не получилось — localtunnel (при открытии в Telegram ввести пароль = ваш внешний IP).
 *
 * Запуск: npm start  (из корня проекта)
 * Нужно: Node.js, Python, в .env — BOT_TOKEN
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const rootDir = path.join(__dirname, '..');
const miniAppDir = path.join(rootDir, 'mini-app');
const port = 3000;
const cloudflaredCmd = process.platform === 'win32' && fs.existsSync(path.join(rootDir, 'cloudflared.exe'))
  ? path.join(rootDir, 'cloudflared.exe')
  : 'cloudflared';

let tunnelProcess = null;
let ltClient = null;
let serverProcess = null;
let botProcess = null;

function killAll() {
  if (botProcess) try { botProcess.kill(); } catch (_) {}
  if (serverProcess) try { serverProcess.kill(); } catch (_) {}
  if (ltClient) try { ltClient.close(); } catch (_) {}
  if (tunnelProcess) try { tunnelProcess.kill(); } catch (_) {}
  process.exit(0);
}

process.on('SIGINT', killAll);
process.on('SIGTERM', killAll);

function startMiniAppServer() {
  return new Promise((resolve, reject) => {
    const python = process.platform === 'win32' ? 'python' : 'python3';
    serverProcess = spawn(python, ['-m', 'http.server', String(port)], {
      cwd: miniAppDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });
    serverProcess.stderr.on('data', (d) => process.stderr.write(d));
    serverProcess.on('error', reject);
    setTimeout(resolve, 1500);
  });
}

function createCloudflareTunnel() {
  return new Promise((resolve, reject) => {
    const urlRegex = /https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/;
    let resolved = false;
    const stderrChunks = [];

    tunnelProcess = spawn(cloudflaredCmd, ['tunnel', '--url', `http://localhost:${port}`], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    const check = (data) => {
      const str = Buffer.isBuffer(data) ? data.toString('utf8') : String(data);
      const m = str.match(urlRegex);
      if (m && !resolved) {
        resolved = true;
        resolve(m[0]);
      }
    };

    tunnelProcess.stdout.on('data', (d) => {
      stderrChunks.push(d);
      check(d);
    });
    tunnelProcess.stderr.on('data', (d) => {
      stderrChunks.push(d);
      check(d);
    });

    tunnelProcess.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        reject(new Error('cloudflared не найден. Установите: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/'));
      }
    });

    tunnelProcess.on('exit', (code) => {
      if (!resolved && code !== 0) {
        resolved = true;
        const buf = Buffer.concat(stderrChunks);
        let stderrText = buf.toString('utf8').trim();
        if (process.platform === 'win32' && /[\u4e00-\u9fff]/.test(stderrText)) {
          try {
            const alt = buf.toString('win1251').trim();
            if (alt && !/[\u4e00-\u9fff]/.test(alt)) stderrText = alt;
          } catch (_) {}
        }
        const hint = stderrText ? `\nВывод cloudflared:\n${stderrText}` : '';
        const manual = '\n\nЕсли вывод кракозябрами — выполните вручную в отдельном терминале:\n  cloudflared tunnel --url http://localhost:3000\nчтобы увидеть реальную ошибку.';
        reject(new Error('cloudflared завершился с кодом ' + code + hint + manual));
      }
    });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error('Таймаут: cloudflared не вернул URL за 15 сек'));
      }
    }, 15000);
  });
}

function getPublicIp() {
  return new Promise((resolve, reject) => {
    const req = https.get('https://api.ipify.org?format=text', { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data.trim()));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

function createLocaltunnel() {
  return new Promise(async (resolve, reject) => {
    try {
      const localtunnel = require('localtunnel');
      const tunnel = await localtunnel({ port });
      ltClient = tunnel;
      tunnel.on('close', () => { ltClient = null; });
      const url = tunnel.url;
      const ip = await getPublicIp();
      resolve({ url, password: ip || 'ваш внешний IP (проверьте на api.ipify.org)' });
    } catch (err) {
      reject(err);
    }
  });
}

function startBot(miniAppUrl) {
  return new Promise((resolve, reject) => {
    const python = process.platform === 'win32' ? 'python' : 'python3';
    const env = { ...process.env, MINI_APP_URL: miniAppUrl };
    botProcess = spawn(python, ['-m', 'bot.main'], {
      cwd: rootDir,
      env,
      stdio: 'inherit',
      shell: true,
    });
    botProcess.on('error', reject);
    botProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) killAll();
    });
    resolve();
  });
}

async function main() {
  console.log('PadelSense: запуск...\n');

  console.log('1) Запуск Mini App на порту', port, '...');
  await startMiniAppServer();
  console.log('   Mini App: http://localhost:' + port + '\n');

  let miniAppUrl;
  let usedLocaltunnel = false;
  let tunnelPassword = '';

  console.log('2) Туннель (сначала Cloudflare)...');
  try {
    miniAppUrl = await createCloudflareTunnel();
    console.log('   Mini App URL:', miniAppUrl);
    console.log('   (в Telegram нажмите «Открыть приложение»)\n');
  } catch (err) {
    if (tunnelProcess) try { tunnelProcess.kill(); tunnelProcess = null; } catch (_) {}
    console.log('   Cloudflare не получился, пробуем localtunnel...');
    try {
      const result = await createLocaltunnel();
      miniAppUrl = result.url;
      tunnelPassword = result.password;
      usedLocaltunnel = true;
      console.log('   Mini App URL:', miniAppUrl);
      console.log('   При открытии в Telegram появится страница с паролем.');
      console.log('   Введите пароль:', tunnelPassword);
      console.log('');
    } catch (err2) {
      console.error(err.message || err);
      console.error('');
      console.error('Localtunnel тоже не запустился:', err2.message || err2);
      throw err2;
    }
  }

  console.log('3) Запуск бота...');
  await startBot(miniAppUrl);

  if (usedLocaltunnel) {
    console.log('\nПароль для страницы в Telegram:', tunnelPassword);
  }
  console.log('\nГотово. В Telegram: «Открыть приложение». Остановка: Ctrl+C\n');
}

main().catch((err) => {
  console.error(err.message || err);
  killAll();
});
