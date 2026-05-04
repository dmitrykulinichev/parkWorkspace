# Звіти
> `page:uklon-reports` · `/uklon-reports`

Звіти Uklon: детальна фінансова та операційна аналітика по роботі з Uklon.

## Вкладки

| Вкладка | За замовчуванням | Опис |
|---|---|---|
| [`tab:uklon-reports-dashboard`](./dashboard.md) | ✓ | Огляд: загальні фінансові показники роботи з Uklon. |
| [`tab:uklon-reports-drivers`](./drivers.md) |  | Водії: аналітика ефективності кожного водія в системі Uklon. |
| [`tab:uklon-reports-vehicles`](./vehicles.md) |  | Автомобілі: аналітика продуктивності кожного авто Uklon. |

> Детальна документація кожної вкладки — у відповідних файлах.

## Опис

<!-- TODO: human description -->


## Функціональний опис

```js
/**
 * @doc-page  page_uklon_reports_index
 * @doc-title Звіти Uklon
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-tabs
 *   - tab_uklon_reports_dashboard (Огляд)
 *   - tab_uklon_reports_drivers (Водії)
 *   - tab_uklon_reports_vehicles (Автомобілі)
 * @doc-features
 *   - Відображення аналітичних звітів по сервісу Uklon
 *   - Вибір діапазону дат (ручний ввід або швидкі фільтри: сьогодні, вчора, тиждень, місяць, минулий місяць)
 *   - Фільтрація даних за статусами замовлень
 *   - Перемикання між табами звітів (Огляд, Водії, Автомобілі)
 *   - Передача спільних фільтрів (дати, статуси) у дочірні таби
 * @doc-api
 *   - GET /uklon-reports/options (через useUklonReportOptions)
 */
```
