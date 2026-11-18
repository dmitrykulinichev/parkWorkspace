# Research: driver «Фотозвіт» (KMP app B) — existing state (2026-11-14)

Read-only research. Paths: BE = /Users/dmytro/Rep/park/app/park-react-spa, A = /Users/dmytro/Rep/park/mobile/app/src,
K = /Users/dmytro/Rep/park/kmp/shared/src (commonMain prefix `commonMain/kotlin/ua/g24/park/driver/shared`).

---

## 1. Backend — «condition reports» already exist (standalone, not tied to accept/handover)

### Table / migrations
- `vehicle_condition_reports` — BE/database/schema/mysql-schema.sql:1569-1593:
  id, park_id (FK cascade), vehicle_id (FK cascade), user_id (FK users, cascade — the driver *User*, not drivers.id),
  `type enum('general') default 'general'`, `status enum('submitted','reviewed') default 'submitted'`,
  `comment text NULL`, `source enum('web','app') default 'web'`, reviewed_at, reviewed_by_user_id (FK users, set null), timestamps.
  Indexes (park_id,vehicle_id), (park_id,user_id), (park_id,status).
- BE/database/migrations/2026_07_08_100000_create_vehicle_condition_reports_table.php:11-26 (comment line 16: `'handover'` reserved for later).
- BE/database/migrations/2026_07_09_100000_add_source_to_vehicle_condition_reports_table.php:12-15 (`source`).
- BE/database/migrations/2026_07_08_200000_add_condition_reports_permission.php:18-37 — permission `condition-reports.view`
  (+ `deny:condition-reports.view`), granted to Owner (global) and Admin role of each park.
- No assignment / handover FK, no client key / idempotency column, no per-photo angle/slot column, no `taken_at`/`reported_at`.
- No sync-journal (`RecordsSyncDeletions` / `SYNC_ENTITY`) on this model; not in BE/app/Services/Sync/Entities
  (only ExpenseSync, FuelSync, IssueSync, ManualTripSync, MileageSync).
- Also listed in BE/app/Support/VehicleDuplicateMerger.php:40 (re-pointed on vehicle merge).

### Model
- BE/app/Models/VehicleConditionReport.php: ParkScope global scope + auto park_id from CurrentPark (16-25); fillable 27-37;
  relations vehicle (withTrashed) 50-53, user 55-58, reviewer 60-63, `files()` morphMany File (65-68).
- Photos = polymorphic `files` table rows (fileable_type = VehicleConditionReport). Storage folder
  `files/condition_reports` (BE/config/files.php:32). FileController maps `vehicleconditionreport` (BE/app/Http/Controllers/Api/FileController.php:319).

### Driver API (mounted under /api/driver/v1, middleware driver-api, auth:sanctum, app.client, app.context, app.driver —
BE/routes/api/driver_app.php:57-67)
- BE/routes/driver_app/driver.php:93-96:
  - `GET /condition-reports` → index (own reports, `where user_id`, paginate 20, newest first) — DriverConditionReportController.php:22-40
  - `POST /condition-reports` → store — :47-74
  - `DELETE /condition-reports/{vehicleConditionReport}` → destroy — :81-91
- Validation (DriverConditionReportController.php:49-54):
  `vehicle_id required|integer`, `comment nullable|string|max:2000`, `files required|array|min:1|max:10`,
  `files.* required|file|image|max:10240` (10 MB each; Laravel `image` = jpg/jpeg/png/bmp/gif/svg/webp — no HEIC).
  ⇒ ONE multipart request per report with all photos (`files[]`), not per-photo. No angles/slots, no required count beyond ≥1.
- Vehicle check: only `Vehicle::findOrFail($data['vehicle_id'])` under ParkScope (:57) — vehicle must be in the active park.
  **No check that the driver currently holds / accepted the vehicle** (contrast IssueSync::authorize requires
  `driver->current_vehicle_id === vehicle_id`, BE/app/Services/Sync/Entities/IssueSync.php:40-48). Not linked to an assignment.
- No idempotency: repeated POST creates a duplicate report (no client key; not part of `/sync/push` receipts
  `sync_push_receipts`, BE/app/Services/Sync/SyncService.php:160-163, 183-189).
