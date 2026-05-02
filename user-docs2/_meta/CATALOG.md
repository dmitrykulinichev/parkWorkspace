# Каталог документації
> Згенеровано автоматично з i-doc.registry.ts · 2026-05-02
> Не редагувати вручну — запусти `node workspace/user-docs2/_scripts/catalog-generator/index.js`

---

## page:dashboard

| | |
|---|---|
| **URL** | `/` |
| **Файл** | `data/pages/page_dashboard.md` |
| **Статус** | 📝 TODO |
| **Hint** | Головна панель: огляд ключових показників вашого автопарку, ... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:dashboard-stats` | `sec_dashboard_stats` | — | Статистика: огляд ключових метрик парку. |
| `sec:dashboard-uklon-pulse` | `sec_dashboard_uklon_pulse` | — | Пульс Uklon: активність інтеграції та останні дані Uklon. |
| `sec:dashboard-vehicle-status` | `sec_dashboard_vehicle_status` | — | Статус авто: поточний стан завантаженості та доступності ваш... |
| `sec:dashboard-maintenance` | `sec_dashboard_maintenance` | — | Критичне обслуговування: автомобілі, що потребують терміново... |
| `sec:dashboard-document-issues` | `sec_dashboard_document_issues` | — | Проблеми з документами: сповіщення про документи, термін дії... |
| `sec:dashboard-tasks` | `sec_dashboard_tasks` | — | Активні задачі: ваші поточні справи та пріоритетні завдання. |
| `sec:dashboard-reports` | `sec_dashboard_reports` | — | Відкриті звіти: технічні інциденти та проблеми, що потребуют... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:dashboard-settings` | `modal_dashboard_settings` | Налаштування дашборду: оберіть, які віджети відображати на г... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_dashboard_main` | page | `[data-i-doc="page:dashboard"]` | `/` |
| `modal_dashboard_settings` | modal | `[data-i-doc="modal:dashboard-settings"]` | `/` |

---

## page:vehicles

| | |
|---|---|
| **URL** | `/vehicles` |
| **Файл** | `data/pages/page_vehicles.md` |
| **Статус** | 📝 TODO |
| **Hint** | Управління автомобілями: реєструйте нові авто, слідкуйте за ... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:vehicle-list` | `sec_vehicle_list` | — | Ваш активний автопарк. Використовуйте пошук або фільтри для ... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:vehicle-filters` | `modal_vehicle_filters` | Налаштуйте фільтри за маркою, моделлю, статусом або типом па... | 📝 TODO |
| `modal:vehicle-form` | `modal_vehicle_form` | Вкажіть основні дані автомобіля: держномер, VIN-код, марку т... | 📝 TODO |
| `modal:vehicle-details` | `modal_vehicle_details` | Повна інформація про автомобіль: технічні характеристики, іс... | 📝 TODO |
| `modal:vehicle-delete-confirm` | `modal_vehicle_delete_confirm` | Ви впевнені, що хочете видалити цей автомобіль? Вся пов'язан... | 📝 TODO |
| `modal:vehicle-mileage-update` | `modal_vehicle_mileage_update` | Введіть поточне значення одометра. Система автоматично розра... | 📝 TODO |
| `modal:vehicle-maintenance-form` | `modal_vehicle_maintenance_form` | Зафіксуйте проведене технічне обслуговування або ремонт: вка... | 📝 TODO |
| `modal:vehicle-assignment-form` | `modal_vehicle_assignment_form` | Закріпіть водія за автомобілем. Виберіть водія зі списку та ... | 📝 TODO |
| `modal:vehicle-unassign-confirm` | `modal_vehicle_unassign_confirm` | Завершити зміну водія? Переконайтеся, що вказано актуальний ... | 📝 TODO |
| `modal:vehicle-issue-report-form` | `modal_vehicle_issue_report_form` | Повідомте про несправність або пошкодження. Детальний опис д... | 📝 TODO |
| `modal:vehicle-qr` | `modal_vehicle_qr` | Персональний QR-код автомобіля. Водій може відсканувати його... | 📝 TODO |
| `modal:vehicle-import` | `modal_vehicle_import` | Масове додавання авто: завантажте файл у форматі Excel або C... | 📝 TODO |
| `modal:vehicle-tag-settings` | `modal_vehicle_tag_settings` | Керуйте мітками (тегами) для класифікації автомобілів та нал... | 📝 TODO |
| `modal:vehicle-transfer` | `modal_vehicle_transfer` | Передача автомобіля в інший підрозділ або парк зі збереження... | 📝 TODO |
| `modal:vehicle-unavailability-form` | `modal_vehicle_unavailability_form` | Вкажіть причину виводу авто з експлуатації (ремонт, ДТП, очі... | 📝 TODO |
| `modal:vehicle-close-unavailability` | `modal_vehicle_close_unavailability` | Підтвердіть повернення автомобіля в роботу. Авто знову стане... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_vehicles_main` | page | `[data-i-doc="page:vehicles"]` | `/vehicles` |
| `modal_vehicle_filters` | modal | `[data-i-doc="modal:vehicle-filters"]` | `/vehicles` |
| `modal_vehicle_form` | modal | `[data-i-doc="modal:vehicle-form"]` | `/vehicles` |
| `modal_vehicle_details` | modal | `[data-i-doc="modal:vehicle-details"]` | `/vehicles` |
| `modal_vehicle_delete_confirm` | modal | `[data-i-doc="modal:vehicle-delete-confirm"]` | `/vehicles` |
| `modal_vehicle_mileage_update` | modal | `[data-i-doc="modal:vehicle-mileage-update"]` | `/vehicles` |
| `modal_vehicle_maintenance_form` | modal | `[data-i-doc="modal:vehicle-maintenance-form"]` | `/vehicles` |
| `modal_vehicle_assignment_form` | modal | `[data-i-doc="modal:vehicle-assignment-form"]` | `/vehicles` |
| `modal_vehicle_unassign_confirm` | modal | `[data-i-doc="modal:vehicle-unassign-confirm"]` | `/vehicles` |
| `modal_vehicle_issue_report_form` | modal | `[data-i-doc="modal:vehicle-issue-report-form"]` | `/vehicles` |
| `modal_vehicle_qr` | modal | `[data-i-doc="modal:vehicle-qr"]` | `/vehicles` |
| `modal_vehicle_import` | modal | `[data-i-doc="modal:vehicle-import"]` | `/vehicles` |
| `modal_vehicle_tag_settings` | modal | `[data-i-doc="modal:vehicle-tag-settings"]` | `/vehicles` |
| `modal_vehicle_transfer` | modal | `[data-i-doc="modal:vehicle-transfer"]` | `/vehicles` |
| `modal_vehicle_unavailability_form` | modal | `[data-i-doc="modal:vehicle-unavailability-form"]` | `/vehicles` |
| `modal_vehicle_close_unavailability` | modal | `[data-i-doc="modal:vehicle-close-unavailability"]` | `/vehicles` |

