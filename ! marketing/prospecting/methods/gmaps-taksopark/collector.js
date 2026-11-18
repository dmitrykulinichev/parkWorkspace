// Google Maps: таксопарки / автопарки / оренда авто під таксі по містах — версія 1.0 (2026-11-17)
// Де: https://www.google.com/maps/?hl=uk у Chrome (логін не потрібен). Виконати файл у консолі, далі
//   g24gm.start()  — для кожного запиту з QUERIES вводить текст у поле пошуку Карт (SPA, без перезавантаження),
//                    прокручує список результатів до кінця (або 25 разів) і збирає картки;
//   g24gm.status(); g24gm.stage() → textarea → Ctrl+C → prospecting/_raw/<дата>_gmaps-taksopark.json
// Картка: назва, place-id (з посилання /maps/place/...!1s<id>), рейтинг і к-сть відгуків, категорія, адреса, телефон, сайт.
// Тільки публічна видача Карт; нічого не пишемо, відгуки не залишаємо.

window.g24gm = (() => {
  const CITIES = ['Київ', 'Львів', 'Одеса', 'Дніпро', 'Харків', 'Вінниця', 'Запоріжжя', 'Миколаїв', 'Івано-Франківськ', 'Тернопіль',
    'Луцьк', 'Чернівці', 'Рівне', 'Черкаси', 'Ужгород', 'Житомир', 'Кропивницький', 'Чернігів', 'Суми', 'Хмельницький', 'Херсон', 'Полтава'];
  const QUERIES = [...CITIES.map(c => ({ q: `таксопарк ${c}`, city: c })), ...CITIES.map(c => ({ q: `оренда авто під таксі ${c}`, city: c }))];
  const S = { started: null, done: false, i: 0, places: {}, log: [] };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const PHONE = /(?:\+?38\s?)?\(?0\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/;

  async function search(q) {
    const inp = document.querySelector('input#searchboxinput, input[name=q]');
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    inp.focus(); set.call(inp, q); inp.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(400);
    (document.querySelector('#searchbox-searchbutton, button[aria-label="Пошук"], button[aria-label="Search"]') || {}).click?.();
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    await sleep(4500);
  }

  async function collect({ q, city }) {
    await search(q);
    let feed = null;
    for (let i = 0; i < 8 && !feed; i++) { feed = document.querySelector('div[role=feed]'); if (!feed) await sleep(1000); }  // список вантажиться довше 4,5 с
    if (!feed) {
      // один результат: Google одразу відкриває картку місця (h1 + кнопки з data-item-id)
      const h1 = document.querySelector('div[role=main] h1');
      if (!h1) { S.log.push(`${q}: no list`); return; }
      const pid = (location.href.match(/!1s([^!]+)/) || [])[1] || h1.innerText.trim();
      const phone = (document.querySelector('button[data-item-id^="phone"]')?.getAttribute('data-item-id') || '').replace(/^phone:tel:/, '');
      const p = S.places[pid] || (S.places[pid] = { pid, name: h1.innerText.trim(), queries: [], cities: [] });
      Object.assign(p, { rating: (document.querySelector('div.F7nice')?.innerText || '').replace(/\s+/g, ''),
        category: document.querySelector('button[jsaction*="category"]')?.innerText || '',
        address: document.querySelector('button[data-item-id="address"]')?.innerText.trim() || '',
        phone: p.phone || phone, site: p.site || document.querySelector('a[data-item-id="authority"]')?.href || '', url: location.href.split('?')[0] });
      if (!p.queries.includes(q)) p.queries.push(q);
      if (!p.cities.includes(city)) p.cities.push(city);
      S.log.push(`${q}: 1 (single place)`);
      return;
    }
    for (let i = 0; i < 25; i++) {
      feed.scrollTop = feed.scrollHeight; await sleep(1500);
      if (/кінця списку|end of the list/i.test(feed.innerText)) break;
    }
    let n = 0;
    for (const a of feed.querySelectorAll('a[href*="/maps/place/"]')) {
      const c = a.parentElement;
      const lines = c.innerText.split('\n').map(s => s.trim()).filter(Boolean);
      const pid = (a.href.match(/!1s([^!]+)/) || [])[1] || a.getAttribute('aria-label');
      const rating = lines.find(l => /^\d[,.]\d\s*\(\d[\d\s]*\)$/.test(l)) || (lines.find(l => /Немає відгуків|No reviews/.test(l)) ? '0' : '');
      const catAddr = lines.find(l => l.includes(' · ') && !PHONE.test(l)) || '';
      const phone = (lines.find(l => PHONE.test(l)) || '').match(PHONE)?.[0] || '';
      const site = [...c.querySelectorAll('a[href^="http"]')].map(x => x.href).find(h => !/google\./.test(h)) || '';
      const p = S.places[pid] || (S.places[pid] = { pid, name: a.getAttribute('aria-label'), queries: [], cities: [] });
      Object.assign(p, { rating, category: catAddr.split(' · ')[0] || '', address: catAddr.split(' · ').slice(1).join(' · '),
        phone: p.phone || phone, site: p.site || site, url: a.href.split('?')[0] });
      if (!p.queries.includes(q)) p.queries.push(q);
      if (!p.cities.includes(city)) p.cities.push(city);
      n++;
    }
    S.log.push(`${q}: ${n}`);
  }

  async function start(list) {
    if (S.started && !S.done) return 'already running';
    Object.assign(S, { started: new Date().toISOString(), done: false, i: 0, places: {}, log: [] });
    (async () => { for (const x of (list || QUERIES)) { try { await collect(x); } catch (e) { S.log.push(`${x.q}: error ${e}`); } S.i++; } S.done = true; })();
    return `started ${(list || QUERIES).length}`;
  }
  const status = () => ({ done: S.done, i: S.i, total: QUERIES.length, places: Object.keys(S.places).length, last: S.log.slice(-3) });
  const stage = () => {
    const payload = { version: '1.0', started: S.started, finished: new Date().toISOString(), queries: QUERIES, log: S.log, places: Object.values(S.places) };
    let ta = document.getElementById('g24-export');
    if (!ta) { ta = document.createElement('textarea'); ta.id = 'g24-export'; ta.style.cssText = 'position:fixed;top:0;left:0;width:300px;height:80px;z-index:999999'; document.body.appendChild(ta); }
    ta.value = JSON.stringify(payload); ta.focus(); ta.select();
    return { chars: ta.value.length, places: payload.places.length };
  };
  return { QUERIES, start, status, stage, _state: S };
})();
'g24gm loaded';
