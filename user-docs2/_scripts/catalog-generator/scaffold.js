'use strict';
const fs   = require('fs');
const path = require('path');
const { GROUP_FOLDER_NAMES } = require('./nav-config');

// ─── Path helpers ─────────────────────────────────────────────────────────────

// '/' → 'dashboard' (from idoc), '/tasks' → 'tasks'
function pageSlug(item) {
  return item.path === '/' ? item.idoc.replace('page:', '') : item.path.slice(1);
}

// 'tab:reports-operational', 'reports' → 'operational'
function tabFileSlug(tabIdoc, pgSlug) {
  const base = tabIdoc.replace('tab:', '');
  const prefix = pgSlug + '-';
  return base.startsWith(prefix) ? base.slice(prefix.length) : base;
}

// Relative prefix from a docFile path to _data/modals/
function modalsPrefix(docFilePath) {
  const depth = docFilePath.split('/').length - 2;
  return '../'.repeat(depth) + 'modals/';
}

// ─── Stub generators ──────────────────────────────────────────────────────────

function humanSection(human) {
  if (!human) return [];
  return ['', '## Опис', '', human, ''];
}

function docRawSection(raw) {
  if (!raw) return [];
  return ['', '## Функціональний опис', '', '```js', raw, '```', ''];
}

function screenshotRows(screenshotList) {
  if (!screenshotList || !screenshotList.length) return [];
  const rows = [
    '## Скріншоти', '',
    '| ID | Селектор | URL |',
    '|---|---|---|',
  ];
  for (const s of screenshotList) {
    rows.push(`| \`${s.id}\` | \`${s.selector}\` | \`${s.url}\` |`);
  }
  return rows;
}

function makePageStub(item, screenshotsByIdoc) {
  const relModals = modalsPrefix(item.docFile);
  const lines = [
    `# ${item.label}`,
    `> \`${item.idoc}\` · \`${item.path}\``,
    '',
    item.hint || '<!-- hint -->',
    '',
  ];

  const pageSections = (item.sections || []).filter(s => !s.tab);
  if (pageSections.length) {
    lines.push('## Розділи', '');
    lines.push('| i-doc | Опис |', '|---|---|');
    for (const s of pageSections) {
      lines.push(`| \`${s.idoc}\` | ${s.hint ? s.hint.slice(0, 80) : '—'} |`);
    }
    lines.push('');
  }

  if (item.modals && item.modals.length) {
    lines.push('## Модальні вікна', '');
    lines.push('| i-doc | Файл |', '|---|---|');
    for (const m of item.modals) {
      const fname = path.basename(m.docFile);
      lines.push(`| \`${m.idoc}\` | [${fname}](${relModals}${fname}) |`);
    }
    lines.push('');
  }

  lines.push(...humanSection(item.human));
  lines.push(...screenshotRows(screenshotsByIdoc[item.idoc]));
  lines.push(...docRawSection(item.docRaw));

  return lines.join('\n').trimEnd() + '\n';
}

function makePageIndexStub(item, screenshotsByIdoc) {
  const lines = [
    `# ${item.label}`,
    `> \`${item.idoc}\` · \`${item.path}\``,
    '',
    item.hint || '<!-- hint -->',
    '',
    '## Вкладки', '',
    '| Вкладка | За замовчуванням | Опис |',
    '|---|---|---|',
  ];
  for (const t of item.tabs) {
    const fname = path.basename(t.docFile);
    lines.push(`| [\`${t.idoc}\`](./${fname}) | ${t.isDefault ? '✓' : ''} | ${t.hint ? t.hint.slice(0, 80) : '—'} |`);
  }
  lines.push('', '> Детальна документація кожної вкладки — у відповідних файлах.');
  lines.push(...humanSection(item.human));
  lines.push(...docRawSection(item.docRaw));

  return lines.join('\n').trimEnd() + '\n';
}

