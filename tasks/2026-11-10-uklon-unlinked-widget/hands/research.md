# Research: Uklon fleet drivers/vehicles not linked to our Driver/Vehicle

Repo root: /Users/dmytro/Rep/park/app/park-react-spa (paths below relative to it). Facts only.

## 1. Storage, fetching, sync, freshness

### Tables / models (archive connection `uklon`)
- `app/Models/UklonDriver.php:20` `$connection = 'uklon'`; fillable :22-39; ParkScope global scope :48-51. Intentionally no ORM relations to core (docblock :9-15).
- `app/Models/UklonVehicle.php:23` `$connection = 'uklon'`; fillable :25-42; ParkScope :50-53.
- Original schema: `database/migrations/2024_05_23_130000_create_uklon_drivers_table.php:14-44`
  - `uklon_id` char(36) **unique (global, not per park)** :17; `driver_id` (our driver) :20; first_name/last_name :23-24; `phone` varchar(20) indexed :25; status :26; signal (callsign) :27; rating :28; balance/limit/currency :31-33; `current_uklon_vehicle_id`, `current_license_plate` :36-37; raw_data json, data_hash md5 :40-41; timestamps :43.
- `database/migrations/2024_05_23_120000_create_uklon_vehicles_table.php:14-40`
  - `uklon_id` char(36) unique :17; `vehicle_id` (ours) :20; `uklon_driver_id` :21; `driver_id` (ours) :22; `license_plate` indexed :25; status :26; brand/model/year/color/comfort_level :27-31; has_branding/has_priority :32-33; raw_data/data_hash :36-37; timestamps :39.
- Moved to archive DB: `database/migrations/2026_07_21_100001_move_uklon_vehicles_to_archive_db.php`, `..._100003_move_uklon_drivers_to_archive_db.php:13-16` -> `UklonArchiveMover::provision()` creates an empty table without FK in archive; "Архів наповнюється синком/ручним заливом" (:7-9). So `created_at` in archive = first time row was written into the archive (sync or manual refill), not necessarily first appearance in Uklon.
- uklon_id format: dashes stripped everywhere (`UklonSyncService.php:77`, `:192`; `UklonFleetService.php:221`, `:302`).

### Sync (writes uklon_drivers / uklon_vehicles)
- `app/Services/Uklon/UklonSyncService.php`
  - `syncVehicles(Park)` :24-71 — returns stats incl. `uklon_ids` (all ids currently in fleet). Skips (returns empty stats) if `uklon_settings.client_id`/`client_secret` empty :28-31. Paginates live API `getFleetVehicles` limit 50 with sleep(1) :41-61. Updates `uklon_settings.last_sync.vehicles` :68.
  - `processVehicle` :73-137 — lookup by uklon_id WITHOUT park scope :83-85; if data_hash unchanged -> skipped (row and its updated_at untouched, vehicle_id NOT refreshed) :87-90; `vehicle_id` = our Vehicle with same park_id+uklon_id :92-95 (no plate matching); `driver_id` = our Driver with uklon_id = vehicle's Uklon driver :97-101; field mapping :103-120 (`licencePlate`, `status.value`, `about.maker.name`, ...).
  - `syncDrivers(Park)` :139-186 — same pattern; `last_sync.drivers` :183.
  - `processDriver` :188-254 — hash-skip :202-205; `driver_id` = Driver with same uklon_id :207-210, else **phone fallback** (last 9 digits, `whereHas('user', phone like %...)`) :212-218. This only fills `uklon_drivers.driver_id`; it does NOT set `Driver.uklon_id`. Mapping :220-237 (`first_name`, `last_name`, `phone`, `status`, `signal`, `rating`, `cash_limit.*`, `selected_vehicle.vehicle_id/license_plate`).
  - Departed fleet members: rows stay in table (comment :78, :193); there is no "in fleet"/"last_seen" column — membership is only known from the `uklon_ids` returned by a live sync.
  - `updateLastSyncTime` :601-613 — writes `uklon_settings.last_sync[type] = now()` (saveQuietly).
- Command `app/Console/Commands/SyncUklonFleet.php` (`uklon:sync-fleet {park_id?}`) :17; parks with non-null uklon_settings :36-39; skips if `!is_active` :56-59, if `background_sync_enabled === false` :62-65; per-park toggles `sync_vehicles_enabled` / `sync_drivers_enabled` (default true) :71-98.
- Schedule `app/Console/Kernel.php:95-99` — `uklon:sync-fleet` dailyAt 03:00.
- Manual triggers: `GET /uklon-drivers/sync` / `GET /uklon-vehicles/sync` (`UklonDriverController::syncAndIndex` :59-73, `UklonVehicleController::syncAndIndex` :66-80, only if `uklon_settings.is_active`); `POST /uklon/run-sync-fleet` (`UklonController::runSyncFleet` :124-149, used by `resources/js/pages/Debug.jsx:449`).
- `POST /uklon/run-link-fleet` (`UklonController.php:114-122`) calls artisan `uklon:link-fleet` — no such command exists in `app/Console/Commands` (grep found none).

