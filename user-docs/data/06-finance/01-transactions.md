---
route: "/transactions"
permission: "transactions.view"
components:
  - "resources/js/pages/Transactions/index.jsx"
  - "resources/js/pages/Transactions/TransactionsList/TransactionsListDesktop.jsx"
  - "resources/js/pages/Transactions/TransactionsList/TransactionsListMobile.jsx"
  - "resources/js/hooks/useTransactionsPage.js"
---

# Транзакції

{{SCRN:page_txn_main}}

> Сторінка дозволяє переглядати та керувати фінансовими транзакціями системи.

## Огляд

Централізований реєстр усіх фінансових операцій. Дозволяє фільтрувати транзакції, створювати нові або редагувати існуючі (залежно від прав доступу).

## Функціональні можливості

- **Створення транзакції:** Відкриває {{MODAL:txn_form}}.
- **Редагування:** Редагування існуючої транзакції через {{MODAL:txn_form}}.
- **Видалення:** Видалення транзакції з системи.
- **Перегляд деталей:** Деталі транзакції через {{MODAL:txn_details}}.

## Реєстр даних

| Колонка | Опис | Логіка / Сортування |
| :--- | :--- | :--- |
| **Сума** | Грошовий вираз операції | - |
| **Дата** | Дата транзакції | Сортування за датою |
| **Тип** | Дохід/Витрата | Колірна індикація |

### Стани інтерфейсу

| Стан | Умова відображення | Скріншот |
| :--- | :--- | :--- |
| Порожній | Транзакції відсутні | {{SCRN:page_txn_empty}} |

## Управління (Actions)

### Глобальні дії

| Дія | Результат |
| :--- | :--- |
| **Додати транзакцію** | Відкриває {{MODAL:txn_form}} |

## Технічна інформація

> Цей розділ призначений для розробників.

| Файл | Роль |
| :--- | :--- |
| `resources/js/pages/Transactions/index.jsx` | Головний компонент |
| `resources/js/hooks/useTransactionsPage.js` | Логіка сторінки |
