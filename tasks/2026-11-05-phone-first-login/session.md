# Сесія: вхід за телефоном

### 2026-11-05

Під час розбору сторінки «Як почати» користувач: «як водій дізнається сценарій? … може першим повинен вводитися
телефон?». З'ясовано: зараз водій, якого вже додав парк, натиснувши «Зареєструватися», проходить увесь майстер і
лише на останньому кроці отримує «Акаунт із цим номером телефону вже існує. Увійдіть»
(`DriverAppRegistrationController::register`). Погоджено phone-first. Користувач: «показовий приклад
вдосконалення інтерфейсу через написання документації».

Бекенд: SMS підтверджує Firebase (`FirebasePhoneVerificationService::verifyAndGetPhone`), `resetPasswordWithPhone`
вже шукає користувача за телефоном і видає сесію навіть без парків (застосунок показує «Код парку» / JoinPark).
Відповідь сесії (`token`, `user`, `memberships`) зібрана в трьох місцях — виносимо в сервіс.

**Бекенд зроблено.** `POST /auth/phone` (`DriverAuthController::loginWithPhone`, throttle `driver-phone-login`):
акаунт є → `registered: true` + сесія (без парків — memberships []); немає → `{registered: false, phone}`.
Відповідь сесії — `DriverAppAuthService::session()` (login, phone, reset, register — без дублювання).
З'ясовано: водій, якого створив парк, має випадковий пароль (`DriverService`, «активація через відновлення») —
саме тому він і не міг увійти без «Забули пароль?». Тести `DriverPhoneLoginTest` (4); увесь бекенд — 385 зелені.
Контракт — `docs/DRIVER_APP_API_CONTRACT.md` §6.

**Ідея користувача (погоджено):** код не SMS, якщо можна — Telegram-бот парку, інакше email, інакше SMS
(економія SMS; lifecell в Україні глючить). Компроміс погоджено: канал «telegram/email» показує, що номер є.
Бекенд: `Services/Auth/PhoneLoginCodeService` (код 6 цифр, 10 хв, 5 спроб, у кеші HMAC), `LoginCodeMail`
(`mail/auth/login-code`), тексти `lang/{uk,en,ru}/auth.php` → `login_code` (en/ru одразу: резервна мова Laravel —
en, без них англомовний побачив би ключ). Запити `POST /auth/phone/start`, `/auth/phone/verify`. Telegram — бот
парку з найсвіжішим `telegram_connected_at` і своїм ботом (`CurrentPark::set` на час надсилання). Тести +5.

**Застосунок зроблено.** `ui/signin/PhoneSignInScreen` + `PhoneSignInViewModel` (логіку телефону/SMS перенесено з
`RegisterViewModel`, не скопійовано); канал коду — `AuthRepository.startPhoneLogin` / `verifyPhoneCode`
(`LoginCodeChannel`); SMS — як раніше `signInWithPhone`. Майстер реєстрації — 5 кроків, стартує з підтвердженим
номером (`RegisterFlow(verifiedPhone)`), «✓ Парк: …» на кроці «Ваші дані». `AuthStepScaffold`: `onBack = null`
(перший екран) і `headerEnd` (вибір мови). Спільне — `ui/auth/AuthParts.kt` (`AuthDescription`, `ResendRow`,
`rememberAutoFocus`, `LanguagePicker`). Рядки `register_phone_*`/`register_otp_*` перейменовано на
`signin_*`/`auth_code_*`; нові — лише українською. Самоперевірка: після переходу в реєстрацію перший екран
скидається (інакше «назад» показував би старий код). Збірка зелена; перший екран перевірено на емуляторі.
