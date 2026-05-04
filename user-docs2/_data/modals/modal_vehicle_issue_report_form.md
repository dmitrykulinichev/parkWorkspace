# vehicle-issue-report-form
> `modal:vehicle-issue-report-form` · відкривається з: `page:vehicles`

Повідомте про несправність або пошкодження. Детальний опис допоможе швидше запланувати ремонт.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `modal_vehicle_issue_report_form` | `[data-i-doc="modal:vehicle-issue-report-form"]` | `/vehicles` |

## Функціональний опис

```js
/**
 * @doc-modal modal_vehicle_issue_report_form
 * @doc-title Створити/Редагувати звіт про проблему
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - фіксація технічних проблем або інцидентів з автомобілями
 *   - детальний опис несправності або події
 *   - прив'язка звіту до конкретного транспортного засобу
 *   - ідентифікація водія, який повідомив про проблему
 *   - встановлення точного часу виникнення або виявлення проблеми
 *   - валідація даних форми з автоматичним позиціонуванням на помилках
 * @doc-api
 *   - GET /api/v1/issue-reports/options (опції форми)
 *   - GET /api/v1/issue-reports/${id} (дані звіту)
 *   - POST /api/v1/issue-reports (створення)
 *   - PATCH /api/v1/issue-reports/${id} (редагування)
 * @doc-entities
 *   - IssueReport, Vehicle, Driver
 */
```