- Service BE/app/Services/VehicleConditionReportService.php:
  - `create()` 27-54: DB transaction — create report (type general, status submitted, source app) + `FileService::storeFile` per file;
    on any exception → `['success'=>false,'message'=>'Не вдалося зберегти звіт…']` → controller 422.
  - `createFromAdmin()` 59-82 (web, attaches pre-uploaded `file_ids`), `updateReport()` 87-109, `delete()` 114-130
    (owner only + status submitted, else 403), `markReviewed()` 135-148.
- FileService::storeFile BE/app/Services/FileService.php:199-220 → validateFile type 'document' (284-298): max 50 MB
  (config/files.php:18) and extension in documents+images+… lists; created with `file_type='document'`.
- Resource BE/app/Http/Resources/VehicleConditionReportResource.php:17-87: id, type, status, comment, source, created_at,
  formatted_*, vehicle{id,brand,model,license_plate,full_name}, user{id,name,avatar_url}, reviewer, files[{id,url,original_name,size,mime_type}],
  files_count, has_files.
- Contract doc: BE/docs/DRIVER_APP_API_CONTRACT.md:556-602 (§9).
- nginx `client_max_body_size 64m` (/Users/dmytro/Rep/park/docker/nginx/default.conf:7); 10×10 MB worst case = 100 MB > 64 MB.
  (No php.ini upload_max_filesize/post_max_size override found in repo docker/.)

### Web cabinet
- API BE/routes/api/condition_reports.php:6-13 (auth:sanctum + staff): options, index, store, show, patch(update), destroy;
  controller BE/app/Http/Controllers/Api/VehicleConditionReportController.php (index filters vehicle_id/status/date_from/date_to/search 18-60;
  update with `file_ids` max:10; destroy deletes files).
- UI: BE/resources/js/pages/VehicleConditionReports/index.jsx (+ VehicleConditionReportsList/{Desktop,Mobile}.jsx),
  modals BE/resources/js/components/modals/vehicleConditionReports/{VehicleConditionReportDetailModal,VehicleConditionReportFormModal}.jsx,
  hook BE/resources/js/hooks/useConditionReportsPage.js, service BE/resources/js/services/vehicleConditionReportService.js.
- Menu: BE/resources/js/components/Navigation/NavigationItems.js:78-83 — «Стан авто», `/vehicle-condition-reports`,
  permission `condition-reports` (Owner + Admin); route BE/resources/js/app.jsx:240.

### Telegram
- None. `grep conditionreport` in app/ hits only Model, Resource, Service, two controllers, FileController. Plan lists it as open
  (workspace/plans/condition-reports-plan.md:146). (For comparison IssueReportService uses TelegramApiService etc.,
  BE/app/Services/IssueReportService.php:21-23.)

### Tests
- BE/tests/Feature/DriverApp/DriverConditionReportApiTest.php: list ok+meta (44-50), auth required (52-56), only own (58-79),
  create 201 with 1 fake image (85-101), no files → 422 (103-108), other-park vehicle → 404 (110-130),
  delete own submitted (136-145), delete reviewed → 403 (147-153), delete other's → 403 (155-174).
  Headers X-Park-Id + X-App-Mode: driver (191-197). No test for "driver doesn't hold vehicle" (because no such rule).

### Plan /Users/dmytro/Rep/park/workspace/plans/condition-reports-plan.md
- Scope: "тільки самостійна фіча, без прив'язки до передачі авто" (:6). All 4 layers marked done (:13-18): BE driver API 7/7,
  mobile (Ionic A) 7/7, BE web 4/4, web frontend 5/5. Limits 10 photos × 10 MB images (:41).
- Open, not done (:143-149): link to handover (`type: handover`, `handover_id`), Telegram notification, before/after
  comparison, problem categories (кузов, скло, салон), staff-requested report via push.

---

## 2. Old Ionic app A — has it (driver, pro UI mode only)

- Modal A/components/quickadd/ConditionReportModal.tsx:
  - PHOTO_LIMIT = 10 (:19); photos held in React state as base64 (:21-25, 49).
  - `Camera.getPhoto({ resultType: Base64, source: CameraSource.Prompt, quality: 80 })` (:64-68) — camera or gallery prompt;
    HEIC/HEIF relabelled as jpeg mime (:70). Free-form series: no fixed angles (front/back/left/right) — just a counter "X/10"
    + 3-col grid with remove buttons (:141-176) + optional comment textarea (:178-189).
  - Submit: one multipart call with all photos (`FleetApi.createConditionReport`, :85-99); requires ≥1 photo (:101-105).
  - **Online only**: submit disabled when `isOffline` or no `currentVehicle` (:133). No queue, no local file persistence, no undo toast;
    photos lost if modal closed.
