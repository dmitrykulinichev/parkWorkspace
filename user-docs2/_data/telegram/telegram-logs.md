# Логи
> `page:telegram-logs` · `/telegram-logs`

Логи Telegram: технічний журнал запитів та відповідей боту для відстеження статусу розсилок.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:telegram-logs-list` | Логи Telegram: переглядайте історію взаємодії системи з ботом для діагностики. |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:telegram-log-details` | [modal_telegram_log_details.md](../modals/modal_telegram_log_details.md) |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_telegram_logs_main` | `[data-i-doc="page:telegram-logs"]` | `/telegram-logs` |

## Функціональний опис

```js
/**
 * @doc-page  page_telegram_logs
 * @doc-title Логи Telegram
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-modals
 *   - modal_activity_log_details (Деталі логу Telegram)
 * @doc-features
 *   - Відображення списку логів Telegram
 *   - Фільтрація логів за пошуковим запитом, статусом, типом дії та діапазоном дат
 *   - Пагінація результатів
 *   - Оновлення списку логів
 *   - Перегляд детальної інформації про лог через модальне вікно
 *   - Відображення станів завантаження та порожнього списку
 * @doc-api
 *   - GET /telegram-logs/options
 *   - GET /telegram-logs
 * @doc-entities
 *   - TelegramLog
 */
```
