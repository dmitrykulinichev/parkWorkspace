# Реєстр структури проекту (Сторінки, Модальні вікна, API)

Цей документ відображає логічну структуру інтерфейсу користувача та пов'язаних з ним частин API.

---

## 📊 1. Головна панель (Dashboard)
**Сторінка:** `Dashboard`
*   *Примітка: Використовує віджети замість модальних вікон.*
    *   **ParkPulseWidget (New):** Графік активності парку.
    *   **WelcomeDashboard** (Onboarding)
    *   **CriticalMaintenanceGrouped**
    *   **DocumentIssuesWidget**
    *   **OpenIssueReports**
    *   **OpenTasksWidget**
    *   **VehiclesStatsWidget**
    *   **VehicleStatusList**
**Модальні вікна:**
1.  **DashboardSettingsModal** — Налаштування відображення віджетів.
2.  **IssueReportActionsModal** — Прийняття рішення по проблемі (з віджета OpenIssueReports).
3.  **TaskDetailsModal** — Деталі задачі (з віджета OpenTasksWidget).

---

## 🚗 2. Автомобілі (Vehicles)

### Сторінка: Автомобілі (Vehicles)
**Файл:** `Vehicles/index.jsx`
*   *Функціонал:*
    *   **Система тегів:** Створення та призначення кольорових тегів для автомобілів (наприклад, "VIP", "Ремонт").
    *   **Аудит:** Відображення користувача, який додав автомобіль.
**Модальні вікна:**
1.  **VehicleFormModal** — Створення нового автомобіля або редагування існуючого (включаючи управління тегами).
2.  **VehicleDetailsModal** — Перегляд детальної інформації про авто (картка авто).
3.  **VehicleDeleteModal** — Підтвердження видалення автомобіля.
4.  **UpdateMileageModal** — Ручне оновлення пробігу.
5.  **AssignDriverModal** — Призначення водія на авто.
6.  **UnassignDriverModal** — Зняття водія з авто.
7.  **IssueReportFormModal** — Створення звіту про проблему (швидка дія).
8.  **VehicleMaintenanceRecordFormModal** — Створення запису про ТО (швидка дія).
9.  **VehicleQrModal** — Перегляд та друк QR-коду автомобіля.
10. **VehicleImportModal** — Імпорт автомобілів з файлу (Excel/CSV) з попереднім переглядом.
11. **ImportBatchDetailsModal** — Детальний журнал операцій імпорту.
12. **FiltersModal** — Розширені фільтри списку.
13. **TagSettingsModal (New)** — Налаштування назв та кольорів тегів.

### Сторінка: Несправності (Issue Reports)
**Файл:** `IssueReports/index.jsx`
**Модальні вікна:**
1.  **IssueReportFormModal** — Створення/Редагування тікета про проблему.
2.  **IssueReportDetailModal** — Перегляд деталей проблеми.
3.  **IssueReportActionsModal** — Прийняття рішення (Resolve) по проблемі.
4.  **TaskInfoModal** — Перегляд пов'язаної задачі.
5.  **FiltersModal** — Фільтрація звітів.

### Сторінка: Технічне обслуговування (Vehicle Maintenance Records)
**Файл:** `VehicleMaintenanceRecords/index.jsx`
**Модальні вікна:**
1.  **VehicleMaintenanceRecordFormModal** — Універсальна форма для Створення та Редагування заїзду на сервіс (групи робіт).
2.  **VehicleMaintenanceRecordDetailModal** — Перегляд деталей заїзду (список робіт, файли, друк чеку).
3.  **FiltersModal** — Фільтрація журналу.

### Сторінка: Регламенти ТО (Maintenance Schedules)
**Файл:** `MaintenanceSchedules/index.jsx`
**Модальні вікна:**
1.  **CreateMaintenanceModal** — Створення власного регламенту.
2.  **EditMaintenanceModal** — Редагування регламенту.
3.  **ImportSchedulesModal** — Імпорт та синхронізація регламентів з системного каталогу.
4.  **FiltersModal** — Фільтрація списку.
5.  **ConfirmationModal** — Підтвердження видалення.

