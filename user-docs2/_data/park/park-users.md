# Команда
> `page:park-users` · `/park-users`

Команда парку: управління доступом менеджерів, перегляд ролей, налаштування прав та активності користувачів системи.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:user-list` | Список користувачів системи: керуйте обліковими записами менеджерів, переглядайт |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:user-form` | [modal_user_form.md](../modals/modal_user_form.md) |
| `modal:user-permissions` | [modal_user_permissions.md](../modals/modal_user_permissions.md) |
| `modal:user-delete-confirm` | [modal_user_delete_confirm.md](../modals/modal_user_delete_confirm.md) |
| `modal:user-reset-password` | [modal_user_reset_password.md](../modals/modal_user_reset_password.md) |
| `modal:user-activation-link` | [modal_user_activation_link.md](../modals/modal_user_activation_link.md) |
| `modal:user-filters` | [modal_user_filters.md](../modals/modal_user_filters.md) |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_park_users_main` | `[data-i-doc="page:park-users"]` | `/park-users` |

## Функціональний опис

```js
/**
 * @doc-page  page_park_users
 * @doc-title Керування користувачами (Команда)
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-modals
 *   - modal_user_filters (Фільтри користувачів)
 *   - modal_user_form (Форма додавання/редагування користувача)
 *   - modal_user_delete_confirm (Підтвердження видалення користувача)
 *   - modal_user_reset_password (Підтвердження скидання пароля)
 *   - modal_user_permissions (Налаштування прав доступу)
 *   - modal_user_activation_link (Посилання на активацію)
 * @doc-features
 *   - Перегляд списку користувачів парку
 *   - Пошук користувачів за ключовими словами
 *   - Фільтрація користувачів (ролі, статус)
 *   - Додавання нових користувачів
 *   - Редагування існуючих користувачів
 *   - Видалення користувачів
 *   - Скидання пароля користувача
 *   - Керування правами доступу
 *   - Генерація та копіювання посилання на активацію
 *   - Пагінація списку
 * @doc-api
 *   - useParkUsersPage (отримання списку та керування станом)
 * @doc-entities
 *   - User
 *   - Role
 *   - Permission
 */
```
