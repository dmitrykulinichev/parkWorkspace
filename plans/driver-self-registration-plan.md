# Самостійна реєстрація водія в мобільному додатку

_Створено: 2026-09-04_

> План реалізації. Продукт-рішення узгоджені в обговоренні з користувачем 2026-09-04,
> зафіксовані нижче в §0. Технічна деталізація — по мірі виконання, ставити `[x]`.

---

## 🔖 Стан на кінець сесії 2026-09-09 — з чого продовжувати

**Уточнення щодо §11:** Phone Auth зависання (справжня причина — відсутній
`providers: ['phone']` у `capacitor.config.ts`) **вже випущено** релізами
1.4.7 (146)/1.4.8 (147) — див. `release/CHANGELOG.md`, підтверджено на
реальному пристрої. НЕ плутати з §12/§13 нижче — ті лишаються невипущеними.

**Найсвіжіше (§13, ще НЕ випущено релізом):** SMS-відновлення пароля (§12), і
повністю перероблено Login + весь Register-флоу — прогрес-бар, розбиття кроку
профілю на 4 сторінки, новий крок підтвердження email кодом (з нуля побудована
бекенд-інфраструктура — `EmailVerificationService`, нова Mailable, 2 нові
роути), плюс два фікси після код-рев'ю (§13.1): свіжий Firebase-токен на
кожному кроці замість застарілого, `Mail::queue()` замість `Mail::send()`.
**Наскрізно НЕ перевірено** — в цій сесії не було змоги протестувати через
Simulator (немає доступу до тап-автоматизації), потрібен ручний прохід
користувача перед релізом (деталі й чекліст — кінець §13). Версію піднято до
1.5.0 (148) — MINOR (помітний новий функціонал: SMS-відновлення +
email-підтвердження).

**Статус збірки 1.5.0 (148):** зібрано й залито на ОБИДВІ платформи, але
свідомо ЗУПИНЕНО на безпечному, непублічному етапі — весь цей реліз ще
жодного разу не пройдений вручну (немає навіть базового проходу в Simulator).
- Android: `internal` track на Google Play (НЕ production, реальні
  користувачі не бачать).
- iOS: білд залито в App Store Connect, версія 1.5.0 створена з What's New —
  **submit for review НЕ виконано**.
- **Перед промоцією в production/review — обов'язково пройти ручний тест**
  повного флоу: RegisterPhone → RegisterOtp → RegisterProfile →
  RegisterEmail (реальний email, реальний код) → RegisterPassword, і окремо
  ForgotPasswordFlow (SMS-гілка) — жодне з цього не тестувалось на реальному
  пристрої.
- Backend під ці ендпоінти (`EmailVerificationService`,
  `DriverAppRegistrationController::sendEmailCode/confirmEmailCode`, нові
  роути) ще ПОТРЕБУЄ окремого деплою на прод-сервер (той самий
  `route:cache`-нюанс, що вже ловили раніше в цій сесії) — без цього мобільний
  клієнт отримає 404 на нових ендпоінтах навіть після проходу manual review.

**Попередній стан (2026-09-07):** Реліз 1.4.5 (144) вийшов — Android опубліковано на Google Play **production**
(живо для реальних користувачів), iOS build 144 залито в App Store Connect і версія
1.4.5 створена з What's New — **Submit for Review лишається ручним кроком**,
свідомо не автоматизовано. CHANGELOG: `mobile/release/CHANGELOG.md`. Історія релізів
цієї сесії: 1.4.3 (142, §9) → 1.4.4 (143, діагностична панель) → 1.4.5 (144, iOS
URL scheme, §10).

Ланцюжок причин: `/code-review high` на весь SMS-флоу (§9) знайшов і виправив
критичний Android-баг (`phoneVerificationCompleted` необроблений) ще ДО першого
реального тесту на пристрої. Коли користувач нарешті протестував на реальному iOS
(не Android!), флоу зависав по-новому — і зависання, і повна відсутність логів у
BetterStack довелось діагностувати вже в реальному часі (§10): виявилось, що
BetterStack взагалі ніколи не був підключений (немає `VITE_BETTERSTACK_TOKEN`), і
окремо — в iOS-проєкті не було URL scheme для reCAPTCHA-фолбеку. Під час перевірки
Firebase Console до купи виявлено ще критичніше: **SMS region policy дозволяв 0
регіонів** — жодна реальна SMS ніколи не пішла б, незалежно від reCAPTCHA. Обидва
виправлено (§10).

**Наступний крок — повторний реальний тест на пристрої (виконує користувач):**
- Тепер варто тестувати саме **справжнім номером**, не фіктивним — SMS region
  policy та reCAPTCHA-фолбек стосуються тільки реального шляху; тестові номери
  (`+380000000001`/`123456`) обходять і те, і те, і НЕ проходять через Android SMS
  Retriever — ними неможливо перевірити ні auto-verification, ні щойно виправлені
  Firebase-конфіги.
- Для Android auto-verification окремо є ізольований інструмент §8
  (`/staff/debug-sms`, "Тест SMS-коду") — без анкети й без створення акаунту, з
  2026-09-07 (§10) показує живий лог кроків прямо на екрані.
- Досі НЕ перевірено на живо: чи справді region policy + URL scheme були
  ЄДИНИМИ причинами (можливий ще шар — App Check enforcement, не перевірявся,
  див. §10).
- Не входило в цю сесію (окремі майбутні задачі): адмінський UI для перегляду/показу
  `driver_join_code` в кабінеті парку (поле вже в `ParkResource`, екрану нема);
  діплінки (§0, свідомо відкладено); політика пароля при реєстрації (§4).

**Якщо після рестарту Docker щось досі падає** — спочатку перевірити
`storage/logs/laravel-*.log` на реальний exception (не довіряти самому факту 500 —
минулого разу під зовсім не пов'язаними ендпоінтами (`/staff/vehicles`,
`/me` тощо) ховалась одна й та сама причина: `Connection refused` до MySQL,
жодна з них не була регресією від змін цієї сесії).

---

## 0. Продукт-рішення (узгоджено)

**Проблема:** зараз перший вхід водія вимагає, щоб адмін парку вручну завів водія в
кабінеті й передав йому логін+пароль. Кнопка "Вперше тут?" у додатку веде на сканування
QR → зовнішній браузер → веб-форма реєстрації (`DriverRegistrationController`) — розрив
контексту, додаток тут ні до чого не причетний.

**Рішення (MVP, без діплінків):**

1. Адмін дає водію (голосом/у чаті/будь-як) два окремі шматки інформації:
   лінк на стор (App Store/Google Play, звичайний, без спецпараметрів) і **код парку**.
2. Водій встановлює додаток, на екрані логіну тисне **"Я новий водій"**.
3. Флоу реєстрації: телефон → SMS-код підтвердження → повна форма профілю (як зараз
   на вебі) → пароль → акаунт створено (`User`, ще без парку).
4. Одразу після — екран **"Приєднатися до парку"**: вводить код парку → водій одразу
   **активний** у цьому парку (без проміжного статусу очікування).

**Явно НЕ в MVP:**
- Діплінки (Android Play Referrer API, iOS clipboard-трюк) — відкладено, обговорювали
  окремо, обидва технічно можливі, але додають складність без пропорційної вигоди на
  старті. Повернутись, коли буде відчутний обсяг органічних інсталяцій.
- Deferred deep linking через сторонні сервіси (Branch/AppsFlyer/Adjust) — свідомо НЕ
  розглядається: продукт — цільний SaaS-додаток на всі парки, а не набір окремих
  брендованих застосунків, тому "магічне" протягування коду через інсталяцію не
  виправдовує вартість/залежність.
- Персональні одноразові коди запрошення — обрано простіший варіант: **один код на
  парк**, багаторазовий (той самий принцип, що вже є в `Park::registration_token`,
  просто новий вхід — з додатку, а не лише з вебу).

**Свідома відмінність від поточної веб-поведінки:** зараз `DriverService::createDriver()`
завжди створює водія зі статусом `new` (очікує адміна). У новому ін-апп флоу — одразу
`active`. Веб-флоу (QR → браузер) лишається як є, з `new` — це стосується тільки нового
шляху.

---

## 1. Підтвердження телефону — Firebase Phone Authentication

Провайдера в проєкті зараз немає (Telegram-OTP видалили в рамках `unified-identity-plan.md`
і нічим не замінили — `password` став обов'язковим для входу, SMS потрібен лише для
підтвердження телефону під час реєстрації, не для звичайного логіну).

**Рішення: Firebase Phone Authentication**, не окремий SMS-шлюз (Turbosms/Twilio й т.п.
розглядались і відхилені). Причини:
- Firebase вже підключено в мобільному додатку (Analytics/Crashlytics/FCM) — жодного
  нового вендора/акаунта заводити не треба, лише ще один Capacitor-плагін
- **10 SMS/день безкоштовно, і це щодня** (не одноразовий тестовий ліміт, як у більшості
  SMS-шлюзів) — при поточній кількості користувачів це реалістично покриває всю
  реєстрацію без жодних витрат
- Уся SMS-логіка (генерація коду, надсилання, звірка, anti-abuse/reCAPTCHA) — на боці
  Google, у самому додатку через Firebase SDK; бекенду лишається тільки звірити готовий
  підписаний ID-токен — не треба писати власний OTP-сервіс, таблицю кодів чи throttling
  для SMS

