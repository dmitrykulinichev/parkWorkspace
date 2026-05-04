# Зароб. водіїв
> `page:driver-earnings` · `/driver-earnings-new`

Заробіток водіїв: фінансовий звіт по персоналу, де ви можете аналізувати доходи, витрати, ефективність та підсумкові виплати водіям.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:driver-earnings-list` | Підсумковий звіт заробітку водіїв: детальна аналітика поїздок, бонусів, витрат т |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:driver-earnings-calc-info` | [modal_driver_earnings_calc_info.md](../modals/modal_driver_earnings_calc_info.md) |
| `modal:driver-earnings-details` | [modal_driver_earnings_details.md](../modals/modal_driver_earnings_details.md) |
| `modal:driver-earnings-raw-data` | [modal_driver_earnings_raw_data.md](../modals/modal_driver_earnings_raw_data.md) |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_driver_earnings_main` | `[data-i-doc="page:driver-earnings"]` | `/driver-earnings-new` |

## Функціональний опис

```js
/**
 * @doc-page  page_driver_earnings_new
 * @doc-title Заробіток водіїв (Новий)
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-modals
 *   - modal_driver_earnings_calc_info (Інформація про розрахунок)
 *   - modal_driver_earnings_details (Деталі заробітку водія)
 *   - modal_raw_data (Сирі дані)
 * @doc-features
 *   - Відображення звіту по заробітку водіїв
 *   - Вибір часового діапазону
 *   - Експорт звіту в Excel
 *   - Перемикання в розширений режим (ефективність)
 *   - Сортування таблиці
 *   - Фільтрація водіїв за наявністю активності
 *   - Перегляд інформації про розрахунки
 *   - Перегляд детальної інформації по водію
 *   - Відображення необроблених даних (Raw Data)
 *   - Відображення статусу інтеграції з Uklon
 * @doc-api
 *   - GET /api/driver-earnings/uklon-report/export
 *   - useDriverEarningsOptions (отримання списку водіїв)
 *   - useUklonDriverEarningsReport (отримання звіту)
 * @doc-entities
 *   - Driver
 *   - EarningsReport
 */
```
