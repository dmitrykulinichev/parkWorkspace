# Графік роботи
> `page:driver-schedule` · `/driver-schedule`

Графік роботи: планувальник змін водіїв, облік технічного обслуговування та ремонтів у зручному матричному форматі.

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:schedule-delete-confirm` | [modal_schedule_delete_confirm.md](modals/modal_schedule_delete_confirm.md) |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_driver_schedule_main` | `[data-i-doc="page:driver-schedule"]` | `/driver-schedule` |

## Функціональний опис

```js
/**
 * @doc-page page_driver_schedule_main
 * @doc-title Графік водіїв
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-modals
 *   - modal_driver_schedule_slot_form (Форма слота графіку)
 *   - modal_driver_schedule_actual_shift_details (Деталі фактичної зміни)
 *   - modal_driver_schedule_simple_driver_details (Деталі водія)
 *   - modal_driver_schedule_delete_confirm (Підтвердження видалення)
 * @doc-features
 *   - CRUD операції зі слотами графіку (створення, редагування, видалення)
 *   - Drag & drop для переміщення слотів на графіку
 *   - Режим копіювання слотів з утримуванням Ctrl
 *   - Вставка слотів перед/після цільового слота
 *   - Реупорядкування слотів (SWAP при центральному розміщенні)
 *   - Клонування слотів на кілька днів вперед з перевіркою доступності
 *   - Розщеплення слотів (додавання нової зміни до дня)
 *   - Експорт розкладу в XLSX з трьома аркушами (графік, підсумок по водіях, завантаженість авто)
 *   - Вибір кількості днів для відображення (7, 10, місяць) з збереженням у localStorage
 *   - Навігація за періодами (попередня, наступна, поточна дата)
 *   - Перегляд фактичних змін та деталей водія
 *   - Управління дозволом на редагування минулих слотів
 *   - Рахування присвоєнь для кожного водія за період
 *   - Адаптивний дизайн з окремими компонентами для десктопу і мобільного
 *   - Мобільна навігація з дійсніми діями в заголовку
 * @doc-api
 *   - GET /driver-schedule
 *   - GET /driver-schedule/{id}
 *   - GET /driver-schedule/options
 *   - GET /driver-schedule/assignment-timeline
 *   - GET /driver-schedule/assignment-details
 *   - POST /driver-schedule
 *   - POST /driver-schedule/bulk
 *   - PATCH /driver-schedule/{id}
 *   - DELETE /driver-schedule/{id}
 *   - POST /driver-schedule/reorder
 *   - POST /drivers/colors
 * @doc-entities
 *   - DriverScheduleSlot, Driver, Vehicle, ActualAssignment, DriverSchedule
 * @doc-notes
 *   - Основний сценарій: диспетчер/менеджер плануючи чергування водіїв на тиждень або місяць
 *   - Drag & drop підтримує кілька режимів: переміщення, копіювання (з Ctrl), вставка перед/після
 *   - Експорт автоматично розраховує завантаженість авто і підсумки по водіях за період
 *   - Клонування перевіряє доступність цільового слота і водія перед створенням
 *   - Редагування минулих слотів контролюється прапорцем allowPastEditing
 *   - Мобільний вигляд має спеціальну навігацію з переключенням днів і блокуванням редагування минулого
 */
```
