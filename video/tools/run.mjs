#!/usr/bin/env node
// Виконати кроки ролика: node run.mjs <тека> <журнал.json> — підготовка (setup), далі кожен крок: мітка часу,
// дії (device.mjs), пауза під репліку. Журнал: { marks: {START, s1…, END}, taps: [{step, text, x, y, at}] }.
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import { perform, prefetch } from './device.mjs'
import { fillVars, holdMs } from './scenario.mjs'

const [dir, out] = process.argv.slice(2)
const scenario = parse(fs.readFileSync(path.join(dir, 'scenario.yaml'), 'utf8'))
const fill = fillVars(scenario)
const marks = {}
const taps = []
let step = null
const ctx = { appId: scenario.appId, log: (t) => taps.push({ step, ...t }) }
const save = () => fs.writeFileSync(out, JSON.stringify({ marks, taps }, null, 1))

try {
  for (const c of scenario.setup ?? []) await perform(fill(c), ctx)
  marks.START = Date.now()
  for (const s of scenario.steps) {
    step = s.id
    marks[s.id] = Date.now()
    console.log(`${s.id}: ${fill(s.say)}`)
    // Дії до останнього тапу/вводу — по черзі; перевірки після нього ("з'явилось …") — паралельно з паузою
    // під репліку, щоб кадр не стояв зайве. Під кінець паузи — знімок екрана для наступного кроку.
    const actions = (s.do ?? []).map(fill)
    const isWait = (c) => typeof c === 'object' && ('extendedWaitUntil' in c || 'assertVisible' in c)
    let split = actions.length
    while (split > 0 && isWait(actions[split - 1])) split--
    for (const c of actions.slice(0, split)) await perform(c, ctx)
    const hold = holdMs(scenario, s)
    await Promise.all([
      (async () => { for (const c of actions.slice(split)) await perform(c, ctx) })(),
      new Promise((r) => setTimeout(r, hold)),
      new Promise((r) => setTimeout(() => { prefetch(); r() }, Math.max(0, hold - 2500))),
    ])
  }
  marks.END = Date.now()
} finally {
  save()
}
