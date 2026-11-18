# Техборг: СТО заїзду в застосунку персоналу й скріни статті

Записано 2026-11-17 на прохання власника. Задача — `workspace/tasks/2026-11-17-maintenance-provider/`.

## Що зроблено

У кабінеті заїзд на сервіс має необов'язкове поле «Де виконували (СТО / ФОП)»: довідник парку
(`MaintenanceProvider`, `MaintenanceProviderService`), підказки `GET /vehicle-maintenance-groups/providers/search`,
поле `provider_name` у створенні й оновленні заїзду, фільтр і показ у списку. Статтю блогу
`maintenance-provider` опубліковано (uk/en/ru, відкладена на 28.11.2026) без скрінів.

## Борг

1. ~~**Поле в застосунку персоналу (KMP)**~~ зроблено 17.11 (реліз 2.0.35 після деплою бекенду)., розділ ремонту (`ui/staff/maintenance`, `DriverStaffMaintenanceController`).
   Стаття вже пише, що поле є в застосунку, тож бажано встигнути до 28.11 або прибрати абзац зі статті.
   - Бекенд: `DriverStaffMaintenanceController` приймає `provider_name` (створення й оновлення: без поля — не
     чіпати, як у вебі), віддає `provider` у відповіді; підказки для застосунку — свій маршрут у `/staff/…`
     через той самий `MaintenanceProviderService::search`.
   - Застосунок: поле з підказками у формі заїзду (як назва ремонту), рядки uk/ru/en, офлайн — назва вільним
     текстом, підказки лише з мережею.
2. ~~**Скріни для статті**~~ зроблено 18.11. в парку «Київ» (`workspace/blog/PROCESS.md`): `provider-field.webp` (форма з
   підказками), `provider-list.webp` (список із фільтром «Де виконували»); потім `publish.mjs … --replace`
   (статус published із frontmatter, дата 28.11).

## ✅ Зроблено 17.11: авто, передане в інший парк, зникає з історичних записів

Трансфер перемикає `vehicles.park_id` на місці, а зв'язок `vehicle()` у багатьох історичних записах фільтрується
`ParkScope` — тоді в записах старого парку колонка «Автомобіль» порожня. Заїзди на сервіс (`VehicleMaintenanceGroup`,
`VehicleMaintenanceRecord`) виправлено 17.11. Так само, ймовірно, у: `DriverExpense`, `FuelRefueling`, `ManualTrip`,
`VehicleConditionReport`, `VehicleUnavailability`, `BonusPenalty`, `InsurancePolicy`, `DriverDebtPlan`, `SosAlert`,
`Task`, `TelegramMessageLog`, `VehicleQrScan`, `BillingVehicleDay` — перевірити кожен і виправити тим самим правилом
(`->withoutGlobalScope(ParkScope::class)->withTrashed()`, як `VehicleAssignment`, `IssueReport`).

Виправлено всі перелічені моделі; правило закріплює `tests/Unit/HistoricalVehicleRelationTest.php` (нова модель-історія — додати туди).
