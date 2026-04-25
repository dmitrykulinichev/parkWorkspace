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

> **Для `page_*_empty`:** не намагатись програмно відтворити порожній стан (не чекати на текст, не видаляти дані). Скрипт ідентичний `page_*_main` — просто відкрити сторінку і зробити скріншот. Порожній стан забезпечує користувач вручну перед запуском.
```
open                    → /[url]
waitForElementPresent   → css=[data-page-ready="true"]   | 10000
captureEntirePageScreenshot → [output-path]
```

`tab_*`:
```
open                    → /[url]
waitForElementPresent   → css=[data-page-ready="true"]   | 10000
click                   → css=[tab-button]
waitForElementPresent   → css=[role="tabpanel"]:not([hidden]) | 5000
captureEntirePageScreenshot → [output-path]
```

`modal_*`:
```
open                    → /[url]
waitForElementPresent   → css=[data-page-ready="true"]   | 10000
click                   → css=[trigger-button]
waitForElementPresent   → css=[role="dialog"]    | 5000
captureEntirePageScreenshot → [output-path]
```

**Шляхи збереження (output-path):**

| Тип | Шлях |
| :--- | :--- |
| `page_*` | `screenshots/pages/[id].png` |
| `tab_*` | `screenshots/tabs/[id].png` |
| `modal_*` | `screenshots/modals/[id].png` |
| `sec_*` | `screenshots/sections/[id].png` |

**Повний формат `.side` файлу:**

> **Важливо — екранування лапок у `target`:** значення `target` — це рядок всередині JSON. Якщо CSS-селектор містить лапки (наприклад `[data-page-ready="true"]`), їх **обов'язково екранувати** як `\"`. Приклад: `"target": "css=[data-page-ready=\"true\"]"`. Неекрановані лапки ламають JSON.

```json
{
  "id": "[id]",
  "version": "2.0",
  "name": "[id]",
  "url": "",
  "tests": [{
    "id": "[id]-test",
    "name": "capture",
    "commands": [
      { "id": "1", "command": "open", "target": "/[url]", "value": "" },
      { "id": "2", "command": "waitForElementPresent", "target": "css=[data-page-ready=\"true\"]", "value": "10000" },
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