---

## page:drivers

| | |
|---|---|
| **URL** | `/drivers` |
| **Файл** | `data/pages/page_drivers.md` |
| **Статус** | 📝 TODO |
| **Hint** | Список водіїв: додавайте нових водіїв, закріплюйте їх за авт... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:driver-list` | `sec_driver_list` | — | Ваша команда водіїв. Ви можете швидко переглянути статус під... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:driver-filters` | `modal_driver_filters` | Гнучка фільтрація водіїв: знаходьте потрібних людей за стату... | 📝 TODO |
| `modal:driver-form` | `modal_driver_form` | Реєстрація водія: введіть персональні дані, контактну інформ... | 📝 TODO |
| `modal:driver-details` | `modal_driver_details` | Досьє водія: повна інформація про стаж, історію поїздок, кон... | 📝 TODO |
| `modal:driver-delete-confirm` | `modal_driver_delete_confirm` | Ви впевнені, що хочете видалити водія? Це закриє всі його по... | 📝 TODO |
| `modal:driver-assignment` | `modal_driver_assignment` | Керування призначенням: оберіть автомобіль для водія, вкажіт... | 📝 TODO |
| `modal:driver-telegram` | `modal_driver_telegram` | Підключення Telegram: згенеруйте код або QR-код для водія, щ... | 📝 TODO |
| `modal:driver-import` | `modal_driver_import` | Масовий імпорт водіїв: завантажте список водіїв з Excel-файл... | 📝 TODO |
| `modal:driver-copy` | `modal_driver_copy` | Копіювання водія: дозволяє швидко перенести дані водія в інш... | 📝 TODO |
| `modal:driver-uklon-info` | `modal_driver_uklon_info` | Дані з Uklon: детальна статистика водія безпосередньо з агре... | 📝 TODO |
| `modal:driver-comments` | `modal_driver_comments` | Журнал коментарів: додавайте важливі замітки про роботу воді... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_drivers_main` | page | `[data-i-doc="page:drivers"]` | `/drivers` |
| `modal_driver_filters` | modal | `[data-i-doc="modal:driver-filters"]` | `/drivers` |
| `modal_driver_form` | modal | `[data-i-doc="modal:driver-form"]` | `/drivers` |
| `modal_driver_details` | modal | `[data-i-doc="modal:driver-details"]` | `/drivers` |
| `modal_driver_delete_confirm` | modal | `[data-i-doc="modal:driver-delete-confirm"]` | `/drivers` |
| `modal_driver_assignment` | modal | `[data-i-doc="modal:driver-assignment"]` | `/drivers` |
| `modal_driver_telegram` | modal | `[data-i-doc="modal:driver-telegram"]` | `/drivers` |
| `modal_driver_import` | modal | `[data-i-doc="modal:driver-import"]` | `/drivers` |
| `modal_driver_copy` | modal | `[data-i-doc="modal:driver-copy"]` | `/drivers` |
| `modal_driver_uklon_info` | modal | `[data-i-doc="modal:driver-uklon-info"]` | `/drivers` |
| `modal_driver_comments` | modal | `[data-i-doc="modal:driver-comments"]` | `/drivers` |

---

## page:tasks

| | |
|---|---|
| **URL** | `/tasks` |
| **Файл** | `data/pages/page_tasks.md` |
| **Статус** | 📝 TODO |
| **Hint** | Ваш список задач: тут ви можете створювати нові задачі, приз... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:task-list` | `sec_task_list` | — | Ваш список задач: переглядайте поточні справи, відстежуйте ї... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:task-filters` | `modal_task_filters` | — | 📝 TODO |
| `modal:task-form` | `modal_task_form` | Заповніть назву та виберіть пріоритет. Ви також можете одраз... | 📝 TODO |
| `modal:task-details` | `modal_task_details` | Детальна інформація про задачу: опис, виконавець, терміни ви... | 📝 TODO |
| `modal:task-delete-confirm` | `modal_task_delete_confirm` | — | 📝 TODO |
| `modal:task-complete-confirm` | `modal_task_complete_confirm` | — | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_tasks_main` | page | `[data-i-doc="page:tasks"]` | `/tasks` |
| `modal_task_filters` | modal | `[data-i-doc="modal:task-filters"]` | `/tasks` |
| `modal_task_form` | modal | `[data-i-doc="modal:task-form"]` | `/tasks` |
| `modal_task_details` | modal | `[data-i-doc="modal:task-details"]` | `/tasks` |
| `modal_task_delete_confirm` | modal | `[data-i-doc="modal:task-delete-confirm"]` | `/tasks` |
| `modal_task_complete_confirm` | modal | `[data-i-doc="modal:task-complete-confirm"]` | `/tasks` |

---

## page:reports

| | |
|---|---|
| **URL** | `/reports` |
| **Файл** | `data/pages/page_reports.md` |
| **Статус** | 📝 TODO |
| **Hint** | — |

### Таби
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `tab:reports-operational` | `tab_reports_operational` | Операційний звіт: детальний аналіз поїздок, палива та витрат... | 📝 TODO |
| `tab:reports-performance` | `tab_reports_performance` | Ефективність парку: порівняльна статистика доходів, пробігу ... | 📝 TODO |
| `tab:reports-maintenance` | `tab_reports_maintenance` | Звіт по ТО: історія ремонтів, обслуговування та витрат на пі... | 📝 TODO |

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:reports-operational-controls` | `sec_reports_operational_controls` | `tab:reports-operational` | Керування операційним звітом: обирайте період (день, тиждень... |
| `sec:reports-operational-table` | `sec_reports_operational_table` | `tab:reports-operational` | Зведена таблиця операційних показників: порівняння фактичних... |
| `sec:reports-performance-controls` | `sec_reports_performance_controls` | `tab:reports-performance` | Фільтрація KPI: вибір довільного періоду часу для аналізу та... |
| `sec:reports-performance-table` | `sec_reports_performance_table` | `tab:reports-performance` | Таблиця виконання нормативів: детальний аналіз ефективності ... |
| `sec:reports-maintenance-stats` | `sec_reports_maintenance_stats` | `tab:reports-maintenance` | Статистика регламентних робіт: загальний огляд стану автопар... |
| `sec:reports-maintenance-filters` | `sec_reports_maintenance_filters` | `tab:reports-maintenance` | Пошук та фільтрація ТО: швидкий пошук автомобіля за номером ... |
| `sec:reports-maintenance-list` | `sec_reports_maintenance_list` | `tab:reports-maintenance` | Список регламентних робіт: детальна інформація про технічний... |

### Модалки
_немає_

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_reports_main` | page | `[data-i-doc="page:reports"]` | `/reports` |
| `tab_reports_operational_main` | tab | `[data-i-doc="tab:reports-operational"]` | `/reports` |
| `tab_reports_performance_main` | tab | `[data-i-doc="tab:reports-performance"]` | `/reports` |
| `tab_reports_maintenance_main` | tab | `[data-i-doc="tab:reports-maintenance"]` | `/reports` |

