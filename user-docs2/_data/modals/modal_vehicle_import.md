# vehicle-import
> `modal:vehicle-import` · відкривається з: `page:vehicles`

Масове додавання авто: завантажте файл у форматі Excel або CSV згідно з шаблоном для швидкого наповнення бази.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `modal_vehicle_import` | `[data-i-doc="modal:vehicle-import"]` | `/vehicles` |

## Функціональний опис

```js
/**
 * @doc-modal modal_vehicle_import
 * @doc-title Імпорт автомобілів
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - масове додавання автомобілів до системи через завантаження файлів (XLSX, CSV)
 *   - інтерактивний попередній перегляд даних перед фіксацією в базі
 *   - автоматична валідація полів: перевірка форматів, обов'язкових даних та унікальності (VIN, держномер)
 *   - візуальна підсвітка помилок та дублікатів безпосередньо в таблиці прев'ю
 *   - завантаження готових шаблонів для заповнення даних користувачем
 *   - перегляд історії попередніх імпортів з деталізацією успішних та помилкових записів
 *   - фільтрація та пропуск некоректних рядків при збереженні валідних даних
 * @doc-api
 *   - POST /api/v1/vehicles/import/validate (валідація файлу)
 *   - POST /api/v1/vehicles/import/execute (виконання завантаження)
 *   - GET /api/v1/vehicles/import/history (історія операцій)
 *   - GET /api/v1/vehicles/import/template (отримання шаблонів)
 * @doc-entities
 *   - Vehicle, ImportBatch
 */
```