**Важливо (узгоджено з користувачем):** з вересня 2024 Firebase вимагає тариф **Blaze**
(pay-as-you-go, з прив'язаною карткою) навіть для використання безкоштовного ліміту —
без фіксованої щомісячної плати, платиться лише за перевищення. Google виставляє рахунок
автоматичним щомісячним списанням з картки (не ручний інвойс). Захист від несподіваного
рахунку — Budget Alert у Google Cloud (готово, виставлено на $1).

- [x] **Перехід проєкту на Blaze + Budget Alert $1** — зроблено 2026-09-05.
      Уточнення з попереднього запису: перевірено (Firebase Console → Usage and
      billing), що проєкт `garage24-bd0f4` на той момент був досі на плані **Spark**
      ($0/міс), не Blaze — попередній запис "готово" був помилковим. Додатково
      перевірено (Google Cloud → Billing → Budgets & alerts): жодного billing account
      не було взагалі ("No items to display").
      Виправлено через Firebase Console → Usage and billing → Upgrade → Blaze →
      Create a Cloud Billing account → Google Cloud Console
      (`console.cloud.google.com/billing/create`): нове ім'я `My Billing Account 1`,
      організація `danutakiev-org` (підставилась сама), країна Ukraine, валюта USD,
      платіжний метод — вже збережена в Google-акаунті картка Visa •••• 9628 (натиснув
      сам користувач, не асистент — введення/використання платіжних даних асистент
      не виконує). Білінг-акаунт створено.
      **Важливо, окремий крок**: створення billing account в Google Cloud САМЕ ПО
      СОБІ не перевело Firebase-проєкт на Blaze (перевірено — одразу після створення
      акаунту Firebase Console → Usage and billing і далі показував "Spark"). Довелось
      повернутись у Firebase Console → Upgrade → вибрати з двох доступних Cloud
      Billing accounts саме щойно створений `My Billing Account 1` (другий,
      `Firebase Payment`, — вже існуючий раніше, не чіпали) → "Link Cloud Billing
      account" — тільки після цього явного кроку Firebase підтвердив "Plan change
      completed successfully", план змінився на **Blaze (Pay as you go)**.
      Budget Alert: `Billing → Budgets & alerts → Create budget` — назва
      `garage24-budget-alert-1usd`, тип **Alerts only** (не Spend cap enforcement),
      скоуп All projects / All services, Monthly, target amount **$1**, дефолтні
      пороги 50%/90%/100% ($0.5/$0.9/$1) на Actual spend, email-сповіщення білінг-
      адмінам увімкнено. Перші дві спроби створення бюджету одразу після створення
      білінг-акаунту падали з "The attempted action failed" — типова затримка
      реплікації щойно створеного billing account у GCP backend; після ~15с очікування
      і перезавантаження сторінки третя спроба пройшла успішно
      ("garage24-budget-alert-1usd has been created").
- [x] **SHA-1/SHA-256 fingerprint для Android-застосунку (`ua.com.g24`)** — додано
      2026-09-05 через Firebase Console → Project Settings → General → Android app
      (раніше секція була повністю порожня, Firebase сам попереджав про це на сторінці
      Sign-in method: без SHA-1 Phone provider не працює на Android, Play Integrity API
      не може верифікувати застосунок). Fingerprints зняті з release keystore
      (`/Users/dmytronovikov/keys/g24-release.keystore`, alias `g24`, шлях з
      `mobile/native/android/keystore.properties`):
      `SHA-1: 9B:63:F7:EA:83:86:39:3B:5B:A1:23:3C:F6:61:85:F3:C2:BE:03:4B`,
      `SHA-256: 27:9E:B6:A1:12:BD:0E:8E:F3:F7:A2:EA:F6:22:06:57:4F:EC:5D:23:06:33:56:
      60:2C:7D:EA:02:A5:AA:51:D0`. Обидва збережені й підтверджені Firebase
      ("New certificate fingerprints added").
- [x] **Firebase Console → Authentication → увімкнути провайдер Phone** — зроблено
      2026-09-05 через Claude in Chrome
- [x] **Firebase Console → Authentication → Test Phone Numbers** — додано
      `+380000000001` з кодом `123456` (2026-09-05). Свідомо НЕ робимо "будь-який номер +
      фіксований код" — це відкрило б реєстрацію під чужим телефоном без підтвердження
      володіння; офіційний список тестових номерів — безпечна альтернатива без такого
      ризику. **Важливо (з'ясовано 2026-09-07, §9):** тестові номери НЕ проходять через
      Android SMS Retriever/`phoneVerificationCompleted` — ними неможливо перевірити
      auto-verification шлях, лише ручний ввід коду.
- [x] Мобільний додаток: `@capacitor-firebase/authentication@^7.5.0` встановлено, обгортка
      `mobile/app/src/services/firebasePhoneAuth.ts` (`sendVerificationCode`,
      `confirmVerificationCode`, `signOutFirebase`) — ховає listener-based API плагіна
      за звичайним async-інтерфейсом. Три події, не проста Promise: `phoneCodeSent`
      (код надіслано, є `verificationId`), `phoneVerificationFailed` (помилка), і
      `phoneVerificationCompleted` — Android SMS Retriever/Play Services підтвердили
      номер самі, без вводу коду (додано 2026-09-07, §9, критичний фікс — до цього
      просто не оброблялось, реєстрація зависала на такому пристрої). `sendVerificationCode()`
      тому повертає union `SendCodeResult`: `{autoVerified: false, verificationId}` —
      звичайний шлях, або `{autoVerified: true, idToken}` — auto-verify, OTP-крок
      пропускається. **Лише нативні платформи** — на web кидає явну помилку
      (`assertNative()`), на відміну від analytics/crashlytics, де web мовчки no-op:
      підтвердження телефону не може мовчки нічого не робити. Перевірено в браузері, що
      guard коректно спрацьовує (не зависає, показує зрозумілий тост) — сам SMS-флоу
      на web неможливий у принципі, **потребує реального iOS/Android білда**.
- [x] Бекенд: звірка Firebase ID-токена — **обрано `kreait/firebase-tokens`** (не повний
      `kreait/firebase-php`/Admin SDK — той тягне grpc+google-cloud-storage, непотрібні
      тут; `firebase-tokens` — той самий автор, лише JWT verify, вже транзитивна частина
      Admin SDK). `App\Services\Firebase\FirebasePhoneVerificationService::verifyAndGetPhone()` —
      перевіряє підпис/issuer/audience/expiry (бібліотека сама тягне й кешує публічні
      сертифікати Google), додатково звіряє `firebase.sign_in_provider === 'phone'` (не
      будь-який Firebase-токен, саме phone-auth) і повертає `phone_number` claim.
      `config('firebase.project_id')` — новий ключ у `config/firebase.php`
      (`FIREBASE_PROJECT_ID`, дефолт `garage24-bd0f4` з наявного service-account).
- [x] З верифікованого токена дістається `phone_number` claim — контролер звіряє його з
      `phone` у тілі запиту (захист від розсинхрону клієнт/токен), `DriverService::registerSelf()`
      примусово перезаписує ним `phone` перед створенням `User` — тілу запиту самому по
      собі не довіряємо

---

## 2. Бекенд — нові ендпоінти ✅ реалізовано

Публічні (без `auth:sanctum`, до створення акаунта) — `routes/driver_app/public.php`:

- [x] `POST /auth/register` `{firebase_id_token, phone, ...профіль, password}` →
      звіряє `firebase_id_token`, звіряє `phone_number` з токена проти `phone` у тілі
      (мають збігатись), перевіряє що телефон ще не зайнятий (`User::withoutGlobalScopes()
      ->where('phone', ...)->exists()` — інакше 422 "акаунт уже існує"), валідує профіль
      (`RegisterDriverAppRequest`, ті самі правила що `SaveDriverRequest`, без
      `parkToken`/`status`, + `password` min:8), створює `User` **без** `Driver`/парку
      (`DriverService::registerSelf()`), одразу видає токен — контракт відповіді той
      самий, що `DriverAuthController::login()`, `memberships: []` (свідомо порожньо).
      Throttle `10,1,driver-register` (тільки прод). Контролер:
      `App\Http\Controllers\Api\DriverApp\DriverAppRegistrationController::register()`.

Захищені (`auth:sanctum`, **БЕЗ** `app.context` — щойно зареєстрована людина ще без
парку, X-Park-Id надіслати нізвідки; той самий блок, що вже мав `/memberships` і
`DELETE /me`) — `routes/api/driver_app.php`:

- [x] `POST /parks/join` `{code}` → шукає `Park::where('driver_join_code', ...)`,
      викликає `DriverService::createDriver(['phone' => $user->phone, 'status' => 'active'],
      $park->id, null)` — `createDriver()` сам знаходить уже автентифікованого `$user`
      через `resolveUser()` (за телефоном) і сам захищає від дубля-membership (кидає
      `\Exception`, контролер ловить → 422). Повертає оновлений `memberships` (як
      `login()`/`memberships()`) — щоб додаток одразу підхопив новий парк без
      повторного логіну. Throttle `10,1,driver-join-park` (тільки прод). Метод:
      `DriverAppRegistrationController::joinPark()`.

**Зміни в існуючому коді:**

- [x] `DriverService::createDriver()` — сигнатуру НЕ міняли: `status` вже передається
      через масив `$validatedData` (`'status' => $driverFields['status'] ?? 'new'`,
      рядок був і раніше) — досить було передати `'status' => 'active'` в масиві з
      контролера, без нового параметра методу
- [x] Нове: `DriverService::registerSelf(array $validatedData, string $verifiedPhone,
      string $password): User` — створює/знаходить `User` (через ті самі приватні
      `resolveUser()`/`upsertDriverProfile()`, що й `createDriver()`), БЕЗ `Driver`-рядка,
      ставить пароль
- [x] Нове: `App\Services\DriverAppAuthService` — `issueUserToken()`/`buildMemberships()`
      винесено з `DriverAuthController` (були `private`, звідти недоступні для нового
      контролера) в окремий сервіс; `DriverAuthController::login()`/`memberships()`
      тепер делегують туди ж — той самий контракт відповіді, нуль дублювання логіки
      видачі токена між login і register
- [x] Нове поле `Park::driver_join_code` (міграція `2026_09_04_120000_...`, з бекфілом
      для існуючих парків) + `Park::generateDriverJoinCode()` — див. §4, обрали
      **окремий короткий код**, не перевикористання `registration_token`
- [x] `AuthContext`/App.tsx коректно поводяться для користувача **без жодного парку** —
      див. §3, реалізовано й перевірено в браузері (симуляція стану).

- [x] Міграція `driver_join_code` застосована на локальній БД (2026-09-05, після
      рестарту Docker Desktop).

---

## 3. Мобільний додаток — нові екрани ✅ реалізовано

- [x] `Login.tsx` — кнопка "Я новий водій"/"Зареєструватися" тепер відкриває
      `RegisterFlow` замість старого QR-сканера (QR-модалку й `handleScanParkQr`
      **видалено повністю** — новий флоу його замінює, не доповнює; `useQrScanner`
      сам хук лишився, він же й досі використовується окремо в `pages/driver/Vehicle.tsx`)
- [x] `pages/RegisterFlow.tsx` — оркестратор кроків (локальний стан `'phone'|'otp'|'profile'`,
      НЕ роутер — той самий принцип, що модалки в старому Login.tsx), тримає спільні дані
      між кроками (телефон, verificationId, firebaseIdToken). З 2026-09-07 (§9) крок
      `'otp'` може пропускатись одразу з `'phone'` в `'profile'`, якщо Android сам
      підтвердив номер (`onAutoVerified`)
- [x] `pages/RegisterPhone.tsx` — ввід телефону (`PhoneInput`, той самий що в Login),
      нормалізація в E.164 (`+380` + останні 9 цифр — той самий принцип, що
      `DriverAuthController::findUserByLogin` на бекенді, з 2026-09-07 винесено в
      `PhoneInput.tsx` як `toE164`, було продубльовано), виклик
      `firebasePhoneAuth.sendVerificationCode`, гілкування на `onCodeSent`/`onAutoVerified`
      за результатом
- [x] `pages/RegisterOtp.tsx` — ввід коду, `confirmVerificationCode` → Firebase ID-токен;
      таймер на повторну відправку (30с), "Змінити номер" — назад на RegisterPhone
- [x] `pages/RegisterProfile.tsx` — повна форма профілю (ті самі поля, що `SaveDriverRequest`
      на вебі, БЕЗ `relatives_contacts` — свідомо не включено в мобільну форму,
      необов'язкове поле) + пароль (`min:8`) → `AuthContext.registerAndLogin()`. З
      2026-09-07 (§9) — посилання "Уже маєте акаунт? Увійти" (раніше цей крок був
      глухим кутом при непоправній помилці)
- [x] `pages/JoinPark.tsx` — ввід коду парку, показується автоматично коли
      `hasSessionWithoutPark` (див. нижче), включно з кнопкою "Вийти з акаунта"
      (без цього нема способу вибратись з екрана, якщо коду нема під рукою)
- [x] `services/firebasePhoneAuth.ts` — обгортка над `@capacitor-firebase/authentication`
      (див. §1, §9)
- [x] `FleetApi.ts` — `registerDriver(firebaseIdToken, profile)`, `joinParkByCode(code)`
- [x] `types/index.ts` — новий тип `RegisterDriverPayload`
- [x] **`context/AuthContext.tsx` — суттєві зміни, не лише нові екрани:**
      - Нове: `registerAndLogin()` (реєстрація → токен+user, memberships завжди `[]`,
        `activeParkId` лишається `null`)
      - Нове: `joinParkByCode()` (той самий "хвіст", що `login()` — активує щойно
        приєднаний парк одразу)
      - Нове похідне значення: `hasSessionWithoutPark` (є токен, `memberships.length === 0`)
        — окремо від `isAuthenticated` (той вимагає активний парк); свідомо НЕ міняли
        семантику `isAuthenticated` самого по собі, щоб не зачепити push/permissions-онбординг/
        SOS-обробник, які вже коректно на ній тримаються
      - 🐛 **Знайдено й виправлено реальний баг** у вже наявному `refreshMemberships()`:
        раніше `memberships.length === 0` завжди трактувалось як "доступ до всіх парків
        забрали" → миттєвий logout. Це зламало б щойно зареєстрованого водія відразу
        при першому `appStateChange`/старті додатку (він же ЗАВЖДИ має `[]` до
        `/parks/join`). Виправлено: логаут лише якщо ДО цього `memberships` було
        непорожнім (реальна втрата доступу), не якщо це вихідний стан. Перевірено в
        браузері — саме цей фікс підтверджено (без нього JoinPark миттєво зникав назад
        на Login).
- [x] `App.tsx` — `{!isAuthenticated ? (hasSessionWithoutPark ? <JoinPark/> : <Login/>) : (...)}`
- [x] i18n — новий файл `i18n/register.ts` (неймспейси `register` + `joinPark`, uk+en),
      зареєстровано в `i18n.ts`; `i18n/login.ts` — прибрано 3 мертві ключі
      (`not_found_register_*`, `scan_park_qr`), оновлено текст `register_link`
- [x] Дизайн — перевикористані існуючі класи (`park-login-hero`/`park-login-container`/
      `park-login-action`, `park-item-card`) і компоненти (`PhoneInput`, `DatePickerModal`,
      `ParkButton`) замість нового дизайн-мови — узгоджено з simple-режимом

**Перевірено в браузері (`npm run dev`, web-платформа):**
Login → "Зареєструватися" → RegisterPhone (валідація, E.164) → guard "лише мобільний
додаток" коректно спрацьовує на web (очікувано — SMS фізично неможливий у браузері) →
"Уже маєте акаунт? Увійти" повертає на Login. Симуляція стану "токен + memberships: []"
(вручну через `localStorage`, ключ `CapacitorStorage.auth_*`) → App.tsx коректно показує
JoinPark (не Login) — підтверджує і `hasSessionWithoutPark`, і фікс `refreshMemberships`.
JoinPark: валідація форми, невірний код → graceful error (без крашу), "Вийти" → чистий
logout назад на Login.

**НЕ перевірено — потребує реального пристрою:** сам SMS send/verify (Firebase Phone
Auth працює лише нативно). Станом на 2026-09-07 інфраструктура готова, білд 1.4.3
опубліковано (Android production, iOS App Store Connect) — реальний тест на пристрої
виконує користувач зараз, окремо через `/staff/debug-sms` для auto-verification.

`npx tsc --noEmit`, `eslint`, `vitest --run`, `vite build` — усе чисто (окрім
одного pre-existing unrelated warning у `FleetApi.ts`, `StaffMaintenanceFile` — не
з цієї сесії).

---

## 5. TEMP-логування процесу реєстрації (2026-09-05)

Флоу складно дебажити (SMS ще жодного разу не тестувався наживо) — обвішано
максимально докладними тимчасовими логами по всьому ланцюжку, бекенд + мобільний
додаток. Усі місця позначені коментарем `// TEMP: ... див.
workspace/plans/driver-self-registration-plan.md` — прибрати за явною командою
користувача (політика: [[feedback_verbose_logging]]).

**Бекенд** (`app/park-react-spa`) — усе через `Log::channel('driver-api')`
(окремий BetterStack-канал `s2550061`, config/logging.php; раніше цей канал
ніхто явно не використовував — увесь наявний `Log::info/warning` у цьому флоу
йшов у загальний `stack`/`betterstack`, не в призначений для Driver App):
- `RegisterDriverAppRequest::failedValidation()` — новий override, логує
  причини 422 на валідації (найчастіша точка відмови, раніше зовсім не
  логувалась — фронт бачив лише generic "Помилка запиту")
- `FirebasePhoneVerificationService::verifyAndGetPhone()` — start/OK, існуючі
  warning-и перенесено на `driver-api`
- `DriverAppRegistrationController::register()`/`joinPark()` — start/OK на
  кожному кроці, усі гілки відмови (raніше не логована "акаунт уже існує",
  "невірний код парку", `createDriver` exception), + обгортка
  `catch (\Throwable)` з повним стектрейсом перед rethrow (щоб і неочікувані
  500-ки теж потрапляли саме в driver-api канал, не лише в загальний)
- `DriverService::registerSelf()` — був повністю без логів, додано
  resolveUser/upsertDriverProfile/OK; `createDriver()` — лог у точці
  "duplicate membership" (стосується й адмінського флоу, не лише реєстрації)
- `DriverAppAuthService::issueUserToken()`/`buildMemberships()` — по логу
  успіху кожен

**Мобільний додаток** (`mobile/app`) — `console.warn` (не `console.log` —
у `remoteLogger.ts` в BetterStack ідуть лише warn+error, log лишається
тільки локально для debug-сторінки):
- `services/firebasePhoneAuth.ts` — `sendVerificationCode`/`confirmVerificationCode`,
  усі гілки (start/подія/OK/FAILED); сам OTP-код НЕ логується, лише довжина
- `pages/RegisterPhone.tsx`, `RegisterOtp.tsx`, `RegisterProfile.tsx`,
  `JoinPark.tsx` — submit start/OK/FAILED на кожному кроці
- 🐛 **Знайдено й виправлено реальний баг** у `RegisterOtp.tsx`: `catch {}`
  без параметра — справжня причина невдалої верифікації (невірний код vs
  протермінований vs мережева помилка) повністю губилась, користувачу і
  логам однаково діставався generic `otp_invalid`. Тепер помилка логується
  до показу тосту (текст тосту навмисно не змінено — це вже поведінка).
- 🐛 **Знайдено й виправлено реальний баг** у `AuthContext.registerAndLogin()`:
  на відміну від `login()`/`switchPark()`/`joinParkByCode()` тут не
  викликався `setRemoteLogContext()` — усі логи в проміжку між реєстрацією
  і приєднанням до парку (сам крок `JoinPark`, який і є типовою точкою
  падіння) йшли в BetterStack без `driver_id`, неможливо було зіставити з
  конкретною людиною. Додано.
- `services/FleetApi.ts` — `maskPhone` тепер `export` (перевикористовується
  сторінками), `joinParkByCode` — додано лог start (був єдиним методом флоу
  без нього)

`npx tsc --noEmit` (0 помилок), `eslint` на змінених файлах (0 нових —
лишились ті самі pre-existing попередження, що й раніше), `vitest --run`
(57/57 passed) — усе перевірено після змін.

---

## 4. Відкриті технічні питання

Вирішено під час реалізації бекенду (2026-09-04):
- ~~Спосіб верифікації Firebase ID-токена~~ → `kreait/firebase-tokens` (див. §1, §2)
- ~~Формат коду парку~~ → окреме поле `Park::driver_join_code`, 6 символів, великі
  літери+цифри без 0/O/1/I/L (`Park::generateDriverJoinCode()`), НЕ переюзали
  `registration_token` (32-символьний, під QR/URL, незручний для ручного вводу)

Ще відкрито:
- Політика пароля при реєстрації — зараз `min:8` (як `DriverPasswordController`), звірити
  чи не потрібне додаткове спрощення на кшталт "8 цифр" для водіїв (CHANGELOG 1.3.44)
- Адмінська сторона (веб-кабінет): де саме показати `driver_join_code` — поле вже
  віддається в `ParkResource`, UI-екран не робили — не входило в "почнемо бекенд".
  Мобільна сторона (де в кожного водія/staff теж є доступ до коду свого активного
  парку) — закрито §7.

---

## 6. Код-рев'ю процесу реєстрації + фікси (2026-09-04)

`/code-review medium` на весь ланцюжок (бекенд-контролер/реквест/сервіси +
мобільні екрани/AuthContext/FleetApi). Знайдено 4 реальні проблеми, усі виправлено:

- [x] 🔴 **Критично — захоплення чужого акаунту через email.**
      `RegisterDriverAppRequest` не мав `Rule::unique('users','email')` (на
      відміну від `SaveDriverRequest`, де ця перевірка є, просто гейтована на
      update через `Rule::when($this->driver, ...)`). Наслідок: атакер
      підтверджує СВІЙ телефон через Firebase, але вказує ЧУЖИЙ email у формі
      →`resolveUser()` (DriverService) знаходить існуючий акаунт саме за email
      (телефон новий, тож phone-гілка пошуку нічого не знаходить) →
      `registerSelf()` беззастережно перезаписує йому пароль
      (`$person->update(['password' => ...])`) — акаунт захоплено. Виправлено:
      додано `Rule::unique('users', 'email')` без `->ignore()` (тут завжди
      create, немає "себе" щоб виключити) + повідомлення `'unique' => 'Такий
      :attribute вже зареєстрований.'` (та сама фраза, що в `SaveDriverRequest`).
- [x] 🟡 **Race condition — дублювання реєстрації.** Перевірка "телефон уже
      зайнятий" (`exists()`) і подальше створення `User` не атомарні: два
      одночасні запити з тим самим підтвердженим телефоном обидва проходять
      перевірку до комміту першого INSERT, другий падає на
      unique-constraint (`users.phone`) — раніше це вилітало як generic 500
      замість очікуваного 422. Виправлено: `catch (QueryException $e)` навколо
      `registerSelf()`, перевірка `$e->getCode() === '23000'` → та сама
      відповідь 422 "Акаунт із цим номером телефону вже існує."
- [x] 🟡 **Необроблена помилка в мобільному додатку при порожньому
      `memberships`.** Якби бекенд повернув `200` з `memberships: []` (напр.
      глобальна роль `Driver` відсутня в БД → `ensureDriverRole()` тихо no-op),
      `AuthContext.joinParkByCode()` брав `freshMemberships[0]` без перевірки —
      `undefined.park_id` кидав TypeError. `JoinPark.tsx` ловив лише
      `ApiError`, решту прокидував далі — а `useAction.run()` не має власного
      catch, тож користувач бачив кнопку, що просто перестає крутитись, без
      жодного тосту чи пояснення (немає глобального "запасного" обробника поза
      React Query, на відміну від `QueryCache.onError` в `main.tsx`).
      Виправлено: явна перевірка на порожній масив в `AuthContext` (кидає
      зрозумілу помилку), `JoinPark.tsx` тепер показує тост для будь-якої
      не-`ApiError` помилки (новий i18n-ключ `joinPark.error`, uk+en).
- [x] 🟢 **Мертвий код — `signOutFirebase()` ніде не викликався.**
      Задокументований як обов'язковий крок одразу після використання
      Firebase ID-токена, але виклику не було ніде в коді — нативна сесія
      лишалась висіти на пристрої (некритично, бо наступний
      `sendVerificationCode()` сам перезаписав би сесію, але це мало бути
      явним прибиранням, а не побічним ефектом). Викликається тепер у
      `RegisterProfile.tsx` одразу після успішного `registerAndLogin()`.

Перевірено після фіксів: `npx tsc --noEmit` (0 помилок), `eslint` (0 нових —
лише ті самі pre-existing попередження), `vitest --run` (57/57), `php -l` на
всіх змінених backend-файлах.

---

## 7. Шеринг лінків на моб-додаток з кодом парку (2026-09-04) ✅ реалізовано

Екран `Settings → "Поділитися додатком"` (`mobile/app/src/pages/shared/Settings.tsx`)
уже існував — системний Share-шит з лінками App Store/Google Play (однакові для
всіх, хардкод App ID/Bundle ID). Доробили: лінки лишаються ті самі, але тепер до
тексту додається код приєднання **того парку, який зараз активний у людини, яка
ділиться** (узгоджено з користувачем — коди різні по парках, лінки на стор — ні).

- [x] `DriverAppAuthService::buildMemberships()` — новий ключ `driver_join_code`
      (з `Park::driver_join_code`, той самий `$parks`-запит, повного select без
      обмежень колонок). Той самий контракт, що вже і в `login()`/`memberships()`
      (обидва делегують сюди) — новий ключ автоматично долітає всюди без
      додаткових змін ендпоінтів.
- [x] Мобільний тип `Membership` (`types/index.ts`) — новий `driver_join_code:
      string | null`
- [x] `Settings.tsx` — `handleShare()` бере `activeMembership?.driver_join_code`
      (той самий `activeMembership`, що вже є в `AuthContext`, з поточного
      активного парку), додає рядок у текст шерингу лише якщо код є (захист від
      теоретичного `null`). Новий i18n-ключ `settings.share_join_code`
      (`{{code}}`, uk+en) з підказкою "після встановлення натисніть 'Я новий
      водій'".
- [x] Адмінська сторона (веб-кабінет парку) — залишається відкритим пунктом
      (§4), не входило в цю задачу.

Перевірено: `npx tsc --noEmit`, `eslint`, `vitest --run` (57/57), `php -l` —
усе чисто.

---

## 8. Дебаг-інструмент "Тест SMS-коду" (2026-09-04) ✅ реалізовано

Перед реальним тестом у TestFlight — окремий інструмент для персоналу, щоб
перевірити сам Firebase Phone Auth ізольовано від флоу реєстрації (без
анкети, без створення акаунту, без виклику `/auth/register`). Аналог
наявного backend-інструменту `/debug` → "Девайси" → "Тест" для FCM push.

- [x] `mobile/app/src/pages/staff/DebugSms.tsx` — новий екран: телефон →
      `sendVerificationCode()` → код → `confirmVerificationCode()` → показує
      довжину отриманого ID-токена (сам токен не показується). Напряму через
      `services/firebasePhoneAuth.ts`, той самий сервіс, що й бойовий флоу —
      тестує саме механізм, а не окрему копію коду. `signOutFirebase()`
      викликається і при виході з екрана (`useIonViewWillLeave`), і при
      "Спробувати ще раз". З 2026-09-07 (§9) — гілкування на auto-verify
      (пропускає крок вводу коду, одразу "done") + 30с cooldown на повторну
      відправку.
- [x] Усі кроки логуються `console.warn` (не `console.log`) з тегом
      `[DebugSms]` — доходять до BetterStack, той самий принцип, що й §5.
- [x] Пункт меню — сайдбар персоналу (`Menu.tsx`, `modes: ['staff']`,
      секція "Особисте"), маршрут `/staff/debug-sms` (`App.tsx`)
- [x] i18n — новий файл `i18n/debug_sms.ts` (uk+en), зареєстровано в `i18n.ts`
- [x] Версія збірки для TestFlight з цим інструментом — `1.4.2 (141)`

Перевірено: `npx tsc --noEmit`, `eslint` (0 нових — ті самі pre-existing
помилки в `Menu.tsx`, не з цієї правки), `vitest --run` (57/57).

---

## 9. Код-рев'ю SMS-флоу перед реальним тестом + реліз 1.4.3 (2026-09-07)

`/code-review high` на весь ланцюжок Firebase Phone Auth (окремо від §6 —
цього разу саме перед першим реальним тестом на пристрої, фокус на
"отримання SMS-коду"). Знайдено 8 проблем, усі виправлено до релізу:

- [x] 🔴 **Критично — реєстрація зависала назавжди на Android з
      автопідтвердженням.** `firebasePhoneAuth.ts` слухав лише `phoneCodeSent`
      і `phoneVerificationFailed`, але НЕ `phoneVerificationCompleted` — подію,
      яку Android SMS Retriever/Play Services кидає, коли номер підтверджено
      автоматично, без введення коду користувачем. На такому пристрої жоден
      з двох слухачів не спрацьовував → Promise `sendVerificationCode()`
      ніколи не резолвиться → спінер на RegisterPhone/RegisterOtp/DebugSms
      висів вічно. Виправлено: додано третій listener, `sendVerificationCode()`
      тепер повертає union `SendCodeResult` (`autoVerified: true/false`) —
      усі викликаючі місця (`RegisterPhone`, `RegisterOtp.resend`, `DebugSms`)
      гілкують за ним, OTP-крок пропускається при auto-verify.
- [x] 🟠 **Необмаскований телефон у логах BetterStack.** `console.warn` у
      `sendVerificationCode()` писав сирий E.164-номер — на відміну від усіх
      інших місць цього ж флоу (`RegisterPhone.tsx`, `FleetApi.ts`), де номер
      завжди йде через `maskPhone()`. Виправлено.
- [x] 🟠 **Немає rate limiting на "Тест SMS-коду" (DebugSms.tsx).** Будь-який
      персонал міг необмежено слати реальні SMS-коди на довільний номер —
      вектор для costs-абʼюзу. Додано 30с cooldown (той самий принцип, що
      `RegisterOtp.RESEND_COOLDOWN_SECONDS`), навмисно НЕ скидається кнопкою
      "Спробувати ще раз" (інакше reset був би обходом).
- [x] 🟡 **RegisterOtp: завжди "невірний код", навіть при мережевій помилці.**
      `confirmVerificationCode` міг впасти через офлайн/таймаут, але юзер
      завжди бачив фіксований текст "невірний код" і намагався перевводити
      правильний код безрезультатно. Виправлено: показується реальне
      повідомлення (той самий принцип, що вже був у resend/RegisterPhone/
      JoinPark).
- [x] 🟡 **RegisterProfile: мовчазний збій при мережевій помилці.** Catch
      рethrow-ив усе, що не `ApiError` (включно з `NetworkError`) — а
      `useAction.run()` не має власного catch, тому кнопка просто переставала
      крутитись без жодного тосту. (Не було "невидимим" для моніторингу —
      unhandled rejection все одно ловився глобальними хендлерами
      `main.tsx`/`remoteLogger`/`crashReporting`, non-fatal у Crashlytics
      реально створювався; проблема була суто в UX, юзер нічого не бачив).
      Виправлено: той самий патерн, що `JoinPark.tsx`
      (`if (err instanceof ApiError) return; showToast(...)`).
- [x] 🟢 **RegisterProfile — глухий кут.** Крок "анкета" не мав шляху назад;
      якщо `registerAndLogin` падав з непоправною помилкою (напр. "акаунт уже
      існує"), єдиний вихід — вбити застосунок. Додано посилання "Уже маєте
      акаунт? Увійти" (той самий текст, що на RegisterPhone).
- [x] 🟢 **Дублікат `toE164`** у `RegisterPhone.tsx` і `DebugSms.tsx`. Винесено
      в `PhoneInput.tsx` поруч з `isValidPhone`, обидва місця імпортують звідти.
- [x] 🟢 **Мертві i18n-ключі** `register.phone_mismatch`/`register.already_exists`
      — ніде не використовувались (реальний текст помилки йде з бекенду через
      глобальний `onApiError`-тост). Видалено, додано `register.error`
      (реально використовується у фіксі RegisterProfile вище).

**Реліз 1.4.3 (142)** — після фіксів: `app/package.json` version+buildNumber
піднято вручну (1.4.2/141 → 1.4.3/142), запис у `mobile/release/CHANGELOG.md`,
`npm run build:release` (тести + iOS/Android білди, обидва успішні), `npm run
whatsnew`. **Android:** `ggplay:create-release` → internal → `promote-release.mjs
--from internal --confirm` → **опубліковано на production** (живо для реальних
користувачів Google Play). **iOS:** `asc:upload-build` (VALID, попередження
"MinimumOSVersion 14.0" — не блокує, Apple вимагатиме 15.0+ з весни 2027) →
`asc:create-version` (версія 1.4.3 створена, білд 142 прикріплений, What's New
заповнено) — **Submit for Review лишається ручним кроком**, свідомо не
автоматизовано цим тулінгом.

Перевірено після фіксів: `npx tsc --noEmit` (0 помилок), `eslint` (0 нових —
лише ті самі pre-existing попередження), `vitest --run` (57/57).

---

## 10. Реальний тест на пристрої: зависання на iOS + Firebase-конфіг (2026-09-07)

Перший реальний тест 1.4.3 користувач провів на **iOS** (не Android, де вже був
пофіксений §9-баг) через "Тест SMS-коду" (§8) зі справжнім номером — флоу
зависало на спінері, і в BetterStack взагалі не було жодного логу. Діагностика
йшла у три заходи.

### 10.1 BetterStack ніколи не був підключений

`grep VITE_BETTERSTACK_TOKEN` по всьому `mobile/` — ключ **ніде не заданий** (ні
`.env`, ні `.env.development.local`, ні нативні конфіги). `remoteLogSink` /
`initGlobalErrorHandlers` (`remoteLogger.ts`) мають `if (!TOKEN) return;` —
мовчазний no-op з першого дня. Тобто BetterStack не працював взагалі ніколи, не
тільки для цього бага — окрема, раніше не помічена прогалина в спостережності
(Crashlytics-breadcrumbs через `crashlyticsLogSink` теж залежать від того ж
console.warn, але Crashlytics сам по собі не залежить від цього токена і працює
незалежно).

**Спершу** додано **діагностику прямо на екрані** (не чекаючи на полагодження
BetterStack):
- [x] `firebasePhoneAuth.ts`: `sendVerificationCode`/`confirmVerificationCode`
      отримали опційний третій параметр `onStep?: (msg: string) => void` —
      викликається паралельно з тим самим `console.warn`, що й раніше. Ніякої
      залежності від BetterStack.
- [x] `DebugSms.tsx`: `pushDiag()` збирає ці кроки (+ `platform`/`native` на
      вході) у `diagLog` — рендериться внизу екрана як `<pre>`-подібний блок,
      `userSelect: text` (можна виділити/скопіювати вручну на пристрої, без
      кабелю й дебагера). Лог НЕ скидається на "Спробувати ще раз" (щоб
      порівнювати послідовні спроби), скидається лише текстом `— reset —`.
      Новий i18n `debug_sms.diag_title`/`debug_sms.error` (оновлено).
- **Реліз 1.4.4 (143)** — суто ця діагностика, без функціональних змін.

**Потім (реліз 1.4.6, 145) BetterStack таки полагоджено** — користувач дав
Source Token, з'ясувалось також, що захардкоджений у коді host застарів:
- [x] `mobile/app/.env` — додано `VITE_BETTERSTACK_TOKEN` (раніше не існував
      узагалі) і **новий** `VITE_BETTERSTACK_ENDPOINT`
      (`https://s2549993.eu-central-1a.betterstackdata.com` — актуальний регіон;
      у коді був захардкоджений застарілий `eu-fsn-3`).
- [x] `remoteLogger.ts` — ENDPOINT тепер теж з env, гейт замінено з `!TOKEN` на
      спільний `IS_CONFIGURED = Boolean(ENDPOINT && TOKEN)` (три місця:
      `flush`, `remoteLogSink`, `initGlobalErrorHandlers`).
- ⚠️ Це **не стосується SMS-бага** — на екранній діагностиці й так видно все,
      що встигає статись клієнтом, а до бекенду в цій точці запит ще не
      доходить (`sendVerificationCode` — суто нативний виклик Firebase SDK).

### 10.2 iOS: відсутня URL-схема для reCAPTCHA-фолбеку

З діагностичною панеллю користувач побачив точне місце зависання:
```
sendVerificationCode: start, platform=ios, phone=+380***76
sendVerificationCode: signInWithPhoneNumber call OK, waiting for event...
```
— і тиша назавжди. За офіційним доком (`firebase.google.com/docs/auth/ios/phone-auth`):
iOS Phone Auth спершу намагається тиху APNs-верифікацію; якщо не вдалось —
фолбек на reCAPTCHA у `SFSafariViewController`, після якої SDK повертається в
застосунок через **кастомну URL-схему** ("Encoded App ID" з Firebase Console,
формат `app-1-<project number>-ios-<app id hash>` — той самий, що
`REVERSED_CLIENT_ID`, коли Google Sign-In не налаштований). Перевірено:
- `native/ios/App/App/GoogleService-Info.plist` не оновлювався з **18 червня**
  (до увімкнення Phone provider 5 вересня)
- `Info.plist` не мав жодного `CFBundleURLTypes` взагалі

Без цього — коли silent push не проходить (типово на реальному пристрої без
гарантії миттєвого APNs-токена), reCAPTCHA-редирект нікуди повертатись, і
`signInWithPhoneNumber` виснить назавжди без жодної події й без помилки.

- [x] Значення підтверджено в Firebase Console (Project Settings → General →
      iOS app → "Encoded App ID"): `app-1-234674191297-ios-991975c3523c2f8bddcd40`
      (Chrome-автоматизація зайшла не з першої спроби — три під'єднані Chrome-
      профілі мали різні Google-акаунти без доступу до проєкту; знайшли робочий
      через `switch_browser` + "Connect" вручну користувачем).
- [x] `native/ios/App/App/Info.plist` — додано `CFBundleURLTypes` з цією
      URL-схемою.
- **Реліз 1.4.5 (144)** — цей фікс.

### 10.3 Firebase Console: SMS region policy дозволяв 0 регіонів (критично)

Паралельно, під час перевірки Firebase Console на прохання користувача
("проглянь ще раз на предмет можливих проблем для функціонування SMS"),
знайдено окрему, незалежну від §10.2 причину, чому реальні SMS не пішли б
НАВІТЬ після фіксу reCAPTCHA:

- Той самий офіційний док прямо попереджає: *"Set a policy on the regions...
  For new projects, the default policy allows no regions."*
- Authentication → Settings → **SMS region policy**: `Allow` з **порожнім**
  списком регіонів — тобто буквально жодному регіону світу не дозволено
  отримувати SMS з цього проєкту.
- Підтверджено фактом: Authentication → Usage → **SMS Usage → Total sent: No
  Data** за весь час існування проєкту — жодної реальної SMS ще не пішло,
  ніколи (тестові номери цей крок обходять повністю, тому фіча "працювала" на
  тестовому номері й проходила рев'ю коду, не показуючи цю прогалину).

Ця прогалина спрацювала б ПІСЛЯ проходження app-verification (тобто вже після
фіксу §10.2) — на етапі фактичної відправки SMS, найімовірніше з окремою
помилкою (`phoneVerificationFailed`), а не мовчазним зависанням.

- [x] Authentication → Settings → SMS region policy → додано **Ukraine (UA)**
      до списку дозволених регіонів, збережено й підтверджено після
      перезавантаження сторінки.

### 10.4 Android: Play Integrity API був вимкнений

Той самий прохід по консолі (для симетрії з iOS) — Google Cloud → APIs &
Services → **Google Play Integrity API**: статус був "не увімкнено" (кнопка
"Enable", не "Manage"). Не є причиною конкретного зависання (Android-баг
§9 — окремий і вже пофіксений раніше), але без Play Integrity Firebase не може
перевірити цілісність застосунку на Android і частіше змушений показувати
reCAPTCHA замість тихої верифікації.

- [x] Увімкнено через `console.cloud.google.com/apis/library/playintegrity.googleapis.com`.

### Що ще НЕ перевірено (свідомо, за браком часу/потреби)

- **App Check** (Firebase Console → App Check) — якщо колись увімкнуть
  "Enforced" для Authentication без налаштованого провайдера на iOS/Android,
  запити можуть відкидатись так само тихо. Станом на 2026-09-07 немає ознак,
  що це проблема — просто не перевірялось.
- **reCAPTCHA SMS defense** (Authentication → Settings → reCAPTCHA) — окремий
  опційний шар anti-fraud (SMS pumping), вимагає власних site keys і мінімальних
  версій SDK (Android 23.1.0+, iOS 11.6.0+). НЕ обов'язковий для базової роботи
  Phone Auth, свідомо не налаштовувався.
- Чи region policy + URL scheme були ЄДИНИМИ причинами зависання на iOS — 
  покаже лише наступний реальний тест 1.4.5 (144), опублікований на прод.

Перевірено після фіксів: `npx tsc --noEmit` (0 помилок), `eslint` (0 нових),
`vitest --run` (57/57).

---

## 11. Критичний баг: зависання Phone Auth назавжди — справжня причина (2026-09-08)

Після §10 (region policy + URL scheme) реальний тест на пристрої досі
зависав, без жодного логу/помилки на екрані ЧИ в мережі — навіть `sendVerificationCode: start` не встигав дійти до `signInWithPhoneNumber call OK`.
Справжня причина виявилась іншою і не пов'язаною з §10 взагалі:

- **`capacitor.config.ts` не мав `providers: ['phone']`** у секції
  `plugins.FirebaseAuthentication`. `@capacitor-firebase/authentication` створює
  `phoneAuthProviderHandler` лише якщо `config.providers` містить `ProviderId.PHONE`
  — інакше на iOS хендлер `nil`, і виклик через Swift `?.` — **повний тихий
  no-op**, без винятку, без логу, без мережевого запиту. На Android той самий
  `null` призводить до NPE, але він ловився зовнішнім try/catch і теж мовчки
  проковтувався. Це пояснює, чому в логах не було НІЧОГО — код фізично не
  доходив до Firebase SDK.
- [x] `capacitor.config.ts` → додано `providers: ['phone']`.
- [x] Другорядний фікс до купи: `PhoneAuthProviderHandler.swift`
  (`@capacitor-firebase/authentication`) не диспетчерив `verifyPhoneNumber` на
  main thread (на відміну від інших provider-хендлерів у тому ж плагіні) —
  запатчено через `patch-package`
  (`patches/@capacitor-firebase+authentication+7.5.0.patch`), `postinstall`
  доданий у `package.json`.
- [x] **Підтверджено на реальному пристрої** — і тестовим номером Firebase
  (`+380000000001`/`123456`), і справжнім номером із реальною SMS.

---

## 12. SMS-відновлення пароля (2026-09-08)

Продукт-геп: водії без email (email опціональний) не мали способу відновити
доступ, якщо забули пароль — старий `forgotPassword()` мовчки no-op-ився без
email. Рішення: **одне поле вводу** (як на Login) — розпізнає телефон/email за
контентом, той самий regex, що вже був на Login (`/^[\d+]/` без `@`).

- [x] Бекенд: `DriverAuthController::resetPasswordWithPhone()` — звіряє
  `firebase_id_token`, шукає `User` за телефоном, ставить пароль, видає токен
  (той самий контракт, що `login()`). Роут `POST /auth/forgot-password/phone`,
  throttle `5,1,driver-forgot-phone` (тільки прод).
- [x] Мобільний: `FleetApi.resetPasswordPhone()`,
  `AuthContext.loginWithPhoneReset()` (дублює тіло `login()` — той самий
  принцип, що вже є між `login()`/`registerAndLogin()`, без спільного
  helper-а), нова сторінка `pages/ForgotPasswordFlow.tsx` — повноекранний
  (НЕ модалка) багатокроковий флоу `input → otp → newPassword`, стрілка назад
  завжди виходить на Login.
- ⚠️ Бекенд-деплой цієї фічі супроводжувався застарілим `route:cache` на проді
  (нові роути 404-ились, поки не перекешували) — користувачу передано команду
  на виправлення; **повторна перевірка після деплою не підтверджена в цій
  сесії**, зробити перед тим, як вважати фічу готовою до продакшн-тесту.

---

## 13. Редизайн Login + онбординг реєстрації "максимальна простота" (2026-09-09)

Мета користувача — прибрати "колхозний" вигляд форм (дрібний текст, купа
елементів одразу) і дійти до стандартних, типових патернів одразу, без
переробок (див. `feedback_default_to_standard_ui_patterns` в пам'яті).

**Login.tsx:**
- [x] Прибрано опис-текст (`app_desc`/`credentials_desc`), заголовок `<h1>`
  замість них; вертикальне центрування форми через flexbox (не `%`-margin —
  та рахується від ширини контейнера, не висоти, тому попередні спроби
  "12%"/"15%" майже не давали видимої різниці).
- [x] Прибрано розкривне "Більше" (тема/мова/реєстрація ховались за ним) —
  замінено на іконку-шестерню (тема+мова, `IonModal` sized-modal рецепт:
  `--width`/`--height: auto`/`--border-radius`, явний
  `--background: var(--ion-item-background, ...)` — інакше в темній темі
  зливається з фоном сторінки) + пряме посилання "Зареєструватися" поруч із
  "Забули пароль?" (симетрично, `justify-content: space-between`).
- [x] Правовий текст (`legal.agree_prefix`/`terms_link`/`privacy_link`)
  переїхав з Login (де він був НЕЛОГІЧНИЙ — юзер, що вже має акаунт, нічого
  заново "не погоджується" щоразу при вході) на реєстрацію, де раніше його
  не було взагалі.
- [x] Офлайн-банер (`App.tsx`) тепер тимчасовий (auto-dismiss 5с через
  `setTimeout`), а не висить постійно поверх елементів.

**Register-флоу — той самий патерн, що ForgotPasswordFlow.tsx** (повноекранна
сторінка + стрілка назад вгорі-зліва, не модалка, не старий `park-login-hero`):
`RegisterPhone.tsx`, `RegisterOtp.tsx`, `RegisterProfile.tsx` перероблені на
`<h1>`-заголовок + flex-центрування (де форма коротка) + стрілку
`onClick={onCancel}` — той самий helper-компонент немає, розмітка
продубльована в кожному файлі (свідомо, короткий JSX, не варте абстракції).

**Прогрес-бар кроків (`StepProgress.tsx`, новий) + розбиття 3-го кроку
(2026-09-09, за проханням користувача):**

Було: `RegisterProfile` — один довгий крок (ім'я/прізвище/по-батькові/номер
посвідчення/email/дата народження/2 адреси/пароль/згода — 8+ полів). Тепер
розбито на 4 "великі" кроки, кожен зі своїм сегментом прогрес-бару вгорі
(`StepProgress`, тонкі риски, `current`/`total`):

1. **Телефон** (`RegisterPhone` + `RegisterOtp` — обидва `current=1`, СМС-код
   не отримує власного сегмента, це частина "введи телефон", за прямим
   проханням користувача)
2. **Профіль** (`RegisterProfile`, тепер лише обов'язкові поля: ім'я/прізвище/
   по-батькові/номер посвідчення/дата народження/2 адреси; email і пароль
   винесено)
3. **Email** (новий `RegisterEmail.tsx`, опціональний) — те саме, "код
   підтвердження на тій самій сторінці не власний крок прогрес-бару"
   (`current=3` і на екрані вводу email, і на екрані вводу коду)
4. **Пароль + згода** (новий `RegisterPassword.tsx`) — фінальний крок,
   викликає `registerAndLogin()`; чекбокс (`IonCheckbox`) замість тексту під
   кнопкою для згоди з умовами/політикою (єдиний інший приклад `IonCheckbox`
   у проєкті — `DocumentFormModal.tsx`, патерн `IonItem lines="none"` +
   `IonLabel` всередині)

`types/index.ts` — новий `RegisterProfileDraft` (лише обов'язкові поля,
проміжний тип між кроками 2→3→4, збирається у фінальний `RegisterDriverPayload`
лише на кроці 4). `RegisterFlow.tsx` тримає накопичувальний `Step`-стан з
усіма даними попередніх кроків (той самий принцип, що й раніше, розширений).

**Підтвердження email кодом (нове, потребує бекенду з нуля)** — дослідження
показало: `MustVerifyEmail` ніде не використовується (закоментовано в
`User.php`), `email_verified_at` — просто timestamp без семантики, жодної
Mailable/коду для email-верифікації в проєкті не було. Пошта в проєкті вже
налаштована й реально працює (`config/mail.php`, SMTP через Resend).

- [x] `App\Services\EmailVerificationService` — код (6 цифр) у `Cache`
  (`CACHE_DRIVER=file`, переживає між запитами), ключ прив'язаний до
  **підтвердженого телефону** (не сесії/токена) — код на 10 хв, "verified"-
  прапорець на 30 хв.
- [x] `App\Mail\EmailVerificationCodeMail` (`ShouldQueue`, хоч
  `QUEUE_CONNECTION=sync` — виконується синхронно однаково, але за
  конвенцією `app/Mail/README.md`), Markdown-шаблон
  `resources/views/mail/auth/email-verification-code.blade.php`.
- [x] `DriverAppRegistrationController::sendEmailCode()`/`confirmEmailCode()`
  — обидва вимагають `firebase_id_token` (той самий `FirebasePhoneVerificationService`,
  що й `register()`) — прив'язує можливість підтвердити email саме до вже
  підтвердженого номера телефону, не до довільного гостя.
- [x] `register()` тепер додатково перевіряє: якщо `email` заповнений,
  `EmailVerificationService::isVerified($phone, $email)` мусить бути `true`,
  інакше 422 "Email не підтверджено." — без цього хтось міг вписати чужий
  email в останній крок форми (той пройшов би `unique`-валідацію, не
  володіння).
- ⚠️ **Важлива деталь виправлена одразу:** `sendEmailCode()`/`confirmEmailCode()`
  спершу писались через `$request->validate()` — та кидає
  `ValidationException` з JSON `{message: "The given data was invalid.",
  errors: {...}}`, генеричний англійський `message` НАВІТЬ з кастомними
  `messages()` (ті йдуть лише в `errors.*`, не в топ-рівневий `message`, який
  саме й тостить мобільний клієнт). Переписано на `Validator::make()` +
  ручний `response()->json(['message' => $validator->errors()->first()], 422)`
  — той самий підхід, що решта методів контролера.
- [x] Нові роути `POST /auth/register/email/send-code`,
  `POST /auth/register/email/confirm-code` (throttle `5,1,driver-register-email`,
  тільки прод), `FleetApi.sendRegisterEmailCode()`/`confirmRegisterEmailCode()`.
- [x] `workspace/docs/shared/emails.md` + `app/Mail/README.md` — новий рядок
  `email_register_verify_code`.

**Статус верифікації:** `npx tsc --noEmit`, `eslint`, `vitest --run` (57/57) —
усе чисто на мобільному боці; `php -l` чисто на бекенді. **НЕ перевірено
наскрізно** (реальний лист + реальний код + повний прохід реєстрації) — у цій
сесії не було змоги провести тап-автоматизацію в Simulator (немає
Accessibility-дозволу для System Events/AppleScript, немає `idb`/`cliclick`);
потрібен ручний прохід користувача через RegisterPhone → RegisterOtp →
RegisterProfile → RegisterEmail (реальний email) → RegisterPassword перед
релізом.

### 13.1 Код-рев'ю онбордингу — два фікси (2026-09-09)

Легкий власний прохід (не важкий `/code-review` skill — той розпаралелив на
~10 агентів і вичерпав ліміт сесії ще до завершення більшості перевірок, див.
пам'ять `feedback_no_heavy_code_review_skill`) виявив і виправив два реальні
ризики:

- [x] **Застарілий Firebase-токен.** `firebaseIdToken` раніше зберігався в
  стані `RegisterFlow` одразу після OTP і передавався незмінним через
  Профіль → Email → Пароль. Firebase ID-токени живуть ~1 год, а флоу тепер
  багатокроковий (юзер може надовго затриматись на email-кроці, перемикаючись
  у поштовий застосунок за кодом) — токен міг протухнути до фінального
  `register()`, скидаючи весь прогрес. Виправлено: `firebasePhoneAuth.ts` —
  новий `refreshIdToken()` (просто `getIdToken({forceRefresh:true})` від
  нативної сесії, яка лишається залогіненою до `signOutFirebase()` в кінці);
  `RegisterEmail.tsx`/`RegisterPassword.tsx` тепер беруть свіжий токен
  безпосередньо перед кожним викликом бекенду замість пропу. `firebaseIdToken`
  прибрано зі стану кроків `RegisterFlow` взагалі — більше не зберігається.
- [x] **Синхронна відправка листа.** `EmailVerificationService::sendCode()`
  викликав `Mail::to($email)->send(...)` — це ЗАВЖДИ синхронно в Laravel,
  незалежно від `ShouldQueue` на самому Mailable (той працює лише через
  `->queue()`). HTTP-запит `sendEmailCode` блокувався на час SMTP-відправки.
  Виправлено на `->queue(...)`. **Важливо:** з поточним `QUEUE_CONNECTION=sync`
  затримка НЕ зникає (job виконується одразу в тому ж запиті) — це готує код
  на майбутнє (реальний async-воркер), не вирішує затримку сьогодні. Той
  самий системний нюанс стосується вже наявного `ResetPasswordNotification` —
  не регресія цієї сесії, загальна властивість поточної інфраструктури черг.

Перевірено після фіксів: `npx tsc --noEmit`, `eslint`, `vitest --run` (57/57),
`php -l` — усе чисто.

### 13.2 Тестова email-адреса для перевірки (2026-09-09)

За аналогією з фіксованими тестовими номерами Firebase (`+380000000001`/
`123456`) — `EmailVerificationService`: якщо `email === test@example.com`
(регістронезалежно), код фіксований `123456`, реальний лист НЕ надсилається
(`example.com` — зарезервований RFC 2606 домен, гарантовано не існує як
реальна скринька). Валідація `Rule::unique('users','email')` НЕ обходиться —
як і з тестовим номером телефону, повторний повний прохід реєстрації тим
самим тестовим email/телефоном вимагає видалити попередній тестовий акаунт
вручну (та сама відома властивість, що вже стосується тестового номера).

⚠️ **Це backend-only зміна** — щоб запрацювало в Simulator/на пристрої
(додаток звертається до `https://app.g24.com.ua`, прод-бекенд), потрібен
окремий деплой бекенду.

### 13.3 Покроковий "назад" + чернетка реєстрації в Preferences (2026-09-09)

За проханням користувача — дві пов'язані UX-правки, максимальна дружність до
переривань:

- [x] **Стрілка "назад" — на попередній крок, не на Login.** `RegisterFlow.tsx`
  тепер тримає стек історії кроків (`history: Step[]`) замість єдиного
  значення. `handleBack()` знімає останній крок зі стеку; на кореневому кроці
  ('phone', стек висотою 1) природно викликає `onCancel` (вихід із флоу
  цілком — там немає куди повертатись). Раніше стрілка на КОЖНОМУ кроці
  виходила прямо на Login, губ лячи весь прогрес одним дотиком. Пропи
  перейменовано з `onCancel` на `onBack` у `RegisterProfile`/`RegisterEmail`/
  `RegisterPassword` (семантика змінилась з "скасувати" на "назад");
  `RegisterOtp`/`RegisterPhone` лишились без змін імен (їхні `onBack`/
  `onCancel` просто тепер обидва отримують `handleBack`). Новий i18n-ключ
  `register.back` ("Назад"/"Back") — старий `back_to_login` уже не завжди
  точний опис дії стрілки.
- [x] **Чернетка введених даних у Preferences.** `storage.ts` — новий ключ
  `REGISTER_DRAFT`. `RegisterFlow` зберігає `{ phone, profile, email }` через
  `storage.setJSON()` на кожному завершеному кроці, завантажує при монтуванні
  (`storage.getJSON()`, рендер затримується до завершення — швидке локальне
  читання, без "миготіння" порожніх полів). `RegisterPhone`/`RegisterProfile`/
  `RegisterEmail` отримали `initialPhone`/`initialDraft`/`initialEmail` пропи
  для попереднього заповнення полів. Свідомо НЕ зберігається: пароль (ніколи
  в Preferences), `verificationId`/Firebase-токен (короткоживучі, після
  перезапуску однаково недійсні — телефон при відновленні підтверджується
  заново). Чернетка прибирається (`storage.remove`) лише після успішної
  реєстрації — новий проп `onSuccess` на `RegisterPassword`.

Перевірено: `npx tsc --noEmit`, `eslint`, `vitest --run` (57/57), `vite build`
— усе чисто.

### 13.4 Посвідчення водія — окремий крок + бекенд-перевірка формату (2026-09-09)

За проханням користувача: "посвідчення водія треба винести в окремий крок,
бо це додаткова інфа, яка не стосується персональних даних" + "перевірка
формату сама одразу, не лише на фінальному register()".

- [x] **Прогрес-бар total=4 → 5.** Новий крок `RegisterLicense.tsx` (крок 3
  з 5): `RegisterProfile.tsx` більше не містить `license_number` — власний
  тип `PersonalDraft = Omit<RegisterProfileDraft, 'license_number'>`, і
  `RegisterFlow.tsx` зберігає його окремо в `Step` до злиття з номером
  посвідчення на наступному кроці.
- [x] **Новий публічний ендпоінт `POST /auth/register/license/validate`**
  (`DriverAppRegistrationController::validateLicense()`) — перевіряє формат
  через уже наявний `DriverLicenseValidationService` (той самий, що
  `register()` зрештою застосує), без побічних ефектів і без прив'язки до
  телефону (не чутливі дані), throttle `20,1,driver-register-license`
  (легший за SMS/email-кроки, тільки прод). "Далі" на кроці заблоковано,
  поки бекенд явно не поверне `valid: true` — раніше невірний формат
  виявлявся лише на фінальному кроці (пароль), після ще двох заповнених
  екранів.

### 13.5 Телефон+код і email+код — одна сторінка, не окремі переходи (2026-09-09)

Користувач: "можливо самі коди перевірки можна було не робити окремими
екранами" → "часто роблять 2 поля... телефон і код нижче який з'являється
знизу... якщо помилився в телефоні — одразу виправив і замовив новий код".

- [x] **`RegisterOtp.tsx` видалено повністю** — була окрема сторінка/крок
  навігації для SMS-коду. Логіку злито в `RegisterPhone.tsx`: поле телефону
  лишається видимим і РЕДАГОВАНИМ постійно; поле коду з'являється нижче
  ПІСЛЯ відправки (`codeSent` state, не окрема стадія на весь екран). Правка
  номера після відправки коду автоматично ховає застаріле поле коду й скидає
  до "Надіслати код" — жодної окремої "Змінити номер"-кнопки більше не
  потрібно, виправлення відбувається прямо на місці.
- [x] **`RegisterEmail.tsx`** — той самий патерн: `stage: 'entry'|'code'`
  замінено на `codeSent: boolean`, поле email завжди видиме/редаговане,
  поле коду з'являється нижче після відправки, правка email після
  відправки коду скидає `codeSent`.
- [x] **`RegisterFlow.tsx` спрощено** — `Step` більше не має варіанту
  `'otp'` (був окремий запис в стеку історії з `verificationId`); телефон +
  код тепер один крок з єдиним колбеком `onVerified(phone)`, викликається
  і при ручному підтвердженні коду, і при auto-verify (Android SMS
  Retriever) — виклику стороні не важливо, яким шляхом підтвердився номер.

Прогрес-бар (StepProgress, total=5) не змінився кількістю сегментів — це
завжди був суто UI-рівень навігації всередині компонента, не крок
оркестратора; сегмент "Телефон" і раніше не отримував окремого поділу для
SMS-коду.

Перевірено: `npx tsc --noEmit`, `eslint`, `vitest --run` (57/57), `vite build`
— усе чисто.

### 13.6 Три дрібні правки після тесту (2026-09-09)

- [x] **"Далі" замість "Зареєструватися" на кроці профілю.** Ключ
  `register.profile_submit` ("Зареєструватися") був помилково спільний для
  `RegisterProfile.tsx` (крок 2, не фінальний) і `RegisterPassword.tsx`
  (справді фінальний) — новий окремий ключ `register.next` ("Далі") для
  першого.
- [x] **Перевірка формату телефону — одразу на кроці телефону.** Новий
  публічний ендпоінт `POST /auth/register/phone/validate`
  (`DriverAppRegistrationController::validatePhone()`, той самий
  `PhoneValidationService`, що й `register()`) — раніше невірний код
  оператора (напр. тестовий номер `+380000000001` — "000" не існує в
  `PhoneValidationService::UKRAINE_MOBILE_OPERATORS`) виявлявся лише на
  фінальному кроці, після ще 3 заповнених екранів. Тепер
  `RegisterPhone.tsx` викликає перевірку одразу ПІСЛЯ підтвердження
  SMS-коду/auto-verify (не ДО відправки — тестові SMS-номери й далі можна
  тестувати, обмеження застосовується лише перед переходом на наступний
  крок). Мережева помилка самої перевірки НЕ блокує — пропускає далі,
  фінальний `register()` все одно перевірить ще раз.
- [x] **Дизайн чекбоксу згоди — переверстано.** `ParkCheckbox.tsx`: чекбокс
  притиснутий до верху тексту (`alignSelf: flex-start`, раніше вертикально
  центрувався й "плавав" при переносі на 2 рядки — це й давало враження
  "звалища тексту"), текст `park-text-xs` → `park-text-sm`, більший
  внутрішній відступ картки.

Перевірено: `npx tsc --noEmit`, `eslint`, `vitest --run` (57/57), `vite build`,
`php -l` — усе чисто.

**Виправлення після повторного тесту (те саме, 2026-09-09):** відступ
чекбоксу ще раз переверстано — прибрано кастомні `--padding-start:14px`/
`--inner-padding-end` (не збігались із стандартним 16px, яким користуються
сусідні `park-item-card` поля без жодних перевизначень — картка виглядала
зсунутою вліво).

### 13.7 Settings-кнопка на кожному кроці онбордингу (2026-09-09)

За проханням користувача: якщо людині незручно читати в поточній темі/мові
посеред реєстрації, не має бути єдиного виходу "почати заново на Login".

- [x] Новий самодостатній компонент `components/ui/SettingsButton.tsx` —
  винесена шестерня+sized-modal (тема+мова) з `Login.tsx` (той самий рецепт,
  без змін поведінки), без пропів, власний `open`-стан.
- [x] Додано на `Login.tsx` (як і раніше, absolute top-right),
  `ForgotPasswordFlow.tsx` (поруч зі стрілкою назад) і **кожен** крок
  `RegisterFlow.tsx` — третій елемент у header-рядку: назад / прогрес-бар
  (`flex:1`, природно займає середину) / шестерня.

### 13.8 Код парку — перенесено на початок онбордингу (2026-09-09)

За проханням користувача: раніше приєднання до парку (`JoinPark.tsx`)
з'являлось окремим екраном **ПІСЛЯ** повної реєстрації (5 кроків) — людина
могла заповнити всю анкету, не знаючи, що коду в неї немає, і засмутитись
у самому кінці.

**Технічне обмеження, що визначило рішення:** фактичне приєднання
(`POST /parks/join`) вимагає `auth:sanctum` — не може статись раніше за
`register()`, бо User ще не існує. Тому розділено ПЕРЕВІРКУ коду (можна
зробити одразу, публічно) і фактичне ПРИЄДНАННЯ (технічно й далі останнє,
але тепер мовчазне, без видимого екрана).

- [x] **Новий крок 1 з 6 — `RegisterParkCode.tsx`** (передує навіть
  телефону). Пояснює контекст (це доповнення до SaaS для автопарків, код
  дає адмін парку, без коду реєстрацію не завершити — конкретне прохання
  користувача додати цей контекст на екрані). Бекенд-перевірка блокує
  "Далі", показує назву парку при підтвердженні (`register.park_code_confirmed`).
- [x] **Новий публічний ендпоінт `POST /parks/check-code`**
  (`DriverAppRegistrationController::checkParkCode()`) — той самий пошук
  `Park::where('driver_join_code', ...)`, що вже є в `joinPark()`, але БЕЗ
  auth і БЕЗ побічних ефектів (не створює Driver, лише підтверджує код +
  повертає `park_name`). Throttle `20,1,driver-check-park-code`.
  Роут — у `routes/driver_app/public.php`, поза `/auth`-групою (той самий
  рівень, що `/parks/join` у `routes/api/driver_app.php`, лише без
  auth-мідлвара).
- [x] **`RegisterPassword.tsx`** — після успішного `registerAndLogin()`
  автоматично й мовчки викликає `joinParkByCode(parkCode)` (код із кроку 1).
  Якщо це раптом впаде (код став невалідним між кроком 1 і кінцем —
  рідкісна гонка), помилку НЕ показує як провал реєстрації — акаунт уже
  створено, `App.tsx` сам покаже `JoinPark.tsx` (`hasSessionWithoutPark`)
  як існуючий фолбек, нічого не втрачено.
- [x] `RegisterFlow.tsx` — `Step`-стек тепер несе `parkCode` через усі
  наступні кроки; прогрес-бар `total=5 → 6`, усі 6 сторінок перенумеровано.
  `JoinPark.tsx`/`App.tsx` НЕ змінювались — лишається як фолбек-механізм,
  просто в щасливому сценарії його більше не видно.

Перевірено: `npx tsc --noEmit`, `eslint`, `vitest --run` (57/57), `vite build`,
`php -l` — усе чисто. **Наскрізно не тестовано** (потребує реального
проходу — див. загальний застережний пункт у §13, кінець).

### 13.9 Реферальні коди — "хто кого привів" (2026-09-09)

За ідеєю користувача: код парку тепер може йти в парі з персональним
кодом людини, яка поділилась застосунком — система завжди знає реферера.

**Формат:** `<код_парку>` або `<код_парку>-<код_користувача>` — друга
частина ЗАВЖДИ опційна (публічна вебсторінка парку `ParkLandingController`,
друковані матеріали тощо — без прив'язки до конкретної людини, лише код
парку). Роздільник `-` (не `:` — той зарезервований в URI, плутає з
scheme-роздільником; `-` ніде не потребує URL-екранування й легше набрати
руками).

**Довжини — свідомо короткі на цьому етапі**, з поясненням чому це безпечно
змінити пізніше без зміни структури (роздільник означає, що парсинг НЕ
залежить від довжини жодної з частин):
- `parks.driver_join_code`: 6 → **3** символи (32³ ≈ 32 768 комбінацій —
  з запасом для реальної кількості парків).
- `users.referral_code` (новий): **5** символів (32⁵ ≈ 33.5 млн — з запасом
  для реальної кількості людей), глобально унікальний (не park-scoped —
  код сам по собі однозначно вказує конкретну людину).
- Обидва — той самий алфавіт `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (без
  візуально неоднозначних 0/O/1/I/L), той самий спосіб генерації
  (рандом + перевірка унікальності в БД).

**Бекенд:**
- [x] `Park::splitJoinCode(string $raw): array{park, referrer}` — єдине
  місце парсингу формату, використовується і перевіркою, і реєстрацією.
- [x] Міграція `2026_09_09_120000_add_referral_code_to_users_table` —
  `users.referral_code`, автогенерація в `User::booted()`'s `creating`-хуку
  (спрацьовує для БУДЬ-якого нового юзера — і водій, і персонал, обидва
  `users`-рядки), з бекфілом для вже існуючих (112 юзерів на момент
  застосування).
- [x] Міграція `2026_09_09_121500_add_referred_by_to_users_table` — ДВА
  поля разом, не одне замість іншого: `referred_by_code` (сирий диплінк
  ЯК ВІН БУВ отриманий — аудит/історія, ідея користувача "я би поклав у
  базу весь", а не лише частину користувача — інакше це 100% дублювало б
  `referred_by_user_id` без жодної нової цінності) + `referred_by_user_id`
  (резолвлений FK, `nullOnDelete` — якщо реферера видалять, зв'язок йде
  null, але сирий код лишається як історичний факт).
- [x] `POST /parks/check-code` (крок 1) — тепер розбирає комбінований код,
  повертає `referrer_name`, якщо реферальна частина резолвилась. Невалідний/
  відсутній реферал НЕ провалює перевірку — просто немає підказки.
- [x] `RegisterDriverAppRequest` — новий `join_code` (nullable) — сирий код
  з кроку 1, ЛИШЕ для атрибуції реферала (не для приєднання до парку самого
  — те лишається окремим `POST /parks/join` після реєстрації).
- [x] `DriverService::registerSelf()` — новий 4-й параметр `?string $joinCode`,
  резолвить і записує `referred_by_code`/`referred_by_user_id` за наявності
  валідної реферальної частини.
- [x] `DriverAppRegistrationController::joinPark()` — лишок від попереднього
  дизайну: лукап парку тепер теж через `Park::splitJoinCode()` (могло впасти,
  якби прилетів комбінований код — той самий рядок з кроку 1 доходить сюди
  через auto-join у `RegisterPassword.tsx`).
- [x] `login()`/`resetPasswordWithPhone()` (`DriverAuthController`) +
  `register()` (`DriverAppRegistrationController`) — усі три `user`-об'єкти
  відповіді тепер включають `referral_code`, щоб моб. додаток міг ділитись
  своїм кодом одразу після будь-якого способу входу.

**Свідомо НЕ зроблено (обговорено й відхилено):** окрема колонка "перший
парк" на `User` — вже виводиться з наявних даних (найранніший `Driver`-рядок
за `created_at`), і додавання дублювало б патерн кешованого "домашнього
парку", який команда цілеспрямовано прибирає (`project_tech_debt.md`,
"Легасі визначення парку").

**Мобільний бік:**
- [x] `RegisterParkCode.tsx` (крок 1) — те саме поле приймає обидва формати;
  показує підтвердження реферала (`register.park_code_referrer`) окремим
  рядком під підтвердженням парку, лише якщо резолвився.
- [x] `RegisterPassword.tsx` — фінальний payload несе `join_code` (сирий
  код з кроку 1) поруч з рештою полів.
- [x] `Settings.tsx` — текст шерингу тепер `<driver_join_code>-<referral_code
  свого юзера>`, якщо обидва є; фолбек на сам код парку, якщо чомусь немає
  свого коду.
- [x] Типи (`RegisterDriverPayload.join_code`, `AppUser.referral_code`,
  `FleetApi` — три місця з інлайновим `user`-типом) синхронізовано з
  бекендом.

**НЕ підключено (за межами цієї сесії):** захоплення справжнього диплінка
(Universal Links/App Links) — зараз формат розроблений і готовий, але немає
перевірки, чи взагалі налаштована ця інфраструктура в застосунку (перехід
за посиланням поки що НЕ відкриває застосунок з передзаповненим кодом —
людина все одно вводить код руками на кроці 1, комбінований чи ні).

Перевірено: `npx tsc --noEmit`, `eslint`, `vitest --run` (57/57), `vite build`,
`php -l` на всіх змінених файлах — усе чисто. Дві міграції застосовано
локально (`php artisan migrate`). **Наскрізно не тестовано.**
