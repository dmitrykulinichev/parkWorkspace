# Sync Screenshots — Задача

> Копіює скріншоти з user-docs до папки лендінгу.
> Md-файли лендінгу не чіпати — сайт показує placeholder автоматично якщо файлу немає.

---

## Структура папок-джерел

Скріншоти зберігаються за схемою:
`user-docs/screenshots/light/[platform]/[subfolder]/[id].png`

| Префікс ID | Підпапка |
| :--------- | :------- |
| `page_`    | `pages/` |
| `tab_`     | `tabs/`  |
| `modal_`   | `modals/`|
| `sec_`     | `sections/`|

Платформи: `desktop` та `mobile`.

Цільові папки лендінгу:
- Desktop → `landing/www/assets/img/docs/desktop/[id].png`
- Mobile  → `landing/www/assets/img/docs/mobile/[id].png`

Завжди перезаписувати — файл міг оновитись.

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

Для кожного ID визначити підпапку за таблицею вище, потім:

1. **Desktop:** `screenshots/light/desktop/[subfolder]/[id].png` → `assets/img/docs/desktop/[id].png`
2. **Mobile:** `screenshots/light/mobile/[subfolder]/[id].png` → `assets/img/docs/mobile/[id].png`

Кожен варіант копіювати незалежно — якщо файлу немає, просто пропустити цей варіант.

### Крок 3 — Звіт

| ID | Desktop | Mobile | Дія |
| :- | :------ | :----- | :-- |
| …  | так / ні | так / ні | скопійовано / відсутній |

Підсумок: скопійовано N desktop, N mobile, відсутні: [список ID].