### Live API (no DB)
- `UklonFleetService::getAllUklonDrivers` / `getAllUklonVehicles` `app/Services/Uklon/UklonFleetService.php:31-56` -> `fetchAllUklonDrivers/Vehicles` :455-503 (live paginated, ids de-dashed, returns raw Uklon items: `id`, `first_name`, `phone`, `licencePlate`, ...). Exposed via `GET /uklon/linking/drivers/all`, `/uklon/linking/vehicles/all` (`routes/api/uklon.php:29,33`; `UklonController.php:153-177`).
- Single synced record: `GET /uklon/drivers/{uklonId}`, `/uklon/vehicles/{uklonId}` (`UklonController.php:179-255`) — returns `synced_at` = `updated_at`.

### Freshness signals available
- `uklon_drivers.created_at` / `uklon_vehicles.created_at` — first insert into archive (see caveat above).
- `updated_at` — changes only when Uklon payload hash changes (`UklonSyncService.php:87-90`, `:202-205`).
- `parks.uklon_settings.last_sync.{drivers,vehicles}` — last successful sync time; returned as `meta.last_sync_at` by `/uklon-drivers` (`UklonDriverController.php:49-56`) and `/uklon-vehicles` (`UklonVehicleController.php:56-63`).
- Index sorting allows `created_at` (`UklonDriverController.php:37`, `UklonVehicleController.php:37`).

## 2. How linking works today

### Fields on core models
- `Driver.uklon_id`, `Driver.uklon_raw_data` — `app/Models/Driver.php:81-82`, cast :112. `DriverResource.php:54` exposes `uklon_id`.
- `Vehicle.uklon_id`, `Vehicle.uklon_raw_data` — `app/Models/Vehicle.php:87-88`, cast :120. `VehicleResource.php:69`.
- Source of truth for "linked" in the backend unlinked queries = `Driver.uklon_id` / `Vehicle.uklon_id` (`UklonFleetService.php:66`, `:112`). Archive back-pointers `uklon_drivers.driver_id`, `uklon_vehicles.vehicle_id` are secondary (set by link, by sync, or phone-guess in sync).

### Link/unlink service (`app/Services/Uklon/UklonFleetService.php`)
- `linkDriver(park, uklonId, localDriverId, ?uklonData)` :218-257 — de-dash id; steals uklon_id from a conflicting local driver (sets their uklon_id=null) :226-235; sets Driver.uklon_id + uklon_raw_data :239-241; in `uklon` transaction: clears other archive rows pointing to this driver, sets `uklon_drivers.driver_id`, backfills `uklon_orders.driver_id` where null :245-256.
- `unlinkDriver` :262-270; `bulkLinkDrivers` :275-294 (errors logged, swallowed).
- `linkVehicle` :299-344 — same as driver, plus order backfill limited to after previous disposal date of a trashed vehicle with same uklon_id :326-342. `unlinkVehicle` :349-357; `bulkLinkVehicles` :362-381.
- `syncVehicles(park, updates)` :386-451 — copies Uklon data into local Vehicle (make/model/options firstOrCreate).
- `linkDriverByPhone(park, driver, phone)` :180-213 — auto-link when driver joins park in mobile app: last 9 digits match, exactly one UklonDriver in park, not taken by another; called from `app/Http/Controllers/Api/DriverApp/DriverAppRegistrationController.php:200`. This is the only automatic linking that sets Driver.uklon_id.
- Matching helpers: `normalizePhone` last 9 digits :505-509; `normalizePlate` upper + strip non-alnum (incl. Cyrillic) :511-514.

