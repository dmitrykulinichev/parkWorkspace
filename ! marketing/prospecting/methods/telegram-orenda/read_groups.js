// Telegram: читання повідомлень публічних груп/каналів-дошок — версія 1.1 (2026-11-17: 1.1 автор для повідомлень поспіль із групи бульбашок)
// Де: web.telegram.org/k, залогінений акаунт власника g24. ТІЛЬКИ ЧИТАННЯ: чат відкривається як превʼю, кнопку JOIN
// не натискаємо, нічого не пишемо і не пересилаємо.
// Запуск: виконати файл у консолі → g24tgr.start(['taxi_cv', ...], { days: 180, maxScrolls: 40 }) → g24tgr.status()
//         → g24tgr.stage() → Ctrl+C → prospecting/_raw/<дата>_telegram-groups.json
// Як працює: відкриває чат через поле пошуку (клік по рядку з @username), гортає історію вгору (scrollTop=0) і на кожному
// кроці дописує видимі повідомлення (DOM віртуалізований — старі «бульбашки» зникають, тому накопичуємо за data-mid),
// доки не дійде до повідомлень старших за `days` днів або не вичерпає `maxScrolls`.

window.g24tgr = (() => {
  const S = { started: null, done: false, cur: '', groups: {}, log: [] };
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function openChat(u) {
    const inp = document.querySelector('input.input-search-input');
    if (!inp) return null;   // перед запуском один раз клікнути в поле пошуку, щоб увімкнути режим пошуку
    inp.focus(); inp.value = u; inp.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(3500);
    const row = [...document.querySelectorAll('.search-group a.row, .search-group .row-clickable, .search-group .chatlist-chat')]
      .find(e => e.innerText.toLowerCase().includes('@' + u.toLowerCase()));
    if (!row) return null;
    const before = document.querySelector('.chat-info .peer-title')?.innerText || '';
    // Telegram Web K відкриває чат на mousedown (простого click() недостатньо)
    for (const t of ['mousedown', 'mouseup', 'click']) row.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, button: 0 }));
    await sleep(4000);
    const title = document.querySelector('.chat-info .peer-title')?.innerText || '';
    const expect = row.querySelector('.peer-title')?.innerText || '';
    if (title === before && expect && title !== expect) return null;   // чат не відкрився — не читаємо чужі повідомлення
    return title;
  }

  function grab(store) {
    for (const b of document.querySelectorAll('.bubbles .bubble[data-mid]')) {
      const mid = b.dataset.mid;
      if (store[mid]) continue;
      const t = b.querySelector('.message');
      if (!t) continue;
      // кілька повідомлень поспіль від однієї людини: імʼя лише над першим, аватар — один на групу бульбашок
      const grp = b.closest('.bubbles-group');
      const nameEl = b.querySelector('.name .peer-title, .peer-title[data-peer-id]') || grp?.querySelector('.name .peer-title');
      const grpPeer = grp?.querySelector('.bubbles-group-avatar[data-peer-id], .avatar[data-peer-id]')?.dataset?.peerId || '';
      store[mid] = {
        mid, ts: +b.dataset.timestamp || 0,
        from: (nameEl?.innerText || '').replace(/\s+/g, ' ').trim(),
        fromPeer: nameEl?.dataset?.peerId || b.querySelector('.avatar[data-peer-id]')?.dataset?.peerId || grpPeer,
        fwd: /Forwarded from|Переслано/i.test(b.querySelector('.name')?.innerText || ''),
        text: t.innerText.replace(/\s+\n/g, '\n').slice(0, 1500),
      };
    }
  }

  async function readChat(u, opt) {
    const title = await openChat(u);
    if (title === null) { S.log.push(`${u}: not found`); return; }
    const msgs = {};
    const cutoff = Date.now() / 1000 - opt.days * 86400;
    const sc = document.querySelector('.bubbles .scrollable-y, .bubbles > .scrollable');
    // Telegram відкриває чат на місці, де його лишили, — спершу йдемо до найновіших повідомлень
    for (let i = 0; i < 6; i++) {
      const down = document.querySelector('.bubbles-go-down:not(.is-hidden), .bubbles-corner-button:not(.is-hidden)');
      if (down) down.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      if (sc) sc.scrollTop = sc.scrollHeight;
      await sleep(1200);
    }
    grab(msgs);
    for (let i = 0; i < opt.maxScrolls; i++) {
      if (sc) sc.scrollTop = 0;
      await sleep(1600);
      grab(msgs);
      const oldest = Math.min(...Object.values(msgs).map(m => m.ts || Infinity));
      if (oldest < cutoff) break;
    }
    S.groups[u] = { username: u, title, read_at: new Date().toISOString(), messages: Object.values(msgs).filter(m => m.ts >= cutoff) };
    S.log.push(`${u}: ${S.groups[u].messages.length} msgs`);
  }

  async function start(usernames, opt = {}) {
    if (S.started && !S.done) return 'already running';
    const o = { days: 180, maxScrolls: 40, ...opt };
    Object.assign(S, { started: new Date().toISOString(), done: false, groups: {}, log: [], opt: o });
    (async () => { for (const u of usernames) { S.cur = u; try { await readChat(u, o); } catch (e) { S.log.push(`${u}: error ${e}`); } } S.done = true; S.cur = ''; })();
    return `started ${usernames.length}`;
  }
  const status = () => ({ done: S.done, cur: S.cur, read: Object.keys(S.groups).length, last: S.log.slice(-3) });
  const stage = () => {
    const payload = { version: '1.0', started: S.started, finished: new Date().toISOString(), opt: S.opt, log: S.log, groups: Object.values(S.groups) };
    let ta = document.getElementById('g24-export');
    if (!ta) { ta = document.createElement('textarea'); ta.id = 'g24-export'; ta.style.cssText = 'position:fixed;top:0;left:0;width:300px;height:80px;z-index:999999'; document.body.appendChild(ta); }
    ta.value = JSON.stringify(payload); ta.focus(); ta.select();
    return { chars: ta.value.length, groups: payload.groups.length, messages: payload.groups.reduce((a, g) => a + g.messages.length, 0) };
  };
  return { start, status, stage, _state: S };
})();
'g24tgr loaded';
