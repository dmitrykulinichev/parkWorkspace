#!/usr/bin/env node
// Публікація статті блогу в суперпарк без кабінету (README.md поруч):
//   node blog/publish.mjs <тека статті> [--sync] [--replace]       (BLOG_ENV=local — суперпарк на localhost, .env.local)
// Тека: article.md (frontmatter + "# Заголовок" + текст) і картинки поруч. Картинки з локальним шляхом
// (`![підпис](card.png)`) і обкладинка (`cover: cover.png`) завантажуються, у тексті підміняються на
// посилання суперпарку. --sync — одразу синхронізувати лендінг.
// Після вдалого завантаження тека переїжджає з blog/drafts/ у blog/uploaded/ — історія завантаженого.
// Назва теки — ключ статті (slug). Разовий: лише створює статтю. Якщо стаття вже є — зупиняється, нічого
// не змінивши: після першого запуску стаття живе в адмінці суперпарку, там її дивляться й правлять.
// --replace — свідомо перезаписати наявну статтю текстом і картинками з теки (правки в адмінці зникнуть).
// --locale en|ru — версія статті цією мовою з підтеки <тека>/en/ (article.md і свої картинки): стаття вже має
// бути в суперпарку; картинки й обкладинка вантажаться до версії мови, українська не змінюється.

import fs from 'node:fs'
import path from 'node:path'

const [articleDir, ...flags] = process.argv.slice(2)
if (!articleDir) {
  console.error('node blog/publish.mjs <тека статті> [--sync] [--replace] [--locale en|ru]')
  process.exit(1)
}
const locale = flags.includes('--locale') ? flags[flags.indexOf('--locale') + 1] : null
if (locale && !['en', 'ru'].includes(locale)) {
  console.error('--locale: en або ru (українська — сама стаття)')
  process.exit(1)
}
// Версія мовою — з підтеки мови; ключ статті (slug) — назва основної теки
const dir = locale ? path.join(articleDir, locale) : articleDir

const env = Object.fromEntries(
  fs.readFileSync(path.join(import.meta.dirname, process.env.BLOG_ENV ? `.env.${process.env.BLOG_ENV}` : '.env'), 'utf8')
    .split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
)
if (!env.BLOG_PUBLISH_KEY) {
  console.error('Немає ключа: BLOG_PUBLISH_KEY у workspace/blog/.env (той самий, що в .env суперпарку)')
  process.exit(1)
}
const api = `${env.BLOG_PUBLISH_URL.replace(/\/$/, '')}/api/blog-publish`
const headers = { Authorization: `Bearer ${env.BLOG_PUBLISH_KEY}`, Accept: 'application/json' }

