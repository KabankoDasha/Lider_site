const puppeteer = require('puppeteer');

let browser = null;

async function getBrowser() {
  if (!browser) {
    console.log('Запуск браузера...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser'
    });
    console.log('Браузер запущен');
  }
  return browser;
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    console.log('Браузер закрыт');
  }
}

// Закрываем браузер при завершении процесса
process.on('exit', closeBrowser);
process.on('SIGINT', closeBrowser);
process.on('SIGTERM', closeBrowser);

module.exports = { getBrowser, closeBrowser };