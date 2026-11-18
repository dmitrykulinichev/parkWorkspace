# Research: app version/platform, Telegram, dashboard widgets, active statuses

Date: 2026-11-10. Read-only research. Paths are relative to `/Users/dmytro/Rep/park/` unless absolute.
Backend root: `app/park-react-spa/` (abbrev. `BE/`). KMP root: `kmp/shared/src/commonMain/kotlin/ua/g24/park/driver/shared/` (abbrev. `KMP/`).

---

## 1. How app version / build / OS reach the backend and where they are stored

### 1.1 No version headers
- There is NO `X-App-Version`, `X-Platform`, `X-App-Build`, or custom User-Agent anywhere in the backend (grep over `app/`, `routes/`, `config/` found nothing).
- Headers the backend reads (middleware): `X-Park-Id` (BE/app/Http/Middleware/SetCurrentPark.php:37, ResolveAppContext.php:43, LogDriverApiRequest.php:35), `X-Timezone` (ResolveAppContext.php:77), `X-Locale` (SetLocale.php:40), `X-Demo-Mode` (BlockMutationsInDemoMode.php:19), `X-Landing-Api-Key`.
- KMP sends on every park-scoped call only `Authorization`, `X-Park-Id`, `X-App-Mode` (KMP/data/network/RequestContext.kt:22-26); `X-Locale` on auth/taxi (KMP/data/auth/AuthApiClient.kt:58, data/taxi/TaxiApiClient.kt:74).
- `LogDriverApiRequest` (BE/app/Http/Middleware/LogDriverApiRequest.php:24-64) logs method/path/status/ip/driver_id/park_id to the `driver-api` log channel - no version, not stored in DB.

### 1.2 The only DB storage: `driver_push_tokens` (per device token)
- Table created 2026_06_14 (BE/database/migrations/2026_06_14_000000_create_driver_push_tokens_table.php); columns in schema dump BE/database/schema/mysql-schema.sql:448-475: `park_id, user_id, driver_id, token (UNIQUE), platform ('android | ios'), geo_permission, camera_permission, push_permission, failure_count, created_at, updated_at`; index on `updated_at`.
- `app_version varchar(32) NULL` and `app_build unsigned int NULL` added by BE/database/migrations/2026_10_27_100000_add_app_version_to_driver_push_tokens_table.php:15-18 (comment line 8-9: "comes with push token `POST /push-tokens`... Old version (A) does not send - empty").
- NOTE: schema dump `mysql-schema.sql` is dated Oct 14 and does NOT yet contain app_version/app_build (it predates the 10-27 migration).
- Model: BE/app/Models/DriverPushToken.php:14-31 (fillable incl. app_version/app_build; `app_build` cast int; global ParkScope line 35).
- Endpoint: `POST /api/driver/v1/push-tokens` and `DELETE` - BE/routes/driver_app/shared.php:20-21 (auth:sanctum + app.context, any mode driver/staff).
- Controller validation: BE/app/Http/Controllers/Api/DriverApp/DriverPushTokenController.php:27-39 - `token` required, `platform` required in:android,ios, `*_permission` nullable, `app_version` nullable string max 32, `app_build` nullable int.
- Service: BE/app/Services/Push/DevicePushTokenService.php:21-62 - `updateOrCreate` keyed by `token`; null fields are filtered out (array_filter line 38-45) so a client that does not send app_version keeps the old value; sets user_id, park_id, driver_id (null if user is not a driver in this park), failure_count=0; if nothing changed it calls `touch()` so `updated_at` = "last time app confirmed token" (lines 55-59).
- Granularity: one row per device push token (token is UNIQUE globally). Token belongs to a User in the active park; re-registration in another park re-assigns the row (park_id/user_id overwritten, line 25-33). Per driver = possibly several rows (several devices).
- Token deletion: FCM `UNREGISTERED` x3 deletes the row (BE/app/Services/Push/FcmPushService.php:110-124); explicit DELETE /push-tokens on logout / toggle off.

