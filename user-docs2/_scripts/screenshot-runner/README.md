# screenshot-runner

Автоматично робить скріншоти всіх i-doc елементів додатку та зберігає їх у `data/screenshots/`.
Використовує Puppeteer (Chromium) з персистентною сесією — логін потрібен лише один раз.

---

## Встановлення

```bash
cd workspace/user-docs2/_scripts/screenshot-runner
npm install
```

---

## Запуск

```bash
node workspace/user-docs2/_scripts/screenshot-runner/index.js [ключі]
```

### Всі ключі

| Ключ | За замовчуванням | Опис |
|---|---|---|
| `--type page,tab` | `page,tab` | Які типи знімати: `page`, `tab`, `modal` |
| `--theme light` | `light` | Тема інтерфейсу: `light`, `dark` |
| `--platform desktop` | `desktop` | Платформа: `desktop`, `mobile` |
| `--full` | _(вимкнено)_ | Знімати повний елемент; без ключа — тільки видима область |
| `--verbose` / `-v` | _(вимкнено)_ | Детальний лог; без ключа — тільки помилки та результат |

### Приклади

```bash
# Мінімальний запуск (світла тема, десктоп, видима область, короткий лог)
node index.js

# Темна тема
node index.js --theme dark

# Мобайл
node index.js --theme light --platform mobile

# Повний цикл для лендінгу — 4 варіанти
node index.js --theme light  --platform desktop
node index.js --theme light  --platform mobile
node index.js --theme dark   --platform desktop
node index.js --theme dark   --platform mobile

# Тільки модалки (ручний режим)
node index.js --type modal

# Все одразу з детальним логом
node index.js --type page,tab,modal --verbose

# Повний елемент (включно з тим що за viewport) + детальний лог для діагностики
node index.js --full --verbose
```

---

## Процес роботи

```
1. Запускається Chromium (видимий, без фіксованого розміру вікна)
2. ─── ПАУЗА ────────────────────────────────────────────────────
   Скрипт чекає на [Enter] у терміналі.
   В цей час налаштуйте браузер:
     • залогіньтесь якщо ще не
     • виберіть тему (світла / темна) — вона має збігатись з --theme
     • встановіть розмір вікна вручну
3. Після [Enter] — навігація на baseUrl, починається зйомка
4. Для кожного URL з каталогу:
     a. Переходить на сторінку (domcontentloaded)
     b. Чекає на [data-page-ready="true"] — React змонтувався
     c. Чекає поки зникне .animate-spin — дані завантажились
     d. Для кожного елемента — чекає на [data-i-doc="..."]
     e. Робить скріншот → зберігає PNG
5. Виводить підсумок і зберігає лог помилок якщо були
6. Браузер залишається відкритим
```

---

## Режим знімка

Поведінка залежить від типу елемента:

| Тип | Дефолт | З `--full` |
|---|---|---|
| `page` | повна сторінка (fullPage) | повна сторінка |
| `tab` | clip по елементу | повна сторінка |
| `sec` | clip по елементу | повна сторінка |
| `modal` | clip по елементу | повна сторінка |

Сторінки (`page`) завжди знімаються повністю — сайдбар знаходиться поза `data-i-doc` елементом, в layout-обгортці, тому потрібен `fullPage`.

Секції, таби та модалки знімаються по bounding box елемента — знімається рівно той блок.

`--full` примусово вмикає `fullPage: true` для всіх типів.

```bash
# Дефолт: page=fullPage, інші=clip
node index.js

# Все fullPage (для діагностики)
node index.js --full
```

---

## Режим логування (`--verbose` / `-v`)

```bash
# Короткий лог (дефолт) — тільки результат кожного знімка і помилки
node index.js
# ✅ page_dashboard_main
# ✅ page_vehicles_main
# ❌ page_drivers_main  — TIMEOUT: елемент не з'явився за 20000мс

# Детальний лог — url, viewport, час очікування ready/spinner, кількість i-doc
node index.js --verbose
# → /drivers  (1)
#   [08:12:18.002] url:      /drivers
#   [08:12:18.002] viewport: 1440 × 900
#   [08:12:18.002] шукаємо [data-page-ready="true"] ...
#   [08:12:19.467] [data-page-ready="true"] знайдено (1465мс) ✓
#   [08:12:20.100] спінер зник (633мс) ✓
#   [08:12:20.100] i-doc елементів: 3
#   ✅ [08:12:20.348] page_drivers_main  [1184 × 900]
```

