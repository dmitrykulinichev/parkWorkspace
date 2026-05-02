'use strict';
const fs   = require('fs');
const path = require('path');
const config = require('./config');

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function ts() {
  return new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
}

const vlog = (...args) => { if (config.verbose) console.log(...args); };

// ─── Error helpers ────────────────────────────────────────────────────────────

function classifyError(err) {
  const msg = err.message || '';
  if (err.name === 'TimeoutError')                         return { code: 'TIMEOUT',    hint: `елемент не з'явився за ${config.waitTimeout}мс` };
  if (msg.includes('detached from document'))              return { code: 'DETACHED',   hint: 'елемент відʼєднався від DOM під час знімку' };
  if (msg.includes('Node is either not clickable'))        return { code: 'OBSCURED',   hint: 'елемент перекритий іншим елементом' };
  if (msg.includes('ERR_CONNECTION_REFUSED'))              return { code: 'CONN_REFUSED', hint: 'додаток не відповідає — перевірте що він запущений' };
  if (msg.includes('ERR_NAME_NOT_RESOLVED'))               return { code: 'DNS',        hint: 'хост не знайдено — перевірте baseUrl в config.js' };
  if (msg.includes('net::ERR_'))                           return { code: 'NET',        hint: `мережева помилка: ${msg.match(/net::ERR_\S+/)?.[0] || msg}` };
  if (msg.includes('Navigation timeout'))                  return { code: 'NAV_TIMEOUT', hint: 'сторінка не завантажилась за 30с' };
  if (msg.includes('ENOENT') || msg.includes('EACCES'))   return { code: 'DISK',       hint: `помилка запису файлу: ${msg}` };
  return { code: 'UNKNOWN', hint: msg };
}

async function saveErrorScreenshot(page, name) {
  try {
    fs.mkdirSync(config.errorsDir, { recursive: true });
    const file = path.join(config.errorsDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    return file;
  } catch {
    return null;
  }
}

// ─── Navigation ───────────────────────────────────────────────────────────────

/**
 * Navigate to a URL and wait for [data-page-ready="true"].
 * Returns { ok: true } or { ok: false, code, hint, errorFile }.
 */
async function navigateTo(page, url) {
  const full = config.baseUrl + url;

  try {
    await page.goto(full, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (err) {
    const { code, hint } = classifyError(err);
    const errorFile = await saveErrorScreenshot(page, `nav_error_${url.replace(/\//g, '_')}`);
    console.error(`  ❌ [${ts()}] Навігація не вдалась — ${code}: ${hint}`);
    if (errorFile) console.error(`     скріншот: ${errorFile}`);
    return { ok: false, code, hint, errorFile };
  }

  // Log page state after domcontentloaded
  if (config.verbose) {
    const finalUrl = page.url().replace(config.baseUrl, '') || url;
    const vp = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight })).catch(() => null);
    vlog(`  [${ts()}] url:      ${finalUrl}`);
    vlog(`  [${ts()}] viewport: ${vp ? `${vp.w} × ${vp.h}` : 'невідомо'}`);
  }

  // Step 1: wait for React to mount ([data-page-ready] appears on root div at mount)
  const readyT0 = Date.now();
  vlog(`  [${ts()}] шукаємо ${config.pageReadySelector} ...`);
  try {
    await page.waitForSelector(config.pageReadySelector, { timeout: config.waitTimeout });
    vlog(`  [${ts()}] ${config.pageReadySelector} знайдено (${Date.now() - readyT0}мс) ✓`);
  } catch {
    const errorFile = await saveErrorScreenshot(page, `ready_error_${url.replace(/\//g, '_')}`);
    console.error(`\n❌ ${config.pageReadySelector} НЕ знайдено на ${url} за ${config.waitTimeout}мс`);
    if (errorFile) console.error(`   скріншот стану: ${errorFile}`);
    console.error(`   Зйомка зупинена.\n`);
    process.exit(1);
  }

  // Step 2: wait for loading spinner to disappear — data fetch complete
  const spinnerT0 = Date.now();
  try {
    await page.waitForSelector(config.loadingSelector, { hidden: true, timeout: config.waitTimeout });
    const elapsed = Date.now() - spinnerT0;
    if (elapsed > 50) vlog(`  [${ts()}] спінер зник (${elapsed}мс) ✓`);
  } catch {
    const errorFile = await saveErrorScreenshot(page, `spinner_error_${url.replace(/\//g, '_')}`);
    console.error(`\n❌ Спінер не зник на ${url} за ${config.waitTimeout}мс — дані не завантажились`);
    if (errorFile) console.error(`   скріншот стану: ${errorFile}`);
    process.exit(1);
  }

  // Sanity check: count i-doc elements found on this page
  if (config.verbose) {
    const idocCount = await page.$$eval('[data-i-doc]', els => els.length).catch(() => 0);
    vlog(`  [${ts()}] i-doc елементів: ${idocCount}`);
  }

  return { ok: true };
}

