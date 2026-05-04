# Недоступності
> `page:vehicle-unavailabilities` · `/vehicle-unavailabilities`

Журнал простоїв: відстежуйте періоди, коли автомобілі були недоступні для роботи через ремонт, ТО або інші причини.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:unavailability-list` | Історія простоїв автомобілів. Помаранчевим кольорв виділені активні записи, що о |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:unavailability-filters` | [modal_unavailability_filters.md](../modals/modal_unavailability_filters.md) |
| `modal:unavailability-details` | [modal_unavailability_details.md](../modals/modal_unavailability_details.md) |
| `modal:unavailability-delete-confirm` | [modal_unavailability_delete_confirm.md](../modals/modal_unavailability_delete_confirm.md) |


## Опис

* <!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_vehicle_unavailabilities_main` | `[data-i-doc="page:vehicle-unavailabilities"]` | `/vehicle-unavailabilities` |

## Функціональний опис

```js
/**
 * @doc-page  page_vehicle_unavailabilities
 * @doc-title Недоступності авто
 * @doc-human
 *   * <!-- TODO: human description -->
 * @doc-modals
 *   - modal_vehicle_unavailability_form (Форма недоступності авто)
 *   - modal_vehicle_close_unavailability (Закриття недоступності)
 *   - modal_unavailability_details (Деталі недоступності)
 *   - modal_unavailability_filters (Фільтри)
 *   - modal_unavailability_delete_confirm (Підтвердження видалення)
 * @doc-features
 *   - перегляд списку періодів недоступності автомобілів (ремонт, ТО, конфіскація тощо)
 *   - розрахунок тривалості перебування авто в неактивному стані
 *   - фільтрація за автомобілем, типом недоступності та станом (активний/закритий)
 *   - пошук за держномером або моделлю автомобіля
 *   - фіксація причини недоступності та очікуваної дати завершення
 *   - можливість "закриття" недоступності з фіксацією фактичного часу та пробігу повернення
 *   - редагування існуючих записів про недоступність
 *   - видалення помилково створених або завершених записів
 *   - пагінація результатів
 *   - колірна індикація активних та завершених періодів
 * @doc-api
 *   - GET /api/vehicle-unavailabilities
 *   - GET /api/vehicle-unavailabilities/{id}
 *   - POST /api/vehicle-unavailabilities
 *   - PATCH /api/vehicle-unavailabilities/{id}
 *   - PATCH /api/vehicle-unavailabilities/{id}/close
 *   - DELETE /api/vehicle-unavailabilities/{id}
 *   - GET /api/vehicle-unavailabilities/options
 * @doc-entities
 *   - Vehicle, VehicleUnavailability, User
 */
```