### 1.3 When KMP sends version
- DTO: KMP/data/pushtoken/dto/PushTokenDtos.kt:7-16 (`app_version`, `app_build`).
- Filled from `AppBuildInfo` every registration: KMP/data/pushtoken/PushTokenRepositoryImpl.kt:23-35 (`appVersion = buildInfo.versionName`, `appBuild = buildInfo.buildNumber`).
- AppBuildInfo: KMP/platform/AppBuildInfo.kt:3-6; Android `versionCode`/`versionName` (kmp/shared/src/androidMain/.../platform/AndroidAppBuildInfo.kt:14,17); iOS `CFBundleVersion`/`CFBundleShortVersionString` (kmp/shared/src/iosMain/.../platform/IosAppBuildInfo.kt:5-11). Current: kmp/androidApp/build.gradle.kts:44-45 `versionCode = 214`, `versionName = "2.0.29"`.
- Trigger (KMP/data/push/PushRegistrar.kt:44-69, 74-83): when (session user id, activeParkId, pushNotificationsEnabled) changes - i.e. on app start with restored session, login, park switch, toggle on; on FCM token refresh; and `ensureRegistered()` (going on taxi line). Only if push notifications are enabled in app settings; if no FCM token - nothing sent (`push.no_token`). KMP sends only `push_permission`, not geo/camera (line 77).
- So version is updated on (re)registration, NOT on each request. Drivers who disabled push in app => no row => no version.
- Old Ionic app (A, mobile/app): POSTs `/push-tokens` with `{token, platform, ...permissions}` only - no version (mobile/app/src/services/FleetApi.ts:684). A's version (package.json:4-5 `1.6.8`/`157`) only goes to `/version-check?build=&platform=` (FleetApi.ts:930) and Better Stack remote logger (mobile/app/src/services/remoteLogger.ts:29,91).
- KMP remote log also includes `app_version`/`platform`/`app: "B"` but it goes directly to Better Stack, not our backend (KMP/data/log/RemoteAppLog.kt:138-145; kmp/docs/adr/0009-remote-log.md "Напряму в Better Stack").

### 1.4 /version-check (public, not stored)
- BE/routes/driver_app/public.php:19-24; BE/app/Http/Controllers/Api/DriverApp/DriverAppVersionController.php:24-51: reads `build` and `platform` query params, compares to config, returns status; nothing persisted.
- KMP calls it once per process start (KMP/data/appversion/AppVersionRepositoryImpl.kt:36-52, cached in memory; KMP/ui/App.kt:94-101).

### 1.5 Login / session
- `DriverAppAuthService::issueUserToken` creates Sanctum token named `app-mobile`, expires in 1 year (BE/app/Services/DriverAppAuthService.php:29-48). No version/platform/device fields on login. Login endpoints: BE/routes/driver_app/public.php:34-78; DriverAuthController methods at BE/app/Http/Controllers/Api/DriverApp/DriverAuthController.php:59 (login), 108 (loginWithPhone), 155 (verifyPhoneCode), 282 (logout) - none take app_version.
- Legacy token name `driver-mobile-app` (tokenable = Driver) still counted (BE/app/Services/DriverService.php:105-109).

### 1.6 "Last seen"
- `personal_access_tokens.last_used_at` - Sanctum updates it on EVERY authenticated request (vendor/laravel/sanctum/src/Guard.php:80-89). Used as app "last seen" by DriverService::getDriversList (BE/app/Services/DriverService.php:94-109): `MAX(COALESCE(last_used_at, created_at))` for tokens `app-mobile` (tokenable User = drivers.user_id) and legacy `driver-mobile-app` (tokenable Driver).
- `driver_push_tokens.updated_at` = last token registration/confirmation (DevicePushTokenService.php:55-59).
- No `last_login_at`/`last_seen_at` on users/drivers. (Taxi has its own `driver_presence.last_seen_at`, migration 2026_10_17_100100.)

---

## 2. "Latest" / "minimum supported" version