---

## page:statistics

| | |
|---|---|
| **URL** | `/statistics` |
| **Файл** | `data/pages/page_statistics.md` |
| **Статус** | 📝 TODO |
| **Hint** | — |

### Таби
_немає_

### Секції
_немає_

### Модалки
_немає_

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_statistics_main` | page | `[data-i-doc="page:statistics"]` | `/statistics` |

---

## page:settings

| | |
|---|---|
| **URL** | `/settings` |
| **Файл** | `data/pages/page_settings.md` |
| **Статус** | 📝 TODO |
| **Hint** | Налаштування системи: персоналізуйте інтерфейс, керуйте спов... |

### Таби
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `tab:settings-appearance` | `tab_settings_appearance` | Налашйте зовнішній вигляд системи: оберіть тему оформлення (... | 📝 TODO |

### Секції
_немає_

### Модалки
_немає_

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_settings_main` | page | `[data-i-doc="page:settings"]` | `/settings` |
| `tab_settings_appearance_main` | tab | `[data-i-doc="tab:settings-appearance"]` | `/settings` |

---

## page:profile

| | |
|---|---|
| **URL** | `/profile` |
| **Файл** | `data/pages/page_profile.md` |
| **Статус** | 📝 TODO |
| **Hint** | Ваш персональний кабінет: керуйте особистими даними, налашто... |

### Таби
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `tab:profile-general` | `tab_profile_general` | Тут ви можете змінити своє ім'я та контактний email. | 📝 TODO |
| `tab:profile-password` | `tab_profile_password` | Для зміни паролю введіть поточний пароль та новий пароль два... | 📝 TODO |
| `tab:profile-telegram` | `tab_profile_telegram` | Підключіть Telegram-бота для отримування миттєвих сповіщень ... | 📝 TODO |
| `tab:profile-notifications` | `tab_profile_notifications` | Налаштуйте, які саме сповіщення ви хочете отримувати на emai... | 📝 TODO |
| `tab:profile-access` | `tab_profile_access` | Перегляд ваших поточних ролей та дозволів у системі. Також т... | 📝 TODO |

### Секції
_немає_

### Модалки
_немає_

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_profile_main` | page | `[data-i-doc="page:profile"]` | `/profile` |
| `tab_profile_general_main` | tab | `[data-i-doc="tab:profile-general"]` | `/profile` |
| `tab_profile_password_main` | tab | `[data-i-doc="tab:profile-password"]` | `/profile` |
| `tab_profile_telegram_main` | tab | `[data-i-doc="tab:profile-telegram"]` | `/profile` |
| `tab_profile_notifications_main` | tab | `[data-i-doc="tab:profile-notifications"]` | `/profile` |
| `tab_profile_access_main` | tab | `[data-i-doc="tab:profile-access"]` | `/profile` |

---

## page:billing

| | |
|---|---|
| **URL** | `/billing` |
| **Файл** | `data/pages/page_billing.md` |
| **Статус** | 📝 TODO |
| **Hint** | Білінг та тарифи: переглядайте історію оплат, поточний стан ... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:billing-current-period` | `sec_billing_current_period` | — | Поточний розрахунковий період: огляд нарахувань, статусу під... |
| `sec:billing-history-list` | `sec_billing_history_list` | — | Історія розрахунків: перегляд усіх попередніх періодів, стат... |

### Модалки
_немає_

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_billing_main` | page | `[data-i-doc="page:billing"]` | `/billing` |

---

## page:documents

| | |
|---|---|
| **URL** | `/documents` |
| **Файл** | `data/pages/page_documents.md` |
| **Статус** | 📝 TODO |
| **Hint** | Управління документами: реєструйте страхові поліси, договори... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:document-list` | `sec_document_list` | — | Ваша база документів. Документи з терміном дії, що закінчуєт... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:documents-filters` | `modal_documents_filters` | Гнучкий пошук: фільтруйте документи за автомобілем, типом, с... | 📝 TODO |
| `modal:document-delete-confirm` | `modal_document_delete_confirm` | Ви впевнені, що хочете видалити цей документ? Це також видал... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_documents_main` | page | `[data-i-doc="page:documents"]` | `/documents` |
| `modal_documents_filters` | modal | `[data-i-doc="modal:documents-filters"]` | `/documents` |
| `modal_document_delete_confirm` | modal | `[data-i-doc="modal:document-delete-confirm"]` | `/documents` |

---

## page:vehicle-maintenance

| | |
|---|---|
| **URL** | `/vehicle-maintenance` |
| **Файл** | `data/pages/page_vehicle_maintenance.md` |
| **Статус** | 📝 TODO |
| **Hint** | Журнал технічного обслуговування: історія всіх сервісних роб... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:maintenance-list` | `sec_maintenance_list` | — | Хронологія сервісних заїздів. Ви можете бачити, хто створюва... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:maintenance-filters` | `modal_maintenance_filters` | Фільтруйте записи за автомобілем, типом робіт (ТО/ремонт) аб... | 📝 TODO |
| `modal:maintenance-details` | `modal_maintenance_details` | Детальний звіт по сервісному заїзду: перелік усіх виконаних ... | 📝 TODO |
| `modal:maintenance-delete-confirm` | `modal_maintenance_delete_confirm` | Ви впевнені, що хочете видалити цей запис? Дані про витрати ... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_vehicle_maintenance_main` | page | `[data-i-doc="page:vehicle-maintenance"]` | `/vehicle-maintenance` |
| `modal_maintenance_filters` | modal | `[data-i-doc="modal:maintenance-filters"]` | `/vehicle-maintenance` |
| `modal_maintenance_details` | modal | `[data-i-doc="modal:maintenance-details"]` | `/vehicle-maintenance` |
| `modal_maintenance_delete_confirm` | modal | `[data-i-doc="modal:maintenance-delete-confirm"]` | `/vehicle-maintenance` |

---

## page:vehicle-unavailabilities

| | |
|---|---|
| **URL** | `/vehicle-unavailabilities` |
| **Файл** | `data/pages/page_vehicle_unavailabilities.md` |
| **Статус** | 📝 TODO |
| **Hint** | Журнал простоїв: відстежуйте періоди, коли автомобілі були н... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:unavailability-list` | `sec_unavailability_list` | — | Історія простоїв автомобілів. Помаранчевим кольорв виділені ... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:unavailability-filters` | `modal_unavailability_filters` | Пошук записів про недоступність за автомобілем, причиною або... | 📝 TODO |
| `modal:unavailability-details` | `modal_unavailability_details` | Повна інформація про причину та тривалість простою автомобіл... | 📝 TODO |
| `modal:unavailability-delete-confirm` | `modal_unavailability_delete_confirm` | Ви впевнені, що хочете видалити цей запис з історії? Це дія ... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_vehicle_unavailabilities_main` | page | `[data-i-doc="page:vehicle-unavailabilities"]` | `/vehicle-unavailabilities` |
| `modal_unavailability_filters` | modal | `[data-i-doc="modal:unavailability-filters"]` | `/vehicle-unavailabilities` |
| `modal_unavailability_details` | modal | `[data-i-doc="modal:unavailability-details"]` | `/vehicle-unavailabilities` |
| `modal_unavailability_delete_confirm` | modal | `[data-i-doc="modal:unavailability-delete-confirm"]` | `/vehicle-unavailabilities` |

