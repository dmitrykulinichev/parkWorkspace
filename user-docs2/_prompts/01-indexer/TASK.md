# 01-indexer — Індексатор i-doc

## Призначення
Читає i-doc мітки з коду та будує єдиний структурований каталог документації.
Запускається при змінах у `i-doc.registry.ts` або `i-doc.hints.ts`.
Результат — `_meta/CATALOG.md` — є єдиним джерелом правди для всіх подальших промптів.

## Вхідні файли
| Файл | Що містить |
|---|---|
| `resources/js/common/i-doc/i-doc.registry.ts` | Всі ID: PageIndices, TabIndices, SectionIndices, ModalIndices |
| `resources/js/common/i-doc/i-doc.mapping.ts` | Маппінг URL → PageIndex |
| `resources/js/common/i-doc/i-doc.hints.ts` | Описи для всіх ID |
| `workspace/user-docs2/_meta/CATALOG.md` | Поточна версія каталогу (якщо є — читати для збереження статусів) |

## Алгоритм

### Крок 1. Зібрати всі ID
Прочитати всі чотири об'єкти з registry: `PageIndices`, `TabIndices`, `SectionIndices`, `ModalIndices`.
Для кожного запису зберегти:
- рядкове значення (`'page:tasks'`, `'modal:task-form'` тощо)
- коментар над записом (`// resources/js/pages/Tasks/index.jsx`)

### Крок 2. Визначити URL для кожної сторінки
З `PathToIDoc` у `i-doc.mapping.ts` отримати URL для кожного `PageIndex`.
Якщо сторінка є в `PageIndices` але немає в `PathToIDoc` — URL = `— (не в роутингу)`.

### Крок 3. Згрупувати таби / секції / модалки по сторінках
Правило: елемент належить сторінці якщо його коментар містить шлях до файлу тієї сторінки.

Приклади відповідностей:
- `// resources/js/pages/Tasks/` → `page:tasks`
- `// resources/js/pages/Vehicles/` → `page:vehicles`
- `// resources/js/pages/Reports/OperationalReportTab.jsx` → `page:reports` (таб цієї сторінки)
- `// resources/js/pages/Dashboard.jsx` → `page:dashboard`

Елементи з коментарем `// resources/js/components/modals/` — shared.
Для них знайти батьківську сторінку через аналіз де вони використовуються в ModalIndices
(зазвичай є додатковий коментар із `pages/`).

### Крок 4. Вивести похідні ідентифікатори
Для кожного i-doc ID обчислити `doc_id`: замінити `:` → `_`, `-` → `_`.
Приклади: `page:tasks` → `page_tasks`, `modal:task-form` → `modal_task_form`, `tab:reports-operational` → `tab_reports_operational`.

Шляхи файлів документації:
- сторінка: `data/pages/page_tasks.md`
- таб: `data/tabs/tab_reports_operational.md`
- модалка: `data/modals/modal_task_form.md`
- секція: окремого файлу немає, документується у файлі сторінки

Скріншоти:
- сторінка: `page_tasks_main` → `[data-i-doc="page:tasks"]` @ `/tasks`
- таб: `tab_reports_operational_main` → `[data-i-doc="tab:reports-operational"]` @ `/reports?tab=operational`
- модалка: `modal_task_form` → `[data-i-doc="modal:task-form"]` @ URL батьківської сторінки

### Крок 5. Записати CATALOG.md
Формат — ієрархічний, детально описаний у PROMPT.md.

При оновленні існуючого каталогу:
- Зберегти поточні статуси (`✅ Done` / `📝 TODO`)
- Додати нові записи зі статусом `📝 TODO`
- Не видаляти записи з `✅ Done` навіть якщо ID зник з registry (позначити `⚠️ Orphan`)
