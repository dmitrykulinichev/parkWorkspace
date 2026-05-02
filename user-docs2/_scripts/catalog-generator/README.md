# _scripts — Генератор каталогу документації

Скрипт читає i-doc мітки з вихідного коду React SPA та будує повну структуру документації:
каталог, навігаційне дерево, skeleton MD-файлів і JSON-каталог для AI doc-генератора.

## Запуск

```bash
node workspace/user-docs2/_scripts/index.js
```

Запускати з кореня репозиторію. Залежностей немає — лише вбудований Node.js.

---

## Вхідні файли

| Файл | Призначення |
|---|---|
| `resources/js/common/i-doc/i-doc.registry.ts` | Всі i-doc ID: `PageIndices`, `TabIndices`, `SectionIndices`, `ModalIndices` |
| `resources/js/common/i-doc/i-doc.mapping.ts` | Маппінг URL → PageIndex |
| `resources/js/common/i-doc/i-doc.hints.ts` | Короткі описи для кожного ID (дороговказ для AI) |
| `resources/js/components/Navigation/NavigationItems.js` | Структура бокового меню (групи, порядок, вкладені пункти) |

Шляхи вхідних файлів визначені в `config.js`.

## Вихідні файли

| Файл | Де | Призначення |
|---|---|---|
| `CATALOG.md` | `_meta/` | Повний перелік всіх елементів: сторінки, таби, секції, модалки, скріншоти |
| `screenshots.json` | `_meta/` | JSON-масив скріншотів: `{id, type, idoc, selector, url, page}` |
| `nav.json` | `_meta/` | Навігаційне дерево з docFile-шляхами, hints, tabs, sections, modals |
| `WARNINGS.md` | `_meta/` | Попередження: елементи без сторінки, сторінки не в навігації |
| `catalog.json` | `data/` | Збагачений nav-tree з screenshots вбудованими в кожен елемент |
| `data/**/*.md` | `data/` | Skeleton MD-файли (не перезаписуються якщо вже існують) |

---

## Файли скрипта

### `index.js` — Оркестратор

Точка входу. Координує весь pipeline:

1. Читає вхідні файли
2. Парсить через `parser.js`
3. Будує допоміжні структури (groupByPage, commentToPage, тощо)
4. Генерує `CATALOG.md` + `screenshots.json`
5. Будує nav-дерево (`buildNavItems`)
6. Запускає `scaffold.js` → оновлює docFile-шляхи в nav-дереві in-place
7. Пише `nav.json` з оновленими шляхами
8. Генерує `catalog.json` — збагачений nav з screenshots
9. Запускає `validate.js` → пише `WARNINGS.md`

---

### `config.js` — Шляхи до файлів

Єдине місце де прописані всі абсолютні шляхи. `REPO` обчислюється відносно `__dirname`.
Міняти тут якщо змінюється структура репозиторію або розташування вхідних/вихідних файлів.

---

### `parser.js` — Парсери TypeScript-джерел

Читає вихідний код як текст (без transpile) та витягує структуровані дані.

| Функція | Що парсить |
|---|---|
| `parseIndexObject(text, name)` | `as const` об'єкт з TypeScript: повертає `[{value, comment}]` |
| `parsePathMapping(text, pages)` | `PathToIDoc` маппінг: повертає `{ '/url': 'page:id' }` |
| `parseHints(text)` | `PageHints` об'єкт: повертає `{ 'page:id': 'hint text' }` |
| `parseNavGroups(text)` | ES-модуль `NavigationItems.js`: повертає `{ GROUP_NAME: [{path, label, children}] }` |

`parseNavGroups` використовує `splitTopLevelObjects()` — brace-matching алгоритм для парсингу
ES-модуля без `require()` (файл не є CommonJS).

---

### `nav-config.js` — Конфігурація навігації

Ручні налаштування для вирішення розбіжностей між NavigationItems та i-doc registry.

