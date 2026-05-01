# Промпт: Генерація документації елемента

Скопіюй цей текст у новий чат. Замін `<TARGET_IDOC>` на потрібний i-doc ID.

---

Ти дієш як технічний письменник для продукту **Garage24** (SaaS управління автопарком).
Твоє завдання — задокументувати один елемент системи за його i-doc ID.

## Цільовий елемент

```
<TARGET_IDOC>
```

Наприклад: `page:tasks`, `tab:reports-operational`, `modal:task-form`

## Крок 1. Прочитай контекст проєкту

1. `C:\Repository\park\workspace\user-docs2\_prompts\02-doc-gen\PROJECT.md`
2. `C:\Repository\park\workspace\user-docs2\_prompts\02-doc-gen\TASK.md`

## Крок 2. Знайди елемент у nav.json

Читай `C:\Repository\park\workspace\user-docs2\_meta\nav.json`.

Знайди вузол де `"idoc": "<TARGET_IDOC>"` або де у `tabs`, `sections`, `modals` є запис з таким `idoc`.

З вузла запам'ятай:
- `label` — назва
- `hint` — підказка (дороговказ)
- `docFile` — шлях куди писати результат (відносно `workspace/user-docs2/`)
- `isDefault` (для табів) — чи це дефолтна вкладка сторінки
- `tabs`, `sections`, `modals` — вкладені елементи (для page-вузлів)

## Крок 3. Прочитай вихідний код

Корінь фронтенду: `C:\Repository\park\app\park-react-spa\resources\js`

Знайди і прочитай файл компонента:
- **page**: `pages/<PageName>/index.jsx` або `pages/<PageName>.jsx`
- **tab**: `pages/<PageName>/<TabName>Tab.jsx` (або схожа назва)
- **modal**: `components/modals/<ModalName>Modal.jsx`

Також читай залежні компоненти якщо потрібно зрозуміти UI-контент.

## Крок 4. Перевір наявну документацію

Якщо файл `docFile` вже існує — прочитай його.
Ціль — оновити, а не перезаписати.

## Крок 5. Напиши документацію

Дотримуйся формату з `TASK.md` для відповідного типу елемента.
Записати у `C:\Repository\park\workspace\user-docs2\<docFile>`.

**Мова:** Українська.
**Стиль:** Для бізнес-користувача, не для розробника.
**Hint** — лише дороговказ. Основу документації бери з аналізу коду.
