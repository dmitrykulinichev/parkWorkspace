# Призначення
> `page:vehicle-assignments` · `/assignments`

Журнал призначень: відстежуйте історію закріплення автомобілів за водіями, переглядайте акти прийому-передачі та контролюйте пробіг на момент зміни водія.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:assignment-list` | Список всіх призначень. Використовуйте фільтри для пошуку активних або завершени |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:assignment-filters` | [modal_assignment_filters.md](../modals/modal_assignment_filters.md) |
| `modal:assignment-form` | [modal_assignment_form.md](../modals/modal_assignment_form.md) |
| `modal:assignment-details` | [modal_assignment_details.md](../modals/modal_assignment_details.md) |
| `modal:assignment-delete-confirm` | [modal_assignment_delete_confirm.md](../modals/modal_assignment_delete_confirm.md) |


## Опис

* <!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_vehicle_assignments_main` | `[data-i-doc="page:vehicle-assignments"]` | `/assignments` |

## Функціональний опис

```js
/**
 * @doc-page  page_vehicle_assignments
 * @doc-title Призначення
 * @doc-human
 *   * <!-- TODO: human description -->
 * @doc-modals
 *   - modal_assignment_form (Форма призначення)
 *   - modal_assignment_details (Деталі призначення)
 *   - modal_assignment_filters (Фільтри призначень)
 *   - modal_assignment_delete_confirm (Підтвердження видалення)
 * @doc-features
 *   - перегляд історії та поточних призначень водіїв на автомобілі
 *   - фільтрація за водієм, автомобілем, статусом (активне/завершене) та періодом часу
 *   - пошук за іменем водія або держномером автомобіля
 *   - створення нових призначень з фіксацією дати та початкового пробігу
 *   - завершення призначень (відв'язка водія) з фіксацією кінцевого пробігу та причин здачі
 *   - візуальна індикація активних призначень
 *   - доступ до пов'язаних медіафайлів (фото/відео прийому-здачі) через Telegram посилання
 *   - пагінація та сортування списку за датою призначення
 * @doc-api
 *   - GET /api/assignments
 *   - GET /api/assignments/{id}
 *   - GET /api/assignments/options
 *   - POST /api/assignments
 *   - PATCH /api/assignments/{id}
 *   - DELETE /api/assignments/{id}
 * @doc-entities
 *   - Vehicle, Driver, User, File, VehicleAssignment
 */
```
