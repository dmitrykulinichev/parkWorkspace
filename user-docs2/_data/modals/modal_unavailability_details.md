# unavailability-details
> `modal:unavailability-details` · відкривається з: `page:vehicle-unavailabilities`

Повна інформація про причину та тривалість простою автомобіля, включаючи коментарі при відкритті та закритті запису.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `modal_unavailability_details` | `[data-i-doc="modal:unavailability-details"]` | `/vehicle-unavailabilities` |

## Функціональний опис

```js
/**
 * @doc-modal modal_unavailability_details
 * @doc-title Деталі запису про недоступність
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - перегляд детальної інформації про період непрацездатності автомобіля
 *   - відображення типу недоступності (ремонт, ТО, конфіскація тощо)
 *   - візуальна індикація поточного стану (Активний/Закритий)
 *   - перегляд причини відправки та підсумкових нотаток при закритті
 *   - точний час початку, завершення та автоматично розрахована тривалість
 *   - інформація про користувачів, які відкрили та закрили запис
 * @doc-api
 *   - використовує дані з батьківського компонента (item prop)
 * @doc-entities
 *   - Vehicle, VehicleUnavailability, User
 */
```
