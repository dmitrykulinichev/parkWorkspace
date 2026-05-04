# Ручні поїздки
> `page:manual-trips` · `/manual-trips`

Облік ручних поїздок: реєструйте поїздки, виконані поза агрегаторами, контролюйте їх вартість та пробіг.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:manual-trip-list` | Хронологія ручних поїздок. Використовуйте фільтри для аналізу фінансових показни |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:manual-trip-form` | [modal_manual_trip_form.md](../modals/modal_manual_trip_form.md) |
| `modal:manual-trip-details` | [modal_manual_trip_details.md](../modals/modal_manual_trip_details.md) |
| `modal:manual-trip-filters` | [modal_manual_trip_filters.md](../modals/modal_manual_trip_filters.md) |
| `modal:manual-trip-delete-confirm` | [modal_manual_trip_delete_confirm.md](../modals/modal_manual_trip_delete_confirm.md) |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_manual_trips_main` | `[data-i-doc="page:manual-trips"]` | `/manual-trips` |

## Функціональний опис

```js
/**
 * @doc-page  page_manual_trips
 * @doc-title Ручні поїздки
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-modals
 *   - modal_manual_trip_form (Форма поїздки)
 *   - modal_manual_trip_details (Деталі поїздки)
 *   - modal_manual_trip_filters (Фільтри поїздок)
 *   - modal_manual_trip_delete_confirm (Підтвердження видалення)
 * @doc-features
 *   - Відображення списку ручних поїздок (таблиця)
 *   - Фільтрація поїздок за різними параметрами
 *   - Пошук поїздок
 *   - Пагінація списку
 *   - Створення нової ручної поїздки
 *   - Редагування існуючої поїздки
 *   - Перегляд деталей поїздки
 *   - Видалення поїздки
 * @doc-api
 *   - GET /api/manual-trips
 *   - POST /api/manual-trips
 *   - PUT /api/manual-trips/{id}
 *   - DELETE /api/manual-trips/{id}
 *   - GET /api/manual-trips/options
 * @doc-entities
 *   - ManualTrip, Vehicle, Driver, User
 */
```
