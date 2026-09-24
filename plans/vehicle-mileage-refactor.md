# Пробіг автомобілів — аудит і план рефакторингу

> Модуль керування пробігом (`VehicleMileageService` + суміжні контролери на вебі,
> мобільному застосунку водія та в Telegram-боті). Документ фіксує знахідки
> кодревʼю (бекенд, потім мобільний застосунок), план рефакторингу, окрему
> перевірку синхронізації з Telegram-каналом, план нової сторінки в СПА,
> та завершальні документацію й тести.
>
> Версія: 1.1 | Дата: 2026-08-13

---

## Статус

| Етап | Прогрес |
|---|---|
| 1. Кодревʼю бекенду | ✅ завершено |
| 2. Кодревʼю мобільного застосунку | ✅ завершено |
| 3. План рефакторингу | ✅ завершено |
| 4. Виконання рефакторингу | ✅ завершено (Фази 1-4) |
| 5. Перевірка синхронізації з Telegram-каналом | 🔄 код готовий, потрібна ваша ручна перевірка на живому парку |
| 6. Нова сторінка «Пробіг» (група «Автомобілі») — після рефакторингу | ✅ завершено |
| 7. Документація модуля | ✅ завершено |
| 8. Базові тести | ⏸️ свідомо відкладено (рішення користувача) |

Позначки: ✅ готово | 🔄 в процесі | ⬜ не розпочато

---

## Архітектура (як є)

**Модель:** `App\Models\VehicleMileageUpdate` — журнал усіх оновлень пробігу.
Поля: `vehicle_id`, `user_id`, `mileage`, `comment`, `reported_by_driver_id`,
`reported_at`, `source` (web/telegram/app), `telegram_message_id`, `telegram_chat_id`.
`ParkScope` глобальний скоуп.

**Денормалізоване поле:** `vehicles.mileage` — "поточний" пробіг, оновлюється
атомарно разом зі створенням запису в `VehicleMileageUpdate` всередині
`VehicleMileageService::updateMileage()` (єдине місце створення записів
у всьому коді — `grep -rn "VehicleMileageUpdate::create"` дає один збіг).

**Сервіс (ядро):** `App\Services\VehicleMileageService` (595 рядків):
- `updateMileage()` — базовий метод: `validateMileage()` (трейт
  `VehicleServiceHelpers`), запис в історію + `vehicles.mileage`, подія
  `ActivityLogEvent::mileageUpdate`, все в транзакції.
- `updateMileageFromWeb()` / `updateMileageFromTelegram()` /
  `updateMileageFromApp()` — обгортки для трьох джерел; `updateMileageFromApp()`
  додатково шле повідомлення в Telegram-групу з фічею `mileage`.
- `updateMileageFromSource()` — універсальний розпізнавач авто/користувача/водія
  для web/telegram шляхів.
- `getMileageHistoryForApp()` / `updateMileageRecordFromApp()` /
  `deleteMileageRecordFromApp()` — CRUD над власним записом для мобільного
  застосунку, дозволено лише `source=app`, не старіше 24 год.
- `notifyTelegramMileageGroup()` / `...Updated()` / `...Deleted()` — синхронізація
  Telegram-повідомлення при create/update/delete з застосунку.

**Два незалежні Telegram-механізми — легко сплутати:**
1. **Park-специфічна "фіча-група" пробігу** — `TelegramConfigService::getGroups()`,
   група з `features.mileage`, куди `notifyTelegramMileageGroup*()` шле
   картку "🚗 номер · пробіг · водій · дата". Саме це — "спеціальний канал"
   у сенсі вимоги нижче (Фаза 5).
2. **Системний "головний канал"** — `ActivityLogHandlerService::handleMileageUpdate()`
   (підписаний на ту саму подію `ActivityLogEvent::mileageUpdate`, яку кидає
   КОЖЕН виклик `updateMileage()`, незалежно від джерела) →
   `TelegramNotificationService::sendToMainChannel()`. Це загальний
   адмін-лог усіх дій системи (Uklon-синки, призначення водіїв тощо),
   не має нічого спільного з park-групою й не редагується/видаляється
   при зміні запису.

