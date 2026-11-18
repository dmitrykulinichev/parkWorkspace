# Посібник водія — окремий розділ /driver: звіт

Не закомічено. Tailwind не перезбирався: використано лише класи, що вже є в style.css.

## Що змінено (landing/)
- **Вміст:** `www/content/docs2/driver/*` переміщено в `www/content/driver/` (через mv, не git mv). Нове меню — `www/content/driver/menu.json`, у ньому одна група «Застосунок для водія»; slug-и `start`/`shift`/`records`, docFile `_data/<page>.md`; поля badge/screen/i18n збережено. Групу прибрано з `content/docs2/menu.json` (у diff лише видалені рядки).
- **`app/Docs/DocsStore.php`:** зі статичного класу став класом розділу (тека + базова адреса). Є два готові розділи: `DocsStore::docs()` (content/docs2 на /docs) і `DocsStore::driver()` (content/driver на /driver). Додано `pagePath()` і `pages()`. `localesOfPath` реагує лише на адреси свого розділу.
- **Контролери:**
  - `Docs2Controller` отримав параметри: `$store`, `section()` (база, API пошуку, тексти) і `indexMeta()`.
  - `movedTo()` дає 301 зі старих адрес /docs/driver-X на /driver/X і зберігає мову.
  - Сторінки посібника мають `<title>` «X — Посібник водія».
  - Новий `DriverGuideController extends Docs2Controller` відрізняється лише налаштуваннями.
- **Маршрути** (`app/routes.php`): `/driver`, `/driver/{slug}`, `/api/driver/search`.
- **`index.php`:** розділ driver зареєстровано через `LocalizedUrl::registerContent('driver', …)`, тож /en/… і /ru/… працюють так само, як у документації.
- **`SearchController`:** спільний `searchSection(store)`. `/api/docs/search` шукає лише в документації, `/api/driver/search` — лише в посібнику. Сторінки беруться мовою з X-Locale, якщо переклад є. Заодно виправлено позицію сніпета (`mb_strpos`).
- **`SitemapController`:** сторінки беруться з обох розділів; додано `/driver` до статичних. `Docs2ImageSitemapService` не змінювався: він читає лише docs2, а скріни сторінок водія потрапляють у мапу через `screens.json` → pages.
- **Шаблони:**
  - `views/docs2/index|page.blade.php` і `partials/docs2-search.blade.php` отримали параметри `$section` (база, пошук, тексти, хлібні крихти).
  - На /docs додано банер «Ви водій? Посібник водія».
  - Посилання prev/next тепер з мовою.
  - JSON-LD url раніше вказував на `/docs2/…`, тепер на canonical.
  - У `partials/header.blade.php` додано пункт «Водіям» → /driver (підсвічується на /driver*).
- **`lang/{uk,en,ru}.php`:**
  - `nav.driver`: «Водіям» / «For drivers» / «Водителям».
  - `docs.index.driver_banner`.
  - Розділ `driver.*`: «Посібник водія» / «Driver guide» / «Руководство водителя».
- **Посилання на старі адреси:** `content/screens.json` (pages → /driver/…), `content/driver/records{,.en,.ru}.md` (/[en|ru/]driver/shift), коментарі в `tools/screens/flows/driver-{start,shift,register}.py`.
- **Тести:** `tests/DocsTest.php` переведено на екземпляр розділу, додано тест «розділ відповідає лише за свої адреси». `tests/ScreensTest.php` тепер сканує обидва розділи й перевіряє повні адреси.

## Перевірка (curl http://localhost:8001)
- **Посібник:**
  - `/driver` — 200, title «Посібник водія | Garage24».
  - `/driver/start|shift|records` — 200, скріни uk (10/7/9).
  - `/en/driver/records` — 200, «Shift records — Driver guide», скріни en.
  - `/ru/driver/records` — 200, «Записи за смену — Руководство водителя», скріни ru.
  - Сайдбар містить лише 3 сторінки водія. Canonical і hreflang uk/en/ru вказують на /driver/records.
- **Редіректи:**
  - `/docs/driver-records|start|shift` — 301 на /driver/….
  - `/en/docs/driver-records` — 301 на /en/driver/records; `/ru/docs/driver-shift` — 301 на /ru/driver/shift.
  - `/docs/driver-nope` — 404. `/docs/driver-schedule` (сторінка документації) — 200, як і раніше.
- **Документація:** `/docs` не містить сторінок водія; банер є uk/en/ru, на /driver його немає.
- **Пошук:**
  - «пробіг»: docs повертає 13 сторінок без водійських; driver — shift, records.
  - «Графік»: driver — порожньо.
  - «refuel» з X-Locale: en — records «Shift records».
- **Мапа сайту** (buildXml, без збереження й без Telegram):
  - /driver і 3 сторінки ×3 мови є, старих /docs/driver-* немає.
  - /en/driver/records містить 9 скрінів en.
  - Статичний `sitemap.xml` перегенерує прод (`/api/sitemap/generate`); у ньому й раніше не було сторінок водія.
- **Тести (php tests/run.php):** 31 з 32 пройшли. Один провал старий і не пов'язаний із цією зміною: «немає screens.app-quickadd-menu у lang/uk.php» (у HEAD цього ключа теж немає).

## Посилання в kmp/ та app/park-react-spa
Посилань на g24.com.ua/docs/driver-* (чи взагалі на g24.com.ua/docs) не знайдено. Збіги «driver-shift» у `park-react-spa/tests/Feature/BlogPostTranslationsTest.php` — це slug тестової статті блогу, не посилання.

## Інцидент
Під час роботи моя команда `pkill -f cat -n` випадково зупинила Docker Desktop. Я перезапустив його (`open -a Docker`), усі контейнери park-* піднялися.