- Config BE/config/mobile_app.php:23-34: `min_required_build` = env `APP_MOBILE_MIN_BUILD` (default 1), `latest_build` = env `APP_MOBILE_LATEST_BUILD` (default 1), `store_url.ios/android`. Comment lines 8-19 (mentions capacitor buildNumber - written for A).
- Used only in DriverAppVersionController.php:31-39: `build < min` -> `update_required`; `build < latest` -> `update_available`; else `ok`. Response: status, min_build, latest_build, store_url.
- KMP: `UPDATE_REQUIRED` -> full-screen `ForceUpdateScreen` (KMP/ui/App.kt:94-101, 129-131). `UPDATE_AVAILABLE` is parsed (AppVersionRepositoryImpl.kt:43-47) but App.kt only reacts to UPDATE_REQUIRED (no soft nudge in shown code). No store-version lookup (no App Store/Play API).
- Domain doc comment KMP/domain/appversion/AppVersionRepository.kt:11-14 still says "new >= 1000, old < 1000 (ADR 0003)" - superseded by ADR 0004.
- No version thresholds in DB settings tables found; only env config.
- Super-park "Оновлення застосунку" page: `GET /system/app-update-push` (BE/routes/api/system.php:207) -> AppUpdatePushController::summary (BE/app/Http/Controllers/Api/System/AppUpdatePushController.php:23-26) -> AppUpdateBroadcast::audience()/builds() (BE/app/Services/Push/AppUpdateBroadcast.php:19-55): groups all tokens (all parks, unique by token) by platform|app_build|app_version with device counts. POST same URL queues push broadcast (lines 29-51; app/Services/PushBroadcast/readme.md).

### CHANGELOG (mobile/release/CHANGELOG.md)
- Header lines 1-7: shared for A (Ionic) and B (KMP); version+build one through-sequence; odd builds = A, even = B; headings marked ` · A` / ` · B`; entries before 158 unmarked = A.
- Heading format: `## <version> (<build>) — <YYYY-MM-DD> · B` then line "Нова версія застосунку." and bullet list.
- Latest: `## 2.0.29 (214) — 2026-11-06 · B` (line 9). Latest A: `## 1.6.8 (157) — 2026-10-05` (line 226) - no A after 158. First B: 2.0.1 (158). 129 headings total.
- ADR: kmp/docs/adr/0004-shared-build-numbering.md (parity rule, supersedes ranges of kmp/docs/adr/0003-old-and-new-versions-one-app.md). 2.0.0 (1000) TestFlight build - not to be used.

---

## 3. Version data already displayed in web cabinet

### 3.1 Drivers list column "Застосунок" (App)
- Column definition: BE/resources/js/pages/Drivers/DriverList/DriverListDesktop.jsx:124 `{ id: 'app', label: t('drivers.col.app') }`; cell 217-224 renders `<AppStatusBadge status={driver.app_status} lastSeenAt={driver.app_last_seen_at} platform={driver.app_platform} pushPermission={driver.app_push_permission} />`.
- Component BE/resources/js/components/UI/AppStatusBadge.jsx:14-62: badge label `drivers.app_status.{active|inactive|none}`; tooltip = hint, last seen datetime, platform (Android/iOS), push permission. NO version/build displayed.
- i18n BE/resources/js/i18n/drivers.ts:28 (col.app = 'Застосунок'), 32-38 (uk: Активний / Неактивний / Немає + hints), also en at ~77, ru at ~122.
- Backend: DriverResource::appInfo() BE/app/Http/Resources/DriverResource.php:121-153: `APP_ACTIVE_DAYS = 7`; lastSeen = max(app_last_seen_at, app_legacy_last_seen_at); `none` if null, `active` if within 7 days, else `inactive`; returns `app_status, app_last_seen_at, app_platform, app_push_permission`. Returns `app_status => null` when list subquery absent (show()).
- Subqueries in DriverService::getDriversList BE/app/Services/DriverService.php:94-123: app_last_seen_at (personal_access_tokens app-mobile by user), app_legacy_last_seen_at (driver-mobile-app by driver), app_platform and app_push_permission (latest driver_push_tokens row by `driver_id`, ordered by updated_at). App_version/app_build NOT selected.
- API: `GET /api/drivers` (list) via DriverController -> DriverService::getDriversList.