### Unlinked lists + prefill (backend, already exist)
- `unlinkedDrivers(Park)` :62-74 — **forces a live sync first** (`syncService->syncDrivers($park)['uklon_ids']`), then `UklonDriver where park_id, whereIn uklon_id (currently in fleet), whereNotIn (Driver.uklon_id of park)` ordered by last_name, first_name; returns columns `uklon_id, first_name, last_name, phone, status, current_license_plate`.
- `unlinkedVehicles(Park)` :108-120 — same, Vehicle.uklon_id; columns `uklon_id, license_plate, brand, model, year, color, status`; ordered by license_plate. Note: `Vehicle::where(...)` is default-scoped (SoftDeletes) so trashed vehicles' uklon_ids count as unlinked.
- `driverPrefill(park, uklonId)` :79-103 — form prefill (first/last name, phone) + `existing` = our Driver whose user.phone ends with same 9 digits (id, name, uklon_id).
- `vehiclePrefill(park, uklonId)` :126-166 — form prefill (plate, make_id/model_id from dictionary or raw name, year, color, body_type, comfort_level, seats, is_priority, options) + `existing` = our Vehicle with same normalized plate (loads all park vehicles and filters in PHP :138-141).

### Create-with-link
- `SaveDriverRequest.php:90-94` — `uklon_id` on POST, unique per park; `DriverService::createDriver` :460, :504-505 calls `linkDriver` in the same DB transaction.
- `StoreVehicleRequest.php:142-150` — `uklon_id` unique per park among non-deleted; `VehicleService::createVehicle` :161, :178-181 calls `linkVehicle`.

### Endpoints (`routes/api/uklon.php`, group `auth:sanctum` + `staff` :12)
- `GET /uklon/linking/drivers` -> `getDriversForLinking` (`UklonController.php:317-324`) -> `unlinkedDrivers` (response `{data: [...]}`).
- `GET /uklon/linking/drivers/all` (live API raw list) :29.
- `GET /uklon/linking/drivers/{uklonId}/prefill` :30 -> `UklonController.php:326-333`.
- `POST /uklon/linking/drivers/bulk` :31 (validation `UklonController.php:257-275`).
- `POST /uklon/linking/drivers` :37 `{uklon_id, local_driver_id}` (`UklonController.php:356-370`).
- Vehicles mirror: `GET /uklon/linking/vehicles` :32, `/all` :33, `/{uklonId}/prefill` :34, `POST /bulk` :35, `POST /sync` :36, `POST /uklon/linking/vehicles` :38 `{uklon_id, local_vehicle_id}` (`UklonController.php:372-386`).
- `GET /uklon-drivers`, `/uklon-drivers/sync`, `/uklon-drivers/{id}` :89-93; `/uklon-vehicles...` :78-82.

### Frontend: pages UklonDrivers / UklonVehicles
- `resources/js/pages/UklonDrivers/index.jsx` — paginated read-only list from `GET /uklon-drivers` (:68-99), "Оновити" calls `/uklon-drivers/sync` (:105-115), shows "Оновлено: last_sync_at" (:135-159). JSDoc lists `modal_driver_integration` (:18-19) but the page does NOT render any modal; state comment "Стан для модалки інтеграції" :66 is empty.
- `UklonDriversList.jsx` columns: name + "ID: uklon_id", phone, current_license_plate ("Без авто"), rating, status (:36-115). **No linked/unlinked indicator, no actions** (although `UklonDriverResource` returns `driver_id` — `app/Http/Resources/UklonDriverResource.php:44`).
- `resources/js/pages/UklonVehicles/index.jsx` — identical structure (diff only in names), endpoint `/uklon-vehicles`. `UklonVehiclesList.jsx` shows plate, brand/model, driver from archive dict (:80-84, :142-145). Resource returns `vehicle_id` (`UklonVehicleResource.php:40`) but UI does not use it. No actions.
- Index endpoints list ALL rows in table incl. departed ones; no `linked` filter param (`UklonDriverController.php:19-57`, `UklonVehicleController.php:19-64`).
- Resources apply fake data when header `X-Demo-Mode: true` or `?demo_mode` (`app/Http/Resources/Traits/WithDemoData.php:14-17`) — different thing from the Kyiv demo park.

