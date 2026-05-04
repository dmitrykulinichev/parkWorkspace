# vehicle-unavailability-form
> `modal:vehicle-unavailability-form` · відкривається з: `page:vehicles`

Вкажіть причину виводу авто з експлуатації (ремонт, ДТП, очікування запчастин) та орієнтовний термін.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `modal_vehicle_unavailability_form` | `[data-i-doc="modal:vehicle-unavailability-form"]` | `/vehicles` |

## Функціональний опис

```js
/**
 * @doc-modal modal_vehicle_unavailability_form
 * @doc-title Відправити авто в недоступний стан / Редагування запису
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - фіксація періодів тимчасової непрацездатності автомобіля (ремонт, ТО, очікування запчастин тощо)
 *   - вибір типу недоступності для категоріювання простоїв
 *   - встановлення фактичної дати початку та очікуваної дати повернення авто в роботу
 *   - додавання детальних текстових описів причин простою
 *   - можливість редагування існуючих записів та додавання нотаток при завершенні періоду недоступності
 *   - перевірка на наявність активних призначень та автоматичне вирішення конфліктів статусів
 * @doc-api
 *   - GET /api/v1/vehicle-unavailabilities/options (опції форми)
 *   - GET /api/v1/vehicle-unavailabilities/${id} (дані запису)
 *   - POST /api/v1/vehicle-unavailabilities (створення)
 *   - PATCH /api/v1/vehicle-unavailabilities/${id} (оновлення)
 * @doc-entities
 *   - Vehicle, VehicleUnavailability
 */
```
