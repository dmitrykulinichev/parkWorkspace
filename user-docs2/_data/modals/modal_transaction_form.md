# transaction-form
> `modal:transaction-form` · відкривається з: `page:transactions`

Додавання або редагування запису: вкажіть тип операції, суму, дату та виберіть об'єкт (авто, водій), до якого відноситься транзакція.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `modal_transaction_form` | `[data-i-doc="modal:transaction-form"]` | `/transactions` |

## Функціональний опис

```js
/**
 * @doc-modal modal_transaction_form
 * @doc-title Форма транзакції
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - Створення або редагування фінансової транзакції
 *   - Вибір типу операції (дохід/витрата)
 *   - Введення суми транзакції
 *   - Вибір категорії (наприклад, Автомобіль)
 *   - Прив'язка до конкретного об'єкта (наприклад, Автомобіль)
 *   - Вибір дати транзакції
 *   - Опис транзакції
 * @doc-api
 *   - POST /api/transactions
 *   - PUT /api/transactions/{id}
 *   - GET /api/transactions/{id}
 * @doc-entities
 *   - Transaction, Vehicle
 */
```