- API A/services/FleetApi.ts:911-926: `getMyConditionReports(page)` GET, `createConditionReport(vehicleId, comment, blobs)` →
  FormData `vehicle_id`, `comment`, `files[]` (name photo_i.jpg) via `requestMultipart` (A/services/FleetApi.ts:207-240, plain fetch POST);
  `deleteConditionReport(id)`.
- Hook A/hooks/driver/useConditionReports.ts (list) — defined but not used by any screen (grep: no consumers). No list/history screen in A.
- FAB: A/components/quickadd/QuickAddFab.tsx:160-200 — item `'condition'` («Стан авто», `quick_add.add_condition_report`, cameraOutline)
  only in `isDriver && uiMode === 'pro'` arc (arc-4); simple mode (:108-158) has 5 items without it. Modal mount :273.
- i18n A/i18n/condition_reports.ts; types `ConditionReport` in A/types/index.ts.

---

## 3. KMP app B

### 3.1 Offline write queue («+» records)
- Docs: kmp/docs/adr/0006-offline-write-queue.md (queue, one `POST /sync/push` for all entities, "Як додати сутність" section),
  0007-background-sync.md, 0008-undo-window-before-send.md, 0010-offline-delete.md, 0012-offline-edit.md.
- Table K/commonMain/sqldelight/ua/g24/park/driver/shared/db/OutboxAction.sq:18-34 `outbox_action`
  (user_id, park_id, client_key PK; entity, `payload TEXT` (JSON), `meta TEXT` (JSON draft for display), state
  pending/needs_confirmation/rejected/accepted, confirmed, message, record_id, created/updated_at_ms, hold_until_ms, op create/update/delete).
  **Only JSON text columns — no blob/file path column; no binary support.**
- Migrations 1.sqm…9.sqm ⇒ current DB schema version 10 (9.sqm header "Версія 9 → 10").
- Other SQLDelight tables: AppLog, DriverExpense, FuelRefueling, IssueReport, ManualTrip, MileageEntry, ResponseCache, SyncState.
- Domain K/…/domain/sync/PendingWrite.kt: `UNDO_WINDOW_MS = 5_000L` (:14), PendingState (:21-30), PendingRecordId (:36),
  PendingDecision Confirm/Cancel + bus PendingDecisions (:45-59), SubmitOutcome (:66-82), PendingRecord (:88-93),
  `QueuedCreates<Draft>` (:100-119), `QueuedDeletes` (:126-133), PendingWriteProblems (:145-154).
- K/…/data/outbox/Outbox.kt:
  - submit() → enqueue() inserts row with `hold_until_ms = now + CONFIRM_FALLBACK` (UNDO_WINDOW*2 = 10 s, :410) (:125-126, 186-204).
  - Decisions: Confirm → `store.release` + `requestFlush()`; Cancel → delete unconfirmed row (:97-115).
  - queued(): schedules OS background flush always (`background.scheduleOutboxFlush()`, :206-213).
  - flush(): under Mutex, batches of `OutboxApiClient.MAX_ACTIONS = 50`, `api.push(session, PushActionDto…)` JSON (:261-284);
    on leftovers → scheduleOutboxFlush (:288).
  - apply(): accepted create → `entities.getValue(row.entity).applyAcceptedInTransaction(...)` + markAccepted; needs_confirmation /
    rejected → mark + emit problem; `failed` stays pending (:306-337). Requires the entity to be a `SyncedEntity` registered in syncModule
    (`entities.getValue`).
- K/…/data/outbox/OutboxApiClient.kt:23-28 — single JSON `POST {BASE_URL}/sync/push` with `backgroundRequest()`; DTOs
  K/…/data/outbox/dto/OutboxDtos.kt:9-41 (`data: JsonObject`).
- K/…/data/outbox/OutboxCreates.kt: `QueuedDraftCodec` (:21-26: serializer, toDto, toDraft, payload JSON) and base
  `OutboxCreates<Draft,DraftDto>` (:32-87) implementing QueuedCreates + QueuedDeletes.
