# vehicle-mileage-update
> `modal:vehicle-mileage-update` · відкривається з: `page:vehicles`

Введіть поточне значення одометра. Система автоматично розрахує середньодобовий пробіг та спрогнозує наступне ТО.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `modal_vehicle_mileage_update` | `[data-i-doc="modal:vehicle-mileage-update"]` | `/vehicles` |

## Функціональний опис

```js
/**
 * @doc-modal modal_vehicle_mileage_update
 * @doc-title Оновлення пробігу
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - фіксація поточного пробігу автомобіля
 *   - перегляд історії змін пробігу (до 20 останніх записів)
 *   - автоматичний розрахунок та візуалізація приросту пробігу
 *   - інтелектуальна обробка конфліктів (захист від некоректного введення) з можливістю примусового оновлення
 *   - прив'язка показань до конкретного водія та часу надання даних
 *   - підтримка коментарів до кожного запису пробігу
 * @doc-api
 *   - POST /api/v1/vehicles/${id}/mileage (оновлення пробігу)
 *   - GET /api/v1/vehicles/${id}/mileage-history (історія пробігу)
 * @doc-entities
 *   - Vehicle, MileageRecord, Driver
 */
```