**Контролери:**
- Веб: `VehicleController::updateMileage()` / `mileageHistory()`
  (`routes/api/vehicles.php`).
- Мобільний застосунок водія: `DriverApp\DriverVehicleMileageController`
  (`routes/driver_app/driver.php`) — update/history/updateRecord/deleteRecord.
- Telegram-бот: `Bot\Processors\MileageProcessor` — розпізнавання пробігу
  в повідомленнях чату.

**Прямі звернення до моделі поза сервісом (тільки читання):**
`VehicleController::mileageHistory()`, `DriverScheduleController` (стрічка подій
графіка), `ReportingService`, `TestUklonOrdersStatsService`, `VehicleEconomicsService`,
`Vehicle::mileageUpdates()`/`latestMileageUpdate()`, `User::mileageUpdates()`.
Запис ізольований повністю — читання ні, кожен консьюмер сам формує запит.

---

## Знахідки — Бекенд

### 🔴 Критичні (correctness)

1. **`VehicleMileageService::updateMileageRecordFromApp()` (~р. 488) не синхронізує `Vehicle.mileage`.**
   Метод оновлює історичний запис, але ніколи не викликає `$vehicle->update(['mileage' => ...])`.
   Якщо водій редагує **найновіший** (поточний) запис пробігу за 24-годинне вікно —
   `vehicles.mileage` лишається зі старим значенням, а історія вже інша.
   Наслідок: наступне реальне подання пробігу валідується проти застарілої бази
   (`validateMileage()`), і будь-що, що читає `Vehicle.mileage` напряму
   (напр. `getLatestVehicleMileages()`), показує неправильне число.

2. **`VehicleMileageService::deleteMileageRecordFromApp()` (~р. 528) — та сама проблема при видаленні.**
   Видаляє запис без відновлення `Vehicle.mileage` до попереднього значення.
   Наслідок: "поточний пробіг" авто більше не підтверджений жодним записом в історії.

3. **Авторизаційна діра: будь-який водій в авто може редагувати/видаляти чужий запис.**
   `DriverVehicleMileageController::updateRecord()`/`deleteRecord()`
   (`app/Http/Controllers/Api/DriverApp/DriverVehicleMileageController.php:100`)
   перевіряють лише що заявник — **поточний** водій авто (`current_vehicle_id`),
   не що запис належить саме йому. Сервісні методи фільтрують лише по
   `vehicle_id`/`park_id`, без `reported_by_driver_id`. А
   `getMileageHistoryForApp()` явно повертає записи "від усіх водіїв, що сиділи
   в авто" — тобто інший водій, якому передали машину того ж дня, може
   відредагувати чи видалити запис попереднього водія (включно з тим, що вже
   опубліковане в Telegram).

4. **`VehicleMileageUpdate::getPreviousMileageAttribute()` (р. 142) забув `withoutGlobalScope(ParkScope::class)`.**
   На відміну від сусідніх `vehicle()`/`user()`/`reportedByDriver()` у тому ж
   файлі, де це явно задокументовано як потрібне для мультипаркових сторінок
   (CurrentPark може відрізнятись від park_id запису — напр. на "Графіку").
   Наслідок: на мультипаркових сторінках `previous_mileage`/`added_mileage`
   можуть повертати `null` або неправильне значення, хоча валідний попередній
   запис існує.

5. **`VehicleMileageUpdate::getAddedMileageAttribute()` (р. 161): falsy-перевірка замість null-перевірки.**
   `return $previous ? $this->mileage - $previous : null;` — легітимний
   попередній пробіг `0` трактується як "немає попереднього", повертає `null`
   замість реальної дельти.

