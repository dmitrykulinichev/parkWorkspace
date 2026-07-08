# Звіти про технічний стан автомобіля — Plan

> Фіча: водій знімає фото стану авто та відправляє звіт через мобільний додаток.
> Адмін переглядає звіти у веб-кабінеті.
>
> **Scope цього плану:** тільки самостійна фіча, без прив'язки до передачі авто.
> Версія: 1.0 | Дата: 2026-07-08

---

## Статус виконання

| Шар | Прогрес |
|---|---|
| 1. Бекенд Driver API | ✅ 7 / 7 |
| 2. Мобільний додаток | ✅ 7 / 7 |
| 3. Бекенд веб-адмін | ✅ 4 / 4 |
| 4. Фронтенд веб-адмін | ✅ 5 / 5 |

Позначки: ✅ готово | 🔄 в процесі | ⬜ не розпочато | ❌ заблоковано

---

## Схема БД

```sql
vehicle_condition_reports
  id                    bigint unsigned PK
  park_id               bigint unsigned NOT NULL  -- ParkScope
  vehicle_id            bigint unsigned NOT NULL  FK vehicles
  user_id               bigint unsigned NOT NULL  FK users (водій що створив)
  type                  enum('general') default 'general'  -- зарезервовано для 'handover' пізніше
  status                enum('submitted','reviewed') default 'submitted'
  comment               text NULL
  reviewed_at           timestamp NULL
  reviewed_by_user_id   bigint unsigned NULL  FK users
  created_at, updated_at
```

Фото: поліморфний `File` (morphMany `files()`), той самий що у maintenance.
Ліміт: **10 фото** на звіт, max 10 MB кожне, тільки зображення.

---

## Ендпоінти Driver API

| Метод | URL | Опис |
|---|---|---|
| POST | `/driver/v1/condition-reports` | Створити звіт + завантажити фото (multipart) |
| GET | `/driver/v1/condition-reports` | Мої звіти (пагінація, найновіші першими) |
| DELETE | `/driver/v1/condition-reports/{id}` | Видалити свій звіт (тільки status=submitted) |

POST payload (multipart/form-data):
```
vehicle_id: int
comment:    string (optional)
files[]:    binary[] (1..10 файлів, jpg/png/webp)
```

---

## Ендпоінти веб-адмін API

| Метод | URL | Опис |
|---|---|---|
| GET | `/vehicle-condition-reports` | Список з фільтрами |
| GET | `/vehicle-condition-reports/{id}` | Деталі + файли |
| PATCH | `/vehicle-condition-reports/{id}` | Позначити як reviewed |
| DELETE | `/vehicle-condition-reports/{id}` | Видалити (адмін) |
| GET | `/vehicle-condition-reports/options` | Опції для фільтрів |

---

## 1. Бекенд Driver API ✅

- [x] **1.1** Міграція `2026_07_08_100000_create_vehicle_condition_reports_table.php`
- [x] **1.2** Модель `app/Models/VehicleConditionReport.php` — ParkScope, relations, accessors
- [x] **1.3** Resource `app/Http/Resources/VehicleConditionReportResource.php`
- [x] **1.4** Сервіс `app/Services/VehicleConditionReportService.php` — create/delete/markReviewed
- [x] **1.5** Контролер `app/Http/Controllers/Api/DriverApp/DriverConditionReportController.php`
- [x] **1.6** Роути в `routes/driver_app/driver.php`
- [x] **1.7** Документація `docs/DRIVER_APP_API_CONTRACT.md` §9 + `config/files.php`

---

## 2. Мобільний додаток ✅

- [x] **2.1** `@capacitor/camera ^7.0.5` — вже є
- [x] **2.2** Типи `ConditionReport`, `ConditionReportFile`, `ConditionReportStatus` → `types/index.ts`
- [x] **2.3** FleetApi: `getMyConditionReports`, `createConditionReport`, `deleteConditionReport`
- [x] **2.4** Hook `hooks/driver/useConditionReports.ts`
- [x] **2.5** `ConditionReportModal` — фото X/10, grid 3 кол., textarea, cancel/submit
- [x] **2.6** FAB: 5й пункт "Стан авто"; arc 150°→120°→90°→60°→30°
- [x] **2.7** `i18n/condition_reports.ts` uk+en; імпорт в `i18n.ts`

---

## 3. Бекенд веб-адмін ✅

- [x] **3.1** Контролер `app/Http/Controllers/Api/VehicleConditionReportController.php`
  - `index` — пагінація, фільтри (vehicle_id, status, date_from, date_to, search)
  - `show` — деталі з усіма відносинами
  - `update` — тільки `status: reviewed` через service->markReviewed
  - `destroy` — видалення адміном (будь-який статус)
  - `options` — vehicle_id + status для фільтрів

- [x] **3.2** `VehicleConditionReportResource` — вже є з Phase 1, підходить повністю

- [x] **3.3** Роути `routes/api/condition_reports.php` + підключено в `routes/api.php`

- [x] **3.4** Міграція прав `2026_07_08_200000_add_condition_reports_permission.php`
  - `condition-reports.view` + `deny:condition-reports.view`
  - Призначено Owner + Admin по кожному парку

---

## 4. Фронтенд веб-адмін ✅

- [x] **4.1** Сервіс `resources/js/services/vehicleConditionReportService.js`
  - `getReports(params)`, `getReport(id)`, `markReviewed(id)`, `deleteReport(id)`, `getOptions()`
  - Зареєстровано в `filterOptionsService.loaderRegistry` як `'condition-reports'`

- [x] **4.2** Хуки — вбудовані в сторінку (useState + apiClient, без окремого файлу хуків)

- [x] **4.3** Сторінка `pages/VehicleConditionReports/index.jsx`
  - Таблиця: Авто | Статус | Водій | Дата | Фото | Дії
  - submitted рядки — помаранчевий фон
  - Фільтри: vehicle_id, status, date_from/to через FiltersModal
  - Меню дій: Переглянути | Позначити переглянутим | Видалити

- [x] **4.4** Модалка `components/modals/vehicleConditionReports/VehicleConditionReportDetailModal.jsx`
  - Авто + водій + дата + статус chip
  - Фотогалерея grid 3 колонки, клік → full-size у новій вкладці
  - Коментар водія
  - Footer: "Позначити переглянутим" (якщо submitted) + "Закрити"

- [x] **4.5** Навігація
  - `NavigationItems.js` → FLEET_MENU_ITEMS: пункт "Стан авто" (`/vehicle-condition-reports`, `permission: 'condition-reports'`)
  - `App.jsx` → додано імпорт + `<Route path="vehicle-condition-reports" element={<VehicleConditionReports />} />`

---

## Відкриті питання (на майбутнє, не блокують MVP)

- [ ] Прив'язка до handover (`type: 'handover'`, `handover_id FK`)
- [ ] Telegram-нотифікація при новому звіті
- [ ] Порівняння "до/після" (два звіти для одного авто поряд)
- [ ] Водій може позначити конкретну проблему (категорія: кузов, скло, салон тощо)
- [ ] Автоматичний запит звіту від персоналу (push-нотифікація водієві)
