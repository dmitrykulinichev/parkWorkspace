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
