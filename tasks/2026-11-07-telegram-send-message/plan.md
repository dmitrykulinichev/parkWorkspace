# Довільне повідомлення в групу парку з кабінету

**Мета:** у кабінеті парку (Налаштування → Інтеграції → Telegram) персонал може написати й надіслати довільне
повідомлення від бота парку в одну з груп парку.

## Як є (07.11.2026)

- Групи парку — у `parks.telegram_settings.groups[]` (`id`, `name`, `is_active`, `features`); старий формат
  (`channel_id`) — `TelegramConfigService::getGroups()` віддає й його.
- Надсилання — `App\Services\Bot\TelegramApiService::sendMessage($text, $chatId)` (бот поточного парку).
- Кабінет: `resources/js/components/Settings/TelegramIntegrationSettings.jsx` (807 рядків), API
  `routes/api/system.php` → `settings/integrations/telegram*` (`auth:sanctum` + `staff`).

## Схема (на погодження)

- **Бекенд:** `POST /settings/integrations/telegram/message` `{ group_id, text }`
  → новий сервіс `App\Services\Bot\TelegramGroupMessageService::send(Park, groupId, text, User)`:
  - група має бути серед груп **цього парку** (`getGroups()`), довільний chat_id не приймаємо;
  - текст 1–4096 символів, звичайний текст (без HTML-розмітки — нічого не зламається від `<` чи `&`);
  - надсилає ботом парку; інтеграція вимкнена чи бот не в групі — зрозуміла помилка;
  - запис у журнал дій (хто, в яку групу, текст).
- **Кабінет:** окремий компонент `TelegramGroupMessage.jsx` у вкладці Telegram: вибір групи (лише збережені),
  поле тексту з лічильником, «Надіслати» з підтвердженням, результат.
- **Тести:** надсилає у свою групу; чужий chat_id — 422; порожній текст — 422; запис у журналі.
- **Перевірка наживо:** лише група «Київ».

## Кроки

- [x] Погодити схему (07.11): неактивні групи — показувати з позначкою; надсилає весь персонал
- [x] Бекенд: сервіс, контролер, маршрут, тести (5 ✓)
- [x] Кабінет: окрема сторінка `/telegram-message` у групі меню «Інтеграція Telegram» (pages/TelegramGroupMessage + форма Settings/TelegramGroupMessage.jsx), переклади, збірка
- [x] Журнал надісланих: таблиця `telegram_group_messages` (міграція 2026_11_07_120000), `GET /settings/integrations/telegram/messages`, список на сторінці; тести 7 ✓, усі 400 ✓
- [x] Перевірити наживо в «Київ» після заливки (+ міграція через /debug) — користувач підтвердив 10.11

**Статус: завершено 10.11.2026.**

## Відкриті питання

- Немає.
