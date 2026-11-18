# Посібник водія в застосунку

**Мета:** водій відкриває посібник (driver.g24.com.ua) просто із застосунку: меню ☰ і «?» у складних місцях; вбудований браузер (Custom Tabs / SFSafariViewController), мовою застосунку.

## Кроки

- [x] Погоджено 17.11 («роби»): вбудований браузер; меню ☰ + «?» у фотозвіті, прийомі/здачі, «руці»
- [x] Платформа: `platform/InAppBrowser` (Android Custom Tabs `androidx.browser` 1.8.0, iOS SFSafariViewController)
- [x] `ui/guide/DriverGuide.kt`: статті (slug з `landing/www/content/driver/menu.json`), мова — рядок `driver_guide_lang`; меню ☰ «Посібник водія» (над «Вийти», обидва режими); «?» (`GuideHelpButton`) у `VehicleMileageSheet` (прийом/здача → /shift), `AddManualTripSheet` (→ /records), `AddConditionReportSheet` (→ /condition-report). Адреси на сайті — 200
- [x] Тести 32 ✓ (`DriverGuideUrlTest`), Android/iOS компілюються
- [x] 2.0.34 (224): Android production ✓
- [x] iOS: 2.0.33 знято з рев'ю, 2.0.34 відправлено на рев'ю Apple (містить усе з 2.0.33). Apple не приймає «☰» у «Що нового» — у ченджлозі «головне меню»
- [ ] Наживо на емуляторі не дивився — емулятор займає інша сесія
