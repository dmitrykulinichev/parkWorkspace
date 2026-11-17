// Скріни застосунку для статті (заокруглення екрана 16 px — більше зрізає «1» годинника: в емуляторі він майже впритул до краю): кілька телефонів поруч у рамках на світлому тлі — широка картинка, бо
// лендінг розтягує картинку на всю ширину тексту (високий скрін одного телефона був би завеликим).
//   node phones.mjs <вихід.webp|.png> <скрін1.png> [скрін2.png …]   (.webp — у 3–4 рази легше без видимої різниці)
import fs from 'node:fs'
import { connect } from './browser.mjs'

const [out, ...shots] = process.argv.slice(2)
if (!out || !shots.length) { console.error('node phones.mjs <вихід.png> <скрін.png>…'); process.exit(1) }

const PHONE_W = 330 // CSS px на один телефон; знімок — з deviceScaleFactor 2
const width = shots.length * PHONE_W + (shots.length - 1) * 48 + 2 * 72
const imgs = shots.map((f) => `data:image/png;base64,${fs.readFileSync(f).toString('base64')}`)

const browser = await connect()
const page = await browser.newPage()
await page.setViewport({ width, height: 900, deviceScaleFactor: 2 })
await page.setContent(`<!doctype html><meta charset="utf-8"><body style="margin:0;background:linear-gradient(160deg,#eef3ff,#f7f9fc 60%);">
  <div id="c" style="display:flex;gap:48px;justify-content:center;align-items:flex-start;padding:56px 72px">
    ${imgs.map((src) => `<div style="width:${PHONE_W}px;border-radius:28px;padding:10px;background:#1c1f26;box-shadow:0 24px 60px rgba(30,45,90,.22)">
      <img src="${src}" style="display:block;width:100%;border-radius:16px"></div>`).join('')}
  </div></body>`)
await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())))
const el = await page.$('#c')
await el.screenshot({ path: out, ...(out.endsWith('.webp') ? { type: 'webp', quality: 90 } : {}) })
await page.close()
await browser.disconnect()
console.log(out)
