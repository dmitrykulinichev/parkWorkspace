# Документи
> `page:documents` · `/documents`

Управління документами: реєструйте страхові поліси, договори оренди та інші документи. Система нагадає вам про закінчення терміну дії.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:document-list` | Ваша база документів. Документи з терміном дії, що закінчується, будуть підсвіче |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:documents-filters` | [modal_documents_filters.md](../modals/modal_documents_filters.md) |
| `modal:document-delete-confirm` | [modal_document_delete_confirm.md](../modals/modal_document_delete_confirm.md) |


## Опис

* <!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_documents_main` | `[data-i-doc="page:documents"]` | `/documents` |

## Функціональний опис

```js
/**
 * @doc-page  page_documents
 * @doc-title Документи
 * @doc-human
 *   * <!-- TODO: human description -->
 * @doc-modals
 *   - modal_document_form (Форма документа)
 *   - modal_documents_filters (Фільтри документів)
 *   - modal_document_delete_confirm (Підтвердження видалення)
 * @doc-features
 *   - перегляд списку документів автомобілів (страховки, техпаспорти, дозволи тощо)
 *   - адаптивне відображення: десктопна таблиця або мобільні картки
 *   - фільтрація за типом документа, статусом (активний/прострочений) та автомобілем
 *   - сортування документів (за замовчуванням за датою закінчення терміну дії)
 *   - пошук за назвою або номером документа
 *   - відстеження термінів дії документів з візуальною індикацією статусів
 *   - завантаження та перегляд скан-копій або фото документів
 *   - створення, редагування та видалення документів
 *   - пагінація списку документів
 * @doc-api
 *   - GET /api/documents
 *   - GET /api/documents/{id}
 *   - GET /api/documents/options
 *   - POST /api/documents
 *   - PUT /api/documents/{id}
 *   - DELETE /api/documents/{id}
 * @doc-entities
 *   - Document, Vehicle, File, Transaction
 */
```