---

## Типи знімків

### `page` та `tab` — автоматично

Скрипт переходить на URL, чекає маркер готовності та зникнення спінера, знімає елемент.

### `modal` — напівручний режим

Модалки не можна відкрити автоматично — для кожної потрібен різний тригер.

Процес для `--type modal`:
1. Скрипт переходить на сторінку де живе модалка
2. Чекає появи `[data-i-doc="modal:task-form"]` (20с)
3. Ви відкриваєте модалку вручну
4. Скрипт виявляє елемент → робить знімок → переходить до наступної

---

## Вихідні файли

```
data/screenshots/
  light/
    desktop/   ← node index.js
    mobile/    ← node index.js --platform mobile
  dark/
    desktop/   ← node index.js --theme dark
    mobile/    ← node index.js --theme dark --platform mobile
  errors/
    elem_error_page_drivers_main.png    ← знімок стану при помилці елемента
    ready_error__drivers.png            ← знімок якщо data-page-ready не знайдено
    spinner_error__drivers.png          ← знімок якщо спінер не зник
    run-2024-01-15T10-30-00.json        ← JSON-лог запуску з помилками
```

При повторному запуску файли **перезаписуються**.

---

## Файли скрипта

| Файл | Відповідальність |
|---|---|
| `index.js` | Оркестратор: читає каталог, фільтрує за `--type`, запускає зйомку |
| `config.js` | Всі налаштування та парсинг CLI-аргументів |
| `browser.js` | Запуск Puppeteer, пауза для підготовки браузера |
| `capture.js` | Навігація, очікування ready/spinner, `element.screenshot()` |
| `package.json` | Залежність: `puppeteer` |
| `chrome-profile/` | Персистентна сесія Chromium (створюється автоматично) |

---

## Конфігурація (`config.js`)

| Параметр | За замовчуванням | Опис |
|---|---|---|
| `baseUrl` | `http://localhost:8010` | URL додатку |
| `waitTimeout` | `20000` мс | Максимальний час очікування елемента або маркера |
| `stabilizationMs` | `600` мс | Пауза після появи елемента (анімації) |
| `pageReadySelector` | `[data-page-ready="true"]` | Маркер що React змонтувався |
| `loadingSelector` | `.animate-spin` | Спінер — чекаємо поки зникне |
| `outputDir` | `data/screenshots/<theme>/<platform>/` | Залежить від `--theme` і `--platform` |
| `errorsDir` | `data/screenshots/errors/` | Знімки стану при помилках та JSON-лог |
| `chromeProfile` | `./chrome-profile/` | Папка з персистентною сесією |

---

## Зв'язок з іншими скриптами

```
catalog-generator/index.js
  └── генерує _meta/screenshots.json   ← читає цей файл
                                              ↓
                                    screenshot-runner/index.js
                                              ↓
                              data/screenshots/<theme>/<platform>/*.png
```

При додаванні нових i-doc міток — спочатку перезапустіть `catalog-generator`.

---

## Типові проблеми

**Браузер не відкривається**
→ Переконайтесь що `npm install` виконано у папці скрипта.

**Скрипт завис на паузі**
→ Натисніть Enter у терміналі після підготовки браузера.

**`data-page-ready` не знайдено — зйомка зупинена**
→ Сторінка не виставляє атрибут. Додайте `usePageReady(!isLoading)` у компонент сторінки.

**Спінер не зник — зйомка зупинена**
→ Дані не завантажились за 20с. Перевірте що API доступне і збільшіть `waitTimeout` в `config.js`.

**Скріншоти зі спінером замість даних**
→ `data-page-ready` виставляється статично при маунті. Перемігруйте сторінку на `usePageReady` (див. `docs/refactoring-ongoing.md` §3).

**Таби пропускаються (⚠️ не видимий)**
→ Нормально для не-дефолтних табів. Перший таб знімається автоматично.