6. **Веб (`source=web`) взагалі не дублюється в park-специфічну Telegram-групу пробігу — на відміну від мобільного застосунку.**
   `updateMileageFromWeb()` → `updateMileageFromSource('web', ...)` → базовий
   `updateMileage()` — і все, жодного виклику `notifyTelegramMileageGroup()`.
   Цей виклик є **тільки** всередині `updateMileageFromApp()`. Отже пробіг,
   доданий через СПА (`VehicleController::updateMileage()`), не потрапляє
   в park-групу з фічею `mileage` взагалі — лише в окремий системний
   "головний канал" (див. "Архітектура" вище), що не те саме і не те, що
   від нього, судячи з усього, очікується. Додатково: **на вебі немає
   жодного ендпоінту редагування/видалення запису пробігу** (`VehicleController`
   має лише `updateMileage()`/`mileageHistory()`) — тобто вимога "синхронно
   оновлюватися і видалятися" для СПА зараз не може виконуватись просто
   тому, що з СПА пробіг не можна відредагувати чи видалити. Детальний план
   перевірки — Фаза 5 нижче.

### 🟡 Продуктивність

7. **N+1 у `VehicleMileageService::getMileageHistoryForApp()` (р. 446).**
   `'added_km' => $r->added_mileage` викликається для кожного з до 50 записів,
   а сам accessor (`getAddedMileageAttribute` → `getPreviousMileageAttribute`)
   робить окремий SQL-запит. До ~50 зайвих запитів на один виклик історії —
   а це часто опитуваний мобільний ендпоінт.

### 🟢 Архітектура / maintainability

8. **`force=true` вимикає ВСЮ валідацію, а не тільки ліміт стрибка.**
   `VehicleMileageService::updateMileage()` (р. 58): при `metadata['force']`
   повністю пропускається `validateMileage()` — і перевірка на стрибок >5000км,
   і на від'ємний/спадний пробіг. Можливо, це і є задум "force" (довіра
   адміну), але варто явно вирішити й задокументувати, чи так і повинно бути.

9. **Дубльована логіка формування Telegram-повідомлень.**
   `notifyTelegramMileageGroup()` і `notifyTelegramMileageGroupUpdated()`
   (`VehicleMileageService.php:374` і далі) — майже ідентичний код побудови
   тексту повідомлення (емодзі-заголовок, номер/назва авто, пробіг, водій,
   дата, коментар), різниться лише заголовок. Зміна формату вимагає правок
   у двох місцях.

10. **`VehicleController::mileageHistory()` — фактично друга, розбіжна реалізація історії пробігу в контролері.**
   66 рядків: сам будує запит з пагінацією, сам рахує `previous_mileage`/`increase`
   через приватний метод `calculatePreviousMileageForUpdate()`, сам форматує
   11+ полів відповіді. Це бізнес-логіка, яка концептуально дублює
   (в іншій формі) `VehicleMileageService::getMileageHistoryForApp()` —
   дві незалежні, по-різному сформовані реалізації "історії пробігу" для
   одного й того ж джерела даних. Кандидат №1 на винесення в сервіс.

11. **Немає єдиної точки читання "поточного пробігу".**
    Різні консьюмери дістають "останній пробіг" по-різному: через денормалізоване
    `Vehicle.mileage`, через `VehicleMileageUpdate::orderBy('created_at')->first()`,
    через фільтр по `reported_at`. Не є жорстким порушенням (читання напряму —
    нормальна практика для Eloquent-проєкту), але саме через це неузгодженість
    (знахідки 1-2) непомітна — ніхто централізовано не звіряє
    `Vehicle.mileage` з фактичною історією.

---

## Знахідки — Мобільний застосунок

