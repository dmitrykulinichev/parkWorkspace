// Довге (—) і середнє (–) тире → дефіс у статтях блогу суперпарку (заголовок, опис, текст; теги не чіпаємо).
// Бере ПОТОЧНУ версію кожної статті (правки в адмінці зберігаються), записує через /api/blog-publish.
//   node blog/tools/dashes.mjs            — лише показати: blog/dashes-review.md (було / стало), нічого не змінює
//   node blog/tools/dashes.mjs --apply    — записати; перед тим копія всіх статей у blog/backup/dashes-<час>.json
//   node blog/tools/dashes.mjs --restore blog/backup/dashes-<час>.json — повернути статті з копії
// Після запису — «Синхронізувати» лендінг (адмінка або node blog/publish.mjs … --sync).
import fs from 'node:fs'
import path from 'node:path'

const BLOG = path.join(import.meta.dirname, '..')
const env = Object.fromEntries(fs.readFileSync(path.join(BLOG, '.env'), 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]))
const api = `${env.BLOG_PUBLISH_URL.replace(/\/$/, '')}/api/blog-publish`
const headers = { Authorization: `Bearer ${env.BLOG_PUBLISH_KEY}`, Accept: 'application/json' }
// Ендпоінти — 60 запитів за хвилину (throttle blog-publish): пауза між запитами, на 429 — почекати й повторити
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const call = async (url, init = {}) => {
  for (;;) {
    await sleep(1100)
    const r = await fetch(`${api}${url}`, { ...init, headers: { ...headers, ...(init.headers ?? {}) } })
    if (r.status === 429) { await sleep(30000); continue }
    if (!r.ok) throw new Error(`${url}: ${r.status} ${(await r.text()).slice(0, 300)}`)
    const j = await r.json(); return j.data ?? j
  }
}
const get = (url) => call(url)
const put = (slug, body) => call(`/posts/${slug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

/** Рядок, що починається з тире, — пункт списку (markdown «- »); «, — » — просто кома; « — » між словами — « - »; решта — «-». */
export const fix = (s) => (s ?? '')
  .replace(/^([ \t]*)[—–][ \t]+/gm, '$1- ')
  .replace(/([,;:])[ \u00a0]+[—–][ \u00a0]+/g, '$1 ')
  .replace(/[  ]+[—–][  ]+/g, ' - ')
  .replace(/[—–]/g, '-')
const count = (s) => ((s ?? '').match(/[—–]/g) ?? []).length

/** Тіло для збереження: усе як було (статус, дата, обкладинка, теги), змінені лише тексти. */
const body = (p, texts) => ({
  title: texts.title, excerpt: texts.excerpt, content: texts.content,
  status: p.status, published_at: p.published_at, cover_image: p.cover_image,
  tags: (p.tags ?? []).map((t) => t.name ?? t),
})

const restoreFile = process.argv[process.argv.indexOf('--restore') + 1]
if (process.argv.includes('--restore')) {
  const saved = JSON.parse(fs.readFileSync(restoreFile, 'utf8'))
  for (const p of saved) { await put(p.slug, body(p, p)); console.log('повернуто', p.slug) }
  process.exit(0)
}

const list = await get('/posts')
const posts = []
for (const item of list) posts.push(await get(`/posts/${item.slug}`))

const changed = posts.map((p) => ({ p, next: { title: fix(p.title), excerpt: fix(p.excerpt), content: fix(p.content) } }))
  .filter(({ p }) => count(p.title) + count(p.excerpt) + count(p.content) > 0)

const total = changed.reduce((n, { p }) => n + count(p.title) + count(p.excerpt) + count(p.content), 0)
const review = [`# Заміна тире на дефіс — ${changed.length} статей, ${total} тире\n`]
for (const { p, next } of changed) {
  review.push(`## ${p.title} (\`${p.slug}\`, ${p.status}, ${(p.published_at ?? '').slice(0, 10)}) — ${count(p.title) + count(p.excerpt) + count(p.content)}\n`)
  for (const key of ['title', 'excerpt', 'content']) {
    const before = (p[key] ?? '').split('\n'), after = next[key].split('\n')
    before.forEach((line, i) => { if (line !== after[i]) review.push(`- було: ${line}\n  стало: ${after[i]}`) })
  }
  review.push('')
}
fs.writeFileSync(path.join(BLOG, 'dashes-review.md'), review.join('\n'))
console.log(`Статей з тире: ${changed.length} з ${posts.length}, тире: ${total}. Перегляд: blog/dashes-review.md`)

if (process.argv.includes('--apply')) {
  fs.mkdirSync(path.join(BLOG, 'backup'), { recursive: true })
  const backup = path.join(BLOG, 'backup', `dashes-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(backup, JSON.stringify(posts, null, 1))
  console.log('Копія всіх статей:', path.relative(BLOG, backup))
  for (const { p, next } of changed) { await put(p.slug, body(p, next)); console.log('оновлено', p.slug) }
}
