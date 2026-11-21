# Сесія

## 2026-11-21 — стан у Play Console
- Інформаційна панель: «12 користувачів зареєстровані протягом 12 днів» з потрібних 14 днів × 12.
- «Користувачі додатка» за день (10–19 лист.): 13, 11, 11, 11, 11, 11, 12, 10, 12, 10. Пік 13 (8–9 лист.).
  Метрика Play рахує пристрої з встановленим застосунком, а не реальне використання; власник каже, що тестувальники пасивні.
- Відгуків тестувальників (Оцінки й відгуки → Відгук про тестування): 0.
- Android vitals, збої й ANR за 28 днів: немає.
- Останній випуск 0.3.6 (10) — 2026-10-27, тобто до початку 14-денного вікна. Оновлень під час тесту не було.
- Тестувальники: Google-група g24app@googlegroups.com, країни UA + BG.
- Висновок: при поданні через 2 дні ризик повторити відмову Multireader високий (рівно 12, без запасу; 0 відгуків; 0 оновлень за тест).

## 2026-11-21 — чи хтось видалив
- Статистика → «Відтік користувачів» за 28 днів: 0 щодня. Ніхто не видалив і не вийшов.
- «Користувачі додатка» в Play = встановлено хоча б на одному пристрої, що вмикався за останні 30 днів (визначення з консолі). Коливання 10–13 — це не відкриття застосунку.
- Відкриттів застосунку Play не показує (потрібна аналітика в застосунку). Реальну активність видно лише з бекенда: taxi_orders (суперпарк → /taxi/orders), taxi_client_tokens.last_used_at. Суперпарк у Chrome не залогінений — переглядає власник.

## 2026-11-21 — схему погоджено
- Власник погодив scheme.md (E → A+B у 0.4.0 → C+D у 0.4.1). Починаю з E.
- Питання власника: чи завжди на лінії хтось із тестового парку? Ні: лінія вмикається вручну, живе 12 год, замовлення веде людина.
  Запропоновано F (демо-водій для тестувальників), чекаю відповіді. Пам'ять: Київ = park 15, тестові водії 114–117.

## 2026-11-21 — E готово (бекенд активності + сторінка «Клієнти»)
- `taxi_client_activity (client_id, day)`; власник `App\Taxi\Clients\ClientActivity`, пише `ClientAuthService::clientForToken`
  у ритмі `last_used_at` (раз на 60 с). День — `taxi.timezone` (Europe/Kyiv). Міграція відновлює історію з днів замовлень і last_used_at.
- `App\Taxi\Admin\ClientBrowser` + `Admin\ClientController`: GET /admin/clients, /admin/clients/daily. Сторінка `/taxi/clients`
  (графік активні/нові/замовлення з лінією цілі 12, підсумок «днів поспіль 12+», список). Документ — taxiMobile/docs/api.md.
- Тести: 131 passed (hands/taxi-tests-1.log). Vite компілює сторінку; API локально перевірено через tinker. Візуально локально не дивився (немає входу).
- На прод (FTP): app/Taxi/Clients/ClientActivity.php, app/Taxi/Admin/ClientBrowser.php,
  app/Taxi/Http/Controllers/Admin/ClientController.php, app/Taxi/Services/ClientAuthService.php,
  app/Taxi/routes/admin.php, app/Taxi/config/taxi.php,
  database/migrations/2026_11_21_100000_taxi_create_client_activity_table.php, public/build/ (увесь).
  Потім міграція через /debug.

## 2026-11-21 — E на проді; F погоджено
- Власник залив E на прод і запустив міграцію.
- F: «кілька тестових водіїв суперпарку, які обслуговують поїздки; в іменах позначити, що це бот». Роблю F перед A+B:
  працює з поточною 0.3.6, тестувальники можуть їздити вже зараз.