### 3.2 System (super-park) pages
- `/system/app-update-push` page: BE/resources/js/systemPages/SystemAppUpdatePush/index.jsx:42 (GET), 59 (POST), table "Збірки на пристроях" 104-130 shows platform, `app_version (app_build)` or "невідомо — стара версія чи ще не відкривали після оновлення", device count. Route BE/resources/js/app.jsx:323-327 (SystemGuard); nav BE/resources/js/components/Navigation/NavigationItems.js:441-445 "Оновлення застосунку".
- Debug `GET /system/.../push-tokens` (BE/routes/api/system.php:77; BE/app/Http/Controllers/Api/DebugController.php:469-497) lists tokens with park/driver/platform/permissions/created/updated - does NOT include app_version/app_build.

---

## 4. Telegram connection of a driver

- `users.telegram_id` (+ `telegram_connection_token`, `telegram_token_expires_at`) - migration BE/database/migrations/2026_02_10_000000_add_telegram_fields_to_users_table.php:14-17. Person-level.
- `drivers.telegram_connected_at` / `telegram_connection_token` / `telegram_token_expires_at` - park-level connection to that park's bot (schema mysql-schema.sql:538-541; `drivers.telegram_id` column still exists in the dump but model reads person's value).
- Driver model: `getTelegramIdAttribute()` -> `$this->user?->telegram_id` (BE/app/Models/Driver.php:187-190). `connectTelegram()` writes users.telegram_id and drivers.telegram_connected_at=now(), clears token (Driver.php:648-680).
- `isTelegramConnected()` = telegram_id not null AND telegram_connected_at not null (Driver.php:762-765).
- `getTelegramConnectionStatusAttribute()` -> 'connected' | 'pending' (valid token) | 'not_connected' (Driver.php:770-781). Enum BE/app/Enums/TelegramStatusEnum.php:5-9.
- Drivers list filter `telegram_status` (BE/app/Services/DriverService.php:151-158): `connected` -> scopeWithTelegram = whereHas user with telegram_id not null (Driver.php:391-394); `not_connected` -> scopeWithoutTelegram (Driver.php:399-402); `pending` not filtered. NOTE: filter ignores telegram_connected_at, while the badge status requires it - definitions differ.
- Filter options from DriverController (BE/app/Http/Controllers/Api/DriverController.php:287-294).
- Resource fields: telegram_id, telegram_username, telegram_connected_at, telegram_connection_status (DriverResource.php:89-92). Frontend: driverService.getTelegramStatusFromDriver (BE/resources/js/services/driverService.js:98-111) -> TelegramStatusBadge in DriverListDesktop.jsx:205-215.
- Mobile staff API uses yet another definition: `'telegram_connected' => (bool) $d->telegram_connected_at` (BE/app/Http/Controllers/Api/DriverApp/DriverStaffDriversController.php:233).
- `hasTelegram()` = telegram_id not null (Driver.php:593-596).

---

## 5. Web cabinet home page (Dashboard)

Important: `/staff/dashboard-summary` is the MOBILE (KMP staff mode) home endpoint, not the web cabinet.
- BE/routes/driver_app/staff.php:52 -> BE/app/Http/Controllers/Api/DriverApp/DriverStaffDashboardController.php:43-109 (single aggregate JSON: free vehicles, free drivers by status (status != inactive, no vehicle), expired docs, critical maintenance, schedule risk, missing mileage, week expenses, birthdays, `drivers_without_deposit_count` = `countDriversWithoutDeposit()` only if `userCanAccess(app_user)` else null, lines 86-91, 106). Consumed by KMP StaffHomeViewModel / StaffDtos.kt:23.

### Web Dashboard page
- BE/resources/js/pages/Dashboard.jsx (route page). Widgets rendered (gated by `isWidgetEnabled(DASHBOARD_WIDGETS.X)`):
  - Onboarding `WelcomeDashboard` (187-198) - data `useParkSetupStatus` -> GET /dashboard/setup-status
  - `ParkPulseWidget` (207-211) - GET /dashboard/pulse
  - `UklonPulseWidget` (214-218) - GET /dashboard/uklon-pulse
  - `VehicleStatusList` (221-229) - useDashboardVehicles -> GET /reports/vehicles-dashboard
  - `CriticalMaintenanceGrouped` (234-242) - GET /dashboard/critical-overdue-maintenance
  - `DocumentIssuesWidget` (245-249)
  - `OpenTasksWidget` (255-264) - GET /tasks
  - `OpenIssueReports` (267-275) - GET /reports/active-issue-reports
  - `DriversWithoutDepositWidget` (279-283) - gated additionally by `canAccess('finance-driver-deposits')`
  - `BirthdaysWidget` (286-290) - GET /dashboard/birthdays
  - Unused components in folder: InsuranceIssuesWidget, SystemActivityMatrixWidget, SystemPulseWidget, UklonOrdersStatsWidget, TestUklonOrdersStatsWidget, UpcomingMaintenance, VehicleMileageChartWidget, VehiclesStatsWidget (imported but not rendered).