---

## page:fleet-settings

| | |
|---|---|
| **URL** | `/fleet-settings` |
| **Файл** | `data/pages/page_fleet_settings.md` |
| **Статус** | 📝 TODO |
| **Hint** | Централізовані налаштування параметрів вашого автопарку: кер... |

### Таби
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `tab:fleet-settings-schedules` | `tab_fleet_settings_schedules` | Налаштування регламентів технічного обслуговування: визначен... | 📝 TODO |

### Секції
_немає_

### Модалки
_немає_

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_fleet_settings_main` | page | `[data-i-doc="page:fleet-settings"]` | `/fleet-settings` |
| `tab_fleet_settings_schedules_main` | tab | `[data-i-doc="tab:fleet-settings-schedules"]` | `/fleet-settings` |

---

## page:vehicle-assignments

| | |
|---|---|
| **URL** | `/assignments` |
| **Файл** | `data/pages/page_vehicle_assignments.md` |
| **Статус** | 📝 TODO |
| **Hint** | Журнал призначень: відстежуйте історію закріплення автомобіл... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:assignment-list` | `sec_assignment_list` | — | Список всіх призначень. Використовуйте фільтри для пошуку ак... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:assignment-filters` | `modal_assignment_filters` | Фільтрація призначень за водієм, автомобілем або статусом ак... | 📝 TODO |
| `modal:assignment-form` | `modal_assignment_form` | Створення або редагування запису про призначення: оберіть во... | 📝 TODO |
| `modal:assignment-details` | `modal_assignment_details` | Повна інформація про призначення, включаючи історію змін, ко... | 📝 TODO |
| `modal:assignment-delete-confirm` | `modal_assignment_delete_confirm` | Ви впевнені, що хочете видалити цей запис? Це призведе до ви... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_vehicle_assignments_main` | page | `[data-i-doc="page:vehicle-assignments"]` | `/assignments` |
| `modal_assignment_filters` | modal | `[data-i-doc="modal:assignment-filters"]` | `/assignments` |
| `modal_assignment_form` | modal | `[data-i-doc="modal:assignment-form"]` | `/assignments` |
| `modal_assignment_details` | modal | `[data-i-doc="modal:assignment-details"]` | `/assignments` |
| `modal_assignment_delete_confirm` | modal | `[data-i-doc="modal:assignment-delete-confirm"]` | `/assignments` |

---

## page:issue-reports

| | |
|---|---|
| **URL** | `/issue-reports` |
| **Файл** | `data/pages/page_issue_reports.md` |
| **Статус** | 📝 TODO |
| **Hint** | Журнал проблем та інцидентів: відстежуйте всі технічні та оп... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:issue-reports-list` | `sec_issue_reports_list` | — | Журнал проблем: огляд поточних технічних інцидентів та пробл... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:issue-reports-filters` | `modal_issue_reports_filters` | Фільтрація інцидентів за статусом, автомобілем, водієм або п... | 📝 TODO |
| `modal:issue-report-form` | `modal_issue_report_form` | Створення звіту про інцидент: опишіть проблему, виберіть тип... | 📝 TODO |
| `modal:issue-report-actions` | `modal_issue_report_actions` | Керування діями: додавайте коментарі, змінюйте статус інциде... | 📝 TODO |
| `modal:issue-report-details` | `modal_issue_report_details` | Повна інформація про інцидент: деталі проблеми, історія дій ... | 📝 TODO |
| `modal:task-info` | `modal_task_info` | Додаткова інформація про задачу, прив'язану до інциденту, та... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_issue_reports_main` | page | `[data-i-doc="page:issue-reports"]` | `/issue-reports` |
| `modal_issue_reports_filters` | modal | `[data-i-doc="modal:issue-reports-filters"]` | `/issue-reports` |
| `modal_issue_report_form` | modal | `[data-i-doc="modal:issue-report-form"]` | `/issue-reports` |
| `modal_issue_report_actions` | modal | `[data-i-doc="modal:issue-report-actions"]` | `/issue-reports` |
| `modal_issue_report_details` | modal | `[data-i-doc="modal:issue-report-details"]` | `/issue-reports` |
| `modal_task_info` | modal | `[data-i-doc="modal:task-info"]` | `/issue-reports` |

---

## page:transactions