### Сторінка: Документи (Documents)
**Файл:** `Documents/index.jsx`
**Модальні вікна:**
1.  **DocumentFormModal** — Завантаження/Редагування документу.
2.  **FiltersModal** — Фільтрація документів.

### Сторінка: Звіти (Reports)
**Файл:** `Reports.jsx`
*   *Сторінка з вкладками:*
    *   **OperationalReportTab:** Оперативна статистика (День/Тиждень/Місяць) з прогнозами.
        *   *Функціонал:* Таблиця з деталізацією по днях, експорт в Excel, відображення тегів автомобілів.
    *   **PerformanceReportTab:** Історичний звіт про виконання нормативів.
        *   *Функціонал:* Таблиця з деталізацією по днях (без прогнозів), експорт в Excel.
    *   **MaintenanceReportTab:** Звіт по регламентних роботах.

---

## ⚡ 3. Операційна діяльність (Operations)

### Сторінка: Водії (Drivers)
**Файл:** `Drivers/index.jsx`
**Модальні вікна:**
1.  **DriverFormModal** — Створення/Редагування профілю водія.
2.  **DriverDetailsModal** — Картка водія (детальна інформація).
3.  **AssignVehicleModal** — Призначення авто (з боку водія).
4.  **TelegramConnectionModal** — Підключення Telegram-бота.
5.  **DriverCommentsModal** — Перегляд коментарів про водія.
6.  **DriverEditCommentModal** — Редагування коментаря.
7.  **DriverImportModal** — Імпорт водіїв з файлу (Excel/CSV) з попереднім переглядом.
8.  **ImportBatchDetailsModal** — Детальний журнал операцій імпорту.
9.  **FiltersModal** — Фільтрація списку водіїв.

### Сторінка: Призначення (Vehicle Assignments)
**Файл:** `VehicleAssignments/index.jsx`
**Модальні вікна:**
1.  **VehicleAssignmentFormModal** — Створення/Редагування запису про призначення.
2.  **VehicleAssignmentDetailModal** — Деталі призначення.
3.  **FiltersModal** — Фільтрація історії.

### Сторінка: Графік роботи (Driver Schedule)
**Файл:** `DriverSchedule/index.jsx`
**Модальні вікна:**
1.  **DriverScheduleSlotFormModal** — Створення/Редагування слоту графіку (Зміна, ТО, Ремонт).
2.  **ActualShiftDetailsModal** — Перегляд деталей фактичної зміни.
3.  **SimpleDriverDetailsModal** — Швидкий перегляд інформації про водія з графіку.
4.  **ConfirmationModal** — Підтвердження дій.

### Сторінка: Задачі (Tasks)
**Файл:** `Tasks/index.jsx`
**Модальні вікна:**
1.  **TaskFormModal** — Створення/Редагування задачі.
2.  **TaskDetailsModal** — Перегляд деталей задачі.
3.  **FiltersModal** — Фільтрація задач.

---

## 💰 4. Фінанси (Finance)

### Сторінка: Транзакції (Transactions)
**Файл:** `Transactions/index.jsx`
**Модальні вікна:**
1.  **TransactionFormModal** — Створення/Редагування транзакції (Дохід/Витрата).
2.  **FiltersModal** — Фільтрація фінансів.

### Сторінка: Ручні поїздки (Manual Trips)
**Файл:** `ManualTrips/index.jsx`
**Модальні вікна:**
1.  **ManualTripModal** — Створення/Редагування ручного замовлення.
2.  **ManualTripDetailsModal** — Перегляд деталей поїздки (вкл. Telegram ID).
3.  **FiltersModal** — Фільтрація списку.

