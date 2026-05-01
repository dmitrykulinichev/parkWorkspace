const fs   = require('fs');
const path = require('path');
const config = require('./config');
const { parseIndexObject, parsePathMapping, parseHints, parseNavGroups } = require('./parser');
const { NAV_GROUPS, PATH_OVERRIDES, VIRTUAL_PATHS, LEGACY_PAGES, GROUP_FOLDER_NAMES } = require('./nav-config');

// ─── Read source files ────────────────────────────────────────────────────────

const registryText = fs.readFileSync(config.idoc.registry, 'utf8');
const mappingText  = fs.readFileSync(config.idoc.mapping,  'utf8');
const hintsText    = fs.readFileSync(config.idoc.hints,    'utf8');

// ─── Parse ───────────────────────────────────────────────────────────────────

const pages    = parseIndexObject(registryText, 'PageIndices');
const tabs     = parseIndexObject(registryText, 'TabIndices');
const sections = parseIndexObject(registryText, 'SectionIndices');
const modals   = parseIndexObject(registryText, 'ModalIndices');
const urlMap   = parsePathMapping(mappingText, pages);   // { '/tasks': 'page:tasks' }
const hints    = parseHints(hintsText);

// ─── Helpers ─────────────────────────────────────────────────────────────────

// 'page:tasks' → 'page_tasks',  'modal:task-form' → 'modal_task_form'
const toDocId = id => id.replace(':', '_').replace(/-/g, '_');

// Reverse url map: 'page:tasks' → '/tasks'  (first occurrence wins)
const pageUrl = {};
for (const [url, pageId] of Object.entries(urlMap)) {
  if (!pageUrl[pageId]) pageUrl[pageId] = url;
}

// Build map: comment path fragment → page id
// e.g. 'pages/Tasks' → 'page:tasks', 'pages/Reports.jsx' → 'page:reports'
const commentToPage = {};
for (const p of pages) {
  if (p.comment) {
    const m = p.comment.match(/resources\/js\/pages\/([^/]+)/);
    if (m) {
      const key = m[1].replace(/\.[jt]sx?$/, ''); // strip .jsx/.tsx extension
      commentToPage[key] = p.value;
    }
  }
}

// Build map: comment (full) → tab id  (for grouping sections under tabs)
const commentToTab = {};
for (const t of tabs) {
  if (t.comment) commentToTab[t.comment] = t.value;
}

// Find page for any entry by its comment
function entryPage(entry) {
  if (!entry.comment) return null;
  const m = entry.comment.match(/resources\/js\/pages\/([^/]+)/);
  if (!m) return null;
  const key = m[1].replace(/\.[jt]sx?$/, '');
  return commentToPage[key] || null;
}

// Find tab for a section (if its file matches a tab comment)
function entryTab(entry) {
  if (!entry.comment) return null;
  return commentToTab[entry.comment] || null;
}

// Group items by page
function groupByPage(items) {
  const map = {};
  for (const item of items) {
    const pg = entryPage(item);
    const key = pg || '__unassigned__';
    if (!map[key]) map[key] = [];
    map[key].push(item);
  }
  return map;
}

const tabsByPage     = groupByPage(tabs);
const sectionsByPage = groupByPage(sections);
const modalsByPage   = groupByPage(modals);

// ─── Doc file paths ──────────────────────────────────────────────────────────

function docFile(id) {
  const d = toDocId(id);
  if (id.startsWith('page:'))  return `data/pages/${d}.md`;
  if (id.startsWith('tab:'))   return `data/tabs/${d}.md`;
  if (id.startsWith('modal:')) return `data/modals/${d}.md`;
  return null;
}

function screenshotId(id) {
  const d = toDocId(id);
  if (id.startsWith('page:') || id.startsWith('tab:')) return `${d}_main`;
  if (id.startsWith('modal:')) return d;
  return null;
}

// ─── Format helpers ───────────────────────────────────────────────────────────

const hint60 = id => {
  const h = hints[id];
  if (!h) return '—';
  return h.length > 60 ? h.slice(0, 60) + '...' : h;
};

const TODO = '📝 TODO';

// ─── Generate CATALOG.md + screenshots.json ──────────────────────────────────

const now = new Date().toISOString().slice(0, 10);
const lines = [];
const screenshots = [];

