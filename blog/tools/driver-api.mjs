// API водія від імені того, хто увійшов у застосунок на емуляторі (збірка demo, kmp/androidApp/src/demo):
// сесія щоразу береться з застосунку й ніде не зберігається. Лише для демо-даних у парку «Київ».
//   import { driverApi } from './driver-api.mjs'; const api = await driverApi(); await api('GET', '/fuel-refuelings')
import { execFileSync } from 'node:child_process'

const ADB = process.env.ADB ?? `${process.env.HOME}/Library/Android/sdk/platform-tools/adb`
const BASE = 'https://app.g24.com.ua/api/driver/v1'

export async function driverApi() {
  execFileSync(ADB, ['shell', 'am', 'broadcast', '-n', 'ua.com.g24/ua.g24.park.driver.DemoSessionExport'])
  await new Promise((r) => setTimeout(r, 1000))
  const session = JSON.parse(execFileSync(ADB, ['shell', 'run-as', 'ua.com.g24', 'cat', 'files/demo-session.json']).toString())
  const headers = {
    Authorization: `Bearer ${session.token}`, Accept: 'application/json', 'X-Park-Id': String(session.active_park_id),
    'X-App-Mode': session.active_mode ?? 'driver', 'X-Locale': 'uk',
  }
  const api = async (method, url, body) => {
    const res = await fetch(BASE + url, { method, headers: body ? { ...headers, 'Content-Type': 'application/json' } : headers, body: body && JSON.stringify(body) })
    return { status: res.status, json: await res.json().catch(() => null) }
  }
  api.parkId = session.active_park_id
  return api
}
