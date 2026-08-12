# Редизайн запису транзакції розрахунку з водієм (серпень 2026)

## Контекст

При поясненні механізму збереження розрахунків з водіями
(`/driver-payouts`) виявлено, що `Transaction`, пов'язана з
`DriverPayoutRecord`, завжди записується як `type='expense'`,
`amount=-abs($amount)` — незалежно від напрямку розрахунку
("Видати водію" / "Отримати від водія"). Це неправильно по суті:

- **Розрахунок (settlement)** — не заробіток і не витрата парку сама
  по собі, а перерозподіл між двома каналами оплати: безготівка йде
  на рахунок парку, готівку водій забирає напряму від клієнта. Через
  розбіжність виникає дисбаланс (як правило на користь парку), який
  компенсується розрахунком — парк доплачує водію готівкою/переказом,
  або навпаки забирає переплату.
- **Зарплата водія** — реальна вартість праці водія для П&Л парку —
  зовсім інша величина, і саме вона мала б потрапляти в `Transaction`
  як `expense`, а не сума розрахунку.

Обговорення велось в чаті 12.08.2026 без написання коду — цей файл
фіксує узгоджений результат, щоб не загубити деталі.

## Узгоджена структура (2 записи, як і зараз)

Кількість записів на подію розрахунку **не змінюється** — лишається
пара `Transaction` + `DriverPayoutRecord`, пов'язана через
`transaction_id` (як зараз). Змінюється те, **яке значення** йде в
кожне поле.

### `DriverPayoutRecord.amount` — без змін

Фактично передана сума, знакова (+видано / −отримано). Те, що реально
перейшло з рук в руки. Не чіпаємо.

### `DriverPayoutRecord.<нове JSON-поле>` — знімок розрахунку

Назва поля — TBD (напр. `breakdown` або `calculation_snapshot`).
Незмінний знімок усіх складових на момент розрахунку — щоб можна було
відтворити логіку навіть якщо `DriverEconomyCalculator` згодом
зміниться. Відповідає 3 блокам з модалки (`DriverEarningsBreakdown`):

1. **Заробіток від поїздок** — `uklon_profit_total`, `uklon_tips_amount`
   (віднято з бази), `manual_trips_amount`, `driver_percent`,
   `driver_earnings` (заробіток = % від бази).
2. **Формування зарплати** — `driver_earnings`, `bonuses_amount`,
   `penalties_amount`, `uklon_tips_amount` (100%),
   `calculated_income` (= `driver_income` на момент розрахунку —
   "Зарплата (до розрахунків)").
3. **Фінальний розрахунок** — `calculated_income`,
   `total_cash_amount`, `expenses_amount`, `debt_payments_amount`,
   `calculated_settlement` (= `payout_amount`, запропонований/
   розрахований залишок до видачі).

Плюс явна фіксація факту й дельти:

- `actual_settlement` — фактично введена менеджером сума (= те саме,
  що лежить в `DriverPayoutRecord.amount`, продубльовано в JSON для
  цілісності знімку).
- `payout_variance` = `actual_settlement - calculated_settlement`.
  У більшості випадків = 0 (менеджер підтверджує запропоновану суму
  без змін).
- `actual_income` = `total_cash_amount + actual_settlement` — реальний
  сукупний заробіток водія з урахуванням фактичної видачі (а не
  теоретичного розрахунку).

Формула/версія логіки розрахунку — теж варто зафіксувати (напр. номер
версії калькулятора або текстовий опис формули), щоб відрізняти
знімки "до" і "після" майбутніх змін формули.

### `Transaction.amount` — змінюється

Замість суми розрахунку (settlement) записуємо `actual_income` —
реальний заробіток водія (готівка яку він лишив собі + фактично
передана сума розрахунку). Завжди `type='expense'`, завжди додатне по
модулю — бо зарплата сама по собі не має напрямку "дав/взяв", напрямок
має лише сам розрахунок (він лишається в `DriverPayoutRecord.amount`).

## Термінологія (уникати плутанини)