## 2026-11-21 — F готово (демо-водії), ADR taxiMobile/docs/adr/0006-demo-drivers.md
- `taxi_clients.is_tester` + перемикач в адмінці «Клієнти» (PATCH /admin/clients/{id}).
- `app/Taxi/Demo`: DemoFleet (конфіг `taxi.demo`: TAXI_DEMO_PARK_ID, TAXI_DEMO_USER_IDS; затримки 20/180/60/≤600 с),
  DemoDispatch (замовлення тестувальника → одна пропозиція вільному боту, `push_status=demo`),
  DemoDriving (кроки через OrderService; будильник wakeAt → /realtime/tick, /realtime/timers; також GET active/show клієнта).
- Ізоляція: справжні водії не бачать тестових замовлень; бот на лінії не отримує справжніх (`demo_bot`). Порожній конфіг — вимкнено.
- Авто бота на карті НЕ рухається (позицію шле лише застосунок водія) — свідомо відкладено.
- Тести: 138 passed (hands/taxi-tests-2.log), фронт зібрано (hands/spa-build-2.log). Системний парк локально id 3.
- На прод (FTP): app/Taxi/Demo/ (3 файли, нові), app/Taxi/Dispatch/DispatchService.php,
  app/Taxi/Http/Controllers/RealtimeController.php, app/Taxi/Http/Controllers/Client/OrderController.php,
  app/Taxi/Http/Controllers/Admin/ClientController.php, app/Taxi/Admin/ClientBrowser.php, app/Taxi/Models/TaxiClient.php,
  app/Taxi/routes/admin.php, app/Taxi/config/taxi.php,
  database/migrations/2026_11_21_110000_taxi_add_is_tester_to_clients_table.php, public/build/.
  Міграція через /debug; .env: TAXI_DEMO_PARK_ID, TAXI_DEMO_USER_IDS; кеш — /clear.

## 2026-11-21 — A, бекенд «Мої адреси»
- `taxi_client_places` (home|work), власник `App\Taxi\Clients\SavedPlaces`; нещодавні — `OrderService::recentDestinations` (3 різні
  адреси завершених поїздок). API GET/PUT/DELETE /client/saved-places[/{kind}]. Видалення акаунта стирає адреси.
- Тести 141 passed (hands/taxi-tests-3.log). Документ — api.md «Мої адреси». Далі — застосунок.

## 2026-11-21 — A+B у застосунку, збірка 0.4.0 (11) готова до заливки
- Застосунок: domain/places/SavedPlaces + data SavedPlacesApi/RepositoryImpl (без кешу: інший вхід не бачить чужих адрес);
  HomeViewModel: AddressField.Home/Work, saved у стані, loadSaved на старті й після поїздки; ui/home/SavedPlacesRow (чіпи, утримання → змінити/видалити).
- B: brand.properties feedback.url, store.android.url, tester.mode=true → AppConfig; platform/DeviceInfo (Android/iOS);
  data/feedback/TesterPrompt (картка, «Закрити» на 7 днів, лише Android+tester.mode); ui/feedback/Feedback.kt (TesterCard, reportBug);
  Налаштування → «Допомога»: «Повідомити про помилку» (копіює версію/ОС/пристрій/client id → feedback.url) і «Відгук у Google Play» (tester.mode, Android).
- Лендінг: /taxi/feedback (content/pages/taxi-feedback.md, routes.php, PageController).
- Рядки лише uk (en/ru після погодження; на англійській мові пристрою нові підписи українською).
- Перевірено на емуляторі з локальним бекендом (hands/shot-7..10.png): картка, чіпи, меню, налаштування. Пошук адрес локально не працює (ключ Google).
- Локально додано TAXI_FIREBASE_PROJECT_ID=g24-taxi у app/park-react-spa/.env (для входу в debug-збірку).
- Версія 0.4.0 (11): androidApp/build.gradle.kts, iosApp project.pbxproj, release/CHANGELOG.md.
- Реліз (alpha + TestFlight) — після заливки бекенду: без /saved-places збереження адрес дасть помилку.

