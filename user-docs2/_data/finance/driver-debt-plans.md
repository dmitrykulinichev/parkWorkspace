# Борги водіїв
> `page:driver-debt-plans` · `/driver-debt-plans`

Плани погашення боргів: створюйте графіки списання боргів водіїв, контролюйте залишки та фіксуйте платежі.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:driver-debt-plan-list` | Журнал планів погашення боргів: переглядайте статус прогресу кожного плану, зали |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:driver-debt-plan-form` | [modal_driver_debt_plan_form.md](../modals/modal_driver_debt_plan_form.md) |
| `modal:driver-debt-plan-details` | [modal_driver_debt_plan_details.md](../modals/modal_driver_debt_plan_details.md) |
| `modal:manual-debt-payment-form` | [modal_manual_debt_payment_form.md](../modals/modal_manual_debt_payment_form.md) |
| `modal:driver-debt-plan-filters` | [modal_driver_debt_plan_filters.md](../modals/modal_driver_debt_plan_filters.md) |
| `modal:driver-debt-plan-delete-confirm` | [modal_driver_debt_plan_delete_confirm.md](../modals/modal_driver_debt_plan_delete_confirm.md) |


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_driver_debt_plans_main` | `[data-i-doc="page:driver-debt-plans"]` | `/driver-debt-plans` |

## Функціональний опис

```js
/**
 * @doc-page page_driver_debt_plans_index
 * @doc-title Плани боргів водіїв
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-modals
 *   - modal_driver_debt_plan_form (Створення/редагування плану)
 *   - modal_manual_debt_payment_form (Ручне списання боргу)
 *   - modal_driver_debt_plan_details (Деталі плану)
 *   - modal_driver_debt_plan_filters (Фільтри плану)
 *   - modal_driver_debt_plan_delete_confirm (Підтвердження видалення)
 * @doc-features
 *   - Перегляд списку планів боргів водіїв
 *   - Фільтрація списку
 *   - Пошук за планами
 *   - Створення нового плану
 *   - Редагування плану
 *   - Ручне списання платежів
 *   - Зміна статусу плану (призупинення/відновлення)
 *   - Видалення плану
 *   - Відображення прогресу погашення боргу
 * @doc-api
 *   - GET /api/driver-debt-plans (через useDriverDebtPlans)
 *   - GET /api/driver-debt-plans/options (через useDriverDebtPlanOptions)
 *   - DELETE /api/driver-debt-plans/{id} (через useDeleteDriverDebtPlan)
 *   - POST /api/driver-debt-plans/{id}/toggle-status (через useToggleDriverDebtPlanStatus)
 * @doc-entities
 *   - DriverDebtPlan, Driver, Vehicle
 */
```
