'use strict';
const fs   = require('fs');
const path = require('path');
const config = require('./config');
const { parseIndexObject, parsePathMapping, parseHints, parseNavGroups, parseDocBlocks } = require('./parser');
const { NAV_GROUPS, PATH_OVERRIDES, VIRTUAL_PATHS, LEGACY_PAGES, GROUP_FOLDER_NAMES, MAIN_GROUP_TITLE } = require('./nav-config');
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

// ─── Scan JSX/JS files for @doc-* JSDoc blocks ───────────────────────────────

function walkDir(dir, extensions, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, extensions, results);
    else if (extensions.some(e => entry.name.endsWith(e))) results.push(full);
  }
  return results;
}

const jsxFiles = [
  ...walkDir(path.join(config.appJs, 'pages'),      ['.jsx', '.js']),
  ...walkDir(path.join(config.appJs, 'components'), ['.jsx', '.js']),
];

// Keyed by @doc-* id exactly as written (e.g. 'page_dashboard_main', 'modal_task_form')
const docBlocksMap = {};
for (const file of jsxFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const block of parseDocBlocks(text)) {
    block.filePath = file;
    docBlocksMap[block.id] = block;
  }
}
console.log(`✅ @doc-* blocks: ${Object.keys(docBlocksMap).length} found in ${jsxFiles.length} files`);

// ─── Registry helpers ─────────────────────────────────────────────────────────

const toDocId = id => id.replace(':', '_').replace(/-/g, '_');

// Convert idoc (page:x, tab:x, modal:x) to the key used in docBlocksMap.
// Pages: screenshotId adds _main → matches @doc-page page_X_main convention.
// Modals/tabs: plain toDocId → matches @doc-modal modal_X / @doc-tab tab_X.
const toDocBlockId = id => {
  if (id.startsWith('page:')) return `${toDocId(id)}_main`;
  return toDocId(id);
};

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

// idoc value → doc block, matched via file path (reliable across @doc-page ID conventions)
// For 'page:tasks' → looks for a page block whose file lives in pages/Tasks/
const pagesDir = path.join(config.appJs, 'pages');
const docBlocksByIdoc = {};
for (const block of Object.values(docBlocksMap)) {
  if (block.type !== 'page' || !block.filePath) continue;
  const rel      = path.relative(pagesDir, block.filePath);
  const topLevel = rel.split(path.sep)[0].replace(/\.[jt]sx?$/, '');
  const idoc     = commentToPage[topLevel];
  if (idoc) docBlocksByIdoc[idoc] = block;
}
console.log(`   Matched to pages: ${Object.keys(docBlocksByIdoc).length}`);

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
  if (id.startsWith('page:'))  return `_data/pages/${d}.md`;
  if (id.startsWith('tab:'))   return `_data/tabs/${d}.md`;
  if (id.startsWith('modal:')) return `_data/modals/${d}.md`;
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
    // Calculate tab slug: 'tab:reports-operational' (page 'reports') -> 'operational'
    const tabBase  = t.value.replace('tab:', '');
    const parts    = tabBase.split('-');
    const tabSlug  = parts[parts.length - 1]; 
    const tabUrl   = `${url}${url.includes('?') ? '&' : '?'}tab=${tabSlug}`;

    pageScreenshots.push({ 
      id: screenshotId(t.value), 
      type: 'tab', 
      idoc: t.value, 
      selector: `[data-i-doc="${t.value}"]`, 
      url: tabUrl, 
      page: id 
    });
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

function mergeDocFields(doc) {
  if (!doc) return {};
  const result = {};
  if (doc.raw)              result.docRaw   = doc.raw;
  if (doc.title)            result.title    = doc.title;
  if (doc.human)            result.human    = doc.human;
  if (doc.features?.length) result.features = doc.features;
  if (doc.api?.length)      result.api      = doc.api;
  if (doc.entities?.length) result.entities = doc.entities;
  if (doc.notes?.length)    result.notes    = doc.notes;
  return result;
}

