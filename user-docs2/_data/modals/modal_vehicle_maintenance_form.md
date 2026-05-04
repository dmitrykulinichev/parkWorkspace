# vehicle-maintenance-form
> `modal:vehicle-maintenance-form` · відкривається з: `page:vehicles`

Зафіксуйте проведене технічне обслуговування або ремонт: вкажіть тип робіт, вартість та пробіг на момент сервісу.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `modal_vehicle_maintenance_form` | `[data-i-doc="modal:vehicle-maintenance-form"]` | `/vehicles` |

## Функціональний опис

```js
/**
 * @doc-modal modal_vehicle_maintenance_form
 * @doc-title Створити/Редагувати запис ТО (Заїзд на сервіс)
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - пакетна реєстрація виконаних робіт (сервісний заїзд)
 *   - поділ на регламентне технічне обслуговування та позаплановий ремонт
 *   - управління загальним пробігом та датою виконання робіт
 *   - фіксація вартості окремих робіт та автоматичний розрахунок загальної суми заїзду
 *   - вбудований менеджер файлів для завантаження актів, чеків та фото (на рівні заїзду або окремої роботи)
 *   - можливість додавання детальних коментарів до кожної маніпуляції
 *   - вибір конкретних регламентних робіт з налаштованих графіків обслуговування (Maintenance Schedule)
 * @doc-api
 *   - GET /api/v1/maintenance-records/options (налаштування форми)
 *   - POST /api/v1/maintenance-records/batch (створення групи записів)
 *   - PATCH /api/v1/maintenance-records/groups/${id} (оновлення групи записів)
 * @doc-entities
 *   - Vehicle, MaintenanceRecord, MaintenanceSchedule
 */
```
