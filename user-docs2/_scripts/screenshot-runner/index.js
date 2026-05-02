'use strict';
const fs     = require('fs');
const path   = require('path');
const config = require('./config');
const { launchBrowser, promptReady } = require('./browser');
const { runCaptures }                = require('./capture');

// ─── Load catalog ─────────────────────────────────────────────────────────────

let allScreenshots;
try {
  const raw = fs.readFileSync(config.screenshotsJson, 'utf8');
  allScreenshots = JSON.parse(raw);
} catch (err) {
  if (err.code === 'ENOENT') {
    console.error(`\n❌ Файл каталогу не знайдено: ${config.screenshotsJson}`);
    console.error('   Запустіть спочатку catalog-generator:');
    console.error('   node workspace/user-docs2/_scripts/catalog-generator/index.js');
  } else {
    console.error(`\n❌ Помилка читання каталогу: ${err.message}`);
  }
  process.exit(1);
}

const toCapture     = allScreenshots.filter(s =>  config.captureTypes.includes(s.type));
const skippedByType = allScreenshots.filter(s => !config.captureTypes.includes(s.type));

console.log(`\n📋 Каталог: ${allScreenshots.length} скріншотів`);
console.log(`   Тема:      ${config.theme}  |  Платформа: ${config.platform}`);
console.log(`   Знімок:    ${config.fullCapture ? 'повний елемент (--full)' : 'видима область'}  |  Лог: ${config.verbose ? 'детальний' : 'короткий (--verbose для деталей)'}`);
console.log(`   Запускаємо (${config.captureTypes.join(', ')}): ${toCapture.length}`);
if (skippedByType.length) {
  const grouped = {};
  for (const s of skippedByType) grouped[s.type] = (grouped[s.type] || 0) + 1;
  const summary = Object.entries(grouped).map(([t, n]) => `${t}: ${n}`).join(', ');
  console.log(`   Пропускаємо (не в --type): ${skippedByType.length}  (${summary})`);
}
if (!toCapture.length) {
  console.log('\nНічого знімати. Перевір --type.');
  process.exit(0);
}
console.log(`   Вихідна папка: ${config.outputDir}`);

// ─── Run ──────────────────────────────────────────────────────────────────────

(async () => {
  const startedAt = new Date();
  const { browser, page } = await launchBrowser();

  try {
    await promptReady(page);
    const { ok, skipped, errors, total, log } = await runCaptures(page, toCapture);

    const duration = ((Date.now() - startedAt) / 1000).toFixed(1);

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`✅ Знято:      ${ok} / ${total}  (${duration}с)`);
    if (skipped) console.log(`⚠️  Пропущено:  ${skipped}  (елемент не видимий)`);
    if (errors)  console.log(`❌ Помилки:    ${errors}`);

    const errorLog = log.filter(e => e.status === 'error');
    const skipLog  = log.filter(e => e.status === 'skip');

    if (skipLog.length) {
      console.log(`\n⚠️  Пропущені (${skipLog.length}):`);
      for (const e of skipLog) {
        console.log(`   ${e.id}  [${e.type}]  — ${e.hint || 'не видимий'}`);
        if (e.errorFile) console.log(`        скріншот: ${path.basename(e.errorFile)}`);
      }
    }

    if (errorLog.length) {
      console.log(`\n❌ З помилками (${errorLog.length}):`);
      for (const e of errorLog) {
        console.log(`   ${e.id}  [${e.type}]  — ${e.code}: ${e.hint}`);
        if (e.errorFile) console.log(`        скріншот: ${path.basename(e.errorFile)}`);
      }
    }

    if (skippedByType.length) {
      const modalCount = skippedByType.filter(s => s.type === 'modal').length;
      console.log(`\n💡 Модалки (${modalCount} шт.) — знімайте вручну:`);
      console.log(`   node index.js --type modal`);
    }

    // ── Write run log ─────────────────────────────────────────────────────────
    if (log.some(e => e.status !== 'ok')) {
      const runId  = startedAt.toISOString().slice(0, 19).replace(/:/g, '-');
      const logFile = path.join(config.errorsDir, `run-${runId}.json`);
      const report  = {
        run:      runId,
        duration: `${duration}с`,
        stats:    { ok, skipped, errors, total },
        entries:  log.filter(e => e.status !== 'ok').map(e => ({
          id:        e.id,
          type:      e.type,
          url:       e.url,
          status:    e.status,
          code:      e.code,
          hint:      e.hint,
          errorFile: e.errorFile ? path.basename(e.errorFile) : null,
          ts:        e.ts,
        })),
      };
      fs.mkdirSync(config.errorsDir, { recursive: true });
      fs.writeFileSync(logFile, JSON.stringify(report, null, 2), 'utf8');
      console.log(`\n📄 Лог помилок: ${logFile}`);
    }

  } catch (err) {
    console.error('\n❌ Неочікувана помилка під час зйомки:');
    console.error('  ', err.message);
    console.error(err.stack);
  } finally {
    console.log('\nБраузер залишено відкритим. Закрийте вручну коли завершите.');
  }
})();
