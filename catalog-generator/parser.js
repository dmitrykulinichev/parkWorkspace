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

module.exports = { parseIndexObject, parsePathMapping, parseHints };