lines.push(`# Каталог документації`);
lines.push(`> Згенеровано автоматично з i-doc.registry.ts · ${now}`);
lines.push(`> Не редагувати вручну — запусти \`node workspace/catalog-generator/index.js\``);
lines.push('');

for (const page of pages) {
  const id   = page.value;
  const url  = pageUrl[id] || '—';
  const file = docFile(id);
  const sc   = screenshotId(id);

  lines.push(`---`);
  lines.push('');
  lines.push(`## ${id}`);
  lines.push('');
  lines.push(`| | |`);
  lines.push(`|---|---|`);
  lines.push(`| **URL** | \`${url}\` |`);
  lines.push(`| **Файл** | \`${file}\` |`);
  lines.push(`| **Статус** | ${TODO} |`);
  lines.push(`| **Hint** | ${hint60(id)} |`);
  lines.push('');

  // Tabs
  const pageTabs = tabsByPage[id] || [];
  if (pageTabs.length) {
    lines.push(`### Таби`);
    lines.push(`| i-doc ID | doc_id | Файл | Hint | Статус |`);
    lines.push(`|---|---|---|---|---|`);
    for (const t of pageTabs) {
      lines.push(`| \`${t.value}\` | \`${toDocId(t.value)}\` | \`${docFile(t.value)}\` | ${hint60(t.value)} | ${TODO} |`);
    }
    lines.push('');
  } else {
    lines.push(`### Таби`);
    lines.push(`_немає_`);
    lines.push('');
  }

  // Sections — group by parent tab
  const pageSections = sectionsByPage[id] || [];
  lines.push(`### Секції`);
  if (pageSections.length) {
    lines.push(`| i-doc ID | doc_id | Таб | Hint |`);
    lines.push(`|---|---|---|---|`);
    for (const s of pageSections) {
      const parentTab = entryTab(s) || '—';
      const tabCell = parentTab !== '—' ? `\`${parentTab}\`` : '—';
      lines.push(`| \`${s.value}\` | \`${toDocId(s.value)}\` | ${tabCell} | ${hint60(s.value)} |`);
    }
  } else {
    lines.push(`_немає_`);
  }
  lines.push('');

  // Modals
  const pageModals = modalsByPage[id] || [];
  lines.push(`### Модалки`);
  if (pageModals.length) {
    lines.push(`| i-doc ID | doc_id | Файл | Hint | Статус |`);
    lines.push(`|---|---|---|---|---|`);
    for (const m of pageModals) {
      lines.push(`| \`${m.value}\` | \`${toDocId(m.value)}\` | \`${docFile(m.value)}\` | ${hint60(m.value)} | ${TODO} |`);
    }
  } else {
    lines.push(`_немає_`);
  }
  lines.push('');

  // Screenshots — collect for JSON and render in catalog
  const pageScreenshots = [];

  // page itself
  pageScreenshots.push({ id: sc, type: 'page', idoc: id, selector: `[data-i-doc="${id}"]`, url, page: id });

  // tabs
  for (const t of pageTabs) {
    const tsc = screenshotId(t.value);
    pageScreenshots.push({ id: tsc, type: 'tab', idoc: t.value, selector: `[data-i-doc="${t.value}"]`, url, page: id });
  }

  // modals
  for (const m of pageModals) {
    const msc = screenshotId(m.value);
    pageScreenshots.push({ id: msc, type: 'modal', idoc: m.value, selector: `[data-i-doc="${m.value}"]`, url, page: id });
  }

  screenshots.push(...pageScreenshots);

  lines.push(`### Скріншоти`);
  lines.push(`| Screenshot ID | Тип | Селектор | URL |`);
  lines.push(`|---|---|---|---|`);
  for (const s of pageScreenshots) {
    lines.push(`| \`${s.id}\` | ${s.type} | \`${s.selector}\` | \`${s.url}\` |`);
  }
  lines.push('');
}

// ─── Write output ────────────────────────────────────────────────────────────

fs.writeFileSync(config.catalog, lines.join('\n'), 'utf8');
console.log(`✅ CATALOG.md written → ${config.catalog}`);

fs.writeFileSync(config.screenshots, JSON.stringify(screenshots, null, 2), 'utf8');
console.log(`✅ screenshots.json written → ${config.screenshots}`);