- Example: K/…/data/issue/IssueRepositoryImpl.kt:34-58 (vehicle-scoped, `vehicleIdOf = draft.vehicle.id`, codec payload IssueCreateDto).
- UI glue K/…/ui/common/QueuedSubmit.kt: `QueuedSubmitViewModel<Draft>` (:50-79), `QueuedSubmitEffects` shows undo toast via
  `notices.showWithUndo(onUndo→Cancel, onExpire→Confirm)` (:85-110, 133-138), `PendingWriteProblemsEffect` (:144-157).
  e.g. AddIssueViewModel is a one-liner (K/…/ui/quickadd/AddIssueViewModel.kt:8).
- Sync engine entities: `enum class SyncEntity { MANUAL_TRIPS, MILEAGE, ISSUES, EXPENSES, FUEL }` (K/…/domain/sync/SyncEngine.kt:7);
  list in K/…/di/SyncModule.kt:31-48 (Outbox, OutboxStore, BackgroundSync, SyncEngine wiring).
- Server side of /sync/push: BE/app/Http/Controllers/Api/DriverApp/DriverSyncController.php:67-85 (`actions.*.data required|array`,
  JSON only, PUSH_MAX_ACTIONS 50 :22); receipts idempotency in SyncService::pushOne (BE/app/Services/Sync/SyncService.php:148-200).
  ⇒ neither client nor server queue supports multipart/file payloads today.

### 3.2 Background work
- Common work K/…/data/sync/BackgroundSync.kt:27-83 (`flushOutbox`, `syncSignalled`, restores session itself).
- Interface K/…/data/sync/BackgroundSyncScheduler.kt:8-14.
- Android: WorkManager — K/androidMain/…/platform/AndroidBackgroundSyncScheduler.kt:26-72: unique work "outbox-flush"
  (KEEP), constraint NetworkType.CONNECTED, exponential backoff 30 s; OutboxFlushWorker / SyncSignalWorker (CoroutineWorker + Koin).
  Dependency `androidx.work:work-runtime-ktx` 2.10.0 (kmp/gradle/libs.versions.toml:21,65; shared/build.gradle.kts:102).
- iOS: BGTaskScheduler — K/iosMain/…/platform/IosBackgroundSync.kt:45-86: `BGProcessingTaskRequest("ua.com.g24.outbox-flush")`
  requiresNetworkConnectivity, `registerBackgroundTasks()`, `handleSilentPush`. Info.plist UIBackgroundModes remote-notification,
  processing; BGTaskSchedulerPermittedIdentifiers ua.com.g24.outbox-flush (kmp/iosApp/iosApp/Info.plist:60-69).
  No background URLSession (upload) anywhere; Ktor Darwin engine with regular session.
- Also in-app triggers (SyncEngine.requestSyncAll, connectivity return, app foreground) per ADR 0006 p.7 / 0007 p.5.
- No HttpTimeout configured on main client (only health check client ConnectivityMonitorImpl.kt:54-56).

### 3.3 Photo capture / picker
- K/…/platform/PhotoPicker.kt:6-19: `PickedPhoto(bytes, mimeType="image/jpeg")`, interface `takePhoto()` / `pickFromGallery()`,
  `@Composable expect fun rememberPhotoPicker(onPicked)`.
- Android K/androidMain/…/platform/PhotoPicker.android.kt: MAX_SIDE 2048, JPEG 80 (:24-25); camera = `ActivityResultContracts.TakePicture`
  into `cacheDir/shared/photo_<ms>.jpg` via FileProvider `${packageName}.fileprovider` (:37-48), CAMERA runtime permission request
  (:49-60), gallery = PickVisualMedia ImageOnly (:52-54, 63); `compress()` downsample + scale + JPEG → in-memory ByteArray (:68-81).
  The temp cache file is not deleted and not used afterwards (bytes are returned).
- iOS K/iosMain/…/platform/PhotoPicker.ios.kt: UIImagePickerController (camera / library) presented on keyWindow root (:27-47);
  `UIImageJPEGRepresentation(image, 0.8)` (:55) — **no resize on iOS** (full-res JPEG). Header says compiled, not tested live (:23).
  Does not request camera permission itself (system prompt via NSCameraUsageDescription).
