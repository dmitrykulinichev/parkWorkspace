# Витрати водія
> `page:driver-expenses` · `/driver-expenses`

Облік витрат водіїв: фіксуйте додаткові витрати водіїв, прив'язуйте їх до конкретних авто та завантажуйте підтверджуючі документи.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:driver-expense-list` | Хронологія витрат водіїв: переглядайте витрати, їх категорії, суми та прикріплен |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:driver-expense-form` | [modal_driver_expense_form.md](../modals/modal_driver_expense_form.md) |
| `modal:driver-expense-details` | [modal_driver_expense_details.md](../modals/modal_driver_expense_details.md) |
| `modal:driver-expense-filters` | [modal_driver_expense_filters.md](../modals/modal_driver_expense_filters.md) |
| `modal:driver-expense-delete-confirm` | [modal_driver_expense_delete_confirm.md](../modals/modal_driver_expense_delete_confirm.md) |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_driver_expenses_main` | `[data-i-doc="page:driver-expenses"]` | `/driver-expenses` |

## Функціональний опис

```js
/**
 * @doc-page  page_driver_expenses
 * @doc-title Витрати водіїв
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-modals
 *   - modal_driver_expense_form (Форма витрат)
 *   - modal_driver_expense_details (Деталі витрати)
 *   - modal_driver_expense_filters (Фільтри витрат)
 *   - modal_driver_expense_delete_confirm (Підтвердження видалення)
 * @doc-features
 *   - Відображення списку витрат водіїв (таблиця)
 *   - Фільтрація витрат за параметрами
 *   - Пошук витрат
 *   - Пагінація списку
 *   - Створення нової витрати
 *   - Редагування витрати
 *   - Перегляд деталей витрати (вкл. файли)
 *   - Видалення витрати
 * @doc-api
 *   - GET /api/driver-expenses
 *   - POST /api/driver-expenses
 *   - PUT /api/driver-expenses/{id}
 *   - DELETE /api/driver-expenses/{id}
 *   - GET /api/driver-expenses/options
 * @doc-entities
 *   - DriverExpense, Vehicle, Driver, User
 */
```
