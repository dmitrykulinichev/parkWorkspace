# Project Configuration

> Цей файл містить налаштування, специфічні для конкретного проєкту.
> `AI_TASK.md` і `STYLE_GUIDE.md` є універсальними — при переносі на новий проєкт змінювати лише цей файл.

---

## ⚠️ Змінювати для кожного нового проєкту

### Мова документації

Українська.
### Папка проєкту

C:\Repository\park\app\park-react-spa

### Коди модулів (для іменування скріншотів)

| Код | Що охоплює |
| :--- | :--- |
| `dash` | Dashboard / Головна |
| `fleet` | Автомобілі / Автопарк |
| `maint` | ТО та ремонти |
| `docs` | Документи |
| `rep` | Звіти |
| `ops` | Операційна діяльність (призначення тощо) |
| `drv` | Водії |
| `fin` | Фінанси |
| `park` | Управління парком |
| `intg` | Інтеграції |
| `sett` | Налаштування |

### Katalon — CSS-селектори рівня проєкту

| Що | CSS-селектор | Примітка |
| :--- | :--- | :--- |
| Сторінка завантажена (універсальний wait) | `[data-page-ready="true"]` | Атрибут на `NewPageHeader` — є на всіх сторінках |
| Контейнер модального вікна | `[data-modal-ready="true"]` | Атрибут на кореневому елементі Modal / TabsModal / FiltersModal |
| Список вкладок | `[role="tablist"]` | Спільний для всіх tabbed-сторінок |
| Активна панель вкладки | `[role="tabpanel"]:not([hidden])` | |

> Якщо в проєкті інші селектори — замінити тут. AI читає ці значення під час Фази 2.

### Doc-мітки в коді (ідентифікатори для документації)

Компоненти-сторінки і модалки містять мітки для автоматичної ідентифікації при генерації документації.

**JSDoc-блок перед компонентом сторінки:**
```js
/**
 * @doc-page page_maint_list
 * @doc-title Технічне обслуговування
 * @doc-screenshots page_maint_list_main, page_maint_list_empty
 */
```

**Атрибут `data-doc-id` в JSX:**
```jsx
<div data-page-ready="true" data-doc-id="page_maint_list">   // сторінка
<div data-modal-ready="true" data-doc-id="modal_maint_details"> // модалка
```

При аналізі коду — шукати ці мітки в першу чергу. Вони мають пріоритет над самостійно виведеними ID.

### Специфічні конвенції проєкту

- Модальні вікна — окремі компоненти в `resources/js/components/modals/`
- Фінансові транзакції створюються автоматично при збереженні деяких форм (ТО, витрати)
- Статуси авто змінюються системно при взаємодії з модулями ТО та Графіку

---

## Змінювати лише якщо стек відрізняється від React + Laravel

### Технологічний стек

| Шар | Технологія |
| :--- | :--- |
| UI-компоненти | React (JSX) |
| Логіка / стан сторінки | Custom hooks (`use*.js`) |
| Серверний стан / кеш | React Query (`useQuery`, `useMutation`) |
| API-клієнт | Service-файли (`*Service.js`) |
| Роутинг | React Router (Laravel Inertia) |
| Форми | react-hook-form |

### Структура вихідного коду

| Що шукати | Де знаходиться |
| :--- | :--- |
| **Маршрути (URL → компонент)** | `routes/web.php` |
| Сторінки (page components) | `resources/js/pages/` |
| Компоненти | `resources/js/components/` |
| Хуки логіки сторінки | `resources/js/hooks/` |
| React Query запити | `resources/js/queries/` |
| API-сервіси | `resources/js/services/` |
| Константи та enum-и | `resources/js/constants/` або `resources/js/enums/` |

### Frontmatter полів файлу сторінки

```
---
route: "/url-path"          ← URL-маршрут сторінки
permission: "module.action" ← рядок дозволу (permission string)
components:                 ← список ключових файлів сторінки
  - "resources/js/pages/..."
---
```
