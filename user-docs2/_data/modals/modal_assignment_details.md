# assignment-details
> `modal:assignment-details` · відкривається з: `page:vehicle-assignments`

Повна інформація про призначення, включаючи історію змін, коментарі та посилання на звіти в Telegram.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `modal_assignment_details` | `[data-i-doc="modal:assignment-details"]` | `/assignments` |

## Функціональний опис

```js
/**
 * @doc-modal modal_assignment_details
 * @doc-title Деталі призначення
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - перегляд повної інформації про період володіння автомобілем водієм
 *   - відображення статусів (Активне/Завершене) з відповідною колірною індикацією
 *   - перегляд даних про пробіг: початковий, кінцевий та розрахована дистанція
 *   - інформація про користувачів, які створили та закрили призначення
 *   - відображення причин призначення та завершення (здачі) авто
 *   - прямі посилання на медіа-звіти в Telegram (прийом та здача авто)
 *   - вкладка з технічною інформацією (debug) для адміністраторів
 * @doc-api
 *   - GET /api/assignments/{id}
 * @doc-entities
 *   - Vehicle, Driver, User, VehicleAssignment
 */
```
