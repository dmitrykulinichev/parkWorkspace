// Telegram: пошук публічних каналів і груп про оренду авто під таксі — версія 1.0 (2026-11-17)
// Де запускати: https://web.telegram.org/k/ у Chrome, залогінений акаунт власника g24 (тільки ЧИТАННЯ: нічого не пишемо,
// ні на що не підписуємось). Виконати файл у консолі сторінки (агент: javascript_tool), далі:
//   g24tg.start()   — проганяє всі запити з QUERIES через глобальний пошук Telegram (≈5 с на запит);
//   g24tg.status()  — прогрес; g24tg.stage() → textarea вгорі зліва, виділено → Ctrl+C.
// Результат: список чатів {peer, title, username, count, kind: channel|group, queries[]}.
// Вміст каналів потім читає parse_tme.py через публічні сторінки https://t.me/s/<username> (без логіна).

window.g24tg = (() => {
  const CITIES_UA = ['Київ', 'Львів', 'Одеса', 'Дніпро', 'Харків', 'Вінниця', 'Запоріжжя', 'Миколаїв', 'Івано-Франківськ',
    'Тернопіль', 'Луцьк', 'Чернівці', 'Рівне', 'Черкаси', 'Ужгород', 'Житомир', 'Кропивницький', 'Чернігів', 'Суми',
    'Хмельницький', 'Херсон', 'Полтава'];
  const CITIES_RU = ['Киев', 'Львов', 'Одесса', 'Днепр', 'Харьков', 'Винница', 'Запорожье', 'Николаев', 'Ивано-Франковск',
    'Тернополь', 'Луцк', 'Черновцы', 'Ровно', 'Черкассы', 'Ужгород', 'Житомир', 'Кропивницкий', 'Чернигов', 'Сумы',
    'Хмельницкий', 'Херсон', 'Полтава'];
  const QUERIES = [
    'оренда авто таксі', 'оренда авто під таксі', 'авто в оренду таксі', 'автопарк таксі', 'таксопарк', 'авто під викуп таксі',
    'оренда авто uklon', 'оренда авто bolt', 'здам авто в оренду', 'оренда електромобіля таксі',
    'аренда авто под такси', 'аренда авто такси', 'автопарк такси', 'авто под выкуп такси', 'сдам авто в аренду такси',
    'водители такси украина', 'водії таксі',
    ...CITIES_UA.map(c => `оренда авто ${c}`), ...CITIES_RU.map(c => `аренда авто ${c}`),
    ...CITIES_UA.map(c => `таксі ${c}`),
  ];
  const S = { started: null, done: false, i: 0, chats: {}, log: [] };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const input = () => document.querySelector('input.input-search-input');
  const globalGroup = () => [...document.querySelectorAll('.search-group-contacts')].find(g => !g.classList.contains('hide') && /Global|Глобальн/i.test(g.innerText));

  function parseRow(e) {
    const txt = e.innerText.replace(/\s+/g, ' ').trim();
    const m = txt.match(/^(.*?)\s*@([A-Za-z0-9_]{4,})(?:,\s*([\d\s]+)\s*(members|subscribers|учасник\S*|підписник\S*))?/);
    return {
      peer: e.getAttribute('data-peer-id'),
      title: m ? m[1].trim() : txt.slice(0, 120),
      username: m ? m[2] : '',
      count: m && m[3] ? +m[3].replace(/\s/g, '') : null,
      kind: m && m[4] ? (/member|учасник/i.test(m[4]) ? 'group' : 'channel') : '',
    };
  }

  async function search(q) {
    const inp = input();
    inp.focus(); inp.value = q; inp.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(3500);
    const g = globalGroup();
    const more = g && [...g.querySelectorAll('[class*=show-more]')].find(b => /more|більше|ещё/i.test(b.innerText));
    if (more) { more.click(); await sleep(2500); }
    const g2 = globalGroup();
    const rows = g2 ? [...g2.querySelectorAll('a.row, .row-clickable')].map(parseRow) : [];
    for (const r of rows) {
      const k = r.peer || r.username; if (!k) continue;
      const c = S.chats[k] || (S.chats[k] = { ...r, queries: [] });
      if (!c.queries.includes(q)) c.queries.push(q);
    }
    S.log.push(`${q}: ${rows.length}`);
  }

  async function start(queries) {
    if (S.started && !S.done) return 'already running';
    Object.assign(S, { started: new Date().toISOString(), done: false, i: 0, chats: {}, log: [] });
    (async () => { for (const q of (queries || QUERIES)) { await search(q); S.i++; } S.done = true; })();
    return `started ${(queries || QUERIES).length} queries`;
  }
  const status = () => ({ done: S.done, i: S.i, total: QUERIES.length, chats: Object.keys(S.chats).length, last: S.log.slice(-3) });
  const stage = () => {
    const payload = { version: '1.0', started: S.started, finished: new Date().toISOString(), queries: QUERIES, log: S.log, chats: Object.values(S.chats) };
    let ta = document.getElementById('g24-export');
    if (!ta) { ta = document.createElement('textarea'); ta.id = 'g24-export'; ta.style.cssText = 'position:fixed;top:0;left:0;width:300px;height:80px;z-index:999999'; document.body.appendChild(ta); }
    ta.value = JSON.stringify(payload); ta.focus(); ta.select();
    return { chars: ta.value.length, chats: payload.chats.length };
  };
  return { QUERIES, start, status, stage, _state: S };
})();
'g24tg loaded';
