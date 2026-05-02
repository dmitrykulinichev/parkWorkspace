'use strict';
const { NAV_GROUPS, VIRTUAL_PATHS, LEGACY_PAGES } = require('./nav-config');

/**
 * Collect all validation warnings.
 * Returns an array of warning strings.
 */
function collectWarnings({ navGroups, nav, pages, sectionsByPage, modalsByPage, tabsByPage, resolveIdoc }) {
  const warnings = [];

  // 1. Nav paths that have no matching i-doc (silently skipped during build)
  function collectSkipped(items) {
    for (const item of items) {
      if (!VIRTUAL_PATHS.has(item.path)) {
        if (resolveIdoc(item.path) === null && !item.children) {
          warnings.push(`nav path without i-doc: ${item.path} ("${item.label}")`);
        }
      }
      if (item.children) collectSkipped(item.children);
    }
  }
  for (const groupName of NAV_GROUPS) {
    collectSkipped(navGroups[groupName] || []);
  }

  // 2. Registry elements not matched to any page via comment
  for (const s of (sectionsByPage['__unassigned__'] || [])) {
    warnings.push(`section not assigned to any page: ${s.value}  (comment: ${s.comment || '—'})`);
  }
  for (const m of (modalsByPage['__unassigned__'] || [])) {
    warnings.push(`modal not assigned to any page: ${m.value}  (comment: ${m.comment || '—'})`);
  }
  for (const t of (tabsByPage['__unassigned__'] || [])) {
    warnings.push(`tab not assigned to any page: ${t.value}  (comment: ${t.comment || '—'})`);
  }

  // 3. Pages in registry but absent from nav (excluding known legacy)
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
      warnings.push(`page in registry but not in nav: ${page.value}`);
    }
  }

  return warnings;
}

module.exports = { collectWarnings };