## 2026-11-21 — реліз 0.4.0; боти = водії парку «Київ»
- Прод: нові маршрути давали 404 (кеш маршрутів) — власник відкрив /api/clear (лише залогінений системний адмін), стало 401.
- Android 0.4.0 (11) опубліковано на alpha (hands/release-android-1.log). iOS — release-ios.mjs (hands/release-ios-1.log).
- Власник: боти — не суперпарк, а водії тестового парку «Київ» (15), «вони вже оформлені». Тепер: TAXI_DEMO_DRIVERS=true,
  TAXI_DEMO_PARK_ID=15; боти = усі активні водії парку (ParkGateway::parkDrivers). TAXI_DEMO_USER_IDS прибрано.
  Адмінка «Клієнти» → блок «Демо-водії» (GET /admin/demo-drivers). Тести 143 passed (hands/taxi-tests-4.log), фронт — spa-build-3.
- Ризик: рев'юер-акаунти Kyiv теж боти — якщо зайдуть у застосунок водія на лінію, можуть побачити тестову пропозицію.

## 2026-11-21 — iOS 0.4.0 у TestFlight; тестувальники — лише ручною позначкою
- iOS 0.4.0 (11) у TestFlight, processingState=VALID (hands/release-ios-1.log). Власник залив зміни ботів, .env TAXI_DEMO_DRIVERS=true, TAXI_DEMO_PARK_ID=15, кеш скинуто.
- Запропоновано TAXI_DEMO_ALL_CLIENTS (усі клієнти — тестувальники на час закритого тесту). Власник: «ні, не треба».
  Отже тестувальник — лише позначка в «Клієнти»; нових треба відмічати вручну. Живі клієнти — звичайна розсилка.
- Звернення до тестувальників — testers-message.md, чекає «так» власника.
- Власник: «тестові акаунти клієнтів — тестувальники; їх використовуватимуть рев'юери Google та Apple». Зроблено:
  DemoFleet::isTestPhone (prefix `+380000`, taxi.demo.test_phone_prefix) → serves(); адмінка показує test_phone (перемикач увімкнений і заблокований).
  Тести 144 passed (hands/taxi-tests-5.log), фронт — spa-build-4. Документи: ADR 0006, api.md, store-listing.md.
  На прод: app/Taxi/Demo/DemoFleet.php, app/Taxi/Admin/ClientBrowser.php, app/Taxi/config/taxi.php, public/build/ + /api/clear.
- 2026-11-21 Власник залив тестові номери (DemoFleet/ClientBrowser/config/build) і скинув кеш. Далі — C+D (0.4.1) за scheme.md; звернення чекає «так».

## 2026-11-21 — 0.4.1 (C поради + D ярлики)
- D: domain/shortcuts/AppShortcuts (object, replay=1); Android res/xml/shortcuts.xml (taxigarage://shortcut/home|work) + MainActivity
  singleTask/onNewIntent; iOS Info.plist UIApplicationShortcutItems + AppDelegate configurationForConnecting + ShortcutSceneDelegate.
  HomeViewModel.onShortcut: свіжо завантажує адреси (друга спроба через 2 с; не вийшло — тост, а не «додати»), чекає подачу ≤8 с, далі маршрут.
- C: domain/tips (Tip, TipNotifications), data/tips/TipPlanner (раз на 3 дні о 18:00, 4 слоти, зсув на кожному відкритті; тестувальницька порада — tester.mode Android);
  Android AlarmManager + TipReceiver (канал taxi_tips), iOS UNCalendarNotificationTrigger; Налаштування → «Поради» (AppSettings.tips).
- Перевірено на емуляторі: будильники 24.11/27.11/30.11/3.12 18:00; ярлик на запущеному — маршрут до «Дім»; знайдено й виправлено
  два екземпляри MainActivity (singleTask) і гонку холодного старту. Емулятор потім завис (чорний екран) — холодний старт після виправлення не перезнятий.
- Картка тестувальника була прихована хрестиком (testerCardHiddenUntil=2026-11-28) — логіка правильна.
- Android 0.4.1 (12) на alpha (hands/release-android-2.log); iOS — release-ios-2.log.
