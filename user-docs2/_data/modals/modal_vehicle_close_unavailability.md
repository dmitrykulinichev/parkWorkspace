# vehicle-close-unavailability
> `modal:vehicle-close-unavailability` · відкривається з: `page:vehicles`

Підтвердіть повернення автомобіля в роботу. Авто знову стане доступним для призначення водіїв.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `modal_vehicle_close_unavailability` | `[data-i-doc="modal:vehicle-close-unavailability"]` | `/vehicles` |

## Функціональний опис

```js
/**
 * @doc-modal modal_vehicle_close_unavailability
 * @doc-title Закрити запис про недоступність
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - завершення періоду непрацездатності автомобіля та повернення його в активний експлуатаційний стан
 *   - фіксація фактичної дати та часу закінчення простою (ремонту, сервісу)
 *   - додавання підсумкових нотаток про виконані роботи або результат періоду недоступності
 *   - візуальне підтвердження переведення транспортного засобу в статус "Активний"
 * @doc-api
 *   - PATCH /api/v1/vehicle-unavailabilities/${id} (закриття запису через мутацію)
 * @doc-entities
 *   - Vehicle, VehicleUnavailability
 */
```
