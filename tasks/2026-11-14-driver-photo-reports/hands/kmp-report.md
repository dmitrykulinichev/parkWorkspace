# Звіт: «Фотозвіт» у застосунку B (KMP) — 2026-11-14/15

Не комічено. (Частину нових файлів хтось уже поставив у staging — `A ` у `git status`; staging не чіпав.)

## Збірка й тести
- `sh gradlew :shared:testDebugUnitTest` — ✓, 16 тестів (нові 14: `ConditionReportCodecTest` 4, `ConditionPhotoUploaderTest` 8, `ConditionReportRowsTest` 2).
- `sh gradlew :androidApp:assembleDebug` — ✓.
- `sh gradlew :shared:compileKotlinIosSimulatorArm64` — ✓ (лише попередження opt-in `flatMapLatest`, як в існуючому коді).
- Наживо не запускав (емулятор/пристрій — власник).

## Що змінено
Нове (shared/src/…):
- `commonMain/sqldelight/.../ConditionReport.sq`, `ConditionReportPhoto.sq`, `10.sqm` (база 10 → 11).
- `platform/LocalFiles.kt` (інтерфейс) + `androidMain/.../AndroidLocalFiles.kt` (filesDir, атомарний запис через .tmp) + `iosMain/.../IosLocalFiles.kt` (NSDocumentDirectory); зареєстровано в `AndroidPlatformModule`/`IosPlatformModule`.
- `domain/conditionreport/ConditionReport.kt`, `ConditionReportRepository.kt` (+ `ConditionPhotoCapture`).
- `data/conditionreport/`: `dto/ConditionReportDtos.kt`, `ConditionReportMappers.kt` (кодек черги), `ConditionPhotoFiles.kt` (файли сеансу форми, чистка «нічиїх»), `ConditionReportLocalStore.kt` (обидві таблиці, реалізує `ConditionPhotoQueue`), `ConditionReportSync.kt` (`condition-reports`, DriverSyncedEntity), `ConditionReportApiClient.kt` (multipart `photo`+`photo_key`), `ConditionPhotoUploader.kt` (по одному, класифікація помилок, backoff), `ConditionPhotoTriggers.kt` (приводи в застосунку + чистка на старті), `ConditionReportRepositoryImpl.kt`.
- `di/ConditionReportModule.kt` (+ в `AppModules`).
- UI: `ui/quickadd/AddConditionReportSheet.kt`, `AddConditionReportViewModel.kt`; `ui/conditionreport/ConditionReportsScreen.kt`, `ConditionReportsViewModel.kt` (чисті `conditionReportRows`/`uploadStateOf`), `ConditionPhotoThumb.kt` (`ConditionPhotoImage`, Coil з okio Path).
- `composeResources/drawable/ic_camera_outline.xml`; рядки uk/en/ru (блок «Фотозвіт» у кінці `strings.xml`).
- Тести: `commonTest/.../data/conditionreport/*Test.kt`, `ui/conditionreport/ConditionReportRowsTest.kt`.

Змінено:
- `Outbox.kt`: `submit(..., alsoInTransaction(owner, key))`; скасоване/прибране створення → `createDroppedInTransaction`; прийняте створення → `createAcceptedInTransaction(owner, key, id)`; `discard` — у транзакції.
- `SyncedEntity.kt`: два open-хуки вище (за замовчуванням нічого). `OutboxCreates.kt`: `createdInTransaction`, `serverDeletable`.
- `QueuedSubmit.kt`: `protected open fun onSaved(saved)` у `QueuedSubmitViewModel`.
- `SyncEngine.kt`: `SyncEntity.CONDITION_REPORTS`; `SyncModule.kt`: сутність у списку, `BackgroundSync` + uploader.
- `BackgroundSync.kt`: `flushOutbox` — черга, потім фото (успіх = обидва); `syncSignalled` теж доливає фото. Тим самим Android WorkManager «outbox-flush» і iOS BGTask/тихий push — без змін у платформеному коді.
- `PhotoPicker.android.kt`: поворот за EXIF, видалення тимчасових файлів камери; `PhotoPicker.ios.kt`: зменшення до 2048 (UIGraphicsImageRenderer, scale 1), JPEG 0.8; `PhotoPicker.kt` — KDoc про режим «лише камера».
- `QuickAddFab.kt` (`CONDITION_REPORT`, з'являється й у «Основна кнопка»), `MainShell.kt` (шторка, маршрут, `HistoryPage.CONDITION_REPORTS` — і для плашки відхилених), `AppDrawer.kt` (`DrawerPage.CONDITION_REPORTS` у «Мої записи»), `ViewModelModule.kt`.
- Документація: `docs/domain/condition-report.md` (нове), `docs/PLAN.md` (пункт камери), `docs/domain/README.md`, `docs/design-system.md`.

## Рішення
- Зв'язок фото ↔ звіт — ключ дії черги (`local_report_key` = `outbox_action.client_key`); рядки фото пишуться в тій самій транзакції, що й дія; id сервера — в транзакції відповіді `/sync/push`. Без змін протоколу.
- Шляхи у базі відносні (iOS-контейнер змінюється з оновленням).
- «Лише камера» = форма викликає тільки `takePhoto()`; дозвіл — `rememberPermissionState(CAMERA)` перед першим фото (камера відкривається сама після дозволу; DENIED → підказка + налаштування). Рядок камери в PermissionsSheet не повертав.
- Пам'ять: у формі лише шляхи; кожне фото одразу у файл; мініатюри Coil декодує під розмір; заливка читає по одному файлу.
- Backoff: у застосунку пауза 30 с·2ⁿ ≤ 30 хв; повернення зв'язку, фон ОС і «↻» її ігнорують (ОС має свій backoff). Невдача → `scheduleOutboxFlush()`.
- 4xx (крім 401/408/429) — відмова назавжди, рядок і файл лишаються для показу; 401 — стоп.
- Вихід з акаунта не стирає черги фото (як черги записів).
- Звіт, який сервер прийняв, «Видалити» лише прибирає з черги (сервер delete не підтримує).

## Не зроблено / ризики
- Не перевірено на пристроях (камера iOS, EXIF Android, BGTask із фото).
- iOS Documents потрапляє в бекап iCloud (не ставив `NSURLIsExcludedFromBackupKey`) — файли тимчасові, дрібниця.
- Якщо ViewModel форми знищено з незбереженими фото (без закриття шторки), файли лишаються до наступного старту (чистка «нічиїх»).
- Немає тестів на SQL-сховище (у проєкті немає JVM-драйвера SQLite для тестів; логіка винесена в чисті функції/фейки).
- Відхилені (422) фото лишаються на телефоні, доки звіт не зникне з сервера чи не прийде в `photo_keys`; окремої кнопки «прибрати» немає.
