# Премії та Штрафи
> `page:bonuses-penalties` · `/bonuses-penalties`

Премії та штрафи: керуйте заохоченнями та стягненнями для водіїв, відстежуйте виконання планів по боргових зобов'язаннях.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:bonus-penalty-list` | Журнал заохочень та стягнень: відстежуйте премії та штрафи водіїв, а також плано |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:bonus-penalty-form` | [modal_bonus_penalty_form.md](../modals/modal_bonus_penalty_form.md) |
| `modal:bonus-penalty-details` | [modal_bonus_penalty_details.md](../modals/modal_bonus_penalty_details.md) |
| `modal:bonus-penalty-filters` | [modal_bonus_penalty_filters.md](../modals/modal_bonus_penalty_filters.md) |
| `modal:bonus-penalty-delete-confirm` | [modal_bonus_penalty_delete_confirm.md](../modals/modal_bonus_penalty_delete_confirm.md) |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_bonuses_penalties_main` | `[data-i-doc="page:bonuses-penalties"]` | `/bonuses-penalties` |

## Функціональний опис

```js
/**
 * @doc-page  page_bonuses_penalties
 * @doc-title Премії та Штрафи
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-modals
 *   - modal_bonus_penalty_form (Форма премії/штрафу)
 *   - modal_bonus_penalty_details (Деталі премії/штрафу)
 *   - modal_bonus_penalty_filters (Фільтри премій/штрафів)
 *   - modal_bonus_penalty_delete_confirm (Підтвердження видалення)
 * @doc-features
 *   - Відображення списку премій та штрафів (таблиця)
 *   - Фільтрація записів за параметрами
 *   - Пошук записів
 *   - Пагінація списку
 *   - Створення нового запису
 *   - Редагування запису
 *   - Видалення запису
 *   - Відображення типу запису (Премія, Штраф, Списання боргу)
 * @doc-api
 *   - GET /api/bonuses-penalties
 *   - POST /api/bonuses-penalties
 *   - PUT /api/bonuses-penalties/{id}
 *   - DELETE /api/bonuses-penalties/{id}
 *   - GET /api/bonuses-penalties/options
 * @doc-entities
 *   - BonusPenalty, Driver, Vehicle, User
 */
```