| | |
|---|---|
| **URL** | `/transactions` |
| **Файл** | `data/pages/page_transactions.md` |
| **Статус** | 📝 TODO |
| **Hint** | Фінансова звітність: відстежуйте всі грошові потоки, доходи ... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:transactions-list` | `sec_transactions_list` | — | Фінансовий журнал: повна історія транзакцій. Відстежуйте гро... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:transactions-filters` | `modal_transactions_filters` | Пошук транзакцій: фільтруйте за датою, типом, категорією або... | 📝 TODO |
| `modal:transaction-form` | `modal_transaction_form` | Додавання або редагування запису: вкажіть тип операції, суму... | 📝 TODO |
| `modal:transaction-delete-confirm` | `modal_transaction_delete_confirm` | Ви впевнені, що хочете видалити цей запис? Видалення транзак... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_transactions_main` | page | `[data-i-doc="page:transactions"]` | `/transactions` |
| `modal_transactions_filters` | modal | `[data-i-doc="modal:transactions-filters"]` | `/transactions` |
| `modal_transaction_form` | modal | `[data-i-doc="modal:transaction-form"]` | `/transactions` |
| `modal_transaction_delete_confirm` | modal | `[data-i-doc="modal:transaction-delete-confirm"]` | `/transactions` |

---

## page:uklon-vehicles

| | |
|---|---|
| **URL** | `/uklon-vehicles` |
| **Файл** | `data/pages/page_uklon_vehicles.md` |
| **Статус** | 📝 TODO |
| **Hint** | Інтеграція з Uklon: переглядайте та керуйте автомобілями, що... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:uklon-vehicles-list` | `sec_uklon_vehicles_list` | — | Список авто Uklon: керуйте прив'язками та переглядайте стату... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:vehicle-integration` | `modal_vehicle_integration` | Зв'язок авто Uklon: виберіть автомобіль з бази парку для інт... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_uklon_vehicles_main` | page | `[data-i-doc="page:uklon-vehicles"]` | `/uklon-vehicles` |
| `modal_vehicle_integration` | modal | `[data-i-doc="modal:vehicle-integration"]` | `/uklon-vehicles` |

---

## page:uklon-drivers

| | |
|---|---|
| **URL** | `/uklon-drivers` |
| **Файл** | `data/pages/page_uklon_drivers.md` |
| **Статус** | 📝 TODO |
| **Hint** | Інтеграція з Uklon: переглядайте та керуйте водіями, що прац... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:uklon-drivers-list` | `sec_uklon_drivers_list` | — | Список водіїв Uklon: керуйте прив'язками та переглядайте бал... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:driver-integration` | `modal_driver_integration` | Зв'язок водія Uklon: виберіть водія з бази парку для інтегра... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_uklon_drivers_main` | page | `[data-i-doc="page:uklon-drivers"]` | `/uklon-drivers` |
| `modal_driver_integration` | modal | `[data-i-doc="modal:driver-integration"]` | `/uklon-drivers` |

---

## page:uklon-reports

| | |
|---|---|
| **URL** | `/uklon-reports` |
| **Файл** | `data/pages/page_uklon_reports.md` |
| **Статус** | 📝 TODO |
| **Hint** | Звіти Uklon: детальна фінансова та операційна аналітика по р... |

### Таби
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `tab:uklon-reports-dashboard` | `tab_uklon_reports_dashboard` | Огляд: загальні фінансові показники роботи з Uklon. | 📝 TODO |
| `tab:uklon-reports-drivers` | `tab_uklon_reports_drivers` | Водії: аналітика ефективності кожного водія в системі Uklon. | 📝 TODO |
| `tab:uklon-reports-vehicles` | `tab_uklon_reports_vehicles` | Автомобілі: аналітика продуктивності кожного авто Uklon. | 📝 TODO |

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:uklon-reports-controls` | `sec_uklon_reports_controls` | `tab:uklon-reports-vehicles` | Панель керування звітами: вибір діапазону дат та статусів за... |

### Модалки
_немає_

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_uklon_reports_main` | page | `[data-i-doc="page:uklon-reports"]` | `/uklon-reports` |
| `tab_uklon_reports_dashboard_main` | tab | `[data-i-doc="tab:uklon-reports-dashboard"]` | `/uklon-reports` |
| `tab_uklon_reports_drivers_main` | tab | `[data-i-doc="tab:uklon-reports-drivers"]` | `/uklon-reports` |
| `tab_uklon_reports_vehicles_main` | tab | `[data-i-doc="tab:uklon-reports-vehicles"]` | `/uklon-reports` |

---

## page:uklon-branding

| | |
|---|---|
| **URL** | `/uklon-branding` |
| **Файл** | `data/pages/page_uklon_branding.md` |
| **Статус** | 📝 TODO |
| **Hint** | Бонуси за брендування: аналізуйте нарахування бонусів за роз... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:uklon-branding-list` | `sec_uklon_branding_list` | — | Список бонусів за брендування: перегляд нарахувань по автомо... |

### Модалки
_немає_

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_uklon_branding_main` | page | `[data-i-doc="page:uklon-branding"]` | `/uklon-branding` |

---

## page:uklon-logs

| | |
|---|---|
| **URL** | `/uklon-logs` |
| **Файл** | `data/pages/page_uklon_logs.md` |
| **Статус** | 📝 TODO |
| **Hint** | Логи інтеграції Uklon: технічний журнал запитів та відповіде... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:uklon-logs-list` | `sec_uklon_logs_list` | — | Журнал запитів: перегляд історії API запитів та відповідей с... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:uklon-log-details` | `modal_uklon_log_details` | Деталі логу Uklon: технічна інформація про запит до API та в... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_uklon_logs_main` | page | `[data-i-doc="page:uklon-logs"]` | `/uklon-logs` |
| `modal_uklon_log_details` | modal | `[data-i-doc="modal:uklon-log-details"]` | `/uklon-logs` |

---

## page:uklon-settings

| | |
|---|---|
| **URL** | `/uklon-settings` |
| **Файл** | `data/pages/page_uklon_settings.md` |
| **Статус** | 📝 TODO |
| **Hint** | Налаштування інтеграції Uklon: керуйте ключами API, налаштув... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:uklon-settings-form` | `sec_uklon_settings_form` | — | Налаштування Uklon API: керуйте ключами інтеграції та параме... |

### Модалки
_немає_

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_uklon_settings_main` | page | `[data-i-doc="page:uklon-settings"]` | `/uklon-settings` |

---

## page:telegram-settings

| | |
|---|---|
| **URL** | `/telegram-settings` |
| **Файл** | `data/pages/page_telegram_settings.md` |
| **Статус** | 📝 TODO |
| **Hint** | Налаштування Telegram: інтеграція з ботами для розсилки пові... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:telegram-settings-form` | `sec_telegram_settings_form` | — | Налаштування інтеграції Telegram: керуйте підключенням до бо... |

### Модалки
_немає_

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_telegram_settings_main` | page | `[data-i-doc="page:telegram-settings"]` | `/telegram-settings` |

---

## page:telegram-logs

