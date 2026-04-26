const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const SeleniumAdapter = require('./seleniumAdapter');
const { baseUrl, screenshot } = require('./config');

const SCRIPTS_DIR = path.join(__dirname, '..', 'user-docs', 'katalon');
const ERRORS_DIR = path.join(__dirname, screenshot.errorsDir);

async function processFiles(page, files, forceMobile = false) {
    const label = forceMobile ? '📱 МОБІЛЬНИЙ ПРОХІД' : '🖥️  ДЕСКТОП ПРОХІД';
    console.log(`\n${label}: ${files.length} файлів`);

    for (const file of files) {
        console.log(`\n⏩ ОБРОБКА: ${file}`);

        if (forceMobile) {
            await page.setViewport({ width: screenshot.mobile.width, height: screenshot.mobile.height });
        } else {
            await page.setViewport(null);
        }

        let project;
        try {
            project = JSON.parse(fs.readFileSync(path.join(SCRIPTS_DIR, file), 'utf8'));
        } catch (err) {
            console.error(`      ❌ НЕВАЛІДНИЙ JSON: ${err.message}`);
            continue;
        }

        if (!Array.isArray(project.tests)) {
            console.error(`      ❌ НЕВАЛІДНА СТРУКТУРА: відсутнє поле tests[]`);
            continue;
        }

        const adapter = new SeleniumAdapter(page, baseUrl, forceMobile);

        for (const test of project.tests) {
            if (!Array.isArray(test.commands)) {
                console.error(`      ❌ НЕВАЛІДНА СТРУКТУРА: відсутнє поле commands[] в тесті "${test.id || test.name}"`);
                continue;
            }
            for (const command of test.commands) {
                try {
                    await adapter.execute(command);
                } catch (err) {
                    console.error(`      ❌ ПОМИЛКА: ${err.message}`);
                    fs.mkdirSync(ERRORS_DIR, { recursive: true });
                    const prefix = forceMobile ? 'mobile_' : '';
                    await page.screenshot({ path: path.join(ERRORS_DIR, `${prefix}error_${file}.png`) });
                    break;
                }
            }
        }
    }
}

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
        await page.goto(baseUrl, { waitUntil: 'networkidle2' });

        await new Promise(resolve => rl.question('\n🔓 Залогіньтесь на сайті та натисніть [Enter] тут для запуску скриптів...', () => resolve()));

        const files = fs.readdirSync(SCRIPTS_DIR).filter(f => f.endsWith('.side'));
        console.log(`\n📋 Знайдено файлів: ${files.length}.`);

        await processFiles(page, files, false);

        if (screenshot.mobile.enabled) {
            await processFiles(page, files, true);
        }

        console.log('\n✨ Успішно завершено!');
    } catch (criticalErr) {
        console.error('\n🛑 КРИТИЧНИЙ ЗБІЙ РАННЕРА:', criticalErr.message);
    } finally {
        rl.close();
        // browser.close();
    }
}

run();
