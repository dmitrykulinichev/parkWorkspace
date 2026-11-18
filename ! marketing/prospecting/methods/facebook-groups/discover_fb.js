// Facebook: пошук груп «оренда авто під таксі» — версія 1.0 (2026-11-17)
// Де: facebook.com у Chrome, залогінений акаунт (окремий робочий акаунт власника g24). ТІЛЬКИ ЧИТАННЯ: у групи не вступаємо,
// нічого не пишемо і не лайкаємо.
// Як: для кожного запиту відкрити https://www.facebook.com/search/groups/?q=<запит> (кожен пошук = перезавантаження сторінки),
// дочекатися ~5 с, виконати цей файл і викликати `await g24fb.collect('<запит>')` — він прокручує видачу і дописує групи
// в localStorage['g24fb'] (переживає перезавантаження). Наприкінці `g24fb.stage()` → textarea → Ctrl+C →
// prospecting/_raw/<дата>_facebook-discover.json.  Скинути накопичене: `g24fb.reset()`.
// Запити — у method.md (QUERIES).

window.g24fb = (() => {
  const KEY = 'g24fb';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{"groups":{},"log":[]}'); } catch (e) { return { groups: {}, log: [] }; } };
  const save = s => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };

  function cards() {
    const out = [], seen = new Set();
    for (const a of document.querySelectorAll('div[role=main] a[href*="/groups/"]')) {
      const m = a.href.match(/\/groups\/([^/?#]+)/);
      const name = a.innerText.trim();
      if (!m || !name || seen.has(m[1])) continue;
      seen.add(m[1]);
      let card = a;
      for (let i = 0; i < 8 && card && !/member|учасник/i.test(card.innerText); i++) card = card.parentElement;
      const meta = (card ? card.innerText : '').replace(name, '').replace(/\s+/g, ' ').trim();
      const mm = meta.match(/(Public|Private|Загальнодоступна|Приватна|Публічна)?\s*·?\s*([\d.,]+\s*[KkMm]?)\s*(members|учасник)/i);
      out.push({ id: m[1], name: name.slice(0, 120), privacy: /Private|Приват/i.test(meta) ? 'private' : 'public',
        members_raw: mm ? mm[2].trim() : '', activity: (meta.match(/[\d+]+\s*posts? a (day|week|month|year)|[\d+]+\s*допис\S* на \S+/i) || [''])[0],
        meta: meta.slice(0, 200) });
    }
    return out;
  }

  async function collect(q, scrolls = 4) {
    for (let i = 0; i < scrolls; i++) { window.scrollTo(0, document.body.scrollHeight); await sleep(1500); }
    const s = load();
    const found = cards();
    for (const g of found) {
      const c = s.groups[g.id] || (s.groups[g.id] = { ...g, queries: [] });
      Object.assign(c, { ...g, queries: c.queries });
      if (!c.queries.includes(q)) c.queries.push(q);
    }
    s.log.push(`${q}: ${found.length}`);
    save(s);
    return { q, found: found.length, total: Object.keys(s.groups).length };
  }

  const stage = () => {
    const s = load();
    const payload = { version: '1.0', finished: new Date().toISOString(), log: s.log, groups: Object.values(s.groups) };
    let ta = document.getElementById('g24-export');
    if (!ta) { ta = document.createElement('textarea'); ta.id = 'g24-export'; ta.style.cssText = 'position:fixed;top:0;left:0;width:300px;height:80px;z-index:999999'; document.body.appendChild(ta); }
    ta.value = JSON.stringify(payload); ta.focus(); ta.select();
    return { chars: ta.value.length, groups: payload.groups.length };
  };
  const reset = () => { localStorage.removeItem(KEY); return 'reset'; };
  return { collect, stage, reset, cards };
})();
'g24fb loaded';
