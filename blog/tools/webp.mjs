// PNG → WebP (якість 90) через Chrome з browser.mjs — у ffmpeg тут немає кодека WebP.
//   node webp.mjs <вхід.png> <вихід.webp>
import fs from 'node:fs'
import { connect } from './browser.mjs'

const [input, output] = process.argv.slice(2)
const browser = await connect()
const page = await browser.newPage()
const b64 = fs.readFileSync(input).toString('base64')
const data = await page.evaluate(async (b64) => {
  const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode()
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight
  c.getContext('2d').drawImage(img, 0, 0)
  return c.toDataURL('image/webp', 0.9).split(',')[1]
}, b64)
fs.writeFileSync(output, Buffer.from(data, 'base64'))
await page.close(); await browser.disconnect()
console.log(`${output} — ${Math.round(fs.statSync(output).size / 1024)} КБ`)
