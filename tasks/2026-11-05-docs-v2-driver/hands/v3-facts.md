# v3 facts — «Записи за зміну» (driver, simple mode)

Paths below are relative to `kmp/shared/src/commonMain/kotlin/ua/g24/park/driver/shared/` (code)
and `kmp/shared/src/commonMain/composeResources/values/strings.xml` (S:line). Checked 2026-11-10.

IMPORTANT: several domain docs (`kmp/docs/domain/*.md`, "Редагування й видалення — лише онлайн",
fuel/expense "видалення з підтвердженням") are STALE. Code + ADR 0010/0012 (2026-10-15) win:
delete/edit go through the offline queue with a 5 s «Скасувати» toast, no confirm dialogs.

## 1. The «+» button

- It is NOT only on Home: it's a floating centre button over the bottom tab bar on every driver
  screen (MainShell, `ui/main/MainShell.kt:558-570`). Tabs: Головна · Графік · [+] · Авто · Інфо
  (or Таксі when taxi is enabled) (`MainShell.kt:176-195`; S:33-36, S:1066).
- Accessibility label «Додати» (S:52). Tap → radial arc menu above the button; icon turns to ✕.
- Items, left→right on the arc (`ui/quickadd/QuickAddFab.kt:50-56`):
  1. **Рука** (S:53) 2. **Пробіг** (S:54) 3. **Звернення** (S:55) 4. **Витрата** (S:56) 5. **Заправка** (S:57)
  NB: the issue item is labelled «Звернення», not «Проблема» (only a code comment calls it "Проблема").
- Hidden/blocked conditions:
  - **No vehicle assigned** → menu does not open; warning toast «Вам не призначено автомобіль.
    Додавання недоступне.» (S:59). If the driver's car is held in another park → «Здайте автомобіль в
    парку «{park}», щоб продовжити» (S:58). Applies to ALL items incl. Витрата (`QuickAddFab.kt:86-113`).
  - **Driver's own settings**: Налаштування → «Основна кнопка» (S:355) — switch per action; hint
    «Дії, які показує кнопка «+». Хоча б одна має лишитись.» (S:356); last visible one can't be
    switched off (`ui/settings/SettingsScreen.kt:188-195, 233-260`). Only shown for driver mode.
  - FAB hidden while the side menu is open and while a **taxi order** is active (`MainShell.kt:563-566`).
  - **Offline**: not hidden; all 5 forms work offline (queue). No feature flags on items.
  - Staff mode has a different FAB (Обслуговування/Додати водія/…), out of scope.

## 2. Forms

Common to all create sheets: bottom-sheet with car header (photo/plate) of current car (except Витрата);
footer: «Історія» (opens the list), «Скасувати» (closes sheet, nothing saved), submit button.
Validation messages appear as a yellow notice at the bottom. On save the sheet closes immediately, the
app opens the record's history list, and a green toast with «СКАСУВАТИ» appears (see §4).
Offline: the same toast text is replaced by «Збережено. Відправиться, щойно з'явиться зв'язок» (S:480)
(`ui/common/QueuedSubmit.kt:94-104`).

### Рука — `ui/quickadd/AddManualTripSheet.kt`
- Title «Додати поїздку» (S:62). Submit «Зберегти» (S:71), cancel «Скасувати» (S:72).
- «Сума поїздки*» (S:63), suffix «грн», **prefilled 100** (`:91`), whole numbers only.
- Toggle «Додатково» / «Сховати додаткові поля» (S:79-80) — hidden by default (not remembered between launches):
  «Дата» + «Час» (default now; picker limited to today and 2 days back, `:186-195`),
  «Пробіг (км)» (optional, decimal; distance of the trip, not odometer) (S:65), «Коментар» placeholder
  «Деталі поїздки...» (S:68,70).
- Validation (`:115-133`): «Вкажіть коректну суму» (S:74), «Не можна додавати майбутні поїздки» (S:75),
  «Можна додавати поїздки не старіші 2 діб» (S:76).
- Toast «Поїздку успішно додано» (S:73). Appears in «Рука» list and in Home tile «Рука сьогодні» (S:244).
- If driver wasn't assigned to the car at that time, server answers "needs confirmation" → record in
  list marked «Потрібне підтвердження: …» with menu «Зберегти все одно» (S:482, 491).

### Пробіг — `ui/quickadd/AddMileageSheet.kt`
- Title «Оновити пробіг» (S:83). Submit «Зберегти», cancel «Скасувати».
- One big field in «км», **prefilled with car's current mileage** (`:83`), digits grouped; submit
  disabled if empty (`:145`).