function enrichPage(idoc) {
  const pageDoc = docBlocksByIdoc[idoc] || docBlocksMap[toDocBlockId(idoc)] || null;

  const pageTabs = (tabsByPage[idoc] || []).map((t, i) => {
    const tabDoc = docBlocksMap[toDocBlockId(t.value)] || null;
    return {
      idoc:      t.value,
      isDefault: i === 0,
      hint:      hints[t.value] || null,
      docFile:   docFile(t.value),
      ...mergeDocFields(tabDoc),
    };
  });
  const pageSections = (sectionsByPage[idoc] || []).map(s => ({
    idoc: s.value,
    tab:  entryTab(s) || null,
    hint: hints[s.value] || null,
  }));
  const pageModals = (modalsByPage[idoc] || []).map(m => {
    const modalDoc = docBlocksMap[toDocBlockId(m.value)] || null;
    return {
      idoc:    m.value,
      docFile: docFile(m.value),
      hint:    hints[m.value] || null,
      ...mergeDocFields(modalDoc),
    };
  });

  return {
    tabs: pageTabs,
    sections: pageSections,
    modals: pageModals,
    ...mergeDocFields(pageDoc),
  };
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
      const { tabs, sections, modals, ...docFields } = enrichPage(idoc);
      node.tabs     = tabs;
      node.sections = sections;
      node.modals   = modals;
      Object.assign(node, docFields);
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

const DATA_DIR = path.join(path.dirname(config.catalog), '..', '_data');
const { created, updated, skipped } = scaffoldDocs(nav, DATA_DIR, screenshotsByIdoc);
console.log(`✅ Scaffold: ${created} created, ${updated} updated, ${skipped} skipped → ${DATA_DIR}`);

// ─── Write nav.json (docFile paths updated in-place by scaffoldDocs) ──────────

function enrichNavWithScreenshots(navItems) {
  for (const item of navItems) {
    if (item.idoc) {
      item.screenshots = screenshotsByIdoc[item.idoc] || [];
      for (const t of item.tabs   || []) t.screenshots = screenshotsByIdoc[t.idoc]   || [];
      for (const m of item.modals || []) m.screenshots = screenshotsByIdoc[m.idoc] || [];
    }
    if (item.children) enrichNavWithScreenshots(item.children);
  }
}

enrichNavWithScreenshots(nav);
fs.writeFileSync(config.nav, JSON.stringify(nav, null, 2), 'utf8');
console.log(`✅ nav.json written → ${config.nav}`);

// ─── Generate publish/menu.json ───────────────────────────────────────────────

function buildMenuJson(navItems) {
  const ungrouped = [];

  function toMenuItem(item) {
    const slug = item.path === '/'
      ? item.idoc.replace('page:', '')
      : item.path.slice(1);
    const pageShot = (screenshotsByIdoc[item.idoc] || []).find(s => s.type === 'page');

    const entry = {
      title: item.label,
      slug,
      image: pageShot ? `${pageShot.id}.png` : '',
    };
    if (item.hint)    entry.description = item.hint;
    if (item.docFile) entry.docFile     = item.docFile;

    const tabs = (item.tabs || []).map(t => {
      const tabBase = t.idoc.replace('tab:', '');
      const pgSlug  = slug.replace(/\//g, '-');
      const prefix  = pgSlug + '-';
      const suffix  = tabBase.startsWith(prefix) ? tabBase.slice(prefix.length) : tabBase;
      const tab = { title: t.title || tabBase, slug: `${pgSlug}--${suffix}` };
      if (t.docFile) tab.docFile = t.docFile;
      const shots = screenshotsByIdoc[t.idoc] || [];
      if (shots.length) tab.screenshots = shots;
      return tab;
    });
    if (tabs.length) entry.tabs = tabs;

    const modals = (item.modals || []).map(m => {
      const modal = { slug: m.idoc.replace('modal:', '') };
      if (m.docFile) modal.docFile = m.docFile;
      const shots = screenshotsByIdoc[m.idoc] || [];
      if (shots.length) modal.screenshots = shots;
      return modal;
    });
    if (modals.length) entry.modals = modals;

    const shots = screenshotsByIdoc[item.idoc] || [];
    if (shots.length) entry.screenshots = shots;

    return entry;
  }

  const groups = [];
  for (const item of navItems) {
    if (item.children && !item.idoc) {
      const items = item.children.filter(c => c.idoc).map(toMenuItem);
      if (items.length) groups.push({ title: item.label, items });
    } else if (item.idoc) {
      ungrouped.push(toMenuItem(item));
    }
  }
  if (ungrouped.length) groups.unshift({ title: MAIN_GROUP_TITLE, items: ungrouped });

  return groups;
}

fs.writeFileSync(config.menuJson, JSON.stringify(buildMenuJson(nav), null, 2), 'utf8');
console.log(`✅ menu.json written → ${config.menuJson}`);

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
