// Браузер для скрінів кабінету й підготовки демо-даних (замість розширення Claude в Chrome).
//   node browser.mjs start [url]   — відкрити окремий Chrome (свій профіль .chrome-profile, порт 9333);
//                                    у кабінет входить користувач сам, раз — сесія зберігається
//   import { page } from './browser.mjs' — підключитись до відкритого вікна зі скрипта
import { spawn } from 'node:child_process'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const PORT = 9333
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PROFILE = path.join(import.meta.dirname, '.chrome-profile')

export async function connect() {
  return puppeteer.connect({ browserURL: `http://127.0.0.1:${PORT}`, defaultViewport: null })
}

/** Вкладка кабінету (перша відкрита). */
export async function page() {
  const browser = await connect()
  const pages = await browser.pages()
  const p = pages.find((x) => x.url().startsWith('https://app.g24.com.ua')) ?? pages[0] ?? (await browser.newPage())
  return { browser, page: p }
}

if (process.argv[2] === 'start') {
  const url = process.argv[3] ?? 'https://app.g24.com.ua'
  spawn(CHROME, [`--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`, '--no-first-run', '--no-default-browser-check', '--window-size=1440,960', url], {
    detached: true, stdio: 'ignore',
  }).unref()
  console.log(`Chrome відкрито: ${url}`)
}

/** Клік по найглибшому видимому елементу з точно таким текстом (n-й зверху). */
export async function clickText(page, text, n = 0) {
  const handles = await page.$$('body *')
  const hits = []
  for (const h of handles) {
    const ok = await h.evaluate((el, text) => {
      if ([...el.children].some((c) => c.textContent.trim() === text)) return false
      const r = el.getBoundingClientRect()
      return el.textContent.trim() === text && r.width > 0 && r.height > 0
    }, text)
    if (ok) hits.push(h)
  }
  if (!hits[n]) throw new Error(`Не знайшов «${text}»`)
  await hits[n].click()
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
