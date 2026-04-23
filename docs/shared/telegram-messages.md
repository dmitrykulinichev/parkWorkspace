# Реєстр Telegram-повідомлень (Telegram Messages Registry)

## 👤 Користувацькі (User-facing)
| Слаг (Slug) | Тригер | Ціль | Текст / Суть |
| :--- | :--- | :--- | :--- |
| `tg_driver_connected` | Підключення за токеном | Водій | "Вітаємо! Ваш акаунт успішно прив'язано." |
| `tg_mileage_success` | Відправка пробігу | Водій | "Дякуємо! Пробіг [км] зафіксовано." |
| `tg_issue_received` | Створення скарги | Водій | "Ваше звернення прийнято. Номер: [ID]." |
| `tg_daily_summary` | Cron (вечір) | Власник | "Підсумок за сьогодні: Вал [сума], Прибуток [сума]." |
| `tg_validation_error` | Помилка вводу | Водій | "Помилка: введений пробіг менший за попередній." |

## 🛠 Системні (Technical/Support)
| Слаг (Slug) | Сервіс | Канал | Призначення |
| :--- | :--- | :--- | :--- |
| `tg_sys_debug_card` | `TelegramDebugLogger` | Support Channel | Картка з деталями вхідного повідомлення. |
| `tg_sys_critical_error` | `sendCriticalErrorReport` | Error Channel | Стек-трейс та дані про виняток у коді. |
| `tg_sys_new_park` | `ParkRegistration` | Admin Channel | Сповіщення про реєстрацію нового клієнта. |
