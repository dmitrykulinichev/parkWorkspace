# Промпт: Запуск індексатора i-doc

Скопіюй цей текст у новий чат Claude.

---

Ти дієш як технічний аналітик. Твоє завдання — прочитати i-doc мітки проєкту та згенерувати структурований каталог документації.

## Крок 1. Прочитай ці файли

1. `C:\Repository\park\app\park-react-spa\resources\js\common\i-doc\i-doc.registry.ts`
2. `C:\Repository\park\app\park-react-spa\resources\js\common\i-doc\i-doc.mapping.ts`
3. `C:\Repository\park\app\park-react-spa\resources\js\common\i-doc\i-doc.hints.ts`
4. `C:\Repository\park\workspace\user-docs2\_meta\CATALOG.md` (якщо є — зчитай поточні статуси)
5. `C:\Repository\park\workspace\user-docs2\_prompts\01-indexer\TASK.md` (алгоритм)

## Крок 2. Виконай алгоритм з TASK.md

## Крок 3. Запиши результат

Записати у `C:\Repository\park\workspace\user-docs2\_meta\CATALOG.md`.

### Формат CATALOG.md

```markdown
# Каталог документації
> Згенеровано з i-doc.registry.ts · Останнє оновлення: [дата]

---

## page:dashboard

| | |
|---|---|
| **URL** | `/` |
| **Файл** | `data/pages/page_dashboard.md` |
| **Статус** | 📝 TODO |
| **Hint** | Головна панель: огляд ключових показників... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Hint (перші 60 символів) |
|---|---|---|
| `sec:dashboard-stats` | `sec_dashboard_stats` | Статистика: огляд ключових метрик... |
| `sec:dashboard-uklon-pulse` | `sec_dashboard_uklon_pulse` | Пульс Uklon: активність інтеграції... |
| `sec:dashboard-vehicle-status` | `sec_dashboard_vehicle_status` | Статус авто: поточний стан... |
| `sec:dashboard-maintenance` | `sec_dashboard_maintenance` | Критичне обслуговування... |
| `sec:dashboard-document-issues` | `sec_dashboard_document_issues` | Проблеми з документами... |
| `sec:dashboard-tasks` | `sec_dashboard_tasks` | Активні задачі... |
| `sec:dashboard-reports` | `sec_dashboard_reports` | Відкриті звіти... |

### Модалки
| i-doc ID | doc_id | Файл | Hint (перші 60 символів) | Статус |
|---|---|---|---|---|
| `modal:dashboard-settings` | `modal_dashboard_settings` | `data/modals/modal_dashboard_settings.md` | Налаштування дашборду... | 📝 TODO |

### Скріншоти
| Screenshot ID | Селектор | URL | Katalon-файл |
|---|---|---|---|
| `page_dashboard_main` | `[data-i-doc="page:dashboard"]` | `/` | `katalon/page_dashboard_main.side` |
| `modal_dashboard_settings` | `[data-i-doc="modal:dashboard-settings"]` | `/` | `katalon/modal_dashboard_settings.side` |

---

## page:tasks

| | |
|---|---|
| **URL** | `/tasks` |
| **Файл** | `data/pages/page_tasks.md` |
| **Статус** | 📝 TODO |
| **Hint** | Ваш список задач: тут ви можете створювати нові задачі... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Hint (перші 60 символів) |
|---|---|---|
| `sec:task-list` | `sec_task_list` | Ваш список задач: переглядайте поточні справи... |

### Модалки
| i-doc ID | doc_id | Файл | Hint (перші 60 символів) | Статус |
|---|---|---|---|---|
| `modal:task-filters` | `modal_task_filters` | `data/modals/modal_task_filters.md` | Гнучкий пошук: фільтруйте... | 📝 TODO |
| `modal:task-form` | `modal_task_form` | `data/modals/modal_task_form.md` | Заповніть назву та виберіть пріоритет... | 📝 TODO |
| `modal:task-details` | `modal_task_details` | `data/modals/modal_task_details.md` | Детальна інформація про задачу... | 📝 TODO |
| `modal:task-delete-confirm` | `modal_task_delete_confirm` | `data/modals/modal_task_delete_confirm.md` | — | 📝 TODO |
| `modal:task-complete-confirm` | `modal_task_complete_confirm` | `data/modals/modal_task_complete_confirm.md` | — | 📝 TODO |

### Скріншоти
| Screenshot ID | Селектор | URL | Katalon-файл |
|---|---|---|---|
| `page_tasks_main` | `[data-i-doc="page:tasks"]` | `/tasks` | `katalon/page_tasks_main.side` |
| `modal_task_filters` | `[data-i-doc="modal:task-filters"]` | `/tasks` | `katalon/modal_task_filters.side` |
| `modal_task_form` | `[data-i-doc="modal:task-form"]` | `/tasks` | `katalon/modal_task_form.side` |
| `modal_task_details` | `[data-i-doc="modal:task-details"]` | `/tasks` | `katalon/modal_task_details.side` |
| `modal_task_delete_confirm` | `[data-i-doc="modal:task-delete-confirm"]` | `/tasks` | `katalon/modal_task_delete_confirm.side` |
| `modal_task_complete_confirm` | `[data-i-doc="modal:task-complete-confirm"]` | `/tasks` | `katalon/modal_task_complete_confirm.side` |

---

## page:reports

| | |
|---|---|
| **URL** | `/reports` |
| **Файл** | `data/pages/page_reports.md` |
| **Статус** | 📝 TODO |
| **Hint** | Звіти: детальна аналітика... |

### Таби
| i-doc ID | doc_id | Файл | Hint (перші 60 символів) | Статус |
|---|---|---|---|---|
| `tab:reports-operational` | `tab_reports_operational` | `data/tabs/tab_reports_operational.md` | Операційний звіт: детальний аналіз... | 📝 TODO |
| `tab:reports-performance` | `tab_reports_performance` | `data/tabs/tab_reports_performance.md` | Ефективність парку... | 📝 TODO |
| `tab:reports-maintenance` | `tab_reports_maintenance` | `data/tabs/tab_reports_maintenance.md` | Звіт по ТО... | 📝 TODO |

### Секції
| i-doc ID | doc_id | Таб | Hint (перші 60 символів) |
|---|---|---|---|
| `sec:reports-operational-controls` | `sec_reports_operational_controls` | `tab:reports-operational` | Керування операційним звітом... |
| `sec:reports-operational-table` | `sec_reports_operational_table` | `tab:reports-operational` | Зведена таблиця... |
| `sec:reports-performance-controls` | `sec_reports_performance_controls` | `tab:reports-performance` | Фільтрація KPI... |
| `sec:reports-performance-table` | `sec_reports_performance_table` | `tab:reports-performance` | Таблиця виконання нормативів... |
| `sec:reports-maintenance-stats` | `sec_reports_maintenance_stats` | `tab:reports-maintenance` | Статистика регламентних робіт... |
| `sec:reports-maintenance-filters` | `sec_reports_maintenance_filters` | `tab:reports-maintenance` | Пошук та фільтрація ТО... |
| `sec:reports-maintenance-list` | `sec_reports_maintenance_list` | `tab:reports-maintenance` | Список регламентних робіт... |

### Модалки
_немає_

### Скріншоти
| Screenshot ID | Селектор | URL | Katalon-файл |
|---|---|---|---|
| `page_reports_main` | `[data-i-doc="page:reports"]` | `/reports` | `katalon/page_reports_main.side` |
| `tab_reports_operational_main` | `[data-i-doc="tab:reports-operational"]` | `/reports?tab=operational` | `katalon/tab_reports_operational_main.side` |
| `tab_reports_performance_main` | `[data-i-doc="tab:reports-performance"]` | `/reports?tab=performance` | `katalon/tab_reports_performance_main.side` |
| `tab_reports_maintenance_main` | `[data-i-doc="tab:reports-maintenance"]` | `/reports?tab=maintenance` | `katalon/tab_reports_maintenance_main.side` |

---
[... решта сторінок у тому ж форматі ...]
```

## Важливі правила

- Виводити **всі** сторінки з `PageIndices` — жодну не пропускати
- Секції що належать конкретному табу — вказувати в колонці "Таб"
- Секції без таба — вказувати прочерк у колонці "Таб"
- При оновленні існуючого CATALOG.md: зберігати `✅ Done`, додавати нові як `📝 TODO`
- Hint у таблицях — перші ~60 символів, закінчити на `...` якщо обрізано
- Якщо hint для ID відсутній у `i-doc.hints.ts` — вставити `—`