Три незалежні точки входу пробігу в мобільному застосунку:
- `AddMileageModal.tsx` (сторінка `/mileage`, `src/pages/driver/Mileage.tsx`) — подача нового показника, `PATCH /vehicles/{id}/mileage`.
- `EditMileageModal.tsx` — редагування власного запису за 24 год, `PATCH /vehicles/{id}/mileage-history/{recordId}`.
- `VehicleMileageModal.tsx` — прийом/передача авто (`VehicleAcceptModal`/handover), окремі ендпоінти
  `POST /vehicles/{id}/accept` і `/handover`, під капотом — `VehicleAssignmentService::updateMileageIfNeeded()`.

### 🔴 Критичні

1. **`EditMileageModal.tsx` і видалення в `Mileage.tsx` не оновлюють "поточний пробіг" на екрані — фронтенд-дзеркало бекенд-бага (Бекенд, п.1-2), і зламане незалежно від нього.**
   `AddMileageModal.tsx` (створення) робить усе правильно: `onSuccess` одразу
   викликає `setCurrentVehicle({ ...currentVehicle, mileage: data.mileage })`
   (оптимістичне оновлення) **і** інвалідовує `queryKeys.driverProfile.park(...)`.
   `EditMileageModal.tsx` (`onSuccess`, р. 62-66) і `deleteMutation` у
   `Mileage.tsx` (р. 77-84) інвалідовують **лише** `mileageHistory` — ігнорують
   `driverProfile`/`currentVehicle` повністю. Картка "Поточний пробіг" угорі
   ТІЄЇ Ж САМОЇ сторінки `/mileage` показує застаріле число одразу після
   редагування/видалення запису в списку під нею, аж доки користувач вручну
   не потягне pull-to-refresh (`useMileageHistory.refresh()` — єдине місце,
   де обидва запити рефетчаться разом, і це обхідний шлях, не фікс).
   **Важливо для фіксу:** наївне дзеркалення `AddMileageModal`'s підходу
   (`setCurrentVehicle({..., mileage: data.mileage})`) буде НЕПРАВИЛЬНИМ —
   `data.mileage` з `updateMileageRecord()` це пробіг ВІДредагованого запису,
   не обов'язково поточний пробіг авто (можна редагувати не найновіший запис).
   Правильний фікс: завжди інвалідовувати `driverProfile` й довіряти відповіді
   бекенду — але це працює тільки ПІСЛЯ фіксу Бекенд п.1-2 (бо зараз бекенд
   сам не перераховує `vehicles.mileage`).

2. **Немає перевірки послідовності/спадання при редагуванні — ні на клієнті, ні на сервері.**
   `AddMileageModal.tsx` (р. 84-87) явно забороняє `mileage < currentVehicle.mileage`.
   `EditMileageModal.tsx` перевіряє лише `mileage < 0` — жодного порівняння
   з сусідніми записами. На бекенді `updateMileageRecordFromApp()` взагалі
   не викликає `validateMileage()` (див. Бекенд, загальний опис). Разом:
   редагування запису може вільно створити неможливу послідовність пробігу
   (напр. середній запис стає більшим за пізніший), і ніщо це не зловить.

### 🟡 Архітектура / узгодженість

3. **Записи, створені через прийом/передачу авто, не мають `source` — і тому не мають бейджа в історії.**
   `VehicleAssignmentService::updateMileageIfNeeded()`/`updateVehicleMileage()`
   викликають `VehicleMileageService::updateMileage()` напряму з
   `metadata['updated_via'] = 'assignment_service'`, але ніколи не ставлять
   `metadata['source']`. У БД такі записи отримують `source = null`.
   `Mileage.tsx`'s `sourceLabel()`/`sourceColor()` (перемикач по
   `'app'|'bot'|'telegram'|'web'`) не показує для них жодного бейджа —
   випадає з єдиної системи позначень джерела. (Це коректно НЕ дозволяє
   редагування через застосунок — `can_edit` й так гейтиться на
   `source === 'app'` — гап тільки в **відображенні**.)

