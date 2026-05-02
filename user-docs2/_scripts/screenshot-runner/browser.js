'use strict';
const puppeteer = require('puppeteer');
const readline  = require('readline');
const config    = require('./config');

async function launchBrowser() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,  // do not override — use whatever size the user sets manually
      args: ['--disable-infobars'],
      userDataDir: config.chromeProfile,  // persistent session — cookies, localStorage, auth
    });
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('ENOENT') || msg.includes('No usable sandbox')) {
      console.error('\n❌ Не вдалося запустити Chromium.');
      console.error('   Можливі причини:');
      console.error('     • не виконано npm install');
      console.error('     • Chromium не завантажено — спробуй: npx puppeteer browsers install chrome');
    } else if (msg.includes('EACCES') || msg.includes('user data directory is already in use')) {
      console.error('\n❌ Chrome профіль заблоковано.');
      console.error('   Можливо вже відкритий інший екземпляр браузера з тим самим профілем.');
      console.error(`   Профіль: ${config.chromeProfile}`);
    } else {
      console.error('\n❌ Помилка запуску браузера:', msg);
    }
    process.exit(1);
  }

  const [page] = await browser.pages();
  return { browser, page };
}

async function promptReady(page) {
  // Pause BEFORE any navigation — user may need to start the app first
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise(resolve =>
    rl.question(
      `\n🔓 Підготуйте браузер (${config.baseUrl}):\n` +
      '     • запустіть додаток якщо ще не запущено\n' +
      '     • залогіньтесь\n' +
      '     • виберіть тему (світла / темна)\n' +
      '     • перевірте розмір вікна\n' +
      '\n   Натисніть [Enter] щоб почати...\n',
      () => { rl.close(); resolve(); }
    )
  );

  try {
    await page.goto(config.baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (err) {
    const msg = err.message || '';
    console.error(`\n❌ Не вдалося підключитися до ${config.baseUrl}`);
    if (msg.includes('ERR_CONNECTION_REFUSED')) {
      console.error('   Додаток не запущено або слухає інший порт.');
      console.error(`   Перевірте baseUrl в config.js (зараз: ${config.baseUrl})`);
    } else if (msg.includes('Navigation timeout')) {
      console.error('   Сторінка не відповіла за 30с — можливо зависла.');
    } else {
      console.error('  ', msg);
    }
    process.exit(1);
  }
}

module.exports = { launchBrowser, promptReady };
