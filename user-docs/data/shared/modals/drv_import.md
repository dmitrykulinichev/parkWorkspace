# Модальне вікно: Імпорт водіїв

{{SCRN:modal_drv_import_form}}

> Вікно пакетного імпорту водіїв з файлу Excel або CSV. Відкривається кнопкою "Імпорт" у хедері сторінки `/drivers`.

## Поля форми

| Поле | Тип | Обов'язкове | Опис / Технічні деталі |
| :--- | :--- | :---: | :--- |
| **Файл** | file (.xlsx, .csv) | Так | Завантажуваний файл з даними водіїв |

## Логіка та валідація

- **Режими вікна:** Два таби — "Імпорт" (завантаження нового файлу) та "Історія" (перегляд попередніх імпортів).
- **Процес:** 1) Завантаження файлу → `POST /drivers/import/validate` (попередній перегляд). 2) Підтвердження → `POST /drivers/import/execute`.
- **Статуси імпорту:** `completed` (успішно), `failed` (помилка), `partial` (частково), `processing` (в обробці), `pending` (очікує).
- **Завантаження шаблону:** Кнопки завантаження шаблону у форматі XLSX або CSV через `GET /drivers/import/template?format=xlsx|csv`.
- **Після збереження:** Повторний запит списку водіїв (перехід на сторінку 1).

## Технічна інформація

> Цей розділ призначений для розробників.

| Файл | Роль |
| :--- | :--- |
| `resources/js/components/modals/DriverImportModal.jsx` | Компонент імпорту |
| `resources/js/components/modals/ImportBatchDetailsModal.jsx` | Деталі конкретного батчу імпорту |
| `resources/js/services/driverService.js` → `validateImport`, `executeImport`, `getImportHistory` | API-методи |
