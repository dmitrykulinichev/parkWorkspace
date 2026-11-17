// Запити до API кабінету від імені користувача, що увійшов у вікні browser.mjs (сесія, парк,
// XSRF — як у самого кабінету, services/api.js). Лише для демо-даних у парку «Київ».
import { page as openPage } from './browser.mjs'

export async function cabinet() {
  const { browser, page } = await openPage()
  const api = (method, url, body, parkOverride) => page.evaluate(async (method, url, body, parkOverride) => {
    const xsrf = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) ?? [])[1] ?? '')
    const headers = { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': xsrf }
    const park = parkOverride ?? localStorage.getItem('active_park_id')
    if (park) headers['X-Park-Id'] = park
    let payload
    if (body?.__form) {
      payload = new FormData()
      for (const [k, v] of Object.entries(body.fields ?? {})) payload.append(k, v)
      for (const f of body.files ?? []) payload.append(f.field, new Blob([Uint8Array.from(atob(f.base64), (c) => c.charCodeAt(0))], { type: f.type }), f.name)
    } else if (body) {
      headers['Content-Type'] = 'application/json'
      payload = JSON.stringify(body)
    }
    const res = await fetch(`/api/v1${url}`, { method, headers, body: payload, credentials: 'include' })
    const text = await res.text()
    let json; try { json = JSON.parse(text) } catch { json = text.slice(0, 300) }
    return { status: res.status, json }
  }, method, url, body, parkOverride ?? null)
  const parkId = await page.evaluate(() => localStorage.getItem('active_park_id'))
  return { browser, page, api, parkId }
}
