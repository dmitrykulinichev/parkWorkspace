# Файли
> `page:park-files` · `/park-files`

Файли парку: централізоване сховище документів та медіа-файлів автопарку. Використовуйте пошук та фільтри для швидкого доступу.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:file-list` | База файлів автопарку: керуйте завантаженням та організацією документів автопарк |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:park-file-form` | [modal_park_file_form.md](../modals/modal_park_file_form.md) |
| `modal:park-file-delete-confirm` | [modal_park_file_delete_confirm.md](../modals/modal_park_file_delete_confirm.md) |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_park_files_main` | `[data-i-doc="page:park-files"]` | `/park-files` |

## Функціональний опис

```js
/**
 * @doc-page  page_park_files
 * @doc-title Файли парку
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-modals
 *   - modal_user_filters (Фільтри документів)
 *   - modal_park_file_form (Форма додавання/редагування документа)
 *   - modal_park_file_delete_confirm (Підтвердження видалення документа)
 * @doc-features
 *   - Перегляд списку документів парку
 *   - Пошук документів за назвою
 *   - Фільтрація документів
 *   - Завантаження (додавання) нових документів
 *   - Редагування існуючих документів
 *   - Видалення документів
 *   - Пагінація списку
 * @doc-api
 *   - useParkDocumentsPage (отримання списку та керування станом)
 * @doc-entities
 *   - ParkDocument
 */
```
