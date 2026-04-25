# Sync Screenshots — Задача

> Копіює скріншоти з user-docs до папки лендінгу.
> Md-файли лендінгу не чіпати — сайт показує placeholder автоматично якщо файлу немає.

---

## Правила визначення папки-джерела

| Префікс ID              | Папка-джерело                                             |
| :---------------------- | :-------------------------------------------------------- |
| `page_` (без `_mobile`) | `workspace/user-docs/screenshots/desktop/pages/`          |
| `page_*_mobile`         | `workspace/user-docs/screenshots/mobile/pages/`           |
| `tab_` (без `_mobile`)  | `workspace/user-docs/screenshots/desktop/tabs/`           |
| `tab_*_mobile`          | `workspace/user-docs/screenshots/mobile/tabs/`            |
| `modal_` (без `_mobile`)| `workspace/user-docs/screenshots/desktop/modals/`         |
| `modal_*_mobile`        | `workspace/user-docs/screenshots/mobile/modals/`          |
| `sec_` (без `_mobile`)  | `workspace/user-docs/screenshots/desktop/sections/`       |
| `sec_*_mobile`          | `workspace/user-docs/screenshots/mobile/sections/`        |
| **інший префікс**       | перевірити по черзі всі папки з таблиці вище, взяти перший збіг |

Копіювати лише світлу тему (без `_dark`). Цільова папка: `landing/www/assets/img/docs/`.
Якщо файл вже є в цільовій папці — не перезаписувати.

---

## Алгоритм

### Крок 1 — Зібрати список ID з базової документації

1. Прочитати **Файл документації** → знайти всі `{{SCRN:id}}` → ID для основної сторінки
2. Прочитати `C:\Repository\park\landing\www\content\docs\menu.json`
3. Знайти запис зі slug = **Slug лендінгу** → взяти масив `tabs[]`
4. Для кожного tab slug знайти відповідний файл базової документації:
   - Та сама папка + той самий числовий префікс + суфікс після `--` у tab slug
   - Приклад: `data/02-vehicles/01-list.md` + tab `vehicles-list--history` → `data/02-vehicles/01-list--history.md`
5. Прочитати кожен файл табу → додати `{{SCRN:id}}` до списку

### Крок 2 — Скопіювати файли

Для кожного ID:
1. Визначити папку-джерело за таблицею вище
2. Перевірити наявність `[папка-джерело]/[id].png`
3. Якщо існує і ще немає в `landing/www/assets/img/docs/[id].png` → скопіювати

### Крок 3 — Звіт

| ID | Папка-джерело | Файл знайдено | Дія |
| :- | :------------ | :------------ | :-- |
| …  | …             | так / ні      | скопійовано / вже є / відсутній |

Підсумок: скопійовано N, вже було N, досі відсутні: [список ID].
