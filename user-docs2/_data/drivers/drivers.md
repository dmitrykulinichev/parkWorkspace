# Список водіїв
> `page:drivers` · `/drivers`

Список водіїв: додавайте нових водіїв, закріплюйте їх за автомобілями та керуйте їхніми доступами до системи.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:driver-list` | Ваша команда водіїв. Ви можете швидко переглянути статус підключення до Telegram |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:driver-filters` | [modal_driver_filters.md](../modals/modal_driver_filters.md) |
| `modal:driver-form` | [modal_driver_form.md](../modals/modal_driver_form.md) |
| `modal:driver-details` | [modal_driver_details.md](../modals/modal_driver_details.md) |
| `modal:driver-delete-confirm` | [modal_driver_delete_confirm.md](../modals/modal_driver_delete_confirm.md) |
| `modal:driver-assignment` | [modal_driver_assignment.md](../modals/modal_driver_assignment.md) |
| `modal:driver-telegram` | [modal_driver_telegram.md](../modals/modal_driver_telegram.md) |
| `modal:driver-import` | [modal_driver_import.md](../modals/modal_driver_import.md) |
| `modal:driver-copy` | [modal_driver_copy.md](../modals/modal_driver_copy.md) |
| `modal:driver-uklon-info` | [modal_driver_uklon_info.md](../modals/modal_driver_uklon_info.md) |
| `modal:driver-comments` | [modal_driver_comments.md](../modals/modal_driver_comments.md) |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_drivers_main` | `[data-i-doc="page:drivers"]` | `/drivers` |

## Функціональний опис

```js
/**
 * @doc-page page_drivers_index
 * @doc-title Водії
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-modals
 *   - modal_driver_form (Форма водія)
 *   - modal_driver_details (Деталі водія)
 *   - modal_driver_delete_confirm (Підтвердження видалення)
 *   - modal_driver_assignment (Призначення автомобіля)
 *   - modal_driver_telegram (Підключення Telegram)
 *   - modal_driver_comments (Коментарі)
 *   - modal_driver_edit_comment (Редагування коментаря)
 *   - modal_driver_import (Імпорт водіїв)
 *   - modal_driver_copy (Копіювання водія)
 *   - modal_driver_filters (Фільтри)
 * @doc-features
 *   - перегляд списку водіїв з підтримкою пагінації, сортування та пошуку
 *   - розширена фільтрація водіїв за статусом та іншими параметрами
 *   - CRUD операції (створення, редагування, видалення водіїв)
 *   - копіювання профілю існуючого водія для швидкого створення нового
 *   - управління призначенням автомобілів водіям
 *   - робота з посиланням для самостійної реєстрації водіїв у системі
 *   - інтеграція профілів водіїв з Telegram-ботом
 *   - ведення та редагування внутрішніх коментарів у картці водія
 *   - пакетний імпорт даних з Excel та експорт поточної вибірки
 *   - швидка зміна робочого статусу водія зі списку
 * @doc-api
 *   - GET /api/v1/drivers
 *   - GET /api/v1/drivers/${id}
 *   - POST /api/v1/drivers
 *   - PATCH /api/v1/drivers/${id}
 *   - DELETE /api/v1/drivers/${id}
 *   - GET /api/v1/filter-options/drivers
 *   - GET /api/v1/drivers/export
 * @doc-entities
 *   - Driver, Vehicle, Comment, VehicleAssignment
 */
```
