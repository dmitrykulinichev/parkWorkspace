'use strict';
const fs   = require('fs');
const path = require('path');
const config = require('./config');
const { parseIndexObject, parsePathMapping, parseHints, parseNavGroups } = require('./parser');
const { NAV_GROUPS, PATH_OVERRIDES, VIRTUAL_PATHS, LEGACY_PAGES, GROUP_FOLDER_NAMES } = require('./nav-config');
const { scaffoldDocs } = require('./scaffold');
const { collectWarnings } = require('./validate');

// ─── Read source files ────────────────────────────────────────────────────────

const registryText = fs.readFileSync(config.idoc.registry, 'utf8');
const mappingText  = fs.readFileSync(config.idoc.mapping,  'utf8');
const hintsText    = fs.readFileSync(config.idoc.hints,    'utf8');
const navItemsText = fs.readFileSync(config.navItems,      'utf8');

// ─── Parse ───────────────────────────────────────────────────────────────────

const pages    = parseIndexObject(registryText, 'PageIndices');
const tabs     = parseIndexObject(registryText, 'TabIndices');
const sections = parseIndexObject(registryText, 'SectionIndices');
const modals   = parseIndexObject(registryText, 'ModalIndices');
const urlMap   = parsePathMapping(mappingText, pages);
const hints    = parseHints(hintsText);
const navGroups = parseNavGroups(navItemsText);

// ─── Registry helpers ─────────────────────────────────────────────────────────

const toDocId = id => id.replace(':', '_').replace(/-/g, '_');

// Reverse url map: 'page:tasks' → '/tasks'
const pageUrl = {};
for (const [url, pageId] of Object.entries(urlMap)) {
  if (!pageUrl[pageId]) pageUrl[pageId] = url;
}

// comment path fragment → page id
const commentToPage = {};
for (const p of pages) {
  if (p.comment) {
    const m = p.comment.match(/resources\/js\/pages\/([^/]+)/);
    if (m) commentToPage[m[1].replace(/\.[jt]sx?$/, '')] = p.value;
  }
}

// comment (full) → tab id
const commentToTab = {};
for (const t of tabs) {
  if (t.comment) commentToTab[t.comment] = t.value;
}

function entryPage(entry) {
  if (!entry.comment) return null;
  const m = entry.comment.match(/resources\/js\/pages\/([^/]+)/);
  if (!m) return null;
  return commentToPage[m[1].replace(/\.[jt]sx?$/, '')] || null;
}

function entryTab(entry) {
  if (!entry.comment) return null;
  return commentToTab[entry.comment] || null;
}

function groupByPage(items) {
  const map = {};
  for (const item of items) {
    const key = entryPage(item) || '__unassigned__';
    if (!map[key]) map[key] = [];
    map[key].push(item);
  }
  return map;
}

const tabsByPage     = groupByPage(tabs);
const sectionsByPage = groupByPage(sections);
const modalsByPage   = groupByPage(modals);

// ─── Doc file paths (initial flat paths used before scaffold rewrites them) ───

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

const hint60 = id => {
  const h = hints[id];
  if (!h) return '—';
  return h.length > 60 ? h.slice(0, 60) + '...' : h;
};

// ─── Generate CATALOG.md ──────────────────────────────────────────────────────

const now = new Date().toISOString().slice(0, 10);
const catalogLines = [];
const screenshots  = [];

catalogLines.push(`# Каталог документації`);
catalogLines.push(`> Згенеровано автоматично з i-doc.registry.ts · ${now}`);
catalogLines.push(`> Не редагувати вручну — запусти \`node workspace/user-docs2/_scripts/catalog-generator/index.js\``);
catalogLines.push('');

