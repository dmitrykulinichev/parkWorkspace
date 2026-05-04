# Логи
> `page:uklon-logs` · `/uklon-logs`

Логи інтеграції Uklon: технічний журнал запитів та відповідей до API Uklon для діагностики підключення.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:uklon-logs-list` | Журнал запитів: перегляд історії API запитів та відповідей системи Uklon. |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:uklon-log-details` | [modal_uklon_log_details.md](../modals/modal_uklon_log_details.md) |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_uklon_logs_main` | `[data-i-doc="page:uklon-logs"]` | `/uklon-logs` |

## Функціональний опис

```js
/**
 * @doc-page  page_uklon_logs_index
 * @doc-title Логи інтеграції Uklon
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-modals
 *   - modal_uklon_log_details (Деталі логу інтеграції Uklon)
 * @doc-features
 *   - Відображення списку логів інтеграції з Uklon
 *   - Пошук за логами (за endpoint, url, статус тощо)
 *   - Пагінація результатів
 *   - Оновлення списку логів
 *   - Перегляд детальної інформації про конкретний лог
 *   - Відображення станів завантаження та порожнього списку
 * @doc-api
 *   - GET /uklon/logs
 * @doc-entities
 *   - UklonLog
 */
```
