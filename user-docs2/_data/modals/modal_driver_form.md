# driver-form
> `modal:driver-form` · відкривається з: `page:drivers`

Реєстрація водія: введіть персональні дані, контактну інформацію та номер посвідчення водія. Також можна додати фото.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `modal_driver_form` | `[data-i-doc="modal:driver-form"]` | `/drivers` |

## Функціональний опис

```js
/**
 * @doc-modal modal_driver_form
 * @doc-title Додати/Редагувати водія
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - створення та редагування профілю водія
 *   - управління аватаром (завантаження, перегляд, видалення)
 *   - валідація даних форми з фокусом на помилкове поле
 *   - ведення контактів родичів та довільних коментарів
 * @doc-api
 *   - GET /api/v1/drivers/options
 *   - GET /api/v1/drivers/${id}
 *   - POST /api/v1/drivers
 *   - PATCH /api/v1/drivers/${id}
 *   - POST /api/v1/drivers/${driverId}/avatar
 *   - DELETE /api/v1/drivers/${driverId}/avatar
 * @doc-entities
 *   - Driver
 */
```