4. **Подвійна валідація при прийомі/передачі авто.**
   `VehicleAssignmentService::updateMileageIfNeeded()` явно викликає
   `$this->validateMileage()` (той самий трейт `VehicleServiceHelpers`)
   ПЕРЕД викликом `VehicleMileageService::updateMileage()`, який всередині
   викликає ту саму `validateMileage()` ще раз. Не баг (те саме правило
   обидва рази), але зайва робота, і зовнішня гілка обробки помилки —
   фактично мертвий код, бо внутрішня зловить те саме.

---

## План рефакторингу

Фази впорядковані за ризиком/цінністю: спершу цілісність даних (те, що вже
зараз тихо ламає показники), потім узгодженість клієнта, потім
продуктивність, і насамкінець — архітектурне прибирання, яке не змінює
поведінку, лише чистить структуру.

### Фаза 1 — Цілісність даних (бекенд, критично) ✅ завершено

- [x] `updateMileageRecordFromApp()`/`deleteMileageRecordFromApp()`: після
      редагування чи видалення завжди перераховувати `vehicles.mileage` з
      фактичної історії (`resyncVehicleCurrentMileage()` — найновіший
      запис за `created_at`, не тільки коли редагований/видалений запис
      "здогадно" був найновішим — простіше й самокоригувальне рішення).
      В одній транзакції з самою зміною запису. Якщо після видалення
      історія авто порожня — `vehicles.mileage` свідомо не чіпається
      (немає жодного запису, яким підтвердити нове значення).
- [x] Додано `validateSequentialMileage()` — edit-специфічна перевірка:
      новий пробіг має лишатись між сусіднім попереднім і наступним
      записом (по `created_at`), без порівняння з `vehicles.mileage` і без
      ліміту стрибка (це не має сенсу для довільного історичного запису,
      на відміну від `validateMileage()`, яка лишилась для НОВИХ подань).
- [x] `VehicleMileageUpdate::getPreviousMileageAttribute()` — додано
      `withoutGlobalScope(ParkScope::class)`.
- [x] `VehicleMileageUpdate::getAddedMileageAttribute()` — `$previous ? ... : null`
      замінено на `$previous !== null ? ... : null`.
- [x] Авторизація: `updateMileageRecordFromApp()`/`deleteMileageRecordFromApp()`
      тепер перевіряють `(int) $record->reported_by_driver_id === $driver->id`,
      повертають `FORBIDDEN_OWNER` при невідповідності.

**Перевірено на реальних даних парку, у транзакції з відкатом (без постійних
змін):** редагування найновішого запису → `vehicles.mileage` оновлюється;
видалення найновішого запису (з 2+ записами) → `vehicles.mileage`
відкочується до нового найновішого; чужий водій → `FORBIDDEN_OWNER` на
обох операціях; редагування нижче сусіднього попереднього запису →
`SEQUENCE_VALIDATION`. Усі 4 сценарії підтвердились коректною поведінкою.

### Фаза 2 — Узгодженість мобільного клієнта ✅ завершено