function makeTabStub(tab, parentItem, screenshotsByIdoc) {
  const tabSections = (parentItem.sections || []).filter(s => s.tab === tab.idoc);
  const relModals = modalsPrefix(tab.docFile);
  const lines = [
    `# ${tab.idoc.replace('tab:', '')}`,
    `> \`${tab.idoc}\` · [\`${parentItem.idoc}\`](./index.md)${tab.isDefault ? ' · за замовчуванням' : ''}`,
    '',
    tab.hint || '<!-- hint -->',
    '',
  ];

  if (tabSections.length) {
    lines.push('## Розділи', '');
    lines.push('| i-doc | Опис |', '|---|---|');
    for (const s of tabSections) {
      lines.push(`| \`${s.idoc}\` | ${s.hint ? s.hint.slice(0, 80) : '—'} |`);
    }
    lines.push('');
  }

  if (tab.isDefault && parentItem.modals && parentItem.modals.length) {
    lines.push('## Модальні вікна', '');
    lines.push('| i-doc | Файл |', '|---|---|');
    for (const m of parentItem.modals) {
      const fname = path.basename(m.docFile);
      lines.push(`| \`${m.idoc}\` | [${fname}](${relModals}${fname}) |`);
    }
    lines.push('');
  }

  lines.push(...humanSection(tab.human));
  lines.push(...screenshotRows(screenshotsByIdoc[tab.idoc]));
  lines.push(...docRawSection(tab.docRaw));

  return lines.join('\n').trimEnd() + '\n';
}

function makeModalStub(modal, parentIdoc, screenshotsByIdoc) {
  const lines = [
    `# ${modal.idoc.replace('modal:', '')}`,
    `> \`${modal.idoc}\` · відкривається з: \`${parentIdoc}\``,
    '',
    modal.hint || '<!-- hint -->',
    '',
  ];
  lines.push(...humanSection(modal.human));
  lines.push(...screenshotRows(screenshotsByIdoc[modal.idoc]));
  lines.push(...docRawSection(modal.docRaw));

  return lines.join('\n').trimEnd() + '\n';
}

// ─── File write ───────────────────────────────────────────────────────────────

function scaffoldFile(filePath, content) {
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
  if (existing === content) return 'skipped';
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  return existing === null ? 'created' : 'updated';
}

// ─── Main scaffold function ───────────────────────────────────────────────────

/**
 * Walk nav tree, update docFile paths, create or update stub files.
 * Mutates nav in-place (updates docFile on page/tab nodes).
 * Returns { created, updated, skipped } counts.
 */
function scaffoldDocs(nav, dataDir, screenshotsByIdoc = {}) {
  let created = 0, updated = 0, skipped = 0;

  function tick(result) {
    if (result === 'created') created++;
    else if (result === 'updated') updated++;
    else skipped++;
  }

  function walk(navItems, parentFolder = '') {
    for (const item of navItems) {
      if (item.children && !item.idoc) {
        const folderName = item.path
          ? (GROUP_FOLDER_NAMES[item.path] || item.path.slice(1))
          : 'misc';
        const subfolder = parentFolder ? `${parentFolder}/${folderName}` : folderName;
        fs.mkdirSync(path.join(dataDir, subfolder), { recursive: true });
        walk(item.children, subfolder);

      } else if (item.idoc) {
        const pgSlug  = pageSlug(item);
        const hasTabs = item.tabs && item.tabs.length > 0;

        if (hasTabs) {
          const pageFolder = parentFolder ? `${parentFolder}/${pgSlug}` : pgSlug;
          fs.mkdirSync(path.join(dataDir, pageFolder), { recursive: true });

          item.docFile = `_data/${pageFolder}/index.md`;
          for (const tab of item.tabs) {
            tab.docFile = `_data/${pageFolder}/${tabFileSlug(tab.idoc, pgSlug)}.md`;
          }

          tick(scaffoldFile(
            path.join(dataDir, pageFolder, 'index.md'),
            makePageIndexStub(item, screenshotsByIdoc),
          ));
          for (const tab of item.tabs) {
            const tSlug = tabFileSlug(tab.idoc, pgSlug);
            tick(scaffoldFile(
              path.join(dataDir, pageFolder, `${tSlug}.md`),
              makeTabStub(tab, item, screenshotsByIdoc),
            ));
          }
        } else {
          const dir = parentFolder ? path.join(dataDir, parentFolder) : dataDir;
          fs.mkdirSync(dir, { recursive: true });
          item.docFile = `_data/${parentFolder ? parentFolder + '/' : ''}${pgSlug}.md`;
          tick(scaffoldFile(
            path.join(dir, `${pgSlug}.md`),
            makePageStub(item, screenshotsByIdoc),
          ));
        }

        if (item.modals) {
          for (const m of item.modals) {
            tick(scaffoldFile(
              path.join(dataDir, 'modals', path.basename(m.docFile)),
              makeModalStub(m, item.idoc, screenshotsByIdoc),
            ));
          }
        }

        if (item.children) walk(item.children, parentFolder);
      }
    }
  }

  fs.mkdirSync(path.join(dataDir, 'modals'), { recursive: true });
  walk(nav);
  return { created, updated, skipped };
}

module.exports = { scaffoldDocs, pageSlug, tabFileSlug };