### Сторінка: Витрати водія (Driver Expenses)
**Файл:** `DriverExpenses/index.jsx`
**Модальні вікна:**
1.  **DriverExpenseModal** — Створення/Редагування витрати (з можливістю прикріплення файлів).
2.  **DriverExpenseDetailsModal** — Перегляд деталей витрати та завантажених файлів.
3.  **FiltersModal** — Фільтрація списку.

### Сторінка: Премії та Штрафи (Bonuses & Penalties)
**Файл:** `BonusesPenalties/index.jsx`
**Модальні вікна:**
1.  **BonusPenaltyModal** — Створення/Редагування запису.
2.  **BonusPenaltyDetailsModal** — Перегляд деталей.
3.  **FiltersModal** — Фільтрація списку.

### Сторінка: Заробіток водіїв (Driver Earnings)
**Файл:** `DriverEarnings/index.jsx`
*   *Сторінка з вкладками:*
    *   **EarningsReportTab:** Тижневий звіт по зарплаті (Вал, База, Бонус, Дохід парку).
    *   **EarningsSchemesTab:** Управління фінансовими схемами (тарифами).
    *   **DriversSettingsTab:** Прив'язка схем до водіїв.
**Модальні вікна:**
1.  **DriverFinancialSchemeModal** — Створення/Редагування тарифного плану.

### Сторінка: Заробіток водіїв 2.0 (Driver Earnings New)
**Файл:** `DriverEarningsNew/index.jsx`
**Модальні вікна:**
1.  **DriverEarningsCalculationInfoModal** — Довідка про принципи розрахунку зарплати (включаючи витрати водія).
2.  **DriverEarningsDetailsModal** — Детальний покроковий розрахунок для конкретного водія (з урахуванням компенсації витрат).
3.  **RawDataModal** — Перегляд сирих JSON даних для дебагу.

### Сторінка: Заробіток автомобілів (Vehicle Earnings)
**Файл:** `VehicleEarnings/index.jsx`
*   *Звіт ефективності автопарку (Вал, Уклон, Водій, Парк, Витрати, Прибуток).*
**Модальні вікна:**
1.  **VehicleEarningsDetailsModal** — Детальна картка автомобіля (KPI + розбивка по днях).

---

## 🏢 5. Управління Парком (Park Management)

### Сторінка: Користувачі парку (Park Users)
**Файл:** `ParkUsers/index.jsx`
**Модальні вікна:**
1.  **ParkUserFormModal** — Додавання/Редагування співробітника.
2.  **ConfirmationModal** — Підтвердження скидання пароля / Відображення посилання на активацію.
3.  **FiltersModal** — Фільтрація.

### Сторінка: Лендінг (Landing Settings)
**Файл:** `LandingSettings/index.jsx`
*   *Налаштування публічної сторінки.*

### Сторінка: Матеріали (Resources)
**Файл:** `Materials/index.jsx` (або `Resources/index.jsx`)
**Модальні вікна:**
1.  **Modal (Generic)** — Налаштування параметрів завантаження (наприклад, фільтр для QR-кодів).

### Сторінка: Журнал подій (Activity Logs)
**Файл:** `ActivityLogs/index.jsx`
*   *Тільки перегляд списків.*

### Сторінка: Журнал розсилок (Subscription Logs)
**Файл:** `SubscriptionLogs/index.jsx`
*   *Тільки перегляд списків.*
**Модальні вікна:**
1.  **FiltersModal** — Фільтрація логів.

### Сторінка: Налаштування (Finance Settings)
**Файл:** `FinanceSettings/index.jsx`
*   *Налаштування фінансових параметрів (комісії, норми).*
**Модальні вікна:**
1.  **FinanceHistoryTable** (вбудований компонент) — Історія змін тарифів.

---

## 🚕 6. Інтеграція Uklon

### Сторінка: Замовлення (Orders)
**Файл:** `Orders/index.jsx`
**Модальні вікна:**
1.  **OrderDetailsModal** — Детальна інформація про замовлення/поїздку.

