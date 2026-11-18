# Бот відповідав «не вдалося вас розпізнати» на службові повідомлення Telegram

**Мета:** «Дмитрий joined the group via invite link» (повідомлення від самого Telegram) не має викликати відповідь бота.

- [x] Корінь: службові повідомлення (new_chat_members, left_chat_member, pinned_message…) ішли до GroupMessageHandler →
      водія не знайдено → `replyDriverNotFoundInGroup`
- [x] `App\Services\Bot\TelegramServiceMessage::is()` + перевірка у `MessageHandlerFactory::create` (до вибору обробника)
- [x] Тест `TelegramGroupUnknownDriverTest::test_telegram_service_messages_get_no_reply` (старий код — ⨯, новий — ✓); усі 423 ✓
- [ ] Деплой (користувач): `app/Services/Bot/TelegramServiceMessage.php`, `app/Services/Bot/MessageHandlerFactory.php`

**Коміт:** app: Бот не відповідає на службові повідомлення Telegram («приєднався до групи» тощо).
