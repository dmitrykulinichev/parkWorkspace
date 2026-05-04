# PROJECT — специфіка проєкту

## Загальне
- **Продукт:** Garage24 — SaaS для управління автопарком
- **Мова документації:** Українська
- **Корінь фронтенду:** `C:\Repository\park\app\park-react-spa`
- **Корінь документації:** `C:\Repository\park\workspace\user-docs2`

## i-doc джерела
| Файл | Призначення |
|---|---|
| `resources/js/common/i-doc/i-doc.registry.ts` | Всі ID елементів |
| `resources/js/common/i-doc/i-doc.mapping.ts` | URL → page ID |
| `resources/js/common/i-doc/i-doc.hints.ts` | Описи елементів (дороговказ) |
| `workspace/user-docs2/_meta/CATALOG.md` | Каталог: структура, файли, скріншоти |

## Стек
- React (JSX) + кастомні хуки + React Query
- Модалки: `Modal.jsx`, `TabsModal.jsx`, `Dialog` (MUI)
- Таби: `TabBar.jsx`
- Роутинг: React Router (Inertia)

## Атрибути в DOM
| Атрибут | Де ставиться |
|---|---|
| `data-i-doc="page:tasks"` | Кореневий div сторінки |
| `data-i-doc="tab:reports-operational"` | Кореневий div вмісту таба |
| `data-i-doc="sec:task-list"` | Кореневий div секції |
| `data-i-doc="modal:task-form"` | Передається як проп кастомній модалці |
| `data-page-ready="true"` | Кореневий div сторінки (разом з data-i-doc) |

## Katalon / Puppeteer селектори
| Тип | CSS-селектор |
|---|---|
| Сторінка | `[data-i-doc="page:tasks"]` |
| Таб | `[data-i-doc="tab:reports-operational"]` |
| Секція | `[data-i-doc="sec:task-list"]` |
| Модалка | `[data-i-doc="modal:task-form"]` |
| Будь-яка відкрита модалка | `[data-modal-ready="true"]` |

## Права доступу
Більшість сторінок вимагають авторизацію. Для документування потрібен обліковий запис з роллю `Owner` або `Admin`.
