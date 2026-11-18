# Руки

### 2026-11-14 · агент Explore
Завдання: бекенд фотозвітів, стара версія A, KMP-черга/камера/«+»/фон.
Результат: бекенд фотозвітів є (vehicle_condition_reports + File, POST multipart ≤10 фото, без ідемпотентності й без перевірки, що авто у водія, без Telegram; кабінет «Стан авто»). A — лише онлайн. KMP: черга лише JSON (/sync/push), постійного сховища файлів немає, фон — WorkManager/BGTask лише для JSON; камера — rememberPhotoPicker (байти в пам'яті; iOS без зменшення); «+» — enum QuickAddAction, новий пункт з'явиться й у налаштуваннях.
Сирий вивід: `hands/research.md`.

### 2026-11-15 · реліз 2.0.31 (218)
- Android internal → production ✓ (`hands/release-android-218.log`), реліз записано в суперпарк.
- iOS: release-ios + publish-ios --submit у фоні (`hands/release-ios-218.log`).
- iOS 2.0.31 (218): на рев'ю Apple ✓.

### 2026-11-16 · тести бекенду
- Фікс груп фотозвіту: старий код — тест ⨯, новий — 416 ✓ (`hands/tests-telegram-fix.log`, `hands/tests-telegram-groups.log`).

### 2026-11-16 · меню «+» сіткою
- installRelease на емулятор (перший раз упав — завис system, після reboot ✓); знімки `hands/fab-*.png`; тести shared ✓ (`hands/kmp-tests-fab-grid.log`).
