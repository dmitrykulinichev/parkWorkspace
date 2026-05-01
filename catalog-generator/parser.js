/**
 * Parses i-doc TypeScript source files.
 * No external dependencies — plain text + regex.
 */

/**
 * Extracts entries from a `export const XxxIndices = { ... } as const` block.
 * Returns: [{ comment, key, value }]
 * Multiple entries after the same comment all share that comment.
 */
function parseIndexObject(text, objectName) {
  const entries = [];
  const regex = new RegExp(`export const ${objectName}\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*as const`);
  const match = text.match(regex);
  if (!match) return entries;

  const lines = match[1].split('\n');
  let currentComment = null;

  for (const line of lines) {
    const commentMatch = line.match(/^\s*\/\/\s*(.+)$/);
    if (commentMatch) {
      currentComment = commentMatch[1].trim();
      continue;
    }
    const entryMatch = line.match(/^\s*(\w+):\s*'([^']+)'/);
    if (entryMatch) {
      entries.push({ comment: currentComment, key: entryMatch[1], value: entryMatch[2] });
    }
  }

  return entries;
}

/**
 * Parses PathToIDoc: { '/path': PageIndices.KEY, ... }
 * Returns: { '/path': 'page:value' }
 */
function parsePathMapping(text, pageEntries) {
  const mapping = {};
  const regex = /export const PathToIDoc\s*=\s*\{([\s\S]*?)\}\s*as const/;
  const match = text.match(regex);
  if (!match) return mapping;

  const keyToValue = {};
  for (const e of pageEntries) keyToValue[e.key] = e.value;

  const lines = match[1].split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*'([^']+)':\s*PageIndices\.(\w+)/);
    if (m && keyToValue[m[2]]) {
      mapping[m[1]] = keyToValue[m[2]];
    }
  }

  return mapping;
}

/**
 * Parses PageHints: { 'id': "hint text", ... }
 * Returns: { 'page:tasks': 'hint...' }
 */
function parseHints(text) {
  const hints = {};
  const regex = /export const PageHints\s*=\s*\{([\s\S]*?)\}\s*as const/;
  const match = text.match(regex);
  if (!match) return hints;

  const lines = match[1].split('\n');
  for (const line of lines) {
    // Handles both "text" and 'text' values, and escaped quotes
    const m = line.match(/^\s*'([^']+)':\s*"((?:[^"\\]|\\.)*)"/);
    if (m) hints[m[1]] = m[2];
  }

  return hints;
}

/**
 * Parses NavigationItems.js (ES module syntax, plain JS).
 * Returns a map: groupName → [ { path, label, children: [...] } ]
 *
 * Each item: { path: '/tasks', label: 'Задачі', children?: [...] }
 */
function parseNavGroups(text) {
  const groups = {};

  // Find each exported const block: export const NAME = [ ... ];
  const groupRegex = /export const (\w+)\s*=\s*\[([\s\S]*?)\];/g;
  let groupMatch;

  while ((groupMatch = groupRegex.exec(text)) !== null) {
    const groupName = groupMatch[1];
    const body = groupMatch[2];
    groups[groupName] = parseNavItems(body);
  }

  return groups;
}

/**
 * Recursively extract { path, label, children } from a JS array body string.
 */
function parseNavItems(body) {
  const items = [];

  // Split into top-level objects by matching balanced braces
  const objects = splitTopLevelObjects(body);

  for (const obj of objects) {
    const pathMatch  = obj.match(/path\s*:\s*'([^']+)'/);
    const labelMatch = obj.match(/label\s*:\s*'([^']+)'/);
    if (!pathMatch) continue;

    const item = {
      path:  pathMatch[1],
      label: labelMatch ? labelMatch[1] : '',
    };

    // Check for children array
    const childrenMatch = obj.match(/children\s*:\s*\[([\s\S]*?)\]\s*[,}]/);
    if (childrenMatch) {
      item.children = parseNavItems(childrenMatch[1]);
    }

    items.push(item);
  }

  return items;
}

/**
 * Splits a string into top-level JS object literals { ... }.
 * Handles nested braces correctly.
 */
function splitTopLevelObjects(text) {
  const objects = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (text[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        objects.push(text.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return objects;
}

module.exports = { parseIndexObject, parsePathMapping, parseHints, parseNavGroups };