### Frontend: "Link with Uklon" (Drivers / Vehicles pages)
- `resources/js/pages/Drivers/index.jsx:185-191` header action `uklon-link` (label `drivers.actions.uklon_link` = "Зв'язати з Uklon" / "Link with Uklon", `resources/js/i18n/drivers.ts:9,99`) opens `DriverIntegrationModal` :362-366.
- `resources/js/components/modals/DriverIntegrationModal.jsx` — loads `GET /drivers?per_page=1000` + `GET /uklon/linking/drivers/all` (LIVE API) :45-48; rows are LOCAL drivers; pass 1 = already linked (`linked` / `linked_not_found`) :61-80; pass 2 = auto-suggest match by phone (last 9) then exact first+last name :85-128; filters all/matched/linked/unmatched :255-258, :314-325; per-row Autocomplete of remaining Uklon drivers :263-269; Save -> `POST /uklon/linking/drivers/bulk` then `window.location.reload()` :195-227. On 403 shows "Інтеграція недоступна" + navigate `/settings?tab=integrations` :135-139, :272-303. It does not list Uklon drivers lacking a local counterpart as rows (only count "Всього в Уклоні").
- `resources/js/pages/Vehicles/index.jsx:281-286` header action `uklon-link` opens `VehicleIntegrationModal` :590-594.
- `resources/js/components/modals/VehicleIntegrationModal.jsx` — TabsModal: "Зв'язок" `VehicleIntegration/VehicleLinkingTab.jsx`, "Синхронізація" `VehicleSyncTab.jsx` (:10-23). Linking tab: `GET /vehicles?per_page=1000` + `GET /uklon/linking/vehicles/all` :43-46; auto-match by normalized plate (`u.licencePlate`) :82-99; save `POST /uklon/linking/vehicles/bulk` :179. Sync tab: `GET /uklon/linking/vehicles/all` :175 + `POST /uklon/linking/vehicles/sync` :285.

### Frontend: "Find in Uklon" picker in Add forms (uses the unlinked endpoints)
- `resources/js/components/Uklon/UklonFleetPicker.jsx` — props `{type: 'drivers'|'vehicles', selected, onSelect, onLinked}` :52; collapsed button -> search mode (:120-139); `useUnlinkedUklonFleet(type, isSearching)` :59; picking calls prefill and `onSelect({uklon_id, prefill, existing})` :63-72; if `existing` -> "link existing" button calls `POST /uklon/linking/{type}` :74-82, :106-115. Display: drivers label "last first", hint "+phone · plate" :25-34; vehicles plate badge + brand/model/year :35-40.
- `resources/js/queries/uklonFleet.js` — `useUnlinkedUklonFleet` staleTime 0, gcTime 0, retry false :13-22; `useUklonFleetPrefill` :24-28; `useLinkUklonFleet` :30-34. Query key `['uklon-fleet','unlinked',type]` :6-9.
- `resources/js/services/uklonService.js:24-37` — `getUnlinkedFleet`, `getFleetPrefill`, `linkFleet`.
- Used in `components/modals/Driver/DriverFormModal.jsx:232-240` (only when `!isEditMode`), submit adds `uklon_id` :132; `handleUklonLinked` invalidates drivers list + closes :165-168. Props `{isOpen, onClose, onSuccess, driverId}` :50 — no prop to preselect a Uklon record; `uklonPick` reset on open :95.
- `components/modals/VehicleFormModal.jsx:232-238` (only `!isEdit`); `handleUklonSelect` sets form values incl. uklon_id :68-71; requires `vehicleForm` prop from Vehicles page (:52-56); `onUklonLinked` prop wired at `pages/Vehicles/index.jsx:485`. No preselect prop; reset on open :66.

## 3. Existing "unlinked" endpoints & special parks
- Already-existing unlinked endpoints: `GET /api/v1/uklon/linking/drivers` and `GET /api/v1/uklon/linking/vehicles` (see §2). No `linked=false` / `not_in_park` filter on `/uklon-drivers` or `/uklon-vehicles`.
- Cost: each call runs a full live sync (paginated, `sleep(1)` between pages, `UklonSyncService.php:58-60`, `:173-175`) — that is why the picker only fetches on demand.
- Park without Uklon (`uklon_settings` null / no client_id+secret): `syncDrivers/syncVehicles` return empty `uklon_ids` (:28-31, :143-146) -> `whereIn('uklon_id', [])` -> endpoint returns `{data: []}` (no error).
- Park with credentials but `is_active=false`: `setCredentials` sets isActive=false (`UklonApiService.php:52`), `request()` aborts 403 "Uklon integration is disabled or not configured for this park." (`UklonApiService.php:122-125`) -> syncDrivers rethrows (:178-181) -> `UklonController::handleException` returns 403 (:391-402).
- Live-API `/all` endpoints: `Fleet ID not configured` exception -> 500 if no fleet id (`UklonFleetService.php:36-38`); 403 when inactive.
- Setup status flag for dashboard: `DashboardController.php:49` `uklon_configured = !empty(is_active) || !empty(client_id)` (used by `pages/Dashboard.jsx:130`).
- Demo park "Київ" (id 15): `uklon_settings.demo` set by `app/Services/Uklon/Demo/DemoUklonSetup.php:42-51` (is_active true, client_id/secret 'demo', fleet_id, name 'Демо-Уклон', demo block); enabled by data migration `database/migrations/2026_10_30_120000_enable_uklon_demo_for_kyiv.php`. `UklonApiService::request` routes to `DemoUklonApi` instead of network (`UklonApiService.php:132-135`), so sync and unlinked endpoints work unchanged.
  - Mock fleet `DemoUklonData::fleetDrivers` :81-109 / `fleetVehicles` :111-124: cast drivers/vehicles (pre-linked by `DemoUklonSetup.php:61-68`) + always EXTRA_COUNT fictional, not-yet-added records from pools EXTRA_DRIVERS :34-37 / EXTRA_VEHICLES :39-42 via `extras()` :142-148 (skips ones whose demo uklon_id is already taken; doc says "завжди 3 вигаданих" — `docs/uklon-demo.md:14-15`). So the demo park always has ~3 unlinked drivers and ~3 unlinked vehicles; adding one rotates in the next.
  - `DemoUklonSetup::demoParkIds()` :121-124 and `canEnable()` :127-132 available.
