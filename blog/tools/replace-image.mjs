// Замінити картинку в уже завантаженій статті, не чіпаючи тексту (правки в адмінці зберігаються):
//   node blog/tools/replace-image.mjs <slug> "<частина підпису картинки>" <файл>   — картинка в тексті
//   node blog/tools/replace-image.mjs <slug> --cover <файл>                       — обкладинка
// Картинку шукає в ПОТОЧНОМУ тексті з суперпарку за підписом ![підпис](…), має знайтись рівно одна.
// Сайт оновиться з наступною синхронізацією.
import fs from 'node:fs'
import path from 'node:path'

const [slug, target, file] = process.argv.slice(2)
if (!slug || !target || !file) { console.error('node replace-image.mjs <slug> "<підпис>"|--cover <файл>'); process.exit(1) }

const BLOG = path.join(import.meta.dirname, '..')
const env = Object.fromEntries(fs.readFileSync(path.join(BLOG, '.env'), 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]))
const api = `${env.BLOG_PUBLISH_URL.replace(/\/$/, '')}/api/blog-publish`
const headers = { Authorization: `Bearer ${env.BLOG_PUBLISH_KEY}`, Accept: 'application/json' }
const call = async (method, url, body) => {
  const res = await fetch(`${api}${url}`, {
    method,
    headers: body instanceof FormData ? headers : { ...headers, 'Content-Type': 'application/json' },
    body: body instanceof FormData ? body : body && JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status}: ${json.message ?? ''}`)
  return json.data ?? json
}
const upload = async (kind) => {
  const form = new FormData()
  form.append('file', new Blob([fs.readFileSync(file)]), path.basename(file))
  return (await call('POST', `/posts/${slug}/${kind}`, form)).image_url
}

if (target === '--cover') {
  console.log('обкладинка →', await upload('cover'))
  process.exit(0)
}

const post = await call('GET', `/posts/${slug}`)
const images = [...post.content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].filter((m) => m[1].includes(target))
if (images.length !== 1) throw new Error(`картинок з підписом «${target}»: ${images.length}, треба рівно одна`)
const [whole, alt] = images[0]
const url = await upload('images')
await call('PUT', `/posts/${slug}`, {
  title: post.title, excerpt: post.excerpt, content: post.content.replace(whole, `![${alt}](${url})`),
  status: post.status, published_at: post.published_at, cover_image: post.cover_image,
  tags: (post.tags ?? []).map((t) => t.name ?? t), // без тегів сервер їх зітре
})
console.log(`«${alt}» →`, url)
