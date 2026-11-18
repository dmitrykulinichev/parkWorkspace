// OLX «Робота»: вакансії водіїв таксі — версія 1.0 (2026-11-18)
// Де: будь-яка сторінка https://www.olx.ua/ у Chrome (логін не потрібен). Виконати файл у консолі (агент: javascript_tool), далі
//   g24olxj.start()  — для кожного запиту з QUERIES гортає публічний JSON-API сайту (/api/v1/offers/, category_id=6 «Робота»)
//                      і збирає вакансії; потім для кожного роботодавця бере кількість його оголошень (/api/v1/offers/?user_id=);
//   g24olxj.status(); g24olxj.stage() → textarea → Ctrl+A, Ctrl+C → prospecting/_raw/<дата>_olx-robota-taksi.json
// Кнопку «показати телефон» НЕ натискаємо (захист від ботів), але номери, написані в тексті вакансії, беремо.
// Ключ роботодавця = olx:<user_id> — той самий, що в методі olx-prokat-avto, тож власники з «Прокату» склеюються автоматично.

window.g24olxj = (() => {
  const CONFIG = { version: '1.0', category_id: 6, pageSize: 50, scanCap: 1000, delayMs: 800,
    QUERIES: ['таксі', 'uklon', 'bolt', 'uber', 'водій на авто компанії', 'автопарк'] };
  const TAXI = /такс|taxi|uklon|уклон|bolt|болт|uber|убер|автопарк/i;
  const PHONE_RE = /(?:\+?38)?[\s(]*0\d{2}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}(?!\d)/g;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const strip = s => (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const getJ = async url => { for (let i = 0; i < 3; i++) { try { const r = await fetch(url); if (r.ok) return await r.json(); } catch (e) {} await sleep(2000); } return null; };
  const S = { started: null, done: false, log: [], offers: {}, users: {} };

  async function scan(q) {
    let n = 0;
    for (let off = 0; off < CONFIG.scanCap; off += CONFIG.pageSize) {
      const r = await getJ(`/api/v1/offers/?offset=${off}&limit=${CONFIG.pageSize}&category_id=${CONFIG.category_id}&query=${encodeURIComponent(q)}`);
      const data = (r && r.data) || [];
      for (const o of data) {
        const desc = strip(o.description);
        if (!TAXI.test(o.title + ' ' + desc)) continue;
        if (S.offers[o.id]) { if (!S.offers[o.id].queries.includes(q)) S.offers[o.id].queries.push(q); continue; }
        const sal = (o.params || []).find(p => p.key === 'salary');
        S.offers[o.id] = { id: o.id, url: o.url, title: o.title, created: o.created_time, city: o.location && o.location.city && o.location.city.name,
          region: o.location && o.location.region && o.location.region.name, category: o.category && o.category.id, business: o.business,
          user_id: o.user && o.user.id, user_name: o.user && o.user.name, user_company: o.user && o.user.company_name,
          salary: sal ? (sal.value && (sal.value.label || JSON.stringify(sal.value))) : '', desc: desc.slice(0, 1500),
          phones: [...new Set((desc.match(PHONE_RE) || []).map(p => p.replace(/\D/g, '')))], queries: [q] };
        n++;
      }
      if (data.length < CONFIG.pageSize) break;
      await sleep(CONFIG.delayMs);
    }
    S.log.push(`${q}: +${n}`);
  }

  async function users() {
    const ids = [...new Set(Object.values(S.offers).map(o => o.user_id).filter(Boolean))];
    for (const id of ids) {
      const r = await getJ(`/api/v1/offers/?user_id=${id}&limit=50`);
      const offs = (r && r.data) || [];
      S.users[id] = { id, total_ads: r && r.metadata ? r.metadata.total_elements : offs.length,
        jobs: offs.filter(o => o.category && o.category.type === 'job').length,
        rentals: offs.filter(o => o.category && o.category.id === 3440).length,
        cities: [...new Set(offs.map(o => o.location && o.location.city && o.location.city.name).filter(Boolean))].slice(0, 10),
        titles: offs.slice(0, 8).map(o => o.title) };
      await sleep(CONFIG.delayMs);
    }
    S.log.push(`users: ${ids.length}`);
  }

  async function start() {
    if (S.started && !S.done) return 'already running';
    Object.assign(S, { started: new Date().toISOString(), done: false, log: [], offers: {}, users: {} });
    (async () => { for (const q of CONFIG.QUERIES) { try { await scan(q); } catch (e) { S.log.push(`${q}: error ${e}`); } }
      try { await users(); } catch (e) { S.log.push('users error ' + e); } S.done = true; })();
    return 'started';
  }
  const status = () => ({ done: S.done, offers: Object.keys(S.offers).length, users: Object.keys(S.users).length, last: S.log.slice(-4) });
  const stage = () => {
    const payload = { version: CONFIG.version, started: S.started, finished: new Date().toISOString(), config: CONFIG, log: S.log,
      offers: Object.values(S.offers), users: Object.values(S.users) };
    let ta = document.getElementById('g24-export');
    if (!ta) { ta = document.createElement('textarea'); ta.id = 'g24-export'; ta.style.cssText = 'position:fixed;top:0;left:0;width:300px;height:80px;z-index:999999'; document.body.appendChild(ta); }
    ta.value = JSON.stringify(payload); ta.focus(); ta.select();
    return { chars: ta.value.length, offers: payload.offers.length, users: payload.users.length };
  };
  return { CONFIG, start, status, stage, _state: S };
})();
'g24olxj loaded';
