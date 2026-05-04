# driver-expense-form
> `modal:driver-expense-form` · відкривається з: `page:driver-expenses`

Реєстрація витрат: вкажіть водія, авто, суму витрат, категорію та додайте опис. Завантажте фото чека для підтвердження.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `modal_driver_expense_form` | `[data-i-doc="modal:driver-expense-form"]` | `/driver-expenses` |

## Функціональний опис

```js
/**
 * @doc-modal modal_driver_expense_form
 * @doc-title Форма витрат
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - Створення або редагування витрат водіїв
 *   - Вибір автомобіля та водія
 *   - Введення суми витрат
 *   - Вибір дати та часу
 *   - Опис витрат
 *   - Управління файлами (завантаження чеків, фото)
 *   - Валідація даних
 * @doc-api
 *   - POST /api/driver-expenses
 *   - PUT /api/driver-expenses/{id}
 *   - GET /api/driver-expenses/options
 *   - GET /api/driver-expenses/{id}
 * @doc-entities
 *   - DriverExpense, Vehicle, Driver
 */
```