| Експорт | Призначення |
|---|---|
| `NAV_GROUPS` | Які групи з NavigationItems включати і в якому порядку |
| `PATH_OVERRIDES` | URL → idoc для шляхів де автоматичний резолв не працює |
| `VIRTUAL_PATHS` | Шляхи що є тільки для структури меню (не реальні сторінки) |
| `LEGACY_PAGES` | Сторінки що навмисно відсутні в навігації (не показувати в warnings) |
| `GROUP_FOLDER_NAMES` | Virtual path → ім'я папки в `data/` (`/fleet` → `fleet`) |

Редагувати коли: з'являється новий розділ меню, змінюється URL сторінки,
або нова сторінка зареєстрована але навмисно відсутня в навігації.

---

### `scaffold.js` — Генерація файлової структури

Відповідає за фізичне створення MD-файлів та обчислення docFile-шляхів.

**Логіка шляхів:**
- Сторінка без табів → `data/<group>/page-slug.md`
- Сторінка з табами → `data/<group>/page-slug/index.md` + `data/<group>/page-slug/<tab-slug>.md`
- Модалки (завжди плоско) → `data/modals/modal_id.md`
- Топ-рівень без групи → `data/page-slug.md`

**Важливо:** `scaffoldDocs()` мутує nav-дерево in-place — оновлює `item.docFile` та `tab.docFile`
на нові nav-tree шляхи. Саме тому `nav.json` пишеться після виклику scaffold.

**Stub-файли** містять: назву, idoc, URL, hint, таблицю секцій, таблицю модалок з посиланнями,
таблицю скріншотів. Не перезаписуються якщо файл вже існує.

---

### `validate.js` — Збір попереджень

Чиста функція `collectWarnings(context)` → `string[]`. Перевіряє три типи проблем:

1. **Nav path без i-doc** — пункт меню є в NavigationItems але відсутній в PathToIDoc
2. **Елемент без сторінки** — таб/секція/модалка не прив'язалася до жодної сторінки  
   (коментар у registry вказує на `components/` а не `pages/`)
3. **Сторінка не в навігації** — є в PageIndices але відсутня в nav-дереві  
   (виключення: `LEGACY_PAGES`)

---

## Алгоритм прив'язки елементів до сторінок

Таби, секції та модалки прив'язуються до сторінок через **коментарі в registry**.

Приклад коментаря в `i-doc.registry.ts`:
```typescript
// resources/js/pages/Tasks/index.jsx
TASK_FILTERS: 'modal:task-filters',
```

Скрипт витягує `Tasks` з шляху → зіставляє з `commentToPage['Tasks'] = 'page:tasks'`.

Shared компоненти в `components/modals/` або `components/DriverSchedule/` — не прив'язуються
автоматично і потрапляють у `WARNINGS.md`. Вирішення: вручну додати в `PATH_OVERRIDES`
або перенести коментар в registry на `pages/`.

---

## Структура `data/catalog.json`

```json
{
  "generated": "2026-05-02",
  "nav": [
    {
      "label": "Автомобілі",
      "folder": "fleet",
      "children": [
        {
          "path": "/reports",
          "label": "Звіти",
          "idoc": "page:reports",
          "hint": "...",
          "docFile": "data/fleet/reports/index.md",
          "screenshots": [{"id": "page_reports_main", "selector": "..."}],
          "tabs": [
            {
              "idoc": "tab:reports-operational",
              "isDefault": true,
              "docFile": "data/fleet/reports/operational.md",
              "screenshots": [{"id": "tab_reports_operational_main", "selector": "..."}]
            }
          ],
          "sections": [...],
          "modals": [...]
        }
      ]
    }
  ]
}
```

Призначення: відправна точка для AI doc-генератора. Містить всю структуру в одному файлі —
шляхи до MD-файлів, скріншоти, hints — без необхідності парсити TypeScript-джерела.
