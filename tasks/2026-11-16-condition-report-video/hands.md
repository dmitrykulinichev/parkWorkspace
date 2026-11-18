# Руки

### 2026-11-16 · бекенд
- Тести: 421 ✓ (`hands/backend-tests-2.log`); міграція локально ✓; vite build ✓ (`hands/vite-build-1.log`).

### 2026-11-16 · реліз 2.0.32 (220)
- Android: release-android.mjs (internal) запущено у фоні, лог `hands/release-android-220.log` (на момент ліміту — «Edit відкрито», заливка йшла). Далі: перевірити лог → `node scripts/publish-android.mjs --confirm`.
- iOS: ще не запускали → `node scripts/release-ios.mjs`, потім `node scripts/publish-ios.mjs --submit`.
- Android 2.0.32 (220): AAB зібрано, але заливка в Google Play впала — fetch failed, ETIMEDOUT (release-android-220.log). Далі: `node scripts/release-android.mjs --skip-build`, потім publish-android.mjs --confirm.
- Android internal ✓ з другої спроби (release-android-220b.log). Passat повернуто Ткаченку (прийнято, 31 740).
- Android 2.0.32 (220) → PRODUCTION ✓ (publish-android-220.log), записано в суперпарк.
- iOS 2.0.32 (220): TestFlight ✓, відправлено на рев'ю Apple ✓ (publish-ios-220.log), записано в суперпарк. Перед збіркою — виправлено iOS-стискання (ключ PixelFormatType, звук 44,1 кГц стерео), перевірено на симуляторі.
