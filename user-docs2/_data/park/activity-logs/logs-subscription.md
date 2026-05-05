# logs-subscription
> `tab:logs-subscription` · [`page:activity-logs`](./index.md)

Журнал розсилок: історія відправлених повідомлень водіям.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `tab_logs_subscription_main` | `[data-i-doc="tab:logs-subscription"]` | `/activity-logs?tab=subscription` |

## Функціональний опис

```js
/**
 * @doc-tab tab_logs_subscription
 * @doc-title Журнал розсилок
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - Відображення журналу відправлених розсилок (Email, Telegram)
 *   - Пошук за користувачем
 *   - Фільтрація за типом звіту, каналом та статусом доставки
 *   - Відображення деталей доставки (дата, користувач, тип, призначення)
 *   - Відображення помилок доставки (якщо є)
 *   - Пагінація журналу
 * @doc-api
 *   - GET /api/subscription-logs
 *   - GET /api/subscription-logs/options
 */
```
