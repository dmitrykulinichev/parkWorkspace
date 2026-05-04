# Тех. обслуговування
> `page:vehicle-maintenance` · `/vehicle-maintenance`

Журнал технічного обслуговування: історія всіх сервісних робіт та ремонтів вашого автопарку з деталізацією по вартості та запчастинах.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:maintenance-list` | Хронологія сервісних заїздів. Ви можете бачити, хто створював запис, які саме ро |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:maintenance-filters` | [modal_maintenance_filters.md](../modals/modal_maintenance_filters.md) |
| `modal:maintenance-details` | [modal_maintenance_details.md](../modals/modal_maintenance_details.md) |
| `modal:maintenance-delete-confirm` | [modal_maintenance_delete_confirm.md](../modals/modal_maintenance_delete_confirm.md) |


## Опис

* <!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_vehicle_maintenance_main` | `[data-i-doc="page:vehicle-maintenance"]` | `/vehicle-maintenance` |

## Функціональний опис

```js
/**
 * @doc-page  page_maintenance_records
 * @doc-title Технічне обслуговування
 * @doc-human
 *   * <!-- TODO: human description -->
 * @doc-modals
 *   - modal_maintenance_record_form (Форма запису ТО)
 *   - modal_maintenance_detail (Деталі запису ТО)
 *   - modal_maintenance_filters (Фільтри записів ТО)
 *   - modal_maintenance_delete_confirm (Підтвердження видалення)
 * @doc-features
 *   - перегляд списку записів технічного обслуговування (ТО)
 *   - групування записів за сесіями обслуговування
 *   - фільтрація за автомобілем, датою та іншими параметрами
 *   - пошук за назвою автомобіля або коментарем
 *   - сортування за автомобілем, пробігом, датою виконання
 *   - пагінація списку результатів
 *   - створення нових записів ТО (через модальне вікно)
 *   - редагування існуючих записів ТО
 *   - перегляд детальної інформації про обслуговування
 *   - видалення записів з підтвердженням
 *   - відображення прикріплених файлів (чеків, актів виконаних робіт)
 *   - візуалізація виконаних робіт за допомогою кольорових тегів (Maintenance/Repair)
 *   - відображення автора (користувача), який створив запис
 *   - автоматичне завантаження опцій фільтрації при ініціалізації
 * @doc-api
 *   - GET /api/vehicle-maintenance-groups
 *   - GET /api/vehicle-maintenance-groups/{id}
 *   - PATCH /api/vehicle-maintenance-groups/{id}
 *   - DELETE /api/vehicle-maintenance-groups/{id}
 *   - POST /api/vehicle-maintenance-records
 *   - GET /api/vehicle-maintenance-records/options
 * @doc-entities
 *   - Vehicle, VehicleMaintenanceRecord, User, File
 */
```