- Per-park sync toggles (`ParkSettingsController.php:195-245`): `background_sync_enabled`, `sync_vehicles_enabled`, `sync_drivers_enabled` affect only cron (`SyncUklonFleet.php:62-98`); unlinked endpoints sync regardless of them (only `is_active` + credentials matter).

## 4. Permissions & menu
- Menu: `resources/js/components/Navigation/NavigationItems.js:276-319` `INTEGRATION_MENU_ITEMS` -> "Інтеграція Uklon" `permission: 'uklon'` :282, children `/uklon-vehicles` :290 and `/uklon-drivers` :295 (no own permission).
- Permission `uklon.view` / `deny:uklon.view` created in `database/migrations/2026_04_17_000004_add_finance_integrations_view_permissions.php:17-20` (Owner + Admin per park). Not in `admin_excluded` (`config/permission.php:181-185`).
- Routes: `resources/js/app.jsx:251-252` — `uklon-vehicles`, `uklon-drivers` have NO `PermissionGuard` (guard defined :130-145, used only for billing :225, driver-schedule :246).
- Backend: `routes/api/uklon.php:12` only `auth:sanctum` + `staff`; no permission checks in `UklonController`, `UklonDriverController`, `UklonVehicleController` (grep for permission/can found none).
- Drivers page: nav `permission: 'drivers'` (`NavigationItems.js:19`); Vehicles list `permission: 'vehicles.list'` (:70). Drivers/Vehicles API routes only `auth:sanctum`+`staff` (`routes/api/drivers.php:10`).
- Backend permission pattern for dashboard widget: `DashboardController::driverConnections` :134-140 `abort_unless($user->can('drivers.view') && !$user->can('deny:drivers.view'), 403)`.

## 5. Dashboard widget pattern
- `resources/js/constants/dashboardConfig.js` — add key in `DASHBOARD_WIDGETS` :3-17 and definition in `WIDGET_DEFINITIONS` :19-98 (`id`, `label`, `description`, `defaultEnabled`); `WIDGETS_ADDED_AFTER_V1` :100-102 — comment says new widgets must NOT be added there (handled by `knownWidgets`); `DEFAULT_DASHBOARD_CONFIG` :104-108 auto-includes all keys.
- `resources/js/pages/Dashboard.jsx`: imports widgets :11-32; `const { user, canAccess } = useAuth()` :77; `isWidgetEnabled` :91; setup status / `showUklonCard` :121-131; layout :200-300 — full-width widgets gated by permission: `DRIVER_CONNECTIONS && canAccess('drivers')` :280-285, `DRIVERS_WITHOUT_DEPOSIT && canAccess('finance-driver-deposits')` :287-292, then BIRTHDAYS :294-298. Each wrapped in `<div data-i-doc={SectionIndices.DASHBOARD_...}>` (registry `resources/js/common/i-doc/i-doc.registry.ts`).
- Similar widget: `resources/js/components/Dashboard/DriverConnectionsWidget.jsx` — `useQuery(['dashboard','driver-connections'], api.get('/dashboard/driver-connections'), staleTime 60s)` :47-51; returns null while loading or when empty :54-59; `Card padding="p-4"` two-column grid with groups :68-102; `Group` list with title+count, max-h-48 scroll, row click opens `DriverDetailsModal` :12-37, :104. Backend route `routes/api/dashboard.php:20`. Also `DriversWithoutDepositWidget.jsx` (71 lines).
- `UklonPulseWidget.jsx` returns null on error/empty (:51, :68, :79) — pattern for hiding in parks without Uklon.
- Dashboard API routes: `routes/api/dashboard.php:13-27` (`auth:sanctum`, `staff`, prefix `dashboard`).