// ─── Capture one element ──────────────────────────────────────────────────────

/**
 * Capture a single screenshot entry.
 * Returns { status: 'ok'|'skip'|'error', reason?, code?, hint?, box?, errorFile? }
 */
async function captureOne(page, entry) {
  const outPath = path.join(config.outputDir, `${entry.id}.png`);

  // Wait for element to become visible
  try {
    await page.waitForSelector(entry.selector, {
      visible: true,
      timeout: config.waitTimeout,
    });
  } catch (err) {
    const { code, hint } = classifyError(err);
    const errorFile = await saveErrorScreenshot(page, `elem_error_${entry.id}`);
    return { status: 'skip', reason: 'not-visible', code, hint, errorFile };
  }

  await delay(config.stabilizationMs);

  // Find element
  const el = await page.$(entry.selector).catch(() => null);
  if (!el) {
    const errorFile = await saveErrorScreenshot(page, `elem_error_${entry.id}`);
    return { status: 'error', reason: 'disappeared', code: 'DETACHED',
             hint: 'елемент зник після waitForSelector (DOM оновився?)', errorFile };
  }

  // Check bounding box — zero-size means element is in DOM but not laid out
  let box;
  try {
    box = await el.boundingBox();
  } catch (err) {
    const { code, hint } = classifyError(err);
    const errorFile = await saveErrorScreenshot(page, `elem_error_${entry.id}`);
    return { status: 'error', reason: 'no-box', code, hint, errorFile };
  }

  if (!box || box.width === 0 || box.height === 0) {
    const errorFile = await saveErrorScreenshot(page, `elem_error_${entry.id}`);
    return { status: 'error', reason: 'zero-size', code: 'LAYOUT',
             hint: `розмір елемента ${box ? `${box.width}×${box.height}` : 'null'} — можливо прихований через CSS`, errorFile };
  }

  // page → full page scroll (sidebar is outside the data-i-doc element, in the layout wrapper)
  // sec / tab / modal → clip to element bounding box
  // --full flag overrides to full page for all types
  const useFullPage = entry.type === 'page' || config.fullCapture;
  try {
    fs.mkdirSync(config.outputDir, { recursive: true });
    if (useFullPage) {
      await page.screenshot({ path: outPath, fullPage: true });
    } else {
      await page.screenshot({ path: outPath, clip: { x: box.x, y: box.y, width: box.width, height: box.height } });
    }
  } catch (err) {
    const { code, hint } = classifyError(err);
    const errorFile = await saveErrorScreenshot(page, `elem_error_${entry.id}`);
    return { status: 'error', reason: 'screenshot-failed', code, hint, errorFile };
  }

  return { status: 'ok', box };
}

// ─── Run all captures ─────────────────────────────────────────────────────────

/**
 * Run all captures grouped by URL.
 * Returns { ok, skipped, errors, total, log[] }
 */
async function runCaptures(page, entries) {
  const stats = { ok: 0, skipped: 0, errors: 0, total: entries.length };
  const log   = [];  // full record of every entry for the run report

  // Group by URL preserving order of first occurrence
  const urlOrder = [];
  const byUrl    = {};
  for (const entry of entries) {
    if (!byUrl[entry.url]) { urlOrder.push(entry.url); byUrl[entry.url] = []; }
    byUrl[entry.url].push(entry);
  }

  for (const url of urlOrder) {
    const group = byUrl[url];
    if (config.verbose) {
      console.log(`\n→ ${url}  (${group.length})`);
    }

    const navResult = await navigateTo(page, url);

    if (!navResult.ok) {
      for (const entry of group) {
        stats.errors++;
        log.push({ ...entry, status: 'error', ...navResult });
        console.error(`❌ ${entry.id}  — навігація не вдалась (${navResult.code}): ${navResult.hint}`);
      }
      continue;
    }

    for (const entry of group) {
      const result = await captureOne(page, entry);
      log.push({ ...entry, ...result, ts: new Date().toISOString() });

      if (result.status === 'ok') {
        stats.ok++;
        if (config.verbose) {
          const dims = `[${Math.round(result.box.width)} × ${Math.round(result.box.height)}]`;
          console.log(`  ✅ [${ts()}] ${entry.id}  ${dims}`);
        } else {
          console.log(`✅ ${entry.id}`);
        }

      } else if (result.status === 'skip') {
        stats.skipped++;
        console.log(`⚠️  ${entry.id}  — ${result.hint}`);
        if (config.verbose && result.errorFile) console.log(`     ↳ ${result.errorFile}`);

      } else {
        stats.errors++;
        console.error(`❌ ${entry.id}  — ${result.code}: ${result.hint}`);
        if (result.errorFile) console.error(`     ↳ ${result.errorFile}`);
      }
    }
  }

  return { ...stats, log };
}

module.exports = { runCaptures };
