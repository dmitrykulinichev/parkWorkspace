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
// 'tab:fleet-settings-commission', 'fleet-settings' → 'commission'
function tabFileSlug(tabIdoc, pgSlug) {
  const base = tabIdoc.replace('tab:', '');
  const prefix = pgSlug + '-';
  return base.startsWith(prefix) ? base.slice(prefix.length) : base;
}

// Relative prefix from a docFile path to data/modals/
// 'data/tasks.md' → '../modals/'
// 'data/fleet/vehicles.md' → '../modals/'
// 'data/fleet/reports/index.md' → '../../modals/'
function modalsPrefix(docFilePath) {
  const depth = docFilePath.split('/').length - 2;
  return '../'.repeat(depth) + 'modals/';
}

// ─── Stub generators ──────────────────────────────────────────────────────────

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
    item.hint || '<!-- TODO: загальний опис сторінки -->',
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

  lines.push(...screenshotRows(screenshotsByIdoc[item.idoc]));
  lines.push('', '<!-- TODO: детальний опис -->');
  return lines.join('\n') + '\n';
}

function makePageIndexStub(item, screenshotsByIdoc) {
  const lines = [
    `# ${item.label}`,
    `> \`${item.idoc}\` · \`${item.path}\``,
    '',
    item.hint || '<!-- TODO: загальний опис сторінки -->',
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
  return lines.join('\n') + '\n';
}

function makeTabStub(tab, parentItem, screenshotsByIdoc) {
  const tabSections = (parentItem.sections || []).filter(s => s.tab === tab.idoc);
  const relModals = modalsPrefix(tab.docFile);
  const lines = [
    `# ${tab.idoc.replace('tab:', '')}`,
    `> \`${tab.idoc}\` · [\`${parentItem.idoc}\`](./index.md)${tab.isDefault ? ' · за замовчуванням' : ''}`,
    '',
    tab.hint || '<!-- TODO: опис вкладки -->',
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

  lines.push(...screenshotRows(screenshotsByIdoc[tab.idoc]));
  lines.push('', '<!-- TODO: детальний опис -->');
  return lines.join('\n') + '\n';
}

function makeModalStub(modal, parentIdoc, screenshotsByIdoc) {
  const lines = [
    `# ${modal.idoc.replace('modal:', '')}`,
    `> \`${modal.idoc}\` · відкривається з: \`${parentIdoc}\``,
    '',
    modal.hint || '<!-- TODO: опис -->',
    '',
  ];
  lines.push(...screenshotRows(screenshotsByIdoc[modal.idoc]));
  lines.push(
    '', '## Поля / Вміст', '',
    '<!-- TODO: перелік полів -->',
    '', '## Дії', '',
    '<!-- TODO: кнопки та дії -->',
  );
  return lines.join('\n') + '\n';
}

// ─── Create file only if it does not already exist ────────────────────────────

function scaffoldFile(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// ─── Main scaffold function ───────────────────────────────────────────────────

/**
 * Walk nav tree, update docFile paths to nav-tree layout, create stub files.
 * Mutates nav in-place (updates docFile on page/tab nodes).
 * Returns { created, skipped } counts.
 */
function scaffoldDocs(nav, dataDir, screenshotsByIdoc = {}) {
  let created = 0, skipped = 0;

  function tick(wasCreated) { if (wasCreated) created++; else skipped++; }

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

          // Update ALL docFile paths before generating stubs (links depend on them)
          item.docFile = `data/${pageFolder}/index.md`;
          for (const tab of item.tabs) {
            tab.docFile = `data/${pageFolder}/${tabFileSlug(tab.idoc, pgSlug)}.md`;
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
          item.docFile = `data/${parentFolder ? parentFolder + '/' : ''}${pgSlug}.md`;
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
  return { created, skipped };
}

module.exports = { scaffoldDocs, pageSlug, tabFileSlug };