| | |
|---|---|
| **URL** | `/telegram-logs` |
| **Файл** | `data/pages/page_telegram_logs.md` |
| **Статус** | 📝 TODO |
| **Hint** | Логи Telegram: технічний журнал запитів та відповідей боту д... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:telegram-logs-list` | `sec_telegram_logs_list` | — | Логи Telegram: переглядайте історію взаємодії системи з бото... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:telegram-log-details` | `modal_telegram_log_details` | Деталі логу Telegram: технічна інформація про запит до боту ... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_telegram_logs_main` | page | `[data-i-doc="page:telegram-logs"]` | `/telegram-logs` |
| `modal_telegram_log_details` | modal | `[data-i-doc="modal:telegram-log-details"]` | `/telegram-logs` |

---

## page:driver-schedule

| | |
|---|---|
| **URL** | `/driver-schedule` |
| **Файл** | `data/pages/page_driver_schedule.md` |
| **Статус** | 📝 TODO |
| **Hint** | Графік роботи: планувальник змін водіїв, облік технічного об... |

### Таби
_немає_

### Секції
_немає_

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:schedule-delete-confirm` | `modal_schedule_delete_confirm` | Ви впевнені, що хочете видалити цей запис із графіку? Це дія... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_driver_schedule_main` | page | `[data-i-doc="page:driver-schedule"]` | `/driver-schedule` |
| `modal_schedule_delete_confirm` | modal | `[data-i-doc="modal:schedule-delete-confirm"]` | `/driver-schedule` |

---

## page:manual-trips

| | |
|---|---|
| **URL** | `/manual-trips` |
| **Файл** | `data/pages/page_manual_trips.md` |
| **Статус** | 📝 TODO |
| **Hint** | Облік ручних поїздок: реєструйте поїздки, виконані поза агре... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:manual-trip-list` | `sec_manual_trip_list` | — | Хронологія ручних поїздок. Використовуйте фільтри для аналіз... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:manual-trip-form` | `modal_manual_trip_form` | Заповніть деталі поїздки: оберіть автомобіль, водія, вкажіть... | 📝 TODO |
| `modal:manual-trip-details` | `modal_manual_trip_details` | Перегляд повної інформації про поїздку: всі дані про водія, ... | 📝 TODO |
| `modal:manual-trip-filters` | `modal_manual_trip_filters` | Фільтрація поїздок: шукайте за водієм, автомобілем або часов... | 📝 TODO |
| `modal:manual-trip-delete-confirm` | `modal_manual_trip_delete_confirm` | Ви впевнені, що хочете видалити запис про цю поїздку? Це змі... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_manual_trips_main` | page | `[data-i-doc="page:manual-trips"]` | `/manual-trips` |
| `modal_manual_trip_form` | modal | `[data-i-doc="modal:manual-trip-form"]` | `/manual-trips` |
| `modal_manual_trip_details` | modal | `[data-i-doc="modal:manual-trip-details"]` | `/manual-trips` |
| `modal_manual_trip_filters` | modal | `[data-i-doc="modal:manual-trip-filters"]` | `/manual-trips` |
| `modal_manual_trip_delete_confirm` | modal | `[data-i-doc="modal:manual-trip-delete-confirm"]` | `/manual-trips` |

---

## page:driver-expenses

| | |
|---|---|
| **URL** | `/driver-expenses` |
| **Файл** | `data/pages/page_driver_expenses.md` |
| **Статус** | 📝 TODO |
| **Hint** | Облік витрат водіїв: фіксуйте додаткові витрати водіїв, прив... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:driver-expense-list` | `sec_driver_expense_list` | — | Хронологія витрат водіїв: переглядайте витрати, їх категорії... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:driver-expense-form` | `modal_driver_expense_form` | Реєстрація витрат: вкажіть водія, авто, суму витрат, категор... | 📝 TODO |
| `modal:driver-expense-details` | `modal_driver_expense_details` | Детальна інформація про витрату: хто здійснив, коли, на яку ... | 📝 TODO |
| `modal:driver-expense-filters` | `modal_driver_expense_filters` | Фільтрація витрат: пошук по водію, авто або часовому періоду... | 📝 TODO |
| `modal:driver-expense-delete-confirm` | `modal_driver_expense_delete_confirm` | Ви впевнені, що хочете видалити запис про цю витрату? Це дія... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_driver_expenses_main` | page | `[data-i-doc="page:driver-expenses"]` | `/driver-expenses` |
| `modal_driver_expense_form` | modal | `[data-i-doc="modal:driver-expense-form"]` | `/driver-expenses` |
| `modal_driver_expense_details` | modal | `[data-i-doc="modal:driver-expense-details"]` | `/driver-expenses` |
| `modal_driver_expense_filters` | modal | `[data-i-doc="modal:driver-expense-filters"]` | `/driver-expenses` |
| `modal_driver_expense_delete_confirm` | modal | `[data-i-doc="modal:driver-expense-delete-confirm"]` | `/driver-expenses` |

---

## page:bonuses-penalties

| | |
|---|---|
| **URL** | `/bonuses-penalties` |
| **Файл** | `data/pages/page_bonuses_penalties.md` |
| **Статус** | 📝 TODO |
| **Hint** | Премії та штрафи: керуйте заохоченнями та стягненнями для во... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:bonus-penalty-list` | `sec_bonus_penalty_list` | — | Журнал заохочень та стягнень: відстежуйте премії та штрафи в... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:bonus-penalty-form` | `modal_bonus_penalty_form` | Керуйте фінансами водія: додавайте премії або штрафи, прив'я... | 📝 TODO |
| `modal:bonus-penalty-details` | `modal_bonus_penalty_details` | Перегляд детальної інформації про заохочення або стягнення, ... | 📝 TODO |
| `modal:bonus-penalty-filters` | `modal_bonus_penalty_filters` | Пошук по преміях та штрафах: фільтруйте за водієм, типом або... | 📝 TODO |
| `modal:bonus-penalty-delete-confirm` | `modal_bonus_penalty_delete_confirm` | Ви впевнені, що хочете видалити цей запис? Це дія змінить фі... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_bonuses_penalties_main` | page | `[data-i-doc="page:bonuses-penalties"]` | `/bonuses-penalties` |
| `modal_bonus_penalty_form` | modal | `[data-i-doc="modal:bonus-penalty-form"]` | `/bonuses-penalties` |
| `modal_bonus_penalty_details` | modal | `[data-i-doc="modal:bonus-penalty-details"]` | `/bonuses-penalties` |
| `modal_bonus_penalty_filters` | modal | `[data-i-doc="modal:bonus-penalty-filters"]` | `/bonuses-penalties` |
| `modal_bonus_penalty_delete_confirm` | modal | `[data-i-doc="modal:bonus-penalty-delete-confirm"]` | `/bonuses-penalties` |

---

## page:driver-debt-plans

