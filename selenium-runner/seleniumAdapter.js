const fs = require('fs');
const path = require('path');
const { screenshot } = require('./config');
const SCREENSHOTS_PREFIX = 'screenshots/';

class SeleniumAdapter {
    constructor(page, baseUrl, forceMobile = false) {
        this.page = page;
        this.baseUrl = baseUrl;
        this.isMobile = forceMobile;
    }

    /**
     * Мапування команд Selenium на методи Puppeteer
     */
    async execute(command) {
        const { command: cmd, target, value } = command;
        // Очищаємо селектор від префіксів Selenium (css=, id=, xpath=)
        const cleanTarget = target ? target.replace(/^(css=|xpath=|id=)/, '') : target;

        console.log(`      [Action] ${cmd}: ${target} ${value ? ' -> ' + value : ''}`);

        switch (cmd) {
            case 'open':
                await this.open(target);
                break;
            case 'click':
                await this.click(cleanTarget);
                break;
            case 'waitForElementPresent':
            case 'waitForElementVisible':
                await this.waitFor(cleanTarget, value);
                break;
            case 'captureEntirePageScreenshot':
                await this.captureScreenshot(target);
                break;
            case 'pause':
                await new Promise(r => setTimeout(r, parseInt(value) || 1000));
                break;
            case 'setWindowSize':
            case 'maximizeWindow':
                break; // розмір вікна керується з config.js
            default:
                console.warn(`      ⚠️ Команда [${cmd}] ще не реалізована в адаптері.`);
        }
    }

    async open(target) {
        const url = target.startsWith('http') ? target : `${this.baseUrl}${target}`;
        await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    }

    async click(selector) {
        await this.page.waitForSelector(selector, { visible: true });
        await this.page.click(selector);
    }

    async waitFor(selector, timeout) {
        await this.page.waitForSelector(selector, {
            visible: true,
            timeout: parseInt(timeout) || 15000
        });
    }

    async captureScreenshot(targetPath) {
        const platform = this.isMobile ? 'mobile' : 'desktop';
        const relativePath = targetPath.replace(SCREENSHOTS_PREFIX, `${screenshot.theme}/${platform}/`);
        const fullPath = path.resolve(__dirname, screenshot.outputDir, relativePath);
        // Створюємо дерево папок, якщо воно відсутнє
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });

        // Пауза для стабілізації UI перед знімком
        await new Promise(r => setTimeout(r, 800));
        const fullPage = this.isMobile ? screenshot.fullPageMobile : screenshot.fullPageDesktop;
        await this.page.screenshot({ path: fullPath, fullPage });
    }
}

module.exports = SeleniumAdapter;