- [x] `EditMileageModal.tsx`: `onSuccess` тепер інвалідовує
      `queryKeys.driverProfile.park(activeParkId)` разом з `mileageHistory`
      (без оптимістичного `setCurrentVehicle` — свідомо, бо `data.mileage`
      з відповіді це пробіг відредагованого запису, не обов'язково поточний).
- [x] `deleteMutation` у `Mileage.tsx` — додано ту саму інвалідацію `driverProfile`.
- [x] `EditMileageModal.tsx`: додано `findNeighbors()` — клієнтська перевірка
      по вже завантаженій `history` (пропси прокинуті з `Mileage.tsx`),
      попередній/наступний сусід по `created_at`, той самий принцип, що
      серверна `validateSequentialMileage()` з Фази 1. Нові ключі перекладу
      `mileage.error_more` (uk/en) для верхньої межі.

`npx tsc --noEmit` — чисто, 0 помилок.

### Фаза 3 — Продуктивність ✅ завершено

- [x] `getMileageHistoryForApp()` — `added_km` тепер рахується по копії
      `$records`, відсортованій за `created_at` (те саме поле, що й
      `getPreviousMileageAttribute()`), без виклику акцесора взагалі —
      з ~50 запитів до 0 додаткових на список історії.
      **Відомий і прийнятний компроміс:** для найстарішого запису В МЕЖАХ
      вибірки (`limit(50)`) `added_km` буде `null`, навіть якщо реальний
      попередній запис існує за межами вікна.

**Перевірено на реальних даних** (авто зі 50+ записами, порівняння з
результатом старого акцесора для кожного запису в межах вікна): 49 з 50
співпали точно; єдина розбіжність — саме задокументований крайній
випадок (найстаріший запис вибірки, попередній запис якого дійсно поза
вікном), не помилка.

### Фаза 4 — Архітектурне прибирання (без зміни поведінки) ✅ завершено

- [x] `VehicleController::mileageHistory()` тепер лише HTTP-обгортка;
      уся логіка (запит + пагінація + `previous_mileage`/`increase`/
      форматування) — у новому `VehicleMileageService::getFormattedHistoryForWeb()`.
      Бонус: та сама falsy-vs-null помилка, що в Фазі 1, була і тут
      (`$previousMileage ? ... : null`) — виправлено заразом. Перевірено на
      реальних даних — відповідь той самий формат (усі поля), фронтенд
      (`UpdateMileageModal.jsx`) нічого не змінює.
- [x] `notifyTelegramMileageGroup()`/`notifyTelegramMileageGroupUpdated()`
      тепер користуються спільним `buildMileageTelegramText()` — різняться
      лише заголовком, як і раніше. Перевірено рефлексією — текст ідентичний.
- [x] `force` **лишили** дозволяти обхід "спад"/"стрибок >5000км" —
      з'ясувалось, що це навмисно: фронтенд (`VehicleAssignmentFormModal.jsx`,
      `useUpdateMileage.js`) має конфлікт-діалог 409 → "ви впевнені?" →
      повтор з `force=true` саме для цих двох випадків. Єдина реальна
      діра — `force` заодно обходив і перевірку на **від'ємний** пробіг,
      що ніколи не має сенсу форсувати; це виправлено, решта поведінки
      `force` не змінена. Перевірено на реальних даних: negative+force
      блокується, decrease+force проходить.
- [x] `VehicleAssignmentService::updateMileageIfNeeded()` — прибрано
      дублюючий явний виклик `validateMileage()`; `updateMileage()`
      всередині і так валідує тим самим трейтом. Заразом уніфікувало форму
      результату помилки (раніше два різні формати залежно від того, де
      саме валідація впала).
- [x] Додано `metadata['source'] = 'assignment'` у
      `updateMileageIfNeeded()` (веб-гілка) і `updateVehicleMileage()`.
      Мобільний `Mileage.tsx`: новий бейдж `sourceLabel()`/`sourceColor()`
      + ключі перекладу `mileage.source_assignment` (uk/en) +
      `MileageRecord['source']` union type розширено.

`php -l` чисто на всіх торкнутих файлах бекенду, `npx tsc --noEmit` — 0 помилок на мобільному.

---

## Фаза 5 — Перевірка синхронізації з Telegram-каналом

**Вимога (сформульована окремо):** усі записи пробігу, додані через СПА
або мобільний застосунок, мають дублюватись у park-специфічну
Telegram-групу з фічею `mileage`, і синхронно оновлюватись/видалятись
у ній при редагуванні/видаленні запису.

**Поточний стан за результатами статичного аналізу (Бекенд, п.6) —
підлягає підтвердженню, не тільки виправленню:**

