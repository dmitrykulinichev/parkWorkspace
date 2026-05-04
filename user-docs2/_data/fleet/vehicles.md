# Автомобілі
> `page:vehicles` · `/vehicles`

Управління автомобілями: реєструйте нові авто, слідкуйте за їх станом, пробігом та термінами технічного обслуговування.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:vehicle-list` | Ваш активний автопарк. Використовуйте пошук або фільтри для швидкого знаходження |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:vehicle-filters` | [modal_vehicle_filters.md](../modals/modal_vehicle_filters.md) |
| `modal:vehicle-form` | [modal_vehicle_form.md](../modals/modal_vehicle_form.md) |
| `modal:vehicle-details` | [modal_vehicle_details.md](../modals/modal_vehicle_details.md) |
| `modal:vehicle-delete-confirm` | [modal_vehicle_delete_confirm.md](../modals/modal_vehicle_delete_confirm.md) |
| `modal:vehicle-mileage-update` | [modal_vehicle_mileage_update.md](../modals/modal_vehicle_mileage_update.md) |
| `modal:vehicle-maintenance-form` | [modal_vehicle_maintenance_form.md](../modals/modal_vehicle_maintenance_form.md) |
| `modal:vehicle-assignment-form` | [modal_vehicle_assignment_form.md](../modals/modal_vehicle_assignment_form.md) |
| `modal:vehicle-unassign-confirm` | [modal_vehicle_unassign_confirm.md](../modals/modal_vehicle_unassign_confirm.md) |
| `modal:vehicle-issue-report-form` | [modal_vehicle_issue_report_form.md](../modals/modal_vehicle_issue_report_form.md) |
| `modal:vehicle-qr` | [modal_vehicle_qr.md](../modals/modal_vehicle_qr.md) |
| `modal:vehicle-import` | [modal_vehicle_import.md](../modals/modal_vehicle_import.md) |
| `modal:vehicle-tag-settings` | [modal_vehicle_tag_settings.md](../modals/modal_vehicle_tag_settings.md) |
| `modal:vehicle-transfer` | [modal_vehicle_transfer.md](../modals/modal_vehicle_transfer.md) |
| `modal:vehicle-unavailability-form` | [modal_vehicle_unavailability_form.md](../modals/modal_vehicle_unavailability_form.md) |
| `modal:vehicle-close-unavailability` | [modal_vehicle_close_unavailability.md](../modals/modal_vehicle_close_unavailability.md) |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_vehicles_main` | `[data-i-doc="page:vehicles"]` | `/vehicles` |

## Функціональний опис

```js
/**
 * Головна сторінка автомобілів з sticky хедером
 * Універсальна для мобільних та десктопних пристроїв
 * 
 * @doc-page page_vehicles_index
 * @doc-title Автомобілі
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-modals
 *   - modal_vehicle_details (Деталі автомобіля)
 *   - modal_vehicle_delete_confirm (Підтвердження видалення)
 *   - modal_vehicle_mileage_update (Оновлення пробігу)
 *   - modal_vehicle_form (Форма автомобіля)
 *   - modal_vehicle_unassign_confirm (Зняття водія)
 *   - modal_vehicle_issue_report_form (Звіт про проблему)
 *   - modal_vehicle_maintenance_form (Запис про ТО)
 *   - modal_vehicle_transfer (Передача авто)
 *   - modal_vehicle_assignment_form (Призначення водія)
 *   - modal_vehicle_unavailability_form (Додавання недоступності)
 *   - modal_vehicle_qr (QR-код авто)
 *   - modal_vehicle_import (Імпорт авто)
 *   - modal_vehicle_close_unavailability (Закриття недоступності)
 *   - modal_vehicle_tag_settings (Налаштування тегів)
 *   - modal_vehicle_filters (Фільтри)
 * @doc-features
 *   - перегляд списку автомобілів з підтримкою пагінації та пошуку
 *   - CRUD операції (створення, редагування, видалення автомобілів)
 *   - розширена фільтрація за статусом, маркою, моделлю та іншими параметрами
 *   - оновлення поточного пробігу автомобіля з веденням історії
 *   - управління призначенням водіїв на автомобілі
 *   - реєстрація та відстеження проблем (інцидентів) через форми звітів
 *   - планування та фіксація технічного обслуговування
 *   - передача транспортних засобів між філіями або парками
 *   - контроль періодів недоступності (ремонт, простій) та повернення в роботу
 *   - генерація та завантаження персональних QR-кодів для швидкої ідентифікації
 *   - пакетний імпорт даних з Excel та експорт поточного списку
 *   - візуальне маркування автомобілів через систему тегів
 *   - відображення ключових показників (статистики) автопарку
 * @doc-api
 *   - GET /api/v1/vehicles
 *   - GET /api/v1/vehicles/${id}
 *   - POST /api/v1/vehicles
 *   - PATCH /api/v1/vehicles/${id}
 *   - DELETE /api/v1/vehicles/${id}
 *   - GET /api/v1/vehicles/statistics
 *   - POST /api/v1/vehicles/${id}/mileage
 *   - GET /api/v1/vehicles/options
 *   - GET /api/v1/vehicles/filter-options
 *   - GET /api/v1/vehicles/export
 * @doc-entities
 *   - Vehicle, Driver, MileageRecord, IssueReport, MaintenanceRecord, VehicleUnavailability
 */
```