- «Додатково»: «Дата»/«Час» (default now) + comment, placeholder «Наприклад: після рейсу Київ–Харків» (S:87).
- Validation (`:106-121`): «Вкажіть коректний пробіг» (S:91); **«Пробіг не може бути меншим за N км»**
  (S:92, N = current car mileage); «Не можна вказати майбутній час» (S:93).
- Toast «Пробіг оновлено» (S:90). Shown in «Пробіг» list; Home tile «Пробіг сьогодні · Не передано»
  (S:246-247) shown only while today's reading is missing (`ui/home/HomeScreen.kt:131,174-182`).
- Server may reject a decrease or implausible jump → «Не збережено: …» in the list.

### Заправка — `ui/quickadd/AddFuelSheet.kt`
- Title «Нова заправка» (S:134). Submit «Зберегти», cancel «Скасувати».
- «Тип палива» (S:135) segmented choice — only types of the car; if the car has one type it's chosen
  silently and shown as a chip (`:98-113, 206-226`).
- «Обсяг (л)» (S:136) required, decimal; «Вартість (грн, необов'язково)» (S:137) optional.
- Toggle «Дата, пробіг» / «Сховати» (S:140-141): «Пробіг (км)» (S:138) prefilled with car mileage,
  hint «Не менше N км, це останній відомий пробіг» (S:212, red if lower); «Дата та час» (S:139).
- Submit enabled only when volume > 0 and type chosen (`:195`). Validation (`:138-170`):
  «Введіть обсяг більше 0» (S:145), «Обсяг — не більше 300 л» (S:146, max 300 `:284`),
  «Введіть вартість більше 0» (S:147), «Оберіть тип палива» (S:148), «Пробіг не може бути меншим за N км».
- No date-in-future check on client for fuel. No receipt photo anywhere.
- Toast «Заправку додано» (S:144). Appears in «Заправки» list.

### Витрата — `ui/quickadd/AddExpenseSheet.kt`
- Title «Нова витрата» (S:105). Submit **«Надіслати»** (S:114), cancel «Скасувати». No car header.
- «Сума (грн)» (S:107) required >0, decimal; «Що це за витрата» (S:109) required, ≥3 chars,
  placeholder «Наприклад: паркування, антифриз, мийка...» (S:110).
- Hint under field: «Витрата потрапить у виплату після погодження менеджером.» (S:106).
- Toggle «Дата» / «Сховати» (S:112-113) → «Дата та час» (default now; no future check in code).
- Validation: «Введіть суму більше 0» (S:117), «Опишіть витрату детальніше» (S:118); button disabled until valid (`:153`).
- Toast «Витрату додано — вона врахується у виплаті після погодження менеджером» (S:116).
- List shows badge «Очікує погодження» / «Погоджено» (S:125-126).

### Звернення — `ui/quickadd/AddIssueSheet.kt`
- Title «Нове звернення» (S:98). Submit **«Надіслати»** (S:100), cancel «Скасувати».
- Single text field, placeholder «Опишіть проблему або питання стосовно автомобіля...» (S:99); ≥3 chars,
  button disabled until then (`:51, 96-105`). No photo, no category. Time = moment of creation.
- Toast «Звернення надіслано» (S:102). Appears in «Звернення» list (current car only) and Home tile
  «Мої відкриті звернення» (S:257).
- Statuses in list: Новий / Потребує уточнення / Створено задачу / Відхилено / Вирішено негайно /
  Вирішено через задачу (S:1177-1182); staff comment shown as «Коментар: …» (S:471).

### Offline behaviour (all 5)
- Saved locally first, visible in the list at once; sent after the 5 s undo window (ADR 0008).
  While not accepted, row shows «Очікує відправки» (S:481) + ↻ «Відправити повторно» (S:492).
- Server refusal → «Не збережено: причина» (S:483) + «Не буде відправлено — натисніть, щоб дізнатися
  більше» (S:484); tap → dialog «Запис не збережено» / «Сервер не прийняв цей запис: …» with
  «Відправити повторно», «Видалити», «Закрити» (S:485-493). Global toast «Запис не прийнято: …» (S:495).
- Home shows red banner «Не збережено записів: N» / «Сервер їх не прийняв…» (S:489-490), tap → list.
- Pending row menu: «Зберегти все одно» (only if needs confirmation) and «Видалити» (`ui/common/history/PendingRow.kt:161-166`). No editing of pending rows.

## 3. Where records live; edit & delete
- Lists: side menu (☰) section **«Мої записи»** (S:823): Рука, Пробіг, Звернення, Витрати, Заправки
  (`ui/main/AppDrawer.kt:130-134`; S:446,454,463,119,149). Also via «Історія» in each sheet and Home tiles
  (Рука сьогодні → Рука; Пробіг сьогодні → Пробіг; Мої відкриті звернення → Звернення).
- Lists grouped by day pills «Сьогодні»/«Вчора»/«5 листопада» (S:497-500); pull-to-refresh; offline shows
  «Збережені дані · оновлено …» (S:24).
- **Tap the card** → dropdown with edit / delete. If the record is no longer editable, the card is not
  tappable (no menu at all).
- Edit windows:
  | Record | Labels | Window |
  |---|---|---|
  | Рука | «Редагувати поїздку» / «Видалити поїздку» (S:448-449) | 12 h from trip date/time, client rule (`ui/manualtrip/ManualTripsViewModel.kt:101-102,138`) |
  | Пробіг | «Редагувати запис» / «Видалити» (S:456-457) | 12 h from creation, only readings entered in the app (not bot/handover) — server `VehicleMileageService.php:589` |
  | Звернення | «Редагувати звернення» / «Видалити звернення» (S:473-474) | status «Новий» AND ≤12 h (`IssueReportService.php:1183-1186`) |
  | Витрата | «Редагувати» / «Видалити» (S:123-124) | 24 h from creation and not yet approved |
  | Заправка | «Редагувати» / «Видалити» (S:152-153) | 24 h from creation |
- Only own records in practice (lists are driver's own; Пробіг/Звернення lists are per current car;
  Звернення list also shows staff-created issues of that car — not editable).
- Edit sheets: «Редагувати поїздку» (all fields visible, date only "not in future", no 2-day limit;
  car can't be changed), «Редагувати запис» (mileage must be between previous and next reading:
  «Пробіг не може бути більшим за N км (наступний запис)» S:460), «Редагувати звернення» (text only),
  «Редагувати витрату» (S:121, submit «Зберегти»), «Редагувати заправку» (S:151; no "not less than
  current mileage" check). Submit «Зберегти», cancel «Скасувати».
- Edit toasts (with СКАСУВАТИ): «Поїздку успішно оновлено», «Запис оновлено», «Звернення оновлено»,
  «Витрату оновлено», «Заправку оновлено» (S:450,458,466,127,154).
- **Delete: immediate, NO confirmation dialog**; toast with СКАСУВАТИ: «Поїздку видалено», «Запис
  видалено», «Звернення видалено», «Витрату видалено», «Заправку видалено» (S:451,459,467,128,155).
  (`*ViewModel.delete` KDoc: "Видалення одразу, без «Ви впевнені?»".)
- Offline: delete works for all; edit works offline for Рука/Пробіг/Звернення, but «Редагувати» is
  **disabled offline for Витрати and Заправки** (`ui/expense/ExpensesScreen.kt:158`, `ui/fuel/FuelScreen.kt:156`).
- Server can still refuse edit/delete later (window passed, issue already in work, staff changed it in
  cabinet) → record returns to original, toast «Запис не прийнято: …».

## 4. «Скасувати»
Two different things:
1. Button «Скасувати» in every sheet = close the form without saving.
2. **Undo toast** after save / edit / delete: bottom bar (above tabs), message + «↶ СКАСУВАТИ»,
   a filling timer bar, **5 seconds** (`domain/sync/PendingWrite.kt:14` UNDO_WINDOW_MS = 5_000;
   `ui/common/notice/Notice.kt:104-118,150-205`). Tap anywhere on the bar = undo.
   - New record: undo removes it from the phone; the server never saw it (no Telegram, no cabinet)
     (ADR 0008). Without undo it's sent when the 5 s pass, the bar is closed, or another undo toast replaces it.
   - Edit: undo restores the previous values; delete: undo brings the record back.
   - Only one undo toast at a time; a new one confirms the previous one.
   - If the app is closed while toast is showing, record is sent anyway (fallback ~10 s, ADR 0008 п.4).

## 5. Gotchas for the guide
- Need an assigned car to use «+» at all (even for Витрата).
- Mileage/fuel mileage can't be lower than car's last known mileage; edits must fit between neighbours.
- Рука: only within last 2 days, not future; amount defaults to 100 — check before saving; hidden
  date/time under «Додатково».
- Витрата is paid only after manager approval; once approved it can't be edited/deleted.
- Звернення: editable only while «Новий» and ≤12 h; after staff takes it, only status/comment change.
- No photos (receipts etc.) in any of these forms.
- Who sees: park staff in web cabinet; Telegram group notifications are sent by the server for Рука
  (group «Рука», `ManualTripService.php:251-260`), Пробіг (mileage group, `VehicleMileageService.php:386,400-431`),
  Звернення (issues group incl. edit/cancel, `IssueReportService.php:74,1086,1120`) — only after the 5 s window.
  No Telegram notification found for app expenses/fuel.
- Editing/deleting is fine within the windows; afterwards ask the park manager.
- «Пробіг (км)» in Рука form = trip distance, not odometer reading (same label as fuel's odometer field).