### Сторінка: Автомобілі Uklon (Uklon Vehicles)
**Файл:** `UklonVehicles/index.jsx`
**Модальні вікна:**
1.  **VehicleIntegrationModal** — Зв'язування авто з Uklon.

### Сторінка: Водії Uklon (Uklon Drivers)
**Файл:** `UklonDrivers/index.jsx`
**Модальні вікна:**
1.  **DriverIntegrationModal** — Зв'язування водіїв з Uklon.

### Сторінка: Звіти Uklon (Uklon Reports)
**Файл:** `UklonReports/index.jsx`
*   *Сторінка аналітики з вкладками:*
    *   **DashboardTab:** Загальні KPI (Дохід, Поїздки, Пробіг, Середній чек), графік динаміки доходів, діаграма статусів.
    *   **DriversTab:** Рейтинг ефективності водіїв (Дохід, Кількість поїздок, Пробіг, Коефіцієнт грн/км).
    *   **VehiclesTab:** Рейтинг ефективності автомобілів (Дохід, Кількість поїздок, Пробіг, Коефіцієнт грн/км).
*   *Функціонал:* Фільтрація за датою (Date Range) та статусами замовлень (MultiSelect).

### Сторінка: Логи Uklon (Uklon Logs)
**Файл:** `UklonLogs/index.jsx`
**Модальні вікна:**
1.  **UklonLogDetailsModal** — Деталі API запиту.

### Сторінка: Налаштування Uklon (Uklon Settings)
**Файл:** `UklonSettings/index.jsx`
*   *Налаштування інтеграції.*

---

## ✈️ 7. Інтеграція Telegram

### Сторінка: Налаштування Telegram (Telegram Settings)
**Файл:** `TelegramSettings/index.jsx`
*   *Налаштування бота.*

### Сторінка: Логи Telegram (Telegram Logs)
**Файл:** `TelegramLogs/index.jsx`
*   *Історія повідомлень.*

---

## ⚙️ 8. Адміністрування та Налаштування

### Сторінка: Налаштування (Settings)
**Файл:** `Settings/index.jsx`
*   *Використовує вкладки (Tabs):*
    *   AppearanceTab
    *   NotificationsTab
    *   MaintenanceTab
    *   PrivacyTab

### Сторінка: Системні Парки (System Parks) - Super Admin
**Файл:** `SystemParks/index.jsx`
**Модальні вікна:**
1.  **SystemParkFormModal** — Створення/Редагування парку (вкл. створення власника).
2.  **ConfirmationModal** — Відображення посилання на активацію.
3.  **FiltersModal** — Фільтрація.

### Сторінка: Тарифні плани (System Subscription Plans)
**Файл:** `SystemSubscriptionPlans/index.jsx`
**Модальні вікна:**
1.  **SystemSubscriptionPlanFormModal** — Налаштування тарифного плану (ціна за авто, статус).
2.  **FiltersModal** — Фільтрація.

### Сторінка: Функціонал підписок (System Subscription Features)
**Файл:** `SystemSubscriptionFeatures/index.jsx`
**Модальні вікна:**
1.  **SystemSubscriptionFeatureFormModal** — Налаштування фічі.

### Сторінка: Системні ролі (System Roles)
**Файл:** `SystemRoles/index.jsx`
**Модальні вікна:**
1.  **FiltersModal** — Фільтрація.

### Сторінка: Системні користувачі (System Users)
**Файл:** `SystemUsers/index.jsx`
**Модальні вікна:**
1.  **SystemUserFormModal** — Створення/Редагування звичайного користувача.
2.  **SystemRoverFormModal** — Розширене редагування для "гастролерів" (управління доступами до різних парків).
3.  **FiltersModal** — Фільтрація.

### Сторінка: Системний журнал розсилок (System Subscription Logs)
**Файл:** `SystemSubscriptionLogs/index.jsx`
*   *Тільки перегляд списків.*
**Модальні вікна:**
1.  **FiltersModal** — Фільтрація логів.

