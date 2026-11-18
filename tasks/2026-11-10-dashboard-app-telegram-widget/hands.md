# Руки

### 2026-11-10 · агент Explore
Завдання: як збирається версія/ОС, «остання» версія, стовпець «Застосунок», статус Telegram, віджети Головної, «активний» водій.
Результат: версія/збірка/ОС — лише в `driver_push_tokens` (на пристрій, при реєстрації push-токена, лише B і лише з увімкненим push); «остання» — `config/mobile_app.php` `latest_build` з env; Telegram — 3 різні правила в коді; Головна — реєстр `constants/dashboardConfig.js`; активний = статус ≠ inactive.
Сирий вивід: `hands/research.md`.

### 2026-11-10 · тести бекенду
Завдання: нові тести `DriverConnectionsTest` (запис релізу, /version-check, заголовки X-App-*, звіт віджета) + повний набір.
Результат: 3 нові ✓; усі 403 ✓. Локальна БД — міграції застосовано.

### 2026-11-10 · скрипти, застосунок, кабінет
- `sync-app-releases.mjs` на локальний суперпарк: 29 B-релізів записано, повтор — без дублю; `/version-check?build=208` → update_available, latest 214.
- KMP: `:shared:compileDebugKotlinAndroid :shared:testDebugUnitTest` ✓.
- Vite build ✓. Браузер (локально, парк «Київ», тимчасовий користувач — видалено): віджет показує Telegram (8 без посилання) і Застосунок (5 не встановили, 3 версія невідома), остання 2.0.29 (214).

### 2026-11-10 · реліз 2.0.30 (216)
- iOS 2.0.29 — READY_FOR_SALE (перевірено в App Store Connect).
- `release-android.mjs` → internal ✓ (`hands/release-android-216.log`); `publish-android.mjs --confirm` → production ✓, реліз записано в суперпарк (прод).
- `release-ios.mjs` → у фоні (`hands/release-ios-216.log`).
- iOS 2.0.30 (216): TestFlight VALID → відправлено на рев'ю Apple (`publish-ios.mjs --submit`), реліз записано в суперпарк.
