#!/usr/bin/env node
// Готовий ролик з сирого дубля: node finish.mjs <тека> <сирий.mp4> <журнал.json> <старт запису, мс>
// Обрізає від першого кроку до END і домальовує дотики — напівпрозорий кружечок у точці кожного тапу на
// ~0,6 с (системні "Показувати дотики" Android у запис не потрапляють). Час і точки — з журналу run.mjs.
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'

const [dir, raw, runLog, recStartArg] = process.argv.slice(2)
const out = path.join(dir, 'out')
const { start, end } = JSON.parse(fs.readFileSync(path.join(out, '.marks.json'), 'utf8'))
const { taps } = JSON.parse(fs.readFileSync(runLog, 'utf8'))
const recStart = Number(recStartArg)
const SIZE = 120 // діаметр кружечка, px (екран 1080 px завширшки)
const SHOW = 0.6 // с — скільки видно кружечок
const LEAD = 0.1 // с — з'являється трохи раніше за тап (неточність синхронізації ~0,1 с)

// Кружечок: біле напівпрозоре коло з сірим обідком (PNG з альфою).
const dot = path.join(os.tmpdir(), 'video-touch-dot.png')
const r = SIZE / 2
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', `color=c=black@0:s=${SIZE}x${SIZE},format=rgba`, '-frames:v', '1',
  '-vf', `geq=r='if(gt(hypot(X-${r},Y-${r}),${r - 7}),110,255)':g='if(gt(hypot(X-${r},Y-${r}),${r - 7}),110,255)':b='if(gt(hypot(X-${r},Y-${r}),${r - 7}),120,255)':a='if(lt(hypot(X-${r},Y-${r}),${r - 1}),if(gt(hypot(X-${r},Y-${r}),${r - 7}),210,120),0)'`, dot])

const ss = Math.max(0, (start - recStart) / 1000)
const dur = (end - start) / 1000
// Запис екрана — зі змінною частотою кадрів: поки екран стоїть, кадрів немає. Тому спершу рівні 30 к/с
// (fps повторює попередній кадр), потім обрізка — інакше перший кадр після паузи "з'їжджає" на початок.
let chain = `[0:v]fps=30,trim=start=${ss.toFixed(3)}:duration=${dur.toFixed(3)},setpts=PTS-STARTPTS[v0]`
taps.forEach((t, i) => {
  const at = Math.max(0, (t.at - start) / 1000 - LEAD)
  chain += `;[v${i}][1:v]overlay=x=${t.x - r}:y=${t.y - r}:enable='between(t,${at.toFixed(2)},${(at + SHOW).toFixed(2)})'[v${i + 1}]`
})
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-loop', '1', '-t', dur.toFixed(3), '-i', dot,
  '-filter_complex', chain, '-map', `[v${taps.length}]`, '-r', '30', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-an', path.join(out, 'video.mp4')])
console.log(`out/video.mp4 — ${dur.toFixed(1)} с, дотиків: ${taps.length}`)
