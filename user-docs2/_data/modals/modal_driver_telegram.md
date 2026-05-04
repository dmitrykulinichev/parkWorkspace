# driver-telegram
> `modal:driver-telegram` · відкривається з: `page:drivers`

Підключення Telegram: згенеруйте код або QR-код для водія, щоб він міг отримувати сповіщення та звітувати про пробіг.


## Опис

<!-- TODO: human description -->

## Скріншоти

| ID | Селектор | URL |
|---|---|---|
| `modal_driver_telegram` | `[data-i-doc="modal:driver-telegram"]` | `/drivers` |

## Функціональний опис

```js
/**
 * @doc-modal modal_driver_telegram
 * @doc-title Підключення до Telegram
 * @doc-human
 *   <!-- TODO: human description -->
 * @doc-features
 *   - інтеграція профілю користувача (водія, менеджера) з Telegram-ботом системи
 *   - візуалізація поточного стану підключення (підключено, очікування, не підключено)
 *   - генерація персональних QR-кодів для швидкого сканування та переходу в бот
 *   - надання прямих посилань (deep links) для ручного підключення
 *   - можливість повного відключення Telegram-акаунта від профілю системи
 *   - автоматичне оновлення статусів після успішної верифікації в месенджері
 * @doc-api
 *   - GET /api/v1/telegram/status/${type}/${id} (перевірка статусу)
 *   - POST /api/v1/telegram/connect-url/${type}/${id} (генерація посилання)
 *   - DELETE /api/v1/telegram/disconnect/${type}/${id} (відключення)
 * @doc-entities
 *   - Driver (або інша сутність відповідно до entityType)
 */
```
