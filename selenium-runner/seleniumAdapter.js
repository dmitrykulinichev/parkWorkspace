const fs = require('fs');
const path = require('path');

class SeleniumAdapter {
    constructor(page, baseUrl) {
        this.page = page;
        this.baseUrl = baseUrl;
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
        const fullPath = path.join(__dirname, targetPath);
        // Створюємо дерево папок, якщо воно відсутнє
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });

        // Пауза для стабілізації UI перед знімком
        await new Promise(r => setTimeout(r, 800));
        await this.page.screenshot({ path: fullPath, fullPage: true });
    }
}

module.exports = SeleniumAdapter;