for (const page of pages) {
  const id  = page.value;
  const url = pageUrl[id] || '—';
  const sc  = screenshotId(id);

  catalogLines.push(`---`, '');
  catalogLines.push(`## ${id}`, '');
  catalogLines.push(`| | |`, `|---|---|`);
  catalogLines.push(`| **URL** | \`${url}\` |`);
  catalogLines.push(`| **Файл** | \`${docFile(id)}\` |`);
  catalogLines.push(`| **Статус** | 📝 TODO |`);
  catalogLines.push(`| **Hint** | ${hint60(id)} |`, '');

  const pageTabs     = tabsByPage[id]     || [];
  const pageSections = sectionsByPage[id] || [];
  const pageModals   = modalsByPage[id]   || [];

  if (pageTabs.length) {
    catalogLines.push(`### Таби`, `| i-doc ID | doc_id | Hint | Статус |`, `|---|---|---|---|`);
    for (const t of pageTabs) {
      catalogLines.push(`| \`${t.value}\` | \`${toDocId(t.value)}\` | ${hint60(t.value)} | 📝 TODO |`);
    }
  } else {
    catalogLines.push(`### Таби`, `_немає_`);
  }
  catalogLines.push('');

  catalogLines.push(`### Секції`);
  if (pageSections.length) {
    catalogLines.push(`| i-doc ID | doc_id | Таб | Hint |`, `|---|---|---|---|`);
    for (const s of pageSections) {
      const parentTab = entryTab(s) || '—';
      catalogLines.push(`| \`${s.value}\` | \`${toDocId(s.value)}\` | ${parentTab !== '—' ? `\`${parentTab}\`` : '—'} | ${hint60(s.value)} |`);
    }
  } else {
    catalogLines.push(`_немає_`);
  }
  catalogLines.push('');

  if (pageModals.length) {
    catalogLines.push(`### Модалки`, `| i-doc ID | doc_id | Hint | Статус |`, `|---|---|---|---|`);
    for (const m of pageModals) {
      catalogLines.push(`| \`${m.value}\` | \`${toDocId(m.value)}\` | ${hint60(m.value)} | 📝 TODO |`);
    }
  } else {
    catalogLines.push(`### Модалки`, `_немає_`);
  }
  catalogLines.push('');

  // Collect screenshots
  const pageScreenshots = [
    { id: sc, type: 'page', idoc: id, selector: `[data-i-doc="${id}"]`, url, page: id },
  ];
  for (const t of pageTabs) {
    pageScreenshots.push({ id: screenshotId(t.value), type: 'tab', idoc: t.value, selector: `[data-i-doc="${t.value}"]`, url, page: id });
  }
  for (const m of pageModals) {
    pageScreenshots.push({ id: screenshotId(m.value), type: 'modal', idoc: m.value, selector: `[data-i-doc="${m.value}"]`, url, page: id });
  }
  screenshots.push(...pageScreenshots);

  catalogLines.push(`### Скріншоти`, `| Screenshot ID | Тип | Селектор | URL |`, `|---|---|---|---|`);
  for (const s of pageScreenshots) {
    catalogLines.push(`| \`${s.id}\` | ${s.type} | \`${s.selector}\` | \`${s.url}\` |`);
  }
  catalogLines.push('');
}

fs.writeFileSync(config.catalog, catalogLines.join('\n'), 'utf8');
console.log(`✅ CATALOG.md written → ${config.catalog}`);

fs.writeFileSync(config.screenshots, JSON.stringify(screenshots, null, 2), 'utf8');
console.log(`✅ screenshots.json written → ${config.screenshots}`);

// ─── Build nav tree ───────────────────────────────────────────────────────────

// Reverse url map: '/tasks' → 'page:tasks'
const pathToIdoc = {};
for (const [url, pageId] of Object.entries(urlMap)) {
  pathToIdoc[url] = pageId;
}

function resolveIdoc(p) {
  if (VIRTUAL_PATHS.has(p)) return null;
  if (Object.prototype.hasOwnProperty.call(PATH_OVERRIDES, p)) return PATH_OVERRIDES[p];
  return pathToIdoc[p] || null;
}

function enrichPage(idoc) {
  const pageTabs = (tabsByPage[idoc] || []).map((t, i) => ({
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
  const pageModals = (modalsByPage[idoc] || []).map(m => ({
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
      node.idoc    = idoc;
      node.hint    = hints[idoc] || null;
      node.docFile = docFile(idoc);
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

// Build screenshotsByIdoc index for stubs
const screenshotsByIdoc = {};
for (const s of screenshots) {
  if (!screenshotsByIdoc[s.idoc]) screenshotsByIdoc[s.idoc] = [];
  screenshotsByIdoc[s.idoc].push(s);
}

const DATA_DIR = path.join(path.dirname(config.catalog), '..', 'data');
const { created, skipped } = scaffoldDocs(nav, DATA_DIR, screenshotsByIdoc);
console.log(`✅ Scaffold: ${created} created, ${skipped} skipped → ${DATA_DIR}`);

// ─── Write nav.json (docFile paths updated in-place by scaffoldDocs) ──────────

fs.writeFileSync(config.nav, JSON.stringify(nav, null, 2), 'utf8');
console.log(`✅ nav.json written → ${config.nav}`);

// ─── Generate data/catalog.json ───────────────────────────────────────────────

function buildCatalogJson(navItems) {
  return navItems.map(item => {
    if (item.children && !item.idoc) {
      const folder = item.path
        ? (GROUP_FOLDER_NAMES[item.path] || item.path.slice(1))
        : null;
      return {
        label:    item.label,
        folder,
        children: buildCatalogJson(item.children),
      };
    }
    if (item.idoc) {
      const sc = screenshotsByIdoc[item.idoc] || [];
      return {
        ...item,
        screenshots: sc,
        tabs: (item.tabs || []).map(t => ({
          ...t,
          screenshots: screenshotsByIdoc[t.idoc] || [],
        })),
        modals: (item.modals || []).map(m => ({
          ...m,
          screenshots: screenshotsByIdoc[m.idoc] || [],
        })),
      };
    }
    return item;
  });
}

const catalogJson = { generated: now, nav: buildCatalogJson(nav) };
fs.writeFileSync(config.catalogJson, JSON.stringify(catalogJson, null, 2), 'utf8');
console.log(`✅ catalog.json written → ${config.catalogJson}`);

// ─── Validation warnings ──────────────────────────────────────────────────────

const warnings = collectWarnings({
  navGroups, nav, pages,
  sectionsByPage, modalsByPage, tabsByPage,
  resolveIdoc,
});

const warningLines = [
  `# Warnings`,
  `> Згенеровано: ${now} · Запусти скрипт щоб оновити`,
  '',
];

if (warnings.length) {
  warningLines.push(`**${warnings.length} проблем знайдено:**`, '');
  warnings.forEach(w => warningLines.push(`- ${w.trim()}`));
  console.log(`\n⚠️  Warnings (${warnings.length}):`);
  warnings.forEach(w => console.log('  ' + w));
} else {
  warningLines.push(`✅ Проблем не знайдено.`);
  console.log(`✅ No warnings`);
}

fs.writeFileSync(config.warnings, warningLines.join('\n'), 'utf8');
console.log(`✅ WARNINGS.md written → ${config.warnings}`);

console.log(`   Pages: ${pages.length} | Tabs: ${tabs.length} | Sections: ${sections.length} | Modals: ${modals.length}`);
console.log(`   Screenshots: ${screenshots.length} (pages: ${screenshots.filter(s => s.type === 'page').length}, tabs: ${screenshots.filter(s => s.type === 'tab').length}, modals: ${screenshots.filter(s => s.type === 'modal').length})`);
