# Генерація Katalon-скриптів

> Цей файл є частиною workflow документування. Читати разом з `_prompts/doc-gen/AI_TASK.md` та `_prompts/doc-gen/PROJECT.md`.

Для **кожного** запланованого скріншота — створити файл `user-docs/katalon/[id].side`.

Робити під час аналізу коду: CSS-селектори видно у JSX, `onClick` обробниках, умовних рендерах — пізніше цього контексту не буде.

**Що витягати з коду:**

| Що потрібно | Де шукати в коді |
| :--- | :--- |
| Головний контейнер сторінки | кореневий `<div>` компонента або `data-testid` |
| Кнопка відкриття модалки | `onClick` → `setOpen(true)` або аналог |
| Контейнер модалки | `[role="dialog"]` або з `PROJECT.md` |
| Кнопка вкладки | `<Tab>` або `[role="tab"]` |
| Контент вкладки | `[role="tabpanel"]` або з `PROJECT.md` |

Якщо точний селектор невідомий — використовувати семантичні з `PROJECT.md` (розділ "Katalon — CSS-селектори рівня проєкту").

**Шаблони команд по типах:**

`page_*_main` / `page_*_empty`:
```
open                    → /[url]
waitForElementPresent   → css=[main-container]   | 10000
captureEntirePageScreenshot → [output-path]
```

`page_*_mobile`:
```
setWindowSize           → 375x812
open                    → /[url]
waitForElementPresent   → css=[main-container]   | 10000
captureEntirePageScreenshot → [output-path]
setWindowSize           → 1920x1080
```

`tab_*`:
```
open                    → /[url]
waitForElementPresent   → css=[role="tablist"]   | 10000
click                   → css=[tab-button]
waitForElementPresent   → css=[role="tabpanel"]:not([hidden]) | 5000
captureEntirePageScreenshot → [output-path]
```

`modal_*`:
```
open                    → /[url]
waitForElementPresent   → css=[page-content]     | 10000
click                   → css=[trigger-button]
waitForElementPresent   → css=[role="dialog"]    | 5000
captureEntirePageScreenshot → [output-path]
```

**Шляхи збереження (output-path):**

| Тип | Шлях |
| :--- | :--- |
| `page_*` (не mobile) | `screenshots/pages/[id].png` |
| `page_*_mobile` | `screenshots/mobile/[id].png` |
| `tab_*` | `screenshots/tabs/[id].png` |
| `modal_*` | `screenshots/modals/[id].png` |
| `sec_*` | `screenshots/sections/[id].png` |

**Повний формат `.side` файлу:**

```json
{
  "id": "[id]",
  "version": "2.0",
  "name": "[id]",
  "url": "[base_url з PROJECT.md]",
  "tests": [{
    "id": "[id]-test",
    "name": "capture",
    "commands": [
      { "id": "1", "command": "open", "target": "/[url]", "value": "" },
      { "id": "2", "command": "waitForElementPresent", "target": "css=[selector]", "value": "10000" },
      { "id": "3", "command": "captureEntirePageScreenshot", "target": "[output-path]", "value": "" }
    ]
  }],
  "suites": [{
    "id": "[id]-suite",
    "name": "default",
    "persistSession": false,
    "parallel": false,
    "timeout": 300,
    "tests": ["[id]-test"]
  }],
  "urls": [],
  "plugins": []
}
```

**Після створення `.side` файлу** — додати рядок в індекс `_meta/RECORDER.md`:

```
| `[id]` | `katalon/[id].side` | [нотатка або —] |
```

Нотатка потрібна лише якщо є умова що не автоматизується (наприклад: "⚠️ потребує порожньої БД").