// ─── Build nav.json ───────────────────────────────────────────────────────────

const navText   = fs.readFileSync(config.idoc.navItems || config.navItems, 'utf8');

// Reverse url map: '/tasks' → 'page:tasks'
const pathToIdoc = {};
for (const [url, pageId] of Object.entries(urlMap)) {
  pathToIdoc[url] = pageId;
}

const navGroups = parseNavGroups(fs.readFileSync(config.navItems, 'utf8'));

function resolveIdoc(path) {
  if (VIRTUAL_PATHS.has(path)) return null;
  if (PATH_OVERRIDES.hasOwnProperty(path)) return PATH_OVERRIDES[path];
  return pathToIdoc[path] || null;
}

function enrichPage(idoc) {
  const pageTabs     = (tabsByPage[idoc]     || []).map((t, i) => ({
    idoc:      t.value,
    isDefault: i === 0,
    hint:      hints[t.value] || null,
    docFile:   docFile(t.value),
  }));
  const pageSections = (sectionsByPage[idoc] || []).map(s => ({
    idoc: s.value,
    tab:  entryTab(s) || null,
    hint: hints[s.value] || null,
  }));
  const pageModals   = (modalsByPage[idoc]   || []).map(m => ({
    idoc:    m.value,
    docFile: docFile(m.value),
    hint:    hints[m.value] || null,
  }));
  return { tabs: pageTabs, sections: pageSections, modals: pageModals };
}

function buildNavItems(items) {
  const result = [];
  for (const item of items) {
    if (VIRTUAL_PATHS.has(item.path)) {
      if (item.children) {
        const children = buildNavItems(item.children);
        if (children.length) result.push({ path: item.path, label: item.label, children });
      }
      continue;
    }

    const idoc = resolveIdoc(item.path);
    if (idoc === null && !item.children) continue;

    const node = { path: item.path, label: item.label };
    if (idoc) {
      node.idoc     = idoc;
      node.hint     = hints[idoc] || null;
      node.docFile  = docFile(idoc);
      const { tabs, sections, modals } = enrichPage(idoc);
      node.tabs     = tabs;
      node.sections = sections;
      node.modals   = modals;
    }

    if (item.children) {
      const children = buildNavItems(item.children);
      if (children.length) node.children = children;
    }

    result.push(node);
  }
  return result;
}

const nav = [];
for (const groupName of NAV_GROUPS) {
  const groupItems = navGroups[groupName];
  if (!groupItems) { console.warn(`  ⚠️  Group not found: ${groupName}`); continue; }
  nav.push(...buildNavItems(groupItems));
}

// ─── Scaffold doc structure ───────────────────────────────────────────────────

const DATA_DIR = path.join(path.dirname(config.catalog), '..', 'data');

// Slug for a page from its nav path: '/' → 'dashboard' (use idoc), '/tasks' → 'tasks'
function pageSlug(item) {
  return item.path === '/' ? item.idoc.replace('page:', '') : item.path.slice(1);
}

// Slug for a tab file inside a page folder:
// 'tab:reports-operational', pageSlug='reports' → 'operational'
// 'tab:fleet-settings-commission', pageSlug='fleet-settings' → 'commission'
function tabFileSlug(tabIdoc, pgSlug) {
  const base = tabIdoc.replace('tab:', '');
  const prefix = pgSlug + '-';
  return base.startsWith(prefix) ? base.slice(prefix.length) : base;
}

// Prefix for relative links from a docFile to data/modals/
// depth: 'data/tasks.md' → '../modals/', 'data/fleet/vehicles.md' → '../modals/',
//        'data/fleet/reports/index.md' → '../../modals/'
function modalsPrefix(docFilePath) {
  const depth = docFilePath.split('/').length - 2;  // folders below data/
  return '../'.repeat(depth) + 'modals/';
}

