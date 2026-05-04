# manual-trip-form
> `modal:manual-trip-form` · відкривається з: `page:manual-trips`

Заповніть деталі поїздки: оберіть автомобіль, водія, вкажіть суму, пробіг та дату. Це дозволить врахувати дохід поза агрегаторами.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `modal_manual_trip_form` | `[data-i-doc="modal:manual-trip-form"]` | `/manual-trips` |

## Функціональний опис

```js
/**
 * @doc-modal modal_manual_trip_form
 * @doc-title Форма поїздки
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - Створення або редагування ручної поїздки
 *   - Вибір автомобіля та водія
 *   - Введення фінансових показників (сума, пробіг)
 *   - Введення дати та часу
 *   - Додавання коментарів
 *   - Динамічна валідація даних
 * @doc-api
 *   - POST /api/manual-trips
 *   - PUT /api/manual-trips/{id}
 *   - GET /api/manual-trips/options
 * @doc-entities
 *   - ManualTrip, Vehicle, Driver
 */
```
