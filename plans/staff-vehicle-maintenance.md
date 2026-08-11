# Обслуговування авто в режимі персоналу (мобільний додаток)

Список/додати/редагувати/видалити заїздів на сервіс (з кількома роботами на заїзд,
як на вебці `/vehicle-maintenance`), через окремий контролер, що працює через вже
наявний `VehicleMaintenanceService`.

## Статус

**Готово повністю** — базова версія (список/CRUD) + друга ітерація за фідбеком
користувача (фільтри, детальний перегляд, аватарки, CSV-експорт, speed-dial FAB,
таб-бар, персистентність фільтрів).

## Друга ітерація (фільтри, деталі, UX-полірування)

- [x] Бекенд: `vehicle_id`/`date_from`/`date_to` фільтри на `index()` — обов'язково
  на сервері (клієнтський список обмежений 200 записами, дата-фільтр міг би
  "загубити" старіші дані)
- [x] Бекенд: `avatar_url` користувача в `VehicleMaintenanceGroupResource` (+ demo-маска)
  + eager-load `user.avatar` (уникнення N+1)
- [x] Тест на нові фільтри (`test_list_filters_by_vehicle_and_date_range`)
- [x] Верхній `StickyBar`: фільтр по авто через `FiltersModal` + CSV-експорт (кнопка share)
- [x] Нижня стікі-панель періоду (`PeriodFilterBar`) — **один рядок**: поле «З»,
  поле «По» (кожне окремо через `DatePickerModal`) + кнопка «⋮» (`IonPopover`)
  зі швидкими інтервалами сьогодні/тиждень/місяць. Без стрілок вліво-вправо
  (це навмисно, на відміну від `DateNavBar`). Дефолт — поточний місяць.
  Проміжна версія (2-рядкова, з окремою `DateRangeModal`) — відхилена
  користувачем як "накидано в купу", перероблена в 1 рядок.
- [x] Обидві панелі (верхня/нижня) ховаються при скролі в протилежних напрямках
  — виявилось що забув `scrollEvents`/`onIonScroll` на `IonContent`, виправлено
  + доданий `resetScroll()` в `useIonViewWillEnter` (як на `/staff/vehicles`)
- [x] Список: гроші перед часом (гроші важливіші), аватар користувача (або
  ініціали) замість статичної іконки зліва — іконку прибрано за фідбеком
  ("краде місце в рядку")
- [x] `MaintenanceRecordDetailModal` — тап по рядку відкриває деталі: авто (з
  іконкою для краси), пробіг, дата, загальна вартість, коментар, таблиця робіт
  з бейджами ТО/Ремонт, хто додав (аватар) — з кнопками Редагувати/Видалити
- [x] CSV-експорт (`buildMaintenanceCsv` в `utils/csvExport.ts`) — за
  аналогією зі `staff/earnings`
- [x] `QuickAddFab`: staff тепер повноцінний speed-dial (не пряма дія) — 3
  кнопки по дузі: Обслуговування (реальна дія) + 2 заглушки (Виплата, Новина
  — показують тост "скоро")
- [x] Таб-бар: позиція 5 тепер mode-conditional — driver бачить «Інфо», staff
  бачить «Ремонт» (`/staff/maintenance`), замість спільної кнопки Info
- [x] Усі фільтри (пошук, авто, період) персистяться між навігаціями — той
  самий патерн модульної змінної, що й `_cachedSearch` у `VehiclesStaff.tsx`
- [x] Тема: `.period-filter-field`/`-kebab` використовують
  `var(--ion-item-background, var(--ion-background-color))` замість
  `--ion-color-light` (який НЕ адаптується під темну тему в цьому проєкті —
  перевірено через `DateNavBar.css`, там теж уникають `--ion-color-light` для
  постійного фону)
- [x] `tsc --noEmit` чисто, `npm run build` успішний, 42 бекенд-тести проходять

## Файли другої ітерації

**Бекенд:**
- `app/Http/Controllers/Api/DriverApp/DriverStaffMaintenanceController.php` — фільтри в `index()`, `user.avatar` eager-load
- `app/Http/Resources/VehicleMaintenanceGroupResource.php` — `avatar_url`
- `tests/Feature/DriverApp/DriverStaffMaintenanceApiTest.php` — новий тест

**Фронтенд:**
- `src/components/ui/PeriodFilterBar.tsx` + `.css` — нова, нижня панель періоду (1 рядок + popover)
- `src/components/staff/MaintenanceRecordDetailModal.tsx` — нова, перегляд заїзду
- `src/pages/staff/MaintenanceStaff.tsx` — фільтри, layout рядка, tap-to-view, CSV, персистентність
- `src/utils/csvExport.ts` — `buildMaintenanceCsv`
- `src/components/quickadd/QuickAddFab.tsx` + `.css` — staff speed-dial (3 кнопки)
- `src/App.tsx` — таб-бар позиція 5 mode-conditional
- `src/types/index.ts`, `src/services/FleetApi.ts`, `src/hooks/util/queryKeys.ts`,
  `src/hooks/staff/useStaffMaintenance.ts` — фільтри в query key/hook/API-виклику
- `src/i18n/maintenance_staff.ts`, `src/i18n/sos.ts` (quick_add ключі) — нові переклади

**Видалено:** `src/components/ui/DateRangeModal.tsx` (проміжна версія, замінена на 1-рядковий інлайн-дизайн)

## Верифікація (виконано)

- 42/42 бекенд-тести проходять (`php artisan test --filter=DriverApp`)
- `tsc --noEmit` — чисто
- `npm run build` — успішний, `MaintenanceStaff` в окремому lazy-chunk

## Не виконано

- Ручна клікова перевірка в браузері — користувач тестує сам на
  `localhost:5173/staff/maintenance` проти локального бекенду
  (`localhost:8010` + прод-дамп в БД `park`)
