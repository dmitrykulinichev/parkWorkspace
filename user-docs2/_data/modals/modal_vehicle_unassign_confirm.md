# vehicle-unassign-confirm
> `modal:vehicle-unassign-confirm` · відкривається з: `page:vehicles`

Завершити зміну водія? Переконайтеся, що вказано актуальний пробіг на момент повернення автомобіля.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `modal_vehicle_unassign_confirm` | `[data-i-doc="modal:vehicle-unassign-confirm"]` | `/vehicles` |

## Функціональний опис

```js
/**
 * @doc-modal modal_vehicle_unassign_confirm
 * @doc-title Здати автомобіль (Зняття водія)
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - завершення зміни/періоду користування автомобілем водієм
 *   - обов'язкова фіксація пробігу на момент передачі (здачі) авто
 *   - встановлення фактичного часу здачі транспортного засобу
 *   - можливість вказання причини здачі або додаткових коментарів
 *   - візуалізація поточного водія та поточного стану автомобіля
 * @doc-api
 *   - PATCH /api/v1/drivers/${driverId}/unassign-vehicle (через хук useVehicleUnassignment)
 * @doc-entities
 *   - Vehicle, Driver
 */
```
