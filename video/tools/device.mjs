// Виконавець кроків ролика на Android-емуляторі (замість Maestro, README.md): кнопки — за текстом на
// екрані (`uiautomator dump`), тиснемо через adb з реальною тривалістю натискання, щоб Android показав
// дотик у записі ("Показувати дотики"); час і координати кожного тапу — у журнал дубля.

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)
const ADB = process.env.ADB ?? `${process.env.HOME}/Library/Android/sdk/platform-tools/adb`
const PRESS_MS = 280 // довше — Android вважатиме довгим натисканням (≈ 400 мс)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export const adb = async (...args) => (await run(ADB, args, { maxBuffer: 16 * 1024 * 1024 })).stdout

/** Видимі елементи з текстом: текст, опис і центр. */
export async function screen() {
  const xml = await adb('exec-out', 'uiautomator', 'dump', '/dev/tty')
  const nodes = []
  for (const m of xml.matchAll(/<node [^>]*?text="([^"]*)"[^>]*?content-desc="([^"]*)"[^>]*?bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g)) {
    const [, text, desc, x1, y1, x2, y2] = m
    const label = decode(text || desc).trim()
    if (label) nodes.push({ label, x: (Number(x1) + Number(x2)) >> 1, y: (Number(y1) + Number(y2)) >> 1 })
  }
  return nodes
}

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

/** Як Maestro: текст збігається повністю (без урахування регістру й крайових пробілів). */
const matches = (node, text) => node.label.toLowerCase() === String(text).trim().toLowerCase()

// Знімок екрана, зроблений заздалегідь (поки кадр стоїть під репліку) — перший пошук без ~2 с очікування.
let prefetched = null
export function prefetch() {
  prefetched = screen().catch(() => null)
}

export async function waitVisible(text, timeout = 10000) {
  const until = Date.now() + timeout
  for (;;) {
    const ready = prefetched ? await prefetched : null
    prefetched = null
    const found = (ready ?? (await screen())).filter((n) => matches(n, text))
    if (found.length) return found
    if (Date.now() > until) throw new Error(`Не з'явилось на екрані: «${text}»`)
    await sleep(300)
  }
}

/** Тап по елементу з текстом [text] ([index] — котрий з однакових, зверху вниз). */
export async function tapOn(text, index = 0, log) {
  const found = (await waitVisible(text)).sort((a, b) => a.y - b.y || a.x - b.x)
  const target = found[index] ?? found.at(-1)
  log?.({ type: 'tap', text, x: target.x, y: target.y, at: Date.now() })
  await adb('shell', 'input', 'swipe', `${target.x}`, `${target.y}`, `${target.x}`, `${target.y}`, `${PRESS_MS}`)
  await sleep(400) // анімація після натискання
}

/** Стерти [count] символів перед курсором — по одному, щоб у кадрі було видно. */
export async function eraseText(count) {
  for (let i = 0; i < count; i++) {
    await adb('shell', 'input', 'keyevent', 'KEYCODE_DEL')
    await sleep(180)
  }
}

/** Ввести текст по символу (як пальцем). `input text` — лише латиниця й цифри. */
export async function inputText(text) {
  for (const ch of String(text)) {
    await adb('shell', 'input', 'text', ch)
    await sleep(180)
  }
}

/** Запуск начисто: застосунок закривається й відкривається знову — завжди з Головної. */
export async function launchApp(appId) {
  await adb('shell', 'am', 'force-stop', appId)
  await adb('shell', 'monkey', '-p', appId, '-c', 'android.intent.category.LAUNCHER', '1')
}

/**
 * Дія кроку з scenario.yaml (ті самі назви, що в Maestro): tapOn, extendedWaitUntil/assertVisible,
 * eraseText, inputText, launchApp, wait (мс).
 */
export async function perform(command, ctx) {
  const [name, arg] = typeof command === 'string' ? [command, undefined] : Object.entries(command)[0]
  switch (name) {
    case 'launchApp': return launchApp(ctx.appId)
    case 'tapOn': return typeof arg === 'object' ? tapOn(arg.text, arg.index ?? 0, ctx.log) : tapOn(arg, 0, ctx.log)
    case 'extendedWaitUntil': return waitVisible(arg.visible, arg.timeout ?? 10000)
    case 'assertVisible': return waitVisible(arg, 10000)
    case 'eraseText': return eraseText(Number(arg))
    case 'inputText': return inputText(arg)
    case 'wait': return sleep(Number(arg))
    default: throw new Error(`Невідома дія: ${name}`)
  }
}
