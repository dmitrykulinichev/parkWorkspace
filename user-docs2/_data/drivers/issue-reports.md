# Звернення
> `page:issue-reports` · `/issue-reports`

Журнал проблем та інцидентів: відстежуйте всі технічні та оперативні інциденти, що виникають під час роботи парку, та керуйте їх вирішенням.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:issue-reports-list` | Журнал проблем: огляд поточних технічних інцидентів та проблем з автомобілями. К |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:issue-reports-filters` | [modal_issue_reports_filters.md](../modals/modal_issue_reports_filters.md) |
| `modal:issue-report-form` | [modal_issue_report_form.md](../modals/modal_issue_report_form.md) |
| `modal:issue-report-actions` | [modal_issue_report_actions.md](../modals/modal_issue_report_actions.md) |
| `modal:issue-report-details` | [modal_issue_report_details.md](../modals/modal_issue_report_details.md) |
| `modal:task-info` | [modal_task_info.md](../modals/modal_task_info.md) |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_issue_reports_main` | `[data-i-doc="page:issue-reports"]` | `/issue-reports` |

## Функціональний опис

```js
/**
 * @doc-page  page_issue_reports
 * @doc-title Звіти про проблеми
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-modals
 *   - modal_issue_reports_filters (Фільтри звітів про проблеми)
 *   - modal_issue_report_form (Форма звіту)
 *   - modal_issue_report_actions (Дії над звітом)
 *   - modal_issue_report_details (Деталі звіту)
 *   - modal_task_info (Інформація про задачу)
 * @doc-features
 *   - Відображення списку звітів про проблеми у вигляді таблиці
 *   - Сортування звітів за різними колонками
 *   - Фільтрація звітів
 *   - Пошук за описом звіту
 *   - Пагінація списку
 *   - Відображення статусу звіту
 *   - Видалення звіту
 *   - Перегляд деталей звіту
 *   - Прийняття рішення по звіту (Resolve)
 *   - Перегляд інформації про пов'язану задачу
 * @doc-api
 *   - GET /api/issue-reports
 *   - GET /api/issue-reports/{id}
 *   - POST /api/issue-reports
 *   - PUT /api/issue-reports/{id}
 *   - DELETE /api/issue-reports/{id}
 *   - PATCH /api/issue-reports/{id}/status
 *   - PATCH /api/issue-reports/{id}/resolve-with-comment
 *   - GET /api/issue-reports/options
 *   - POST /api/issue-reports/{id}/reject
 *   - POST /api/issue-reports/{id}/request-info
 *   - POST /api/issue-reports/{id}/resolve-immediately
 *   - GET /api/issue-reports/{id}/available-tasks
 *   - POST /api/issue-reports/{id}/assign-to-task
 *   - POST /api/issue-reports/{id}/create-new-task
 * @doc-entities
 *   - IssueReport, Vehicle, Task, Driver
 */
```
