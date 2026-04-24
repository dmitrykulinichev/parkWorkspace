# Реєстр модальних вікон (Modals Index)

Цей файл описує всі модальні вікна системи, які використовуються на сторінках через плейсхолдер `{{MODAL:ім'я}}`.

**Примітка:** При описі нової модалки спочатку додайте її в цей реєстр.

| ID Модалки | Назва (UI) | Файл опису | Використовується на сторінках | Дата оновлення |
| :--- | :--- | :--- | :--- | :--- |
| **fleet_vehicle_form** | Додати/Редагувати автомобіль | [fleet_vehicle_form.md](../data/shared/modals/fleet_vehicle_form.md) | `02-vehicles/01-list.md` | 2026-04-23 |
| **fleet_vehicle_details** | Деталі автомобіля | [fleet_vehicle_details.md](../data/shared/modals/fleet_vehicle_details.md) | `02-vehicles/01-list.md` | 2026-04-23 |
| **fleet_vehicle_delete** | Видалення автомобіля | [fleet_vehicle_delete.md](../data/shared/modals/fleet_vehicle_delete.md) | `02-vehicles/01-list.md` | 2026-04-23 |
| **fleet_mileage_update** | Оновлення пробігу | [fleet_mileage_update.md](../data/shared/modals/fleet_mileage_update.md) | `02-vehicles/01-list.md`, `01-home.md` | 2026-04-23 |
| **fleet_vehicle_import** | Імпорт автомобілів | [fleet_vehicle_import.md](../data/shared/modals/fleet_vehicle_import.md) | `02-vehicles/01-list.md` | 2026-04-23 |
| **fleet_vehicle_qr** | QR-код автомобіля | [fleet_vehicle_qr.md](../data/shared/modals/fleet_vehicle_qr.md) | `02-vehicles/01-list.md` | 2026-04-23 |
| **fleet_tag_settings** | Налаштування тегів | [fleet_tag_settings.md](../data/shared/modals/fleet_tag_settings.md) | `02-vehicles/01-list.md` | 2026-04-23 |
| **fleet_filters** | Розширена фільтрація авто | [fleet_filters.md](../data/shared/modals/fleet_filters.md) | `02-vehicles/01-list.md` | 2026-04-23 |
| **fleet_vehicle_transfer** | Трансфер автомобіля (між парками) | [fleet_vehicle_transfer.md](../data/shared/modals/fleet_vehicle_transfer.md) | `02-vehicles/01-list.md` | 2026-04-23 |
| **maint_record_form** | Запис про ТО/Ремонт | [maint_record_form.md](../data/shared/modals/maint_record_form.md) | `02-vehicles/01-list.md`, `02-vehicles/02-maintenance.md` | 2026-04-23 |
| **maint_record_details** | Деталі заїзду на сервіс | [maint_record_details.md](../data/shared/modals/maint_record_details.md) | `02-vehicles/02-maintenance.md` | 2026-04-23 |
| **maint_filters** | Фільтри журналу ТО | [maint_filters.md](../data/shared/modals/maint_filters.md) | `02-vehicles/02-maintenance.md` | 2026-04-23 |
| **maint_issue_report_form** | Повідомити про проблему | [maint_issue_report_form.md](../data/shared/modals/maint_issue_report_form.md) | `02-vehicles/01-list.md`, `08-integrations/02-telegram.md` | 2026-04-23 |
| **ops_assignment_form** | Створити/Редагувати призначення | [ops_assignment_form.md](../data/shared/modals/ops_assignment_form.md) | `02-vehicles/01-list.md`, `03-drivers/01-list.md`, `03-drivers/02-assignments.md` | 2026-04-24 |
| **ops_assignment_details** | Деталі призначення | [ops_assignment_details.md](../data/shared/modals/ops_assignment_details.md) | `03-drivers/02-assignments.md` | 2026-04-24 |
| **issue_report_form** | Створити/Редагувати звіт | [issue_report_form.md](../data/shared/modals/issue_report_form.md) | `03-drivers/03-issue-reports.md` | 2026-04-24 |
| **issue_report_actions** | Прийняти рішення по звіту | [issue_report_actions.md](../data/shared/modals/issue_report_actions.md) | `03-drivers/03-issue-reports.md`, `01-home.md` | 2026-04-24 |
| **issue_report_details** | Деталі звіту про проблему | [issue_report_details.md](../data/shared/modals/issue_report_details.md) | `03-drivers/03-issue-reports.md` | 2026-04-24 |
| **issue_task_info** | Деталі задачі (звіт) | [issue_task_info.md](../data/shared/modals/issue_task_info.md) | `03-drivers/03-issue-reports.md` | 2026-04-24 |
| **ops_unassign_form** | Зняти водія | [ops_unassign_form.md](../data/shared/modals/ops_unassign_form.md) | `02-vehicles/01-list.md`, `03-drivers/02-assignments.md` | 2026-04-23 |
| **fleet_unavailability_form** | Фіксація простою (Недоступність) | [fleet_unavailability_form.md](../data/shared/modals/fleet_unavailability_form.md) | `02-vehicles/01-list.md`, `02-vehicles/03-unavailabilities.md` | 2026-04-23 |
| **fleet_unavailability_close** | Повернення в роботу | [fleet_unavailability_close.md](../data/shared/modals/fleet_unavailability_close.md) | `02-vehicles/01-list.md`, `02-vehicles/03-unavailabilities.md` | 2026-04-23 |
| **fleet_unavailability_details** | Деталі простою автомобіля | [fleet_unavailability_details.md](../data/shared/modals/fleet_unavailability_details.md) | `02-vehicles/03-unavailabilities.md` | 2026-04-23 |
| **fleet_document_form** | Додати/Редагувати документ | [fleet_document_form.md](../data/shared/modals/fleet_document_form.md) | `02-vehicles/04-documents.md` | 2026-04-23 |
| **fleet_document_filters** | Фільтри документів | [fleet_document_filters.md](../data/shared/modals/fleet_document_filters.md) | `02-vehicles/04-documents.md` | 2026-04-23 |
| **maint_schedule_form** | Створити/Редагувати регламент | [maint_schedule_form.md](../data/shared/modals/maint_schedule_form.md) | `02-vehicles/06-settings.md` | 2026-04-23 |
| **maint_schedule_import** | Імпорт шаблонів ТО | [maint_schedule_import.md](../data/shared/modals/maint_schedule_import.md) | `02-vehicles/06-settings.md` | 2026-04-23 |
| **drv_driver_form** | Додати/Редагувати водія | [drv_driver_form.md](../data/shared/modals/drv_driver_form.md) | `03-drivers/01-list.md` | 2026-04-24 |
| **drv_driver_details** | Деталі водія | [drv_driver_details.md](../data/shared/modals/drv_driver_details.md) | `03-drivers/01-list.md` | 2026-04-24 |
| **drv_import** | Імпорт водіїв | [drv_import.md](../data/shared/modals/drv_import.md) | `03-drivers/01-list.md` | 2026-04-24 |
| **drv_driver_copy** | Копіювати водія в інший парк | [drv_driver_copy.md](../data/shared/modals/drv_driver_copy.md) | `03-drivers/01-list.md` | 2026-04-24 |
| **drv_comments** | Коментарі до водія | [drv_comments.md](../data/shared/modals/drv_comments.md) | `03-drivers/01-list.md` | 2026-04-24 |
| **drv_telegram** | Підключення Telegram | [drv_telegram.md](../data/shared/modals/drv_telegram.md) | `03-drivers/01-list.md` | 2026-04-24 |
| **drv_schedule_slot_form** | Форма графіку роботи | [drv_schedule_slot_form.md](../data/shared/modals/drv_schedule_slot_form.md) | `/driver-schedule` | 2026-04-24 |
| **drv_actual_shift_details** | Деталі фактичної зміни | [drv_actual_shift_details.md](../data/shared/modals/drv_actual_shift_details.md) | `/driver-schedule` | 2026-04-24 |
| **drv_simple_driver_details** | Деталі водія (проста картка) | [drv_simple_driver_details.md](../data/shared/modals/drv_simple_driver_details.md) | `/driver-schedule` | 2026-04-24 |
| **task_form** | Форма задачі | [task_form.md](../data/shared/modals/task_form.md) | `/tasks`, `01-home.md` | 2026-04-24 |
| **task_details** | Деталі задачі | [task_details.md](../data/shared/modals/task_details.md) | `/tasks` | 2026-04-24 |
| **manual_trip_form** | Форма ручної поїздки | [manual_trip_form.md](../data/shared/modals/manual_trip_form.md) | `/manual-trips` | 2026-04-24 |
| **manual_trip_details** | Деталі ручної поїздки | [manual_trip_details.md](../data/shared/modals/manual_trip_details.md) | `/manual-trips` | 2026-04-24 |
| **txn_form** | Форма транзакції | [txn_form.md](../data/shared/modals/txn_form.md) | `/transactions` | 2026-04-24 |
| **txn_details** | Деталі транзакції | [txn_details.md](../data/shared/modals/txn_details.md) | `/transactions` | 2026-04-24 |
| **drv_exp_form** | Форма витрат водія | [drv_exp_form.md](../data/shared/modals/drv_exp_form.md) | `/driver-expenses` | 2026-04-24 |
| **drv_exp_details** | Деталі витрати водія | [drv_exp_details.md](../data/shared/modals/drv_exp_details.md) | `/driver-expenses` | 2026-04-24 |
| **bonus_penalty_form** | Форма премій/штрафів | [bonus_penalty_form.md](../data/shared/modals/bonus_penalty_form.md) | `/bonuses-penalties` | 2026-04-24 |
| **bonus_penalty_details** | Деталі премії/штрафу | [bonus_penalty_details.md](../data/shared/modals/bonus_penalty_details.md) | `/bonuses-penalties` | 2026-04-24 |
| **driver_debt_plan_form** | Форма плану боргу | [driver_debt_plan_form.md](../data/shared/modals/driver_debt_plan_form.md) | `/driver-debt-plans` | 2026-04-24 |
| **driver_debt_plan_details** | Деталі плану боргу | [driver_debt_plan_details.md](../data/shared/modals/driver_debt_plan_details.md) | `/driver-debt-plans` | 2026-04-24 |
| **manual_debt_payment_form** | Форма погашення боргу | [manual_debt_payment_form.md](../data/shared/modals/manual_debt_payment_form.md) | `/driver-debt-plans` | 2026-04-24 |
| **intg_uklon_vehicle_details** | Деталі авто в Uklon | [intg_uklon_vehicle_details.md](../data/shared/modals/intg_uklon_vehicle_details.md) | `02-vehicles/01-list.md` | 2026-04-24 |
| **dash_settings** | Налаштування дашборду | [dash_settings.md](../data/shared/modals/dash_settings.md) | `01-home.md` | 2026-04-24 |
| **driver_earnings_raw_data** | Сирі дані звіту | [driver_earnings_raw_data.md](../data/shared/modals/driver_earnings_raw_data.md) | `/driver-earnings-new` | 2026-04-24 |
| **driver_earnings_calc_info** | Інформація про нарахування | [driver_earnings_calc_info.md](../data/shared/modals/driver_earnings_calc_info.md) | `/driver-earnings-new` | 2026-04-24 |
| **driver_earnings_details** | Деталі заробітку водія | [driver_earnings_details.md](../data/shared/modals/driver_earnings_details.md) | `/driver-earnings-new` | 2026-04-24 |
| **vehicle_earnings_details** | Деталі заробітку авто | [vehicle_earnings_details.md](../data/shared/modals/vehicle_earnings_details.md) | `/vehicle-earnings` | 2026-04-24 |
| **vehicle_earnings_calc_info** | Інформація про розрахунок | [vehicle_earnings_calc_info.md](../data/shared/modals/vehicle_earnings_calc_info.md) | `/vehicle-earnings` | 2026-04-24 |
| **park_user_form** | Додати/Редагувати користувача | [park_user_form.md](../data/shared/modals/park_user_form.md) | `07-park/02-team.md` | 2026-04-24 |
| **park_user_filters** | Фільтри команди | [park_user_filters.md](../data/shared/modals/park_user_filters.md) | `07-park/02-team.md` | 2026-04-24 |
| **park_user_permissions** | Управління правами | [park_user_permissions.md](../data/shared/modals/park_user_permissions.md) | `07-park/02-team.md` | 2026-04-24 |
| **park_user_delete** | Підтвердження видалення | [park_user_delete.md](../data/shared/modals/park_user_delete.md) | `07-park/02-team.md` | 2026-04-24 |
| **park_user_reset_password** | Скидання пароля | [park_user_reset_password.md](../data/shared/modals/park_user_reset_password.md) | `07-park/02-team.md` | 2026-04-24 |
| **park_user_activation** | Посилання на активацію | [park_user_activation.md](../data/shared/modals/park_user_activation.md) | `07-park/02-team.md` | 2026-04-24 |
| **park_file_form** | Додати/Редагувати файл парку | [park_file_form.md](../data/shared/modals/park_file_form.md) | `07-park/03-files.md` | 2026-04-24 |
| **park_file_filters** | Фільтри файлів | [park_file_filters.md](../data/shared/modals/park_file_filters.md) | `07-park/03-files.md` | 2026-04-24 |
| **park_file_delete** | Підтвердження видалення документа | [park_file_delete.md](../data/shared/modals/park_file_delete.md) | `07-park/03-files.md` | 2026-04-24 |
| **landing_news_form** | Створити/Редагувати новину | [landing_news_form.md](../data/shared/modals/landing_news_form.md) | `/landing-settings` | 2026-04-24 |
| **landing_news_delete** | Підтвердження видалення новини | [landing_news_delete.md](../data/shared/modals/landing_news_delete.md) | `/landing-settings` | 2026-04-24 |
