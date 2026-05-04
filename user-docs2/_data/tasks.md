# Задачі
> `page:tasks` · `/tasks`

Ваш список задач: тут ви можете створювати нові задачі, призначати відповідальних, прив'язувати їх до автомобілів та відстежувати статус виконання.

## Розділи

| i-doc | Опис |
|---|---|
| `sec:task-list` | Ваш список задач: переглядайте поточні справи, відстежуйте їх статус та пріорите |

## Модальні вікна

| i-doc | Файл |
|---|---|
| `modal:task-filters` | [modal_task_filters.md](modals/modal_task_filters.md) |
| `modal:task-form` | [modal_task_form.md](modals/modal_task_form.md) |
| `modal:task-details` | [modal_task_details.md](modals/modal_task_details.md) |
| `modal:task-delete-confirm` | [modal_task_delete_confirm.md](modals/modal_task_delete_confirm.md) |
| `modal:task-complete-confirm` | [modal_task_complete_confirm.md](modals/modal_task_complete_confirm.md) |

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `page_tasks_main` | `[data-i-doc="page:tasks"]` | `/tasks` |

## Функціональний опис

```js
/**
 * @doc-page page_task_list
 * @doc-title Задачи
 * @doc-modals
 *   - modal_task_filters (Фільтри задач)
 *   - modal_task_form (Форма створення/редагування)
 *   - modal_task_delete_confirm (Підтвердження видалення)
 *   - modal_task_details (Деталі задачі)
 *   - modal_task_complete_confirm (Підтвердження завершення)
 * @doc-features
 *   - CRUD: створення, редагування, видалення
 *   - Фільтрація за параметрами
 *   - Пошук по назві/тексту
 *   - Пагінація зі змінною кількістю записів на сторінку
 *   - Зміна статусу задачі
 *   - Завершення задачі з коментарем
 *   - Адаптивна верстка (мобільна та десктопна версії)
 *   - Синхронізація фільтрів з URL та localStorage
 * @doc-api
 *   - GET /api/v1/tasks/options
 *   - GET /api/v1/tasks
 *   - POST /api/v1/tasks
 *   - PATCH /api/v1/tasks/{id}
 *   - DELETE /api/v1/tasks/{id}
 * @doc-entities
 *   - Task
 * @doc-notes
 *   - Сторінка синхронізує фільтри з URL та localStorage для збереження стану між сеансами
 *   - Мобільна та десктопна версії списку керуються рендеренням в renderTaskList()
 *   - Пошук виконується в реальному часі (debounced через useUrlFilters)
 */
```
