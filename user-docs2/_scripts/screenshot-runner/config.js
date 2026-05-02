'use strict';
const path = require('path');

const USER_DOCS2 = path.resolve(__dirname, '../..');   // workspace/user-docs2

// ── CLI arg helpers ────────────────────────────────────────────────────────────

function getArg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  const eq = process.argv.find(a => a.startsWith(`--${name}=`));
  if (eq) return eq.split('=')[1];
  return fallback;
}

// ── Parsed args ────────────────────────────────────────────────────────────────

// --type page,tab  |  --type modal        default: page,tab
const rawTypes = getArg('type', 'page,tab');

// --verbose / -v   show detailed per-page logs; without flag — errors only
const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

// --full           capture full element height even if it scrolls beyond the visible window
//                  default: clip to viewport (what the user actually sees)
const fullCapture = process.argv.includes('--full');

// --theme light  |  --theme dark          default: light
// Controls which subfolder screenshots land in: data/screenshots/<theme>/…
const theme = getArg('theme', 'light');

// --platform desktop  |  --platform mobile   default: desktop
// Controls which subfolder screenshots land in: data/screenshots/…/<platform>/…
const platform = getArg('platform', 'desktop');

// ── Validate ───────────────────────────────────────────────────────────────────

const VALID_THEMES    = ['light', 'dark'];
const VALID_PLATFORMS = ['desktop', 'mobile'];

if (!VALID_THEMES.includes(theme)) {
  console.error(`\n❌ Невідома тема: "${theme}". Допустимі: ${VALID_THEMES.join(', ')}`);
  process.exit(1);
}
if (!VALID_PLATFORMS.includes(platform)) {
  console.error(`\n❌ Невідома платформа: "${platform}". Допустимі: ${VALID_PLATFORMS.join(', ')}`);
  process.exit(1);
}

// ── Export ─────────────────────────────────────────────────────────────────────

// Screenshots are saved to:  data/screenshots/<theme>/<platform>/<id>.png
// e.g.  data/screenshots/light/desktop/sidebar-menu.png
//        data/screenshots/dark/mobile/sidebar-menu.png
//
// This lets the landing page pick the right variant based on user preferences:
//   theme:    light | dark   — matches the UI colour scheme the app was in
//   platform: desktop | mobile — matches the viewport/device context

module.exports = {
  // App base URL
  baseUrl: 'http://localhost:8010',

  // Input: catalog of all screenshots to capture
  screenshotsJson: path.join(USER_DOCS2, '_meta/screenshots.json'),

  // Output root — actual files land in <outputDir>/<id>.png
  outputDir: path.join(USER_DOCS2, 'data/screenshots', theme, platform),

  // The two active dimensions for this run
  theme,
  platform,

  // Verbose logging — show detailed per-page info (url, viewport, ready/spinner timing, i-doc count)
  // Without this flag only errors and the final summary are printed
  verbose,

  // Full element capture — capture the entire element even if it extends beyond the visible window
  // Default (false): clip to viewport — screenshot shows only what the user sees
  fullCapture,

  // Chrome persistent session (survives between runs — login once)
  chromeProfile: path.join(__dirname, 'chrome-profile'),

  // Selector that signals the page finished loading its data
  pageReadySelector: '[data-page-ready="true"]',

  // Selector for loading spinner — script waits until it disappears (data fetch complete)
  // Matches the <Loader /> component: <div class="animate-spin ...">
  loadingSelector: '.animate-spin',

  // How long to wait for an element to appear (ms)
  waitTimeout: 20000,

  // Pause after element found before taking screenshot (let animations settle)
  stabilizationMs: 600,

  // Which screenshot types to capture in this run
  captureTypes: rawTypes.split(',').map(s => s.trim()),

  // Error screenshots and run log are saved here (not theme/platform-scoped)
  errorsDir: path.join(USER_DOCS2, 'data/screenshots/errors'),
};