async function call(method, url, body) {
  const res = await fetch(`${api}${url}`, {
    method,
    headers: body instanceof FormData ? headers : { ...headers, 'Content-Type': 'application/json' },
    body: body instanceof FormData ? body : body && JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status}: ${json.message ?? ''} ${JSON.stringify(json.errors ?? '')}`)
  return json
}

// article.md: frontmatter (key: value; tags — через кому) + "# Заголовок" + текст. Чернеткові позначки
// (<!-- … -->) на сайт не йдуть. Та сама будова — у версіях мовою (<тека>/en/article.md).
function readArticle(from) {
  const source = fs.readFileSync(path.join(from, 'article.md'), 'utf8')
  const [, front, rest] = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ?? []
  if (!front) throw new Error(`${from}/article.md: немає frontmatter`)
  const meta = Object.fromEntries(front.split('\n').filter(Boolean).map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]))
  const [, title, body] = rest.match(/^\s*#\s+(.+)\n([\s\S]*)$/) ?? []
  if (!title) throw new Error(`${from}/article.md: потрібен "# Заголовок"`)

  return { meta, title, content: body.replace(/<!--[\s\S]*?-->\n*/g, '').trim() + '\n' }
}

const slug = path.basename(path.resolve(articleDir))
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new Error(`Назва теки «${slug}» — ключ статті: лише латиниця, цифри й дефіси`)
// Версії мовами, що лежать поруч (en/, ru/) — викладаються тим самим запуском, після української
const localeDirs = ['en', 'ru'].filter((l) => fs.existsSync(path.join(articleDir, l, 'article.md')))

if (locale) {
  await publishTranslation(locale)
  await syncIfAsked()
  process.exit(0)
}

let { meta, title, content } = readArticle(dir)

const exists = await fetch(`${api}/posts/${slug}`, { headers })
if (!exists.ok && exists.status !== 404) {
  console.error(`Не вдалось перевірити статтю: ${exists.status}`)
  process.exit(1)
}
if (exists.ok && !flags.includes('--replace')) {
  console.error(`Стаття «${slug}» уже є в суперпарку — правки робляться в адмінці. Перезаписати текстом з теки: --replace`)
  process.exit(1)
}

const post = await call('PUT', `/posts/${slug}`, {
  title,
  excerpt: meta.excerpt ?? '',
  content, // спершу з локальними шляхами картинок — стаття мусить існувати, щоб до неї вантажити
  status: meta.status ?? 'draft',
  published_at: meta.published_at || null,
  tags: (meta.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean),
})
console.log(`${post.created ? 'Створено' : 'Перезаписано'}: ${slug} (${post.data.status}, ${post.data.published_at ?? 'без дати'})`)

async function upload(kind, file) {
  const form = new FormData()
  form.append('file', new Blob([fs.readFileSync(path.join(dir, file))]), path.basename(file))
  const { image_url } = await call('POST', `/posts/${slug}/${kind === 'cover' ? 'cover' : 'images'}`, form)
  console.log(`  ↑ ${file}`)
  return image_url
}

const local = [...content.matchAll(/!\[([^\]]*)\]\((?!https?:\/\/)([^)\s]+)\)/g)]
for (const [whole, alt, file] of local) {
  content = content.replace(whole, `![${alt}](${await upload('image', file)})`)
}
if (local.length) await call('PUT', `/posts/${slug}`, { ...post.data, title, content, tags: post.data.tags.map((t) => t.name) })

if (meta.cover) await upload('cover', meta.cover)

console.log(`Картинок у тексті: ${local.length}${meta.cover ? ', обкладинка є' : ''}`)

for (const l of localeDirs) {
  await publishTranslation(l)
}
await syncIfAsked()

// Завантажено — тека з чернеток у "завантажене"
const uploaded = path.join(import.meta.dirname, 'uploaded', path.basename(path.resolve(dir)))
if (!process.env.BLOG_ENV && path.resolve(dir) !== uploaded) {
  fs.mkdirSync(path.dirname(uploaded), { recursive: true })
  fs.rmSync(uploaded, { recursive: true, force: true }) // повторне завантаження — в історії лишається останнє
  fs.renameSync(dir, uploaded)
  console.log(`Тека → ${path.relative(process.cwd(), uploaded)}`)
}

async function syncIfAsked() {
  if (!flags.includes('--sync')) return
  const report = await call('POST', '/sync')
  console.log(`Лендінг: статей ${JSON.stringify(report.synced ?? '?')}, картинок завантажено ${report.images_downloaded ?? 0}, не вдалось ${report.images_failed ?? 0}`)
}

/**
 * Версія мовою з <тека>/<мова>/: текст — PUT …/translations/{мова}, картинки й обкладинка — з `locale`, тож вони
 * належать цій версії. Кадру цією мовою немає — у тексті посилання на український файл (`../day.webp`), він
 * завантажиться копією до версії; без обкладинки лендінг покаже українську.
 */
async function publishTranslation(lang) {
  const from = path.join(articleDir, lang)
  let { meta, title, content } = readArticle(from)

  const res = await fetch(`${api}/posts/${slug}`, { headers })
  if (!res.ok) {
    console.error(`Статті «${slug}» немає в суперпарку (${res.status}) — спершу опублікуйте українську`)
    process.exit(1)
  }
  const { data } = await res.json()
  if (data.translations.some((t) => t.locale === lang) && !flags.includes('--replace')) {
    console.log(`Версія [${lang}] уже є — пропущено (правки в адмінці; перезаписати з теки: --replace)`)
    return
  }

  const save = (text) => call('PUT', `/posts/${slug}/translations/${lang}`, { title, excerpt: meta.excerpt ?? '', content: text })
  const saved = await save(content) // спершу з локальними шляхами — версія мусить існувати, щоб вантажити до неї
  console.log(`${saved.created ? 'Створено' : 'Перезаписано'}: ${slug} [${lang}]`)

  const upload = async (kind, file) => {
    const form = new FormData()
    form.append('file', new Blob([fs.readFileSync(path.join(from, file))]), path.basename(file))
    form.append('locale', lang)
    const { image_url } = await call('POST', `/posts/${slug}/${kind === 'cover' ? 'cover' : 'images'}`, form)
    console.log(`  ↑ ${lang}/${file}`)
    return image_url
  }

  const local = [...content.matchAll(/!\[([^\]]*)\]\((?!https?:\/\/)([^)\s]+)\)/g)]
  for (const [whole, alt, file] of local) {
    content = content.replace(whole, `![${alt}](${await upload('image', file)})`)
  }
  if (local.length) await save(content)
  if (meta.cover) await upload('cover', meta.cover)
  console.log(`  [${lang}] картинок у тексті: ${local.length}${meta.cover ? ', обкладинка є' : ''}`)
}
