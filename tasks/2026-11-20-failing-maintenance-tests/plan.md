# Два тести ТО падають

**Мета:** з'ясувати й виправити: `DisposedVehicleMaintenanceTest::editing_keeps_date_not_later_than_disposal` (422 замість 200) і `DriverStaffMaintenanceApiTest::create_group_with_two_records_sums_total_cost` (пробіг 50000 замість 60000).

## Кроки

- [x] Причина 1 (справжній баг): ТО вибулого авто в день вибуття відхилялось — дата ТО розбиралась в UTC, а день
      вибуття — початок дня за Києвом; виправлено: дата ТО — за Києвом (`VehicleMaintenanceGroupController::update`,
      `StoreBatchVehicleMaintenanceRequest`)
- [x] Причина 2 (застарілий тест): з 18.11 пробіг із ТО піднімається через `VehicleMileageService` (стрибок ≤ 5000 км),
      а тест робив 50 000 → 60 000; тест виправлено на 54 000
- [x] Повний прогін: 488 ✓

**Статус: завершено 20.11.2026.**
