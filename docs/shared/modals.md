# Реєстр модальних вікон (Modals Registry)

| Слаг (Slug) | Назва модалки | Викликається з | Опис |
| :--- | :--- | :--- | :--- |
| `fleet_vehicle_create` | Створення автомобіля | `fleet_vehicle_list` | Форма додавання нового ТЗ. |
| `fleet_vehicle_view` | Картка автомобіля | `fleet_vehicle_list` | Детальна інформація про авто. |
| `fleet_mileage_update` | Оновлення пробігу | `fleet_vehicle_list`, QR | Ввід поточних показників одометра. |
| `fleet_maintenance_add` | Запис на сервіс | `fleet_vehicle_list`, `maint_record_log` | Додавання робіт по ТО/ремонту. |
| `drivers_create` | Реєстрація водія | `drivers_list` | Форма нового водія. |
| `drivers_tg_connect` | Підключення Telegram | `drivers_list` | Генерація токена активації бота. |
| `fin_expense_create` | Додавання витрати | `fin_trans_list` | Фіксація витрат (паливо, запчастини). |
| `fin_scheme_edit` | Схема оплати | `fin_payroll` | Налаштування % та бонусів водія. |
| `sch_slot_edit` | Редагування зміни | `sch_matrix` | Призначення водія на конкретну дату. |
| `maint_issue_solve` | Рішення за зверненням | `maint_issue_list` | Закриття скарги або створення задачі. |
| `sys_park_create` | Створення парку | `sys_parks_list` | Реєстрація нового клієнта. |
| `sys_user_impersonate` | Вхід від імені | `sys_users_list` | Авторизація в парку клієнта. |
| `sys_plan_edit` | Редагування тарифу | `sys_plans_list` | Налаштування ціни за авто. |
