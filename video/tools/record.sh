#!/bin/sh
# Записати ролик: ./tools/record.sh 02-pochatok-zminy   (README.md)
# 1) сценарій; 2) запис екрана + кроки (run.mjs: тапи за текстом, видимі дотики); 3) факт зйомки
# (out/timing.md, out/subtitles.srt), озвучка (voice.mjs → out/video-voice.mp4)
# і ролик, обрізаний від мітки START до END (out/video.mp4). Сирий запис дубля — raw/take-N.mp4.
set -e
ROLL="${1:?тека ролика}"
HERE="$(cd "$(dirname "$0")" && pwd)"
DIR="$HERE/../$ROLL"
ADB="${ADB:-$HOME/Library/Android/sdk/platform-tools/adb}"

node "$HERE/build.mjs" "$DIR" plan
mkdir -p "$DIR/raw" "$DIR/out"
TAKE="take-$(ls "$DIR/raw" 2>/dev/null | grep -c '^take-.*\.mp4$' | awk '{print $1+1}')"

# Кадр без сторонніх речей: порожній буфер обміну (підказка клавіатури), demo-статусбар.
"$ADB" shell cmd clipboard set-text "" >/dev/null 2>&1 || true
"$ADB" shell am broadcast -a com.android.systemui.demo -e command enter >/dev/null
"$ADB" shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 1200 >/dev/null
# Дотики — кружечком у кадрі (системне "Показувати дотики"); вимикаємо після запису.
"$ADB" shell settings put system show_touches 1
trap '"$ADB" shell settings put system show_touches 0' EXIT

"$ADB" shell rm -f /sdcard/video-take.mp4
# Час старту запису — з годинника емулятора (той самий, що в Мака, ±0,1 с): перший рядок — мс.
"$ADB" shell 'date +%s%N; exec screenrecord --bit-rate 8000000 /sdcard/video-take.mp4' > "$DIR/raw/.rec-start" &
REC=$!
sleep 1
REC_START=$(head -1 "$DIR/raw/.rec-start" | cut -c1-13)
RUN="$DIR/raw/$TAKE.run.json"
node "$HERE/run.mjs" "$DIR" "$RUN" || { echo "Дубль зупинився — дивись $RUN"; kill -INT $REC; exit 1; }
sleep 1
kill -INT $REC; wait $REC 2>/dev/null || true
sleep 2
"$ADB" pull /sdcard/video-take.mp4 "$DIR/raw/$TAKE.mp4" >/dev/null

node "$HERE/build.mjs" "$DIR" fact "$RUN" "$TAKE"
node "$HERE/finish.mjs" "$DIR" "$DIR/raw/$TAKE.mp4" "$RUN" "$REC_START"
node "$HERE/voice.mjs" "$DIR"
echo "Готово: $DIR/out/video.mp4 і video-voice.mp4 ($TAKE), хронометраж — out/timing.md"
