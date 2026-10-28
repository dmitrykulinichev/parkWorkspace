#!/usr/bin/env node
// Один ролик — одна тека з scenario.yaml (README.md). З нього:
//   node build.mjs <тека> plan                    → scenario.md (сценарій для погодження)
//   node build.mjs <тека> fact <журнал.json> <дубль> → out/timing.md (факт зйомки) і out/subtitles.srt
// Текст озвучки, змінні й кроки — лише в scenario.yaml: інший ролик чи авто — змінити змінні/кроки.

import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import { fillVars, holdMs, words } from './scenario.mjs'

const [dir, mode, logFile, take] = process.argv.slice(2)
if (!dir || !['plan', 'fact'].includes(mode)) {
  console.error('node build.mjs <тека ролика> plan | fact <журнал.json> <дубль>')
  process.exit(1)
}

const scenario = parse(fs.readFileSync(path.join(dir, 'scenario.yaml'), 'utf8'))
const fill = fillVars(scenario)
const vars = scenario.vars ?? {}
const pace = scenario.wordsPerSecond ?? 2.5
const sec = (ms) => (ms / 1000).toFixed(1).replace('.', ',')

if (mode === 'plan') {
  let total = 0
  const rows = scenario.steps.map((s) => {
    const ms = holdMs(scenario, s)
    const row = `| ${s.id} | ${sec(total)} | ${fill(s.screen)} | ${fill(s.say)} | ${sec(ms)} |`
    total += ms
    return row
  })
  fs.writeFileSync(path.join(dir, 'scenario.md'), [
    `# ${scenario.id} · ${fill(scenario.title)} — сценарій`,
    '',
    '> Згенеровано з `scenario.yaml` (`tools/build.mjs plan`) — правити там, не тут.',
    `> Час — оцінка за темпом диктора ${String(pace).replace('.', ',')} слова/с (без часу на самі дії); факт кожного дубля — \`out/timing.md\`.`,
    '',
    `Титр: **${fill(scenario.caption)}**`,
    '',
    '## Змінні',
    '',
    '| Змінна | Значення |',
    '|---|---|',
    ...Object.entries(vars).map(([k, v]) => `| \`${k}\` | ${v} |`),
    '',
    '## Кроки',
    '',
    '| id | Старт (оцінка) | На екрані | Озвучка | Кадр стоїть |',
    '|---|---|---|---|---|',
    ...rows,
    '',
    `Разом ≈ ${sec(total)} с.`,
    '',
    ...(scenario.prep?.length ? ['## Підготовка кадру', '', ...scenario.prep.map((p) => `- ${fill(p)}`), ''] : []),
  ].join('\n'))
  console.log(`scenario.md — ${scenario.steps.length} кроків, ≈ ${sec(total)} с`)
}

if (mode === 'fact') {
  const { marks, taps } = JSON.parse(fs.readFileSync(logFile, 'utf8'))
  const start = marks[scenario.steps[0].id]
  const end = marks.END
  if (!start || !end) {
    console.error('У журналі немає міток першого кроку чи END — дубль не пройшов до кінця')
    process.exit(1)
  }
  const rel = (ms) => Math.max(0, ms - start)
  const at = (ms) => {
    const t = rel(ms)
    return `${String(Math.floor(t / 60000)).padStart(2, '0')}:${((t % 60000) / 1000).toFixed(1).padStart(4, '0').replace('.', ',')}`
  }
  const srtAt = (ms) => {
    const t = rel(ms)
    const p = (n, w = 2) => String(n).padStart(w, '0')
    return `${p(Math.floor(t / 3600000))}:${p(Math.floor((t % 3600000) / 60000))}:${p(Math.floor((t % 60000) / 1000))},${p(t % 1000, 3)}`
  }
  const steps = scenario.steps.map((s, i) => ({ id: s.id, say: fill(s.say), from: marks[s.id], to: marks[scenario.steps[i + 1]?.id] ?? end }))
  const out = path.join(dir, 'out')
  fs.mkdirSync(out, { recursive: true })
  fs.writeFileSync(path.join(out, 'timing.md'), [
    `# ${scenario.id} · ${fill(scenario.title)} — факт зйомки (дубль ${take})`,
    '',
    `> Таймкоди від початку ролика (перший крок). Сирий запис — \`raw/${take}.mp4\`, ролик — \`out/video.mp4\`.`,
    `> Тривалість: ${sec(end - start)} с. "Вистачає" — чи встигає диктор (темп ${String(pace).replace('.', ',')} слова/с).`,
    '',
    '| Старт | Крок | Озвучка | Вікно, с | Вистачає |',
    '|---|---|---|---|---|',
    ...steps.map((s) => {
      const need = (words(s.say) / pace) * 1000
      const have = s.to - s.from
      return `| ${at(s.from)} | ${s.id} | ${s.say} | ${sec(have)} | ${have + 50 >= need ? '✓' : `⚠ мало на ${sec(need - have)} с`} |`
    }),
    '',
    '## Тапи',
    '',
    '| Час | Крок | Кнопка | Точка (x, y) |',
    '|---|---|---|---|',
    ...taps.map((t) => `| ${at(t.at)} | ${t.step} | ${t.text} | ${t.x}, ${t.y} |`),
    '',
  ].join('\n'))
  fs.writeFileSync(path.join(out, 'subtitles.srt'), steps.map((s, i) => `${i + 1}\n${srtAt(s.from)} --> ${srtAt(s.to)}\n${s.say}\n`).join('\n'))
  fs.writeFileSync(path.join(out, '.marks.json'), JSON.stringify({ start, end, steps: steps.map((s) => ({ id: s.id, from: rel(s.from), to: rel(s.to), say: s.say })) }))
  console.log(`out/timing.md, out/subtitles.srt — ролик ${sec(end - start)} с, тапів: ${taps.length}`)
}
