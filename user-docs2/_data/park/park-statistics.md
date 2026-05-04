# Статистика
> `page:park-statistics` · `/park-statistics`

Статистика парку: глобальна аналітика діяльності автопарку, візуалізація трендів поїздок та використання автомобілів.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:uklon-stats-widget` | Статистика замовлень Uklon: огляд поточних показників поїздок та доходів у систе |
| `sec:test-uklon-stats-widget` | Тестовий віджет статистики: розширений аналіз нових метрик Uklon. |
| `sec:vehicle-mileage-chart-widget` | Графік пробігу: візуалізація динаміки використання автомобілів у розрізі часу. |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_park_statistics_main` | `[data-i-doc="page:park-statistics"]` | `/park-statistics` |

## Функціональний опис

```js
/**
 * @doc-page  page_park_statistics
 * @doc-title Статистика парку
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - Відображення віджета статистики замовлень Uklon (оригінальний)
 *   - Відображення тестового віджета статистики замовлень Uklon
 *   - Відображення графіка пробігу автопарку
 * @doc-entities
 *   - UklonOrder
 *   - Vehicle
 */
```