| Джерело | Створення → повідомлення в групу | Редагування → правка повідомлення | Видалення → видалення повідомлення |
|---|---|---|---|
| Мобільний застосунок (`app`) | ✅ `notifyTelegramMileageGroup()` | ✅ `notifyTelegramMileageGroupUpdated()` | ✅ `notifyTelegramMileageGroupDeleted()` |
| СПА / веб (`web`) | ❌ немає виклику взагалі | — (нема ендпоінту редагування) | — (нема ендпоінту видалення) |
| Telegram-бот (`telegram`) | н/з — запис і так з'явився через сам чат, дублювання може бути недоречним | н/з | н/з |

- [x] **Вирішено:** дублювання з СПА потрібне — це прямо сформульована
      вимога користувача ("усі пробіги додані в СПА або через моб додаток
      повинні дублюватися... в спеціальний телеграм канал"), не припущення.
- [x] Додано виклик `notifyTelegramMileageGroup()` у `updateMileageFromWeb()`.
      `notifyTelegramMileageGroup()` тепер приймає `string $personName`
      замість обов'язкового `Driver $driver` (на вебі водій не завжди
      відомий) — пріоритет: явно вказаний водій запису
      (`$mileageUpdate->reportedByDriver`), інакше ім'я співробітника, що
      вніс запис. Заголовок картки для вебу — `💻 <b>Веб</b>` (замість
      `📱 <b>Додаток</b>` для мобільного) — джерело видно прямо в Telegram.
- [x] **Перевірено безпечно, без реального відправлення:** підмінив
      `TelegramApiService` і `CurrentPark` у транзакції з відкатом,
      прогнав `updateMileageFromWeb()` — виконується без винятків,
      `success=true`. У цьому дев-оточенні жоден парк не має активної
      групи з фічею `mileage`, тож реальний виклик `sendMessage()` не
      спрацьовує в жодному сценарії (гейт `isIntegrationActive()`/пошук
      групи відпрацьовує коректно, як і раніше для мобільного шляху).
- [x] Синхронне редагування/видалення з СПА — тепер можливе: Фаза 6
      додала веб-CRUD (сторінка «Пробіг»), і його мутації одразу
      використовують `notifyTelegramMileageGroupUpdated()`/`...Deleted()`.
- [ ] **Залишається зробити:** ручна перевірка на РЕАЛЬНІЙ Telegram-групі
      живого парку (create → картка з'явилась і саме з заголовком `💻 Веб`;
      майбутнє edit/delete з Фази 6 → повідомлення редагується/зникає).
      Це свідомо не робилось автоматично — реальне надсилання повідомлення
      в чужий Telegram-чат є видимою для інших дією, підтверджується вами
      на живих даних, а не мною в фоні.

---

## Фаза 6 — Нова сторінка «Пробіг» у СПА (група меню «Автомобілі») ✅ завершено

- [x] Пункт меню «Пробіг» у `FLEET_MENU_ITEMS`, поруч з "Недоступності" —
      `resources/js/components/Navigation/NavigationItems.js`.
- [x] Бекенд: `VehicleMileageService::getParkWideHistory()` — пагінований
      список по всьому парку, N+1-безпечний `added_km` (групування по
      `vehicle_id` в межах сторінки — записи різних авто йдуть впереміш).
      `VehicleMileageController` (index/options/update/destroy),
      роути під `/api/v1/vehicle-mileage`.
