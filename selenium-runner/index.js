const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const SeleniumAdapter = require('./seleniumAdapter'); // Імпорт нашого адаптера
const { baseUrl } = require('./config');

const SCRIPTS_DIR = path.join(__dirname, '..', 'user-docs', 'katalon');

async function run() {
    console.log('🚀 Ініціалізація браузера...');
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized'],
        userDataDir: path.join(__dirname, 'chrome-profile'),
    });

    const page = await browser.newPage();
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    try {
        // Перехід на початкову сторінку для логіну
        await page.goto(baseUrl, { waitUntil: 'networkidle2' });

        await new Promise(resolve => rl.question('\n🔓 Залогіньтесь на сайті та натисніть [Enter] тут для запуску скриптів...', () => resolve()));

        const files = fs.readdirSync(SCRIPTS_DIR).filter(f => f.endsWith('.side'));
        console.log(`\n📋 Знайдено файлів: ${files.length}. Починаю обробку...`);

        for (const file of files) {
            console.log(`\n⏩ ОБРОБКА: ${file}`);
            await page.setViewport(null); // Скидаємо viewport перед кожним файлом
            const project = JSON.parse(fs.readFileSync(path.join(SCRIPTS_DIR, file), 'utf8'));

            // Створюємо екземпляр адаптера для конкретного файлу
            const adapter = new SeleniumAdapter(page, project.url || baseUrl);

            for (const test of project.tests) {
                for (const command of test.commands) {
                    try {
                        await adapter.execute(command);
                    } catch (err) {
                        console.error(`      ❌ ПОМИЛКА: ${err.message}`);
                        // Скріншот помилки для дебагу
                        await page.screenshot({ path: `error_${file}.png` });
                        break; // Перехід до наступного .side файлу
                    }
                }
            }
        }

        console.log('\n✨ Успішно завершено!');
    } catch (criticalErr) {
        console.error('\n🛑 КРИТИЧНИЙ ЗБІЙ РАННЕРА:', criticalErr.message);
    } finally {
        rl.close();
        // browser.close(); // Можна закрити після тестування
    }
}

run();