// Create file only if it does not already exist
function scaffoldFile(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function makePageStub(item) {
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
    lines.push('| i-doc | Опис |');
    lines.push('|---|---|');
    for (const s of pageSections) {
      lines.push(`| \`${s.idoc}\` | ${s.hint ? s.hint.slice(0, 80) : '—'} |`);
    }
    lines.push('');
  }
  if (item.modals && item.modals.length) {
    lines.push('## Модальні вікна', '');
    lines.push('| i-doc | Файл |');
    lines.push('|---|---|');
    for (const m of item.modals) {
      const fname = path.basename(m.docFile);
      lines.push(`| \`${m.idoc}\` | [${fname}](${relModals}${fname}) |`);
    }
    lines.push('');
  }
  lines.push('<!-- TODO: детальний опис -->');
  return lines.join('\n') + '\n';
}

function makePageIndexStub(item) {
  const lines = [
    `# ${item.label}`,
    `> \`${item.idoc}\` · \`${item.path}\``,
    '',
    item.hint || '<!-- TODO: загальний опис сторінки -->',
    '',
    '## Вкладки',
    '',
    '| Вкладка | За замовчуванням | Опис |',
    '|---|---|---|',
  ];
  for (const t of item.tabs) {
    const fname = path.basename(t.docFile);
    lines.push(`| [\`${t.idoc}\`](./${fname}) | ${t.isDefault ? '✓' : ''} | ${t.hint ? t.hint.slice(0, 80) : '—'} |`);
  }
  lines.push('');
  lines.push('> Детальна документація кожної вкладки — у відповідних файлах.');
  return lines.join('\n') + '\n';
}

function makeTabStub(tab, parentItem) {
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
    lines.push('| i-doc | Опис |');
    lines.push('|---|---|');
    for (const s of tabSections) {
      lines.push(`| \`${s.idoc}\` | ${s.hint ? s.hint.slice(0, 80) : '—'} |`);
    }
    lines.push('');
  }
  const tabModals = (parentItem.modals || []);
  if (tabModals.length && tab.isDefault) {
    lines.push('## Модальні вікна', '');
    lines.push('| i-doc | Файл |');
    lines.push('|---|---|');
    for (const m of tabModals) {
      const fname = path.basename(m.docFile);
      lines.push(`| \`${m.idoc}\` | [${fname}](${relModals}${fname}) |`);
    }
    lines.push('');
  }
  lines.push('<!-- TODO: детальний опис -->');
  return lines.join('\n') + '\n';
}

function makeModalStub(modal, parentIdoc) {
  const lines = [
    `# ${modal.idoc.replace('modal:', '')}`,
    `> \`${modal.idoc}\` · відкривається з: \`${parentIdoc}\``,
    '',
    modal.hint || '<!-- TODO: опис -->',
    '',
    '## Поля / Вміст',
    '',
    '<!-- TODO: перелік полів -->',
    '',
    '## Дії',
    '',
    '<!-- TODO: кнопки та дії -->',
  ];
  return lines.join('\n') + '\n';
}

let scaffoldCreated = 0;
let scaffoldSkipped = 0;

function scaffoldNav(navItems, parentFolder = '') {
  for (const item of navItems) {
    if (item.children && !item.idoc) {
      // Group node (virtual path)
      const folderName = item.path
        ? (GROUP_FOLDER_NAMES[item.path] || item.path.slice(1))
        : 'misc';
      const subfolder = parentFolder ? `${parentFolder}/${folderName}` : folderName;
      fs.mkdirSync(path.join(DATA_DIR, subfolder), { recursive: true });
      scaffoldNav(item.children, subfolder);

    } else if (item.idoc) {
      const pgSlug = pageSlug(item);
      const hasTabs = item.tabs && item.tabs.length > 0;

      if (hasTabs) {
        const pageFolder = parentFolder ? `${parentFolder}/${pgSlug}` : pgSlug;
        fs.mkdirSync(path.join(DATA_DIR, pageFolder), { recursive: true });

        // Update docFile paths in nav object
        item.docFile = `data/${pageFolder}/index.md`;
        if (scaffoldFile(path.join(DATA_DIR, pageFolder, 'index.md'), makePageIndexStub(item))) scaffoldCreated++;
        else scaffoldSkipped++;

        for (const tab of item.tabs) {
          const tSlug = tabFileSlug(tab.idoc, pgSlug);
          tab.docFile = `data/${pageFolder}/${tSlug}.md`;
          if (scaffoldFile(path.join(DATA_DIR, pageFolder, `${tSlug}.md`), makeTabStub(tab, item))) scaffoldCreated++;
          else scaffoldSkipped++;
        }
      } else {
        const dir = parentFolder ? path.join(DATA_DIR, parentFolder) : DATA_DIR;
        fs.mkdirSync(dir, { recursive: true });
        item.docFile = `data/${parentFolder ? parentFolder + '/' : ''}${pgSlug}.md`;
        if (scaffoldFile(path.join(dir, `${pgSlug}.md`), makePageStub(item))) scaffoldCreated++;
        else scaffoldSkipped++;
      }

      // Scaffold modals (flat in data/modals/)
      if (item.modals) {
        for (const m of item.modals) {
          const modalPath = path.join(DATA_DIR, 'modals', path.basename(m.docFile));
          if (scaffoldFile(modalPath, makeModalStub(m, item.idoc))) scaffoldCreated++;
          else scaffoldSkipped++;
        }
      }

      if (item.children) scaffoldNav(item.children, parentFolder);
    }
  }
}

