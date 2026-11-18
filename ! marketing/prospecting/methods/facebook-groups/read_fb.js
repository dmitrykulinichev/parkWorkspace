// Facebook: читання постів відкритих груп — версія 1.1 (2026-11-17: 1.1 розкриває «See more», інакше довгі пости обрізані)
// Де: facebook.com, залогінений робочий акаунт. ТІЛЬКИ ЧИТАННЯ: не вступаємо, не коментуємо, не лайкаємо.
// Facebook перезавантажує сторінку при переході на іншу групу, тому: для КОЖНОЇ групи відкрити
// https://www.facebook.com/groups/<id>/ (сортування за замовчуванням), почекати ~5 с, виконати цей файл і
// `await g24fbr.read('<id>', 20)` — прокручує стрічку 20 разів і повертає пости (FB віртуалізує стрічку: пости поза
// екраном спорожнюються, тому накопичуємо на кожному кроці). Результат кожної групи агент дописує у
// prospecting/_raw/<дата>_facebook-posts.json (масив {group, name, posts:[{author, uid, text}]}).
// Пауза між групами ≥ 10 с: акаунт новий, не провокуємо антиспам.

window.g24fbr = (() => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  function grab(store) {
    const feed = document.querySelector('div[role=feed]');
    if (!feed) return;
    // довгі пости обрізані «See more» / «Показати більше» — розкриваємо (це лише розгортання тексту, не дія в групі)
    for (const b of feed.querySelectorAll('div[role=button]')) if (/^(See more|Показати більше|Ещё)$/i.test(b.textContent.trim())) b.click();
    for (const p of feed.children) {
      if (p.textContent.length < 50) continue;
      const a = p.querySelector('h2 a, h3 a, strong a, a[role=link] strong');
      const link = (a?.closest('a') || a)?.href || '';
      const uid = (link.match(/\/user\/(\d+)/) || [])[1] || '';
      const msgEl = p.querySelector('[data-ad-rendering-role=story_message], [data-ad-preview=message], div[data-ad-comet-preview=message]');
      const text = (msgEl?.innerText || msgEl?.textContent || '').trim();
      const author = (a?.textContent || '').trim();
      const key = uid + '|' + text.slice(0, 80);
      if (!text || store[key]) continue;
      store[key] = { author, uid, text: text.slice(0, 2000) };
    }
  }
  async function read(group, scrolls = 20) {
    const store = {};
    grab(store);
    for (let i = 0; i < scrolls; i++) { window.scrollBy(0, window.innerHeight * 1.5); await sleep(1800); grab(store); }
    return { group, name: document.title.replace(/\s*\|\s*Facebook.*$/, '').replace(/^\(\d+\)\s*/, ''), read_at: new Date().toISOString(), posts: Object.values(store) };
  }
  return { read, grab };
})();
'g24fbr loaded';
