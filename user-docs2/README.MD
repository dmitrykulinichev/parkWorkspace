1. Нова сторінка або модалка
- Розставити data-i-doc мітки → PROMPT з i-doc-tagging-task.md
- Зареєструвати в registry.ts, mapping.ts, hints.ts

2. Наповнення JSDoc-блоку
- Запустити PROMPT-doc-features.md для компонента
- AI додає @doc-features, @doc-api, @doc-entities, @doc-notes
- Людина окремо пише @doc-human якщо потрібен маркетинговий вступ

3. Генерація каталогу
   node workspace/user-docs2/_scripts/catalog-generator/index.js
   Оновлює data/**/*.md, catalog.json, nav.json, screenshots.json

4. Скріншоти (за потреби)
   node workspace/user-docs2/_scripts/screenshot-runner/index.js

5. Публікація (за потреби)
- Запустити PROMPT-doc-publish.md для потрібного файлу з data/
- AI пише чистий маркетинговий текст у publish/

  ---
Коли щось змінилось у коді — повторити кроки 2→3, публікацію перегенерувати якщо торкнулися функціоналу.

data/ не редагується вручну ніколи. Всі зміни — тільки через JSX-файли або hints.