| | |
|---|---|
| **URL** | `/driver-debt-plans` |
| **Файл** | `data/pages/page_driver_debt_plans.md` |
| **Статус** | 📝 TODO |
| **Hint** | Плани погашення боргів: створюйте графіки списання боргів во... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:driver-debt-plan-list` | `sec_driver_debt_plan_list` | — | Журнал планів погашення боргів: переглядайте статус прогресу... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:driver-debt-plan-form` | `modal_driver_debt_plan_form` | Створення плану погашення: вкажіть водія, загальну суму борг... | 📝 TODO |
| `modal:driver-debt-plan-details` | `modal_driver_debt_plan_details` | Детальна інформація про план боргу: перегляд прогресу оплат,... | 📝 TODO |
| `modal:manual-debt-payment-form` | `modal_manual_debt_payment_form` | Списання боргу: зафіксуйте платіж водія вручну, якщо кошти н... | 📝 TODO |
| `modal:driver-debt-plan-filters` | `modal_driver_debt_plan_filters` | Фільтрація планів: шукайте за водієм, статусом (активні/заве... | 📝 TODO |
| `modal:driver-debt-plan-delete-confirm` | `modal_driver_debt_plan_delete_confirm` | Ви впевнені, що хочете видалити цей план? Історія вже провед... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_driver_debt_plans_main` | page | `[data-i-doc="page:driver-debt-plans"]` | `/driver-debt-plans` |
| `modal_driver_debt_plan_form` | modal | `[data-i-doc="modal:driver-debt-plan-form"]` | `/driver-debt-plans` |
| `modal_driver_debt_plan_details` | modal | `[data-i-doc="modal:driver-debt-plan-details"]` | `/driver-debt-plans` |
| `modal_manual_debt_payment_form` | modal | `[data-i-doc="modal:manual-debt-payment-form"]` | `/driver-debt-plans` |
| `modal_driver_debt_plan_filters` | modal | `[data-i-doc="modal:driver-debt-plan-filters"]` | `/driver-debt-plans` |
| `modal_driver_debt_plan_delete_confirm` | modal | `[data-i-doc="modal:driver-debt-plan-delete-confirm"]` | `/driver-debt-plans` |

---

## page:driver-earnings

| | |
|---|---|
| **URL** | `/driver-earnings-new` |
| **Файл** | `data/pages/page_driver_earnings.md` |
| **Статус** | 📝 TODO |
| **Hint** | Заробіток водіїв: фінансовий звіт по персоналу, де ви можете... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:driver-earnings-list` | `sec_driver_earnings_list` | — | Підсумковий звіт заробітку водіїв: детальна аналітика поїздо... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:driver-earnings-calc-info` | `modal_driver_earnings_calc_info` | Інформація про розрахунки: пояснення методики нарахування до... | 📝 TODO |
| `modal:driver-earnings-details` | `modal_driver_earnings_details` | Деталі заробітку водія: аналітика поїздок, нарахувань та спи... | 📝 TODO |
| `modal:driver-earnings-raw-data` | `modal_driver_earnings_raw_data` | Технічні дані: сирі дані звіту для діагностики розрахунків. | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_driver_earnings_main` | page | `[data-i-doc="page:driver-earnings"]` | `/driver-earnings-new` |
| `modal_driver_earnings_calc_info` | modal | `[data-i-doc="modal:driver-earnings-calc-info"]` | `/driver-earnings-new` |
| `modal_driver_earnings_details` | modal | `[data-i-doc="modal:driver-earnings-details"]` | `/driver-earnings-new` |
| `modal_driver_earnings_raw_data` | modal | `[data-i-doc="modal:driver-earnings-raw-data"]` | `/driver-earnings-new` |

---

## page:vehicle-earnings

| | |
|---|---|
| **URL** | `/vehicle-earnings` |
| **Файл** | `data/pages/page_vehicle_earnings.md` |
| **Статус** | 📝 TODO |
| **Hint** | Заробіток автомобілів: фінансова аналітика кожного авто у фл... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:vehicle-earnings-list` | `sec_vehicle_earnings_list` | — | Звіт по заробітку автомобілів: повна фінансова статистика ко... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:vehicle-earnings-details` | `modal_vehicle_earnings_details` | Деталі заробітку автомобіля: повний звіт про доходи, витрати... | 📝 TODO |
| `modal:vehicle-earnings-calc-info` | `modal_vehicle_earnings_calc_info` | Методика розрахунку для авто: інформація про те, як враховую... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_vehicle_earnings_main` | page | `[data-i-doc="page:vehicle-earnings"]` | `/vehicle-earnings` |
| `modal_vehicle_earnings_details` | modal | `[data-i-doc="modal:vehicle-earnings-details"]` | `/vehicle-earnings` |
| `modal_vehicle_earnings_calc_info` | modal | `[data-i-doc="modal:vehicle-earnings-calc-info"]` | `/vehicle-earnings` |

---

## page:park-statistics

| | |
|---|---|
| **URL** | `/park-statistics` |
| **Файл** | `data/pages/page_park_statistics.md` |
| **Статус** | 📝 TODO |
| **Hint** | Статистика парку: глобальна аналітика діяльності автопарку, ... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:uklon-stats-widget` | `sec_uklon_stats_widget` | — | Статистика замовлень Uklon: огляд поточних показників поїздо... |
| `sec:test-uklon-stats-widget` | `sec_test_uklon_stats_widget` | — | Тестовий віджет статистики: розширений аналіз нових метрик U... |
| `sec:vehicle-mileage-chart-widget` | `sec_vehicle_mileage_chart_widget` | — | Графік пробігу: візуалізація динаміки використання автомобіл... |

### Модалки
_немає_

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_park_statistics_main` | page | `[data-i-doc="page:park-statistics"]` | `/park-statistics` |

---

## page:park-users

| | |
|---|---|
| **URL** | `/park-users` |
| **Файл** | `data/pages/page_park_users.md` |
| **Статус** | 📝 TODO |
| **Hint** | Команда парку: управління доступом менеджерів, перегляд роле... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:user-list` | `sec_user_list` | — | Список користувачів системи: керуйте обліковими записами мен... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:user-form` | `modal_user_form` | Керування користувачем: додайте менеджера, встановіть роль т... | 📝 TODO |
| `modal:user-permissions` | `modal_user_permissions` | Налаштування прав: керуйте доступом конкретного користувача ... | 📝 TODO |
| `modal:user-delete-confirm` | `modal_user_delete_confirm` | Ви впевнені, що хочете видалити обліковий запис користувача?... | 📝 TODO |
| `modal:user-reset-password` | `modal_user_reset_password` | Скидання пароля: відправка листа з посиланням на встановленн... | 📝 TODO |
| `modal:user-activation-link` | `modal_user_activation_link` | Посилання на активацію: скопіюйте це посилання, щоб передати... | 📝 TODO |
| `modal:user-filters` | `modal_user_filters` | Пошук користувачів: фільтруйте команду за роллю або активніс... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_park_users_main` | page | `[data-i-doc="page:park-users"]` | `/park-users` |
| `modal_user_form` | modal | `[data-i-doc="modal:user-form"]` | `/park-users` |
| `modal_user_permissions` | modal | `[data-i-doc="modal:user-permissions"]` | `/park-users` |
| `modal_user_delete_confirm` | modal | `[data-i-doc="modal:user-delete-confirm"]` | `/park-users` |
| `modal_user_reset_password` | modal | `[data-i-doc="modal:user-reset-password"]` | `/park-users` |
| `modal_user_activation_link` | modal | `[data-i-doc="modal:user-activation-link"]` | `/park-users` |
| `modal_user_filters` | modal | `[data-i-doc="modal:user-filters"]` | `/park-users` |

---

## page:park-files

| | |
|---|---|
| **URL** | `/park-files` |
| **Файл** | `data/pages/page_park_files.md` |
| **Статус** | 📝 TODO |
| **Hint** | Файли парку: централізоване сховище документів та медіа-файл... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:file-list` | `sec_file_list` | — | База файлів автопарку: керуйте завантаженням та організацією... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:park-file-form` | `modal_park_file_form` | Керування файлом: завантажуйте новий файл або редагуйте існу... | 📝 TODO |
| `modal:park-file-delete-confirm` | `modal_park_file_delete_confirm` | Ви впевнені, що хочете видалити цей файл? Це дія незворотна. | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_park_files_main` | page | `[data-i-doc="page:park-files"]` | `/park-files` |
| `modal_park_file_form` | modal | `[data-i-doc="modal:park-file-form"]` | `/park-files` |
| `modal_park_file_delete_confirm` | modal | `[data-i-doc="modal:park-file-delete-confirm"]` | `/park-files` |

---

## page:landing-settings

| | |
|---|---|
| **URL** | `/landing-settings` |
| **Файл** | `data/pages/page_landing_settings.md` |
| **Статус** | 📝 TODO |
| **Hint** | Налаштування лендінгу: керуйте контентом вашої посадкової ст... |

### Таби
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `tab:landing-general` | `tab_landing_general` | Загальні налаштування: керуйте головним заголовком, описом, ... | 📝 TODO |
| `tab:landing-news` | `tab_landing_news` | Новини та акції: додавайте та редагуйте новини, бонусні прог... | 📝 TODO |

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:landing-general-settings` | `sec_landing_general_settings` | — | Налаштування головної сторінки: керуйте брендингом, контенто... |
| `sec:landing-print-settings` | `sec_landing_print_settings` | — | Налаштування матеріалів для друку: редагуйте текст на листів... |
| `sec:landing-benefits` | `sec_landing_benefits` | — | Керування перевагами: редагуйте список бонусів та умов, які ... |
| `sec:landing-requirements` | `sec_landing_requirements` | — | Керування вимогами: список критеріїв для водіїв, що відображ... |
| `sec:landing-faq` | `sec_landing_faq` | — | Керування розділом FAQ: додавайте відповіді на поширені запи... |
| `sec:landing-news-list` | `sec_landing_news_list` | — | Список новин та акцій: керуйте публікаціями, що відображають... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:landing-news-form` | `modal_landing_news_form` | Додавання або редагування новини: заповніть заголовок, текст... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_landing_settings_main` | page | `[data-i-doc="page:landing-settings"]` | `/landing-settings` |
| `tab_landing_general_main` | tab | `[data-i-doc="tab:landing-general"]` | `/landing-settings` |
| `tab_landing_news_main` | tab | `[data-i-doc="tab:landing-news"]` | `/landing-settings` |
| `modal_landing_news_form` | modal | `[data-i-doc="modal:landing-news-form"]` | `/landing-settings` |

---

## page:materials

| | |
|---|---|
| **URL** | `—` |
| **Файл** | `data/pages/page_materials.md` |
| **Статус** | 📝 TODO |
| **Hint** | Матеріали для друку: завантажуйте та друкуйте рекламні листі... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:material-list` | `sec_material_list` | — | Каталог матеріалів для друку: переглядайте та генеруйте необ... |
| `sec:material-item` | `sec_material_item` | — | Матеріал: переглядайте опис та обирайте спосіб друку. |

### Модалки
_немає_

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_materials_main` | page | `[data-i-doc="page:materials"]` | `—` |

---

## page:finance-settings

| | |
|---|---|
| **URL** | `/finance-settings` |
| **Файл** | `data/pages/page_finance_settings.md` |
| **Статус** | 📝 TODO |
| **Hint** | Фінансові налаштування: керуйте відсотковими ставками комісі... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:finance-form-section` | `sec_finance_form_section` | — | Фінансові правила: налаштування відсотків, комісій та норм р... |
| `sec:finance-history-section` | `sec_finance_history_section` | — | Історія змін: хронологія всіх фінансових налаштувань парку. |

### Модалки
_немає_

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_finance_settings_main` | page | `[data-i-doc="page:finance-settings"]` | `/finance-settings` |

---

## page:activity-logs

| | |
|---|---|
| **URL** | `/activity-logs` |
| **Файл** | `data/pages/page_activity_logs.md` |
| **Статус** | 📝 TODO |
| **Hint** | Журнал подій: повна історія всіх дій у системи, включаючи си... |

### Таби
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `tab:logs-system` | `tab_logs_system` | Системний журнал: історія технічних дій у системі. | 📝 TODO |
| `tab:logs-subscription` | `tab_logs_subscription` | Журнал розсилок: історія відправлених повідомлень водіям. | 📝 TODO |

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:logs-system-toolbar` | `sec_logs_system_toolbar` | — | Панель інструментів системного журналу: пошук, фільтри, стат... |
| `sec:logs-system-list` | `sec_logs_system_list` | — | Список системних подій: хронологія дій у системі. |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:logs-filters` | `modal_logs_filters` | Фільтри журналу: пошук подій за датою, користувачем, типом д... | 📝 TODO |
| `modal:logs-statistics` | `modal_logs_statistics` | Статистика подій: аналітика активності користувачів та часто... | 📝 TODO |
| `modal:logs-details` | `modal_logs_details` | Деталі події: повна технічна інформація про конкретну подію,... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_activity_logs_main` | page | `[data-i-doc="page:activity-logs"]` | `/activity-logs` |
| `tab_logs_system_main` | tab | `[data-i-doc="tab:logs-system"]` | `/activity-logs` |
| `tab_logs_subscription_main` | tab | `[data-i-doc="tab:logs-subscription"]` | `/activity-logs` |
| `modal_logs_filters` | modal | `[data-i-doc="modal:logs-filters"]` | `/activity-logs` |
| `modal_logs_statistics` | modal | `[data-i-doc="modal:logs-statistics"]` | `/activity-logs` |
| `modal_logs_details` | modal | `[data-i-doc="modal:logs-details"]` | `/activity-logs` |

---

## page:orders

| | |
|---|---|
| **URL** | `/orders` |
| **Файл** | `data/pages/page_orders.md` |
| **Статус** | 📝 TODO |
| **Hint** | Замовлення Uklon: переглядайте всі замовлення, історію стату... |

### Таби
_немає_

### Секції
| i-doc ID | doc_id | Таб | Hint |
|---|---|---|---|
| `sec:orders-list` | `sec_orders_list` | — | Список замовлень: переглядайте історію, фільтруйте за водіям... |

### Модалки
| i-doc ID | doc_id | Hint | Статус |
|---|---|---|---|
| `modal:order-filters` | `modal_order_filters` | Фільтри замовлень: шукайте за статусом, типом оплати, водієм... | 📝 TODO |
| `modal:order-details` | `modal_order_details` | Деталі замовлення: перегляд повних даних поїздки, комісій, с... | 📝 TODO |

### Скріншоти
| Screenshot ID | Тип | Селектор | URL |
|---|---|---|---|
| `page_orders_main` | page | `[data-i-doc="page:orders"]` | `/orders` |
| `modal_order_filters` | modal | `[data-i-doc="modal:order-filters"]` | `/orders` |
| `modal_order_details` | modal | `[data-i-doc="modal:order-details"]` | `/orders` |