| Поняття | Поле | Зміст |
|---|---|---|
| Розрахунковий заробіток (теоретичний) | `driver_income` / `calculated_income` | Що видає `DriverEconomyCalculator` за формулою, без урахування фактичної видачі |
| Фактичний заробіток (реалізований) | `actual_income` | `total_cash_amount + actual_settlement` — те, що водій реально отримав в підсумку |
| Запропонований розрахунок | `calculated_settlement` (= `payout_amount`) | Скільки калькулятор пропонує видати/забрати |
| Фактичний розрахунок | `actual_settlement` (= `DriverPayoutRecord.amount`) | Скільки менеджер реально ввів і передав |
| Розбіжність факт/розрахунок | `payout_variance` | `actual_settlement - calculated_settlement` |

**Важливо задокументувати окремо (обов'язковий пункт, не забути):**
джерело істини для фінального заробітку водія — `actual_income`
(факт), а не сирий `driver_income` з калькулятора. Хтось у майбутньому
може помилково рахувати П&Л водія напряму з калькулятора, ігноруючи що
менеджер міг видати менше/більше за пропозицію.

## Статус

🟢 Реалізовано (12.08.2026).

## Як реалізовано

- **Міграція:** `2026_08_12_100000_add_calculation_snapshot_to_driver_payout_records_table.php`
  — `driver_payout_records.calculation_snapshot` (json, nullable). Стара
  міграція, що додавала `transaction_id`, не чіпалась.
- **Модель:** `App\Models\DriverPayoutRecord` — `calculation_snapshot` у
  `$fillable`, каст `'array'`.
- **Фронтенд:** `DriverPayoutModal.jsx` — `buildCalculationSnapshot()`
  формує знімок із `driver`-пропу (це вже готовий `earnings`-об'єкт з
  `/driver-payouts`, той самий, що рендерить `DriverEarningsBreakdown`) і
  надсилає його полем `calculation_snapshot` в `POST`/`PATCH`.
- **Бекенд:** `App\Services\DriverPayoutService`:
  - `buildSnapshot()` — мерджить сирий знімок з фронтенду з похідними
    полями: `calculated_income` (alias `driver_income`),
    `calculated_settlement` (alias `payout_amount`), `actual_settlement`
    (= сума акту), `payout_variance` (= `actual_settlement -
    calculated_settlement`), `actual_income` (= `total_cash_amount +
    actual_settlement`), `formula` (текстовий опис формули, константа
    `FORMULA_DESCRIPTION`).
  - `resolveTransactionAmount()` — бере `actual_income` зі знімку для
    суми `Transaction`; якщо знімка нема (мобільний потік, свідомо
    ізольований від калькулятора — `DriverStaffPayoutsController` не
    надсилає його) — fallback на стару поведінку (`amount` акту).
  - `Transaction.amount` тепер = `-abs(actual_income)` (реальний
    заробіток водія), а не сума розрахунку. `DriverPayoutRecord.amount`
    без змін — фактично передана сума.
  - `update()` перераховує знімок тільки якщо `calculation_snapshot`
    прийшов у запиті; інакше лишає старий знімок запису (актуально для
    мобільного потоку, де знімка ніколи нема).
- **Ресурс:** `DriverPayoutRecordResource` віддає `calculation_snapshot`
  у відповіді (поки не використовується в UI, для майбутнього).
- **Контролери:** і `DriverPayoutController` (веб), і
  `DriverStaffPayoutsController` (мобільний) валідують
  `calculation_snapshot` як `nullable|array` — мобільний фронтенд поки
  його не надсилає (свідомо ізольований від калькулятора), тож для
  записів з мобільного `actual_income` недоступний і діє fallback.

## Що лишилось відкритим

- `actual_income`/`payout_variance` поки ніде не відображаються в UI
  (`/driver-payouts`, модалка) — тільки зберігаються в БД/API.

(Пункт про старі записи знято: на момент зміни `driver_payout_records`
було порожнім — 0 рядків, міграції задом наперед не потрібні.)