- Widget registry: BE/resources/js/constants/dashboardConfig.js:3-16 (`DASHBOARD_WIDGETS` ids), 18-91 (`WIDGET_DEFINITIONS` label/description/defaultEnabled), 95 (`WIDGETS_ADDED_AFTER_V1` - do NOT add new ones there, comment 93-94), 97-101 defaults.
- Settings persistence: localStorage `dashboard_settings_v1`, new widgets auto-enabled via `knownWidgets` (BE/resources/js/hooks/useDashboardSettings.js:9-27). Settings modal iterates WIDGET_DEFINITIONS (BE/resources/js/components/modals/DashboardSettingsModal.jsx:4,22).
- i-doc ids: BE/resources/js/common/i-doc/i-doc.registry.ts:271-279 (SectionIndices.DASHBOARD_*), e.g. `DASHBOARD_DRIVERS_WITHOUT_DEPOSIT: 'sec:dashboard-drivers-without-deposit'`.
- Permission gating (frontend): `canAccess(module)` = `can(module+'.view') && !can('deny:'+module+'.view')` (BE/resources/js/context/AuthContext.jsx:134-136).

### Reference widget: Drivers without deposit (full chain)
- Component BE/resources/js/components/Dashboard/DriversWithoutDepositWidget.jsx:26-71 (Card, title, count, list; returns null if loading/empty; click opens DriverDepositModal).
- Hook BE/resources/js/hooks/useDriverDeposits.js:34-41 (`useQuery` key ['driver-deposits','without-deposit'], staleTime 60s).
- Service BE/resources/js/services/driverDepositsService.js:23-25 (`apiClient.get('/driver-deposits/without-deposit')`).
- Route BE/routes/api/finance.php:138 (group `auth:sanctum`, `staff` line 20).
- Controller BE/app/Http/Controllers/Api/DriverDepositController.php:125-136 (`userCanAccess(Auth::user())` else forbidden; returns `{success, data}`).
- Service BE/app/Services/DriverDepositService.php: PERMISSION `finance-driver-deposits.view` / DENY (37-38), `userCanAccess` (51-54), `EXPECTED_DEPOSIT_STATUSES = [ACTIVE, NEW, CANDIDATE]` (260-261), `driversWithoutDeposit()` (314-340, whereIn drivers.status EXPECTED_DEPOSIT_STATUSES), `countDriversWithoutDeposit()` (342-346).
- Dashboard API routes file: BE/routes/api/dashboard.php:13-26 (`auth:sanctum`,`staff`; prefix `dashboard`; DashboardController e.g. birthdays at BE/app/Http/Controllers/Api/DashboardController.php:122-127 using CurrentPark).
- Other widget pattern (BirthdaysWidget.jsx) uses `api` from services/api directly with useEffect (lines 3-8).

---

## 6. "Active" driver statuses

- Enum BE/app/Enums/DriverStatusEnum.php:7-10: `candidate`, `new`, `active`, `inactive`.
- `Driver::scopeActive` = status != inactive (BE/app/Models/Driver.php:264-267); `isActive()` same (Driver.php:556-559). `isAvailable()` = active status (566).
- `DriverDepositService::EXPECTED_DEPOSIT_STATUSES` = ACTIVE, NEW, CANDIDATE (= all except inactive) (DriverDepositService.php:261).
- DriverStaffDashboardController free drivers: `status != 'inactive'` (line 55).
- Drivers list `active_only` filter -> scopeActive (DriverService.php:192-194).
- `ParkUserStatus` (BE/app/Models/ParkUserStatus.php:13-45) is STAFF status per (user, park): `active`/`inactive`, absence of row = active - not driver status.
