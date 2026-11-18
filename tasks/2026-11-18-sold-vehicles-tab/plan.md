# Вкладка «Вибулі» на сторінці авто

**Мета (18.11):** на /vehicles бракувало проданих авто. Рішення: окрема вкладка «Вибулі» (продано/списано/інше), а не статус — вибуле авто поза роботою (soft delete + disposal_reason).

- [x] `DisposedVehiclesController` (GET /vehicles/disposed), `DisposedVehiclesList.jsx`, вкладка, i18n uk/ru/en, тест
- [ ] Деплой (користувач), без міграцій

- [x] 18.11 користувач: «передані і вибулі — одна вкладка з різновидами» → `Services/Vehicles/DisposedVehiclesReport` (вибуття + передані з vehicle_transfers), одна вкладка «Вибулі» з причиною й «→ парк»; `transferred-out`, `TransferredVehiclesList` прибрано; тести 466 ✓
