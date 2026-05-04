# vehicle-assignment-form
> `modal:vehicle-assignment-form` · відкривається з: `page:vehicles`

Закріпіть водія за автомобілем. Виберіть водія зі списку та вкажіть пробіг на момент передачі авто.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `modal_vehicle_assignment_form` | `[data-i-doc="modal:vehicle-assignment-form"]` | `/vehicles` |

## Функціональний опис

```js
/**
 * @doc-modal modal_vehicle_assignment_form
 * @doc-title Створити/Редагувати призначення (Водій на Авто)
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - закріплення водія за транспортним засобом (створення призначення)
 *   - фіксація дати початку та початкового пробігу при видачі авто
 *   - управління завершенням призначень: встановлення дати повернення та кінцевого пробігу
 *   - вказівка причин призначення та здачі для обліку в історії
 *   - інтелектуальне вирішення конфліктів (наприклад, коли авто вже зайняте іншим водієм) через примусовий сабміт
 *   - динамічне відображення полів завершення тільки для існуючих записів
 * @doc-api
 *   - GET /api/assignments/options (опції форми)
 *   - GET /api/assignments/${id} (дані призначення)
 *   - POST /api/assignments (нове призначення)
 *   - PATCH /api/assignments/${id} (оновлення)
 * @doc-entities
 *   - Vehicle, Driver, VehicleAssignment, User
 */
```
