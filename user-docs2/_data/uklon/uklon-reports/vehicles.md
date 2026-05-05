# uklon-reports-vehicles
> `tab:uklon-reports-vehicles` · [`page:uklon-reports`](./index.md)

Автомобілі: аналітика продуктивності кожного авто Uklon.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:uklon-reports-controls` | Панель керування звітами: вибір діапазону дат та статусів замовлень для аналізу. |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `tab_uklon_reports_vehicles_main` | `[data-i-doc="tab:uklon-reports-vehicles"]` | `/uklon-reports?tab=vehicles` |

## Функціональний опис

```js
/**
 * @doc-tab  tab_uklon_reports_vehicles
 * @doc-title Автомобілі
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - Відображення таблиці статистичних даних по автомобілях
 *   - Можливість сортування за колонками: кількість поїздок, дохід, середній чек, пробіг, Грн/км
 *   - Відображення детальних показників (модель, номерний знак, поїздки, дохід, середній чек, пробіг, ефективність)
 *   - Відображення станів завантаження та порожнього списку
 *   - Отримання та відображення даних на основі переданих фільтрів (дати, статуси)
 * @doc-api
 *   - GET /uklon-reports/vehicles (через useUklonVehiclesStats)
 */
```