fs.mkdirSync(path.join(DATA_DIR, 'modals'), { recursive: true });
scaffoldNav(nav);

console.log(`✅ Scaffold: ${scaffoldCreated} created, ${scaffoldSkipped} skipped (already exist) → ${DATA_DIR}`);

fs.writeFileSync(config.nav, JSON.stringify(nav, null, 2), 'utf8');
console.log(`✅ nav.json written → ${config.nav}`);

// ─── Validation warnings ──────────────────────────────────────────────────────

const warnings = [];

// 1. Nav paths that resolved to null (skipped silently)
function collectSkipped(items, result = []) {
  for (const item of items) {
    if (!VIRTUAL_PATHS.has(item.path)) {
      const idoc = resolveIdoc(item.path);
      if (idoc === null && !item.children) {
        result.push(`  nav path without i-doc: ${item.path} ("${item.label}")`);
      }
    }
    if (item.children) collectSkipped(item.children, result);
  }
  return result;
}
for (const groupName of NAV_GROUPS) {
  const groupItems = navGroups[groupName] || [];
  warnings.push(...collectSkipped(groupItems));
}

// 2. Unassigned elements (couldn't be mapped to any page)
for (const s of (sectionsByPage['__unassigned__'] || [])) {
  warnings.push(`  section not assigned to any page: ${s.value}  (comment: ${s.comment || '—'})`);
}
for (const m of (modalsByPage['__unassigned__'] || [])) {
  warnings.push(`  modal not assigned to any page: ${m.value}  (comment: ${m.comment || '—'})`);
}
for (const t of (tabsByPage['__unassigned__'] || [])) {
  warnings.push(`  tab not assigned to any page: ${t.value}  (comment: ${t.comment || '—'})`);
}

// 3. Pages in registry that are not in nav at all
const navIdocs = new Set();
function collectIdocs(items) {
  for (const item of items) {
    if (item.idoc) navIdocs.add(item.idoc);
    if (item.children) collectIdocs(item.children);
  }
}
collectIdocs(nav);

for (const page of pages) {
  if (!navIdocs.has(page.value) && !LEGACY_PAGES.has(page.value)) {
    warnings.push(`  page in registry but not in nav: ${page.value}`);
  }
}

const warningLines = [
  `# Warnings`,
  `> Згенеровано: ${now} · Запусти скрипт щоб оновити`,
  '',
];

if (warnings.length) {
  warningLines.push(`**${warnings.length} проблем знайдено:**`, '');
  warnings.forEach(w => warningLines.push(`- ${w.trim()}`));
  console.log(`\n⚠️  Warnings (${warnings.length}):`);
  warnings.forEach(w => console.log(w));
} else {
  warningLines.push(`✅ Проблем не знайдено.`);
  console.log(`✅ No warnings`);
}

fs.writeFileSync(config.warnings, warningLines.join('\n'), 'utf8');
console.log(`✅ WARNINGS.md written → ${config.warnings}`);

console.log(`   Pages: ${pages.length} | Tabs: ${tabs.length} | Sections: ${sections.length} | Modals: ${modals.length}`);
console.log(`   Screenshots: ${screenshots.length} (pages: ${screenshots.filter(s=>s.type==='page').length}, tabs: ${screenshots.filter(s=>s.type==='tab').length}, modals: ${screenshots.filter(s=>s.type==='modal').length})`);