### Сторінка: Debug
**Файл:** `Debug.jsx`
*   *Інструментарій розробника (кнопки дій, включаючи тест сповіщень).*

---

## 👤 9. Особистий кабінет

### Сторінка: Профіль (Profile)
**Файл:** `Profile.jsx`
*   *Використовує вкладки (Tabs) для редагування даних та зміни паролю.*
*   **Вкладка "Інформація про парк":** Відображення тарифу та (для гастролерів) списку доступних парків з можливістю перемикання.

---

## 📈 10. Аналітика

### Сторінка: Статистика (Statistics)
**Файл:** `Statistics.jsx`
*   *Графіки та діаграми.*

---

## 🌐 11. Глобальні компоненти
**Компонент:** `NotificationBell.jsx` (New)
*   *Функціонал:* Відображення сповіщень у хедері.

**Компонент:** `GlobalTour`
*   *Конфігурація:* `tourConfig.js`
*   *Функціонал:* Забезпечує відображення віртуальних турів на сторінках (`/`, `/reports`).

---

## 🤖 12. Автоматизація та Звіти (Automation & Reports)

### `SendDailyPerformanceReport` (Команда)
**Призначення:** Щоденний звіт виконання нормативів.
**Функціонал:**
- Генерація HTML-звіту за попередній день.
- Відправка в Telegram-канал логів.
- Показники: Дохід, Поїздки, Активні авто, Деталізація по кожному авто.

### `SendDriverEarningsReport` (Команда)
**Призначення:** Щоденний фінансовий звіт по водіях.
**Функціонал:**
- Генерація HTML-звіту за попередній день.
- Відправка в Telegram-канал логів.
- Показники: Каса, Зарплата, Бонуси, Штрафи, До видачі.

### `SendCriticalMaintenanceReport` (Команда)
**Призначення:** Звіт про критичні прострочені ТО.
**Функціонал:**
- Генерація HTML-звіту.
- Відправка в Telegram-канал логів.
- Показники: Список авто з простроченими регламентними роботами.

### `SendHybridPerformanceReport` (Команда)
**Призначення:** Зведений звіт ефективності.
**Функціонал:**
- Генерація HTML-звіту за вказану дату.
- Відображення показників (Дохід, Поїздки) в розрізі День / Тиждень / Місяць.

---

## 🔌 13. API та Сервіси (New)

### Функціонал: Пульс парку (Park Pulse)
*   **Контролер:** `app/Http/Controllers/Api/ParkPulseController.php`
    *   *Призначення:* Обробляє запит `GET /api/v1/dashboard/pulse`.
*   **Сервіс:** `app/Services/ParkPulseService.php`
    *   *Призначення:* Агрегує погодинну статистику з різних сервісів (`DriverService`, `VehicleService`, `IssueReportService` та ін.) та формує дані для графіка.
*   **Компонент:** `resources/js/components/Dashboard/ParkPulseWidget.jsx`
    *   *Призначення:* React-компонент, що відображає віджет на головній панелі.
*   **Запит:** `resources/js/queries/parkPulse.js`
    *   *Призначення:* React Query хук `useParkPulse` для отримання даних з API.
*   **Сервіси-постачальники даних:**
    *   `app/Services/DriverService.php` (додано `getHourlyStats`)
    *   `app/Services/VehicleService.php` (додано `getHourlyStats`)
    *   `app/Services/IssueReportService.php` (додано `getHourlyStats`)
    *   `app/Services/VehicleMaintenanceService.php` (додано `getHourlyStats`)
    *   `app/Services/VehicleAssignmentService.php` (додано `getHourlyStats`)
    *   `app/Services/ManualTripService.php` (створено з `getHourlyStats`)
    *   `app/Services/VehicleMileageService.php` (додано `getHourlyStats`)