- [x] Staff-CRUD без обмежень мобільного шляху:
      `updateMileageRecordAsStaff()`/`deleteMileageRecordAsStaff()` —
      будь-який запис, без 24-годинного вікна й без прив'язки до автора,
      але з тією самою `validateSequentialMileage()` і обов'язковим
      `resyncVehicleCurrentMileage()`. Заразом синхронізують Telegram
      (`notifyTelegramMileageGroupUpdated()`/`...Deleted()` з заголовком
      `💻 Веб ✏️`) — закриває залишок Фази 5 (синхронне
      редагування/видалення тепер можливе, бо з'явився сам ендпоінт).
- [x] Фільтри: авто, водій, джерело (усі/додаток/веб/бот/призначення),
      період — `DateRangeFilter` + `Select` + `SegmentedControl`,
      той самий патерн, що `/driver-deposits`.
- [x] Permission: `vehicles.mileage.view` (+ `deny:`), той самий патерн,
      що інші розділи "Автомобілі" (`vehicles.maintenance` тощо) —
      Owner + Admin по кожному парку.
- [x] Модалка редагування (`VehicleMileageRecordModal`) — мілідж,
      дата/час, коментар; помилки читає з `err.errors`/`err.message`
      напряму (той самий фікс, що в Фазі 2 мобільного, застосований
      одразу тут, а не як окремий баг).

**Перевірено:** `getParkWideHistory()`/`options()` на реальних даних
(2558 записів, 12 авто, 32 водії в тестовому парку) — коректний формат.
`npx vite build` — чисто, новий чанк `VehicleMileage-*.js` без помилок.

---

## Фаза 7 — Документація модуля ✅ завершено

- [x] Створено `app/Http/Controllers/Api/doc/VehicleMileageService.md`
      (за форматом `DriverEconomyCalculator.md`): огляд, усі публічні
      методи (включно з новими `getParkWideHistory()`/`*AsStaff()` з Фази 6),
      інваріант `vehicles.mileage`, правила `force` й `validateSequentialMileage()`,
      таблиця Telegram-синхронізації по джерелах (стан після Фази 5),
      застереження про два різні формати DTO (`getFormattedHistoryForWeb()`
      проти `getParkWideHistory()`) — щоб їх не плутали при майбутніх правках.
- [x] Doc-мітки на сторінках/модалках: нові файли (`VehicleMileage/index.jsx`,
      `VehicleMileageRecordModal.jsx`) вже мають повні `@doc-page`/`@doc-modal`
      блоки, написані одразу при створенні в Фазі 6. Мобільні файли, які
      торкнулись у Фазі 2 (`Mileage.tsx`, `EditMileageModal.tsx`), мають
      лише простий `// i-doc: Name` (мобільна конвенція, без структурованих
      `@doc-*` полів) — не змінювались, бо їхня "особистість"/призначення
      компонента не змінилась, лише внутрішня логіка.
- [x] `workspace/user-docs2/_data/` — це **автогенерована** документація
      (`.md`-файли зі скріншотами/селекторами, що читають ті самі `@doc-*`
      блоки з коду) — не редагується вручну. Нові доk-мітки в коді (вище)
      підхоплюються існуючим генератором; вручну нічого дописувати не
      потрібно й не варто (перезапишеться, розійдеться з кодом).

## Фаза 8 — Базові тести

⏸️ **Свідомо відкладено** — за рішенням користувача 2026-08-13, поки не
робимо. Чекліст лишається нижче на майбутнє.

- [ ] Feature-тест: редагування найновішого запису пробігу через
      `updateMileageRecordFromApp()` → `vehicles.mileage` оновлюється.
- [ ] Feature-тест: видалення найновішого запису → `vehicles.mileage`
      відкочується до нового найновішого запису, що лишився.
- [ ] Feature-тест: водій A не може відредагувати/видалити запис,
      залишений водієм B (авторизаційна перевірка з Фази 1).
- [ ] Unit-тест на `VehicleMileageUpdate::getAddedMileageAttribute()` —
      попередній пробіг `0` дає дельту, а не `null`.
- [ ] Unit/feature-тест на `getPreviousMileageAttribute()` в мультипарковому
      контексті (інший `CurrentPark`, ніж `park_id` запису).
- [ ] Feature-тест: `validateMileage()` в `updateMileage()` справді блокує
      від'ємний/абсурдний пробіг, і `force=true` свідомо обходить саме те,
      що задокументовано (не більше і не менше).
- [ ] Feature-тест: staff-CRUD (`updateMileageRecordAsStaff()`/
      `deleteMileageRecordAsStaff()`, Фаза 6) працює без обмежень 24 год/
      власника — на відміну від мобільних методів.
