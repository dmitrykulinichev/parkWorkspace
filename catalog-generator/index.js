const fs = require('fs');
const config = require('./config');
const { parseIndexObject, parsePathMapping, parseHints } = require('./parser');

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

// ─── Generate CATALOG.md ─────────────────────────────────────────────────────

const now = new Date().toISOString().slice(0, 10);
const lines = [];

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

  // Screenshots
  lines.push(`### Скріншоти`);
  lines.push(`| Screenshot ID | Селектор | URL | Katalon-файл |`);
  lines.push(`|---|---|---|---|`);
  lines.push(`| \`${sc}\` | \`[data-i-doc="${id}"]\` | \`${url}\` | \`katalon/${sc}.side\` |`);
  for (const m of pageModals) {
    const msc = screenshotId(m.value);
    lines.push(`| \`${msc}\` | \`[data-i-doc="${m.value}"]\` | \`${url}\` | \`katalon/${msc}.side\` |`);
  }
  for (const t of pageTabs) {
    const tsc = screenshotId(t.value);
    lines.push(`| \`${tsc}\` | \`[data-i-doc="${t.value}"]\` | \`${url}\` | \`katalon/${tsc}.side\` |`);
  }
  lines.push('');
}

// ─── Write output ─────────────────────────────────────────────────────────────

const output = lines.join('\n');
fs.writeFileSync(config.output, output, 'utf8');
console.log(`✅ CATALOG.md written → ${config.output}`);
console.log(`   Pages: ${pages.length}, Tabs: ${tabs.length}, Sections: ${sections.length}, Modals: ${modals.length}`);
