## page_vehicle_earnings_main

- **URL:** `/vehicle-earnings`

## page_vehicle_earnings_mobile

- **URL:** `/vehicle-earnings`
- **Коментар:** ширина viewport < 768px.

## modal_vehicle_earnings_details

- **URL:** `/vehicle-earnings`
- **Кроки:**
  1. Натиснути на будь-який рядок у таблиці "Заробіток автомобілів".
- **Тригер:** `onRowClick` (рядок таблиці)

## modal_vehicle_earnings_calc_info

- **URL:** `/vehicle-earnings`
- **Кроки:**
  1. Натиснути кнопку з іконкою інформації в хедері `DateRangeFilter`.
- **Тригер:** `onInfoClick`

## page_park_stats_main

- **URL:** `/park-statistics`
- **Кроки:**
  1. Відкрити сторінку статистики парку.

## page_park_stats_mobile

- **URL:** `/park-statistics`
- **Viewport:** < 768px
- **Кроки:**
  1. Відкрити сторінку статистики парку на мобільному пристрої.

## page_park_users_main

- **URL:** `/park-users`
- **Кроки:**
  1. Відкрити сторінку "Команда".

## page_park_users_mobile

- **URL:** `/park-users`
- **Viewport:** < 768px

## modal_park_user_form

- **URL:** `/park-users`
- **Кроки:**
  1. Натиснути кнопку "Додати користувача" (хедер).
- **Тригер:** `handleCreateClick`

## modal_park_user_filters

- **URL:** `/park-users`
- **Кроки:**
  1. Натиснути кнопку фільтрів у хедері.
- **Тригер:** `handleFiltersClick`

## modal_park_user_permissions

- **URL:** `/park-users`
- **Кроки:**
  1. Натиснути на іконку щита (Shield) у рядку користувача з роллю Admin.
- **Тригер:** `onPermissions`

## modal_park_user_delete

- **URL:** `/park-users`
- **Кроки:**
  1. Натиснути кнопку з іконкою кошика у рядку користувача.
- **Тригер:** `onDelete`

## modal_park_user_reset_password

- **URL:** `/park-users`
- **Кроки:**
  1. Натиснути кнопку з іконкою LockReset у рядку користувача.
- **Тригер:** `onResetPassword`

## modal_park_user_activation

- **URL:** `/park-users`
- **Кроки:**
  1. Створити нового користувача.
  2. Модалка відкриється автоматично після успішного створення.
- **Тригер:** `activationLinkModal.isOpen`

## page_park_files_main

- **URL:** `/park-files`
- **Кроки:**
  1. Відкрити сторінку "Файли парку".

## page_park_files_empty

- **URL:** `/park-files`
- **Умова:** відсутність документів.

## modal_park_file_form

- **URL:** `/park-files`
- **Кроки:**
  1. Натиснути "Додати документ".
- **Тригер:** `handleCreateClick`

## modal_park_file_filters

- **URL:** `/park-files`
- **Кроки:**
  1. Натиснути кнопку фільтрів.
- **Тригер:** `handleFiltersClick`

## modal_park_file_delete

- **URL:** `/park-files`
- **Кроки:**
  1. Натиснути іконку кошика у рядку документа.
- **Тригер:** `onDelete`

## page_park_billing_main

- **URL:** `/billing`
- **Кроки:**
  1. Відкрити сторінку "Білінг та Тарифи" через навігаційне меню.

## page_park_billing_empty

- **URL:** `/billing`
- **Кроки:**
  1. Відкрити сторінку білінгу для нового парку, де ще немає сформованих періодів.

## page_park_billing_mobile

- **URL:** `/billing`
- **Кроки:**
  1. Відкрити сторінку "Білінг та Тарифи" при ширині вікна < 768px.

## page_park_landing_main

- **URL:** `/landing-settings`
- **Кроки:**
  1. Відкрити розділ "Налаштування Лендінгу".

## tab_park_landing_general

- **URL:** `/landing-settings`
- **Вкладка:** Загальні налаштування (активна за замовчуванням).

## tab_park_landing_news

- **URL:** `/landing-settings`
- **Вкладка:** Новини та акції.

## modal_landing_news_form

- **URL:** `/landing-settings`
- **Кроки:**
  1. Натиснути кнопку "Додати новину" або іконку редагування у рядку новини.
- **Тригер:** `handleCreateClick` / `handleEditClick`

## modal_landing_news_delete

- **URL:** `/landing-settings`
- **Кроки:**
  1. Натиснути іконку кошика у рядку новини.
- **Тригер:** `onDelete`

## page_park_materials_main

- **URL:** `/resources`
- **Кроки:**
  1. Відкрити сторінку "Матеріали для друку".