- Only consumer: staff maintenance form K/…/ui/staff/maintenance/MaintenanceFormSheet.kt:150 (`rememberPhotoPicker { viewModel.addPhoto(photo.bytes) }`),
  thumbnails via Coil `AsyncImage(model = ByteArray | url)` (:243-244, 347). Coil 3.0.4 + coil-network-ktor3 in deps.
- Staff upload: K/…/data/staff/StaffApiClient.kt:103-114 `uploadMaintenanceFiles` — Ktor `submitFormWithBinaryData`, `files[]`
  image/jpeg, filename photo_i.jpg; one request per group after group save. ViewModel K/…/ui/staff/maintenance/MaintenanceFormViewModel.kt:
  `MAINTENANCE_MAX_PHOTOS = 5` (:27), LocalPhoto(jpeg ByteArray) in memory (:43), submit: create group then upload (:186-199);
  failure → stays in form with PHOTO_UPLOAD error. **Online, foreground, in-memory; no queue, no persistence, no background.**
  Repo K/…/data/staff/StaffMaintenanceRepositoryImpl.kt:58-59. Doc kmp/docs/domain/staff-maintenance.md:19-32.
- Permissions: K/…/ui/settings/PermissionsSheet.kt:83,93,103,188 — `showCamera` param "лише персоналу… водію — ні";
  callers: SettingsScreen.kt:221 (`showCamera = isStaff`), MainShell.kt:367 onboarding (`showCamera = !isDriver`).
  Android manifest already declares CAMERA (kmp/androidApp/src/main/AndroidManifest.xml:10, comment mentions «фото звернень»);
  FileProvider :65-73 with res/xml/file_paths.xml `<cache-path name="shared" path="shared/"/>` only.
  iOS Info.plist NSCameraUsageDescription mentions «фотографування стану авто» (:88-93), NSPhotoLibrary(Add)UsageDescription present.
- On-device file storage: no persistent file storage code in shared (no okio, no NSFileManager/NSDocumentDirectory, no filesDir).
  Only temporary: Android cacheDir/shared (PhotoPicker, AndroidShareLauncher.kt:22), iOS NSTemporaryDirectory (IosShareLauncher.kt:8,30).

### 3.4 Quick-add menu
- K/…/ui/quickadd/QuickAddFab.kt: `enum class QuickAddAction(label, icon)` TRIP, MILEAGE, ISSUE, EXPENSE, FUEL (:50-56);
  KDoc :45-49 explicitly anticipates "Стан авто" from donor pro-mode — "новий елемент тут + обробка в onAction викликача".
  `visibleQuickAddActions(hidden)` (:59-60); arc 140dp 162°→18° divided evenly (:63, RadialFabMenu :104-120);
  blocked without current vehicle → toast (:86-113).
- Handler: K/…/ui/main/MainShell.kt:559-562 (`onAction = { activeQuickAdd = it }`), sheets :591-620 (EXPENSE without vehicle,
  others need `profile.currentVehicle`; `else -> Unit`). History pages enum MainShell.kt:646-651 (MANUAL_TRIPS, MILEAGE, ISSUES, EXPENSES, FUEL).
- Settings «Основна кнопка»: K/…/ui/settings/SettingsScreen.kt:222-258 QuickAddSettingsSheet iterates `QuickAddAction.entries`
  (switch per action, last visible can't be turned off). Stored as hidden set: K/…/domain/settings/AppSettings.kt:40-44
  ("Зберігаються саме приховані: нова дія з'являється в усіх одразу"), K/…/data/settings/SettingsRepositoryImpl.kt:41,71-72.
  ⇒ a new enum entry automatically appears in FAB and in Settings toggles.
- Staff FAB separate: K/…/ui/staff/StaffQuickAddFab.kt (MAINTENANCE, DRIVER, DOCUMENT, NEWS).

## 4. kmp/docs/domain & plan
- No domain doc about condition reports / photo reports in kmp/docs/domain (files list: assignment, auth, …, vehicle; only
  staff-maintenance.md mentions photos :19-32, 45-48).
- kmp/docs/PLAN.md:127-128 — "[ ] ВІДКЛАДЕНО (рішення 2026-10-07): камера — у водія лише фото стану авто (components/quickadd/ConditionReportModal.tsx)".
- kmp/docs/design-system.md:255-257 — PhotoPicker description ("Фото ремонту").
