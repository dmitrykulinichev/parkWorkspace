# Заробіток авто
> `page:vehicle-earnings` · `/vehicle-earnings`

Заробіток автомобілів: фінансова аналітика кожного авто у флоті. Аналізуйте доходи, витрати, ефективність роботи та чистий прибуток.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:vehicle-earnings-list` | Звіт по заробітку автомобілів: повна фінансова статистика кожного авто, включаюч |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:vehicle-earnings-details` | [modal_vehicle_earnings_details.md](../modals/modal_vehicle_earnings_details.md) |
| `modal:vehicle-earnings-calc-info` | [modal_vehicle_earnings_calc_info.md](../modals/modal_vehicle_earnings_calc_info.md) |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_vehicle_earnings_main` | `[data-i-doc="page:vehicle-earnings"]` | `/vehicle-earnings` |

## Функціональний опис

```js
/**
 * @doc-page  page_vehicle_earnings
 * @doc-title Заробіток автомобілів
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-modals
 *   - modal_vehicle_earnings_details (Деталі заробітку автомобіля)
 *   - modal_earnings_calc_info (Інформація про розрахунок)
 * @doc-features
 *   - Відображення звіту по заробітку автомобілів
 *   - Вибір часового діапазону
 *   - Експорт звіту в Excel
 *   - Сортування таблиці за різними показниками
 *   - Перегляд детальної інформації по автомобілю
 *   - Перегляд інформації про розрахунки
 *   - Розрахунок підсумкових показників (пробіг, поїздки, доходи, витрати)
 * @doc-api
 *   - GET /api/vehicle-earnings/export
 *   - useVehicleEarningsReport (отримання звіту)
 * @doc-entities
 *   - Vehicle
 *   - EarningsReport
 */
```
