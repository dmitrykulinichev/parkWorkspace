# Транзакції
> `page:transactions` · `/transactions`

Фінансова звітність: відстежуйте всі грошові потоки, доходи та витрати вашого автопарку. Використовуйте фільтри для детального аналізу фінансових показників.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:transactions-list` | Фінансовий журнал: повна історія транзакцій. Відстежуйте грошові потоки, фільтру |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:transactions-filters` | [modal_transactions_filters.md](../modals/modal_transactions_filters.md) |
| `modal:transaction-form` | [modal_transaction_form.md](../modals/modal_transaction_form.md) |
| `modal:transaction-delete-confirm` | [modal_transaction_delete_confirm.md](../modals/modal_transaction_delete_confirm.md) |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_transactions_main` | `[data-i-doc="page:transactions"]` | `/transactions` |

## Функціональний опис

```js
/**
 * @doc-page  page_transactions
 * @doc-title Фінанси
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-modals
 *   - modal_transactions_filters (Фільтри транзакцій)
 *   - modal_transaction_form (Форма транзакції)
 *   - modal_transaction_delete_confirm (Підтвердження видалення транзакції)
 * @doc-features
 *   - Перегляд списку транзакцій (табличний вигляд)
 *   - Фільтрація транзакцій за типом, категорією та датами
 *   - Пошук транзакцій
 *   - Пагінація списку
 *   - Створення нової транзакції
 *   - Редагування транзакції
 *   - Видалення транзакції
 * @doc-api
 *   - GET /api/transactions
 *   - POST /api/transactions
 *   - PUT /api/transactions/{id}
 *   - DELETE /api/transactions/{id}
 *   - GET /api/transactions/options
 * @doc-entities
 *   - Transaction
 */
```
