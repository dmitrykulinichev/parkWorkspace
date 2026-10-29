// «Скан» документа для демо-даних: бланк із полями й великим «ЗРАЗОК», намальований Chrome (browser.mjs).
// Не схожий на справжній документ навмисно — лише щоб у кадрі був прикріплений файл.
import { connect } from './browser.mjs'

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])

/** @param {{title: string, rows: [string, string][], card?: boolean}} doc → PNG (Buffer) */
export async function scan(doc) {
  const browser = await connect()
  const page = await browser.newPage()
  const [w, h] = doc.card ? [1000, 630] : [850, 1100]
  await page.setViewport({ width: w, height: h })
  await page.setContent(`<!doctype html><meta charset="utf-8"><body style="margin:0;width:${w}px;height:${h}px;
    background:#f6f3ea;font-family:Helvetica,Arial,sans-serif;color:#333;position:relative;overflow:hidden">
    <div style="position:absolute;inset:24px;border:2px solid #b9b2a0;border-radius:${doc.card ? 18 : 4}px;padding:36px 44px">
      <div style="font-size:${doc.card ? 30 : 34}px;font-weight:700;letter-spacing:.5px;margin-bottom:28px">${esc(doc.title)}</div>
      <div style="display:flex;gap:36px">
        ${doc.card ? '<div style="width:190px;height:240px;background:#ddd6c4;border-radius:8px;flex:none"></div>' : ''}
        <table style="font-size:24px;border-collapse:collapse">${doc.rows.map(([k, v]) =>
          `<tr><td style="color:#888;padding:8px 24px 8px 0;white-space:nowrap">${esc(k)}</td><td style="padding:8px 0;font-weight:600">${esc(v)}</td></tr>`).join('')}</table>
      </div>
      ${doc.card ? '' : '<div style="margin-top:40px">' + '<div style="height:14px;background:#e2dccb;border-radius:4px;margin:18px 0"></div>'.repeat(14) + '</div>'}
    </div>
    <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-22deg);font-size:${doc.card ? 150 : 170}px;
      font-weight:900;color:rgba(214,40,40,.22);letter-spacing:12px;white-space:nowrap">ЗРАЗОК</div>
  </body>`)
  const png = await page.screenshot({ type: 'png' })
  await page.close()
  await browser.disconnect()
  return Buffer.from(png)
}
