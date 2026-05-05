# fleet-settings-schedules
> `tab:fleet-settings-schedules` · [`page:fleet-settings`](./index.md) · за замовчуванням

Налаштування регламентів технічного обслуговування: визначення інтервалів за пробігом або часом для автоматичних нагадувань про сервіс.


## Опис

* <!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `tab_fleet_settings_schedules_main` | `[data-i-doc="tab:fleet-settings-schedules"]` | `/fleet-settings?tab=schedules` |

## Функціональний опис

```js
/**
 * @doc-tab   tab_fleet_settings_schedules
 * @doc-title Регламенти ТО
 * @doc-human
 *   * <!-- TODO: human description -->
 * @doc-modals
 *   - modal_maintenance_schedule_form (Форма регламенту ТО)
 *   - modal_maintenance_schedule_import (Імпорт регламентів)
 *   - modal_maintenance_schedule_delete_confirm (Підтвердження видалення)
 *   - modal_maintenance_schedule_filters (Фільтри регламентів)
 * @doc-features
 *   - управління глобальними правилами проведення технічного обслуговування
 *   - налаштування інтервалів обслуговування за пробігом (км) та часом (роки)
 *   - конфігурація випереджувальних нагадувань (за км або дні до настання події)
 *   - прив'язка регламентів до типів двигунів (Бензин, Дизель, Газ або Всі)
 *   - встановлення пріоритетності робіт для візуального акцентування в звітах
 *   - можливість швидкої активації/деактивації окремих регламентів
 *   - пакетний імпорт типових регламентів
 *   - пошук та фільтрація списку регламентних робіт
 *   - інтегрований режим відображення (isEmbedded) для використання в налаштуваннях
 * @doc-api
 *   - GET /api/maintenance-schedules
 *   - POST /api/maintenance-schedules
 *   - PATCH /api/maintenance-schedules/{id}
 *   - DELETE /api/maintenance-schedules/{id}
 *   - GET /api/vehicle-maintenance-records/options
 * @doc-entities
 *   - MaintenanceSchedule
 */
```
