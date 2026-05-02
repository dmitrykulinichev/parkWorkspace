/**
 * Конфігурація навігаційної структури документації.
 * Визначає порядок груп і виправляє розбіжності між NavigationItems.js та i-doc registry.
 */

// Групи NavigationItems.js що включаємо (в порядку відображення).
// SYSTEM_MENU_ITEMS ігноруємо — це системний адмін.
module.exports.NAV_GROUPS = [
  'DASHBOARD_MENU_ITEM',
  'MAIN_MENU_ITEMS',
  'FLEET_MENU_ITEMS',
  'FINANCE_MENU_ITEMS',
  'PARK_MENU_ITEMS',
  'INTEGRATION_MENU_ITEMS',
  'SETTINGS_MENU_ITEMS',
];

// Шляхи що є в NavigationItems але відсутні в PathToIDoc — вказуємо i-doc ID вручну.
// null = пропустити цей пункт.
module.exports.PATH_OVERRIDES = {
  '/resources': 'page:materials',  // nav path відрізняється від route
};

// Шляхи-"групи" що існують тільки для структури меню — не є реальними сторінками.
module.exports.VIRTUAL_PATHS = new Set([
  '/drivers-group',
  '/fleet',
  '/finance',
  '/park',
  '/uklon',
  '/telegram',
]);

// Сторінки з registry що навмисно відсутні в навігації (легасі, службові тощо).
// Попередження для них не показуємо.
module.exports.LEGACY_PAGES = new Set([
  'page:statistics',  // легасі-сторінка, не актуальна
]);

// Маппінг virtual path → ім'я папки в data/.
// Визначає структуру каталогу документації.
module.exports.GROUP_FOLDER_NAMES = {
  '/drivers-group': 'drivers',
  '/fleet':         'fleet',
  '/finance':       'finance',
  '/park':          'park',
  '/uklon':         'uklon',
  '/telegram':      'telegram',
};
