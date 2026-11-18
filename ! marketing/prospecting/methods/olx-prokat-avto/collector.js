// OLX «Прокат авто» collector — версія 1.3 (2026-11-17: 1.1 «Chevrolet Bolt» ≠ taxi; 1.3 телефони, написані в тексті оголошень)
// Як запускати: див. method.md поруч. Коротко:
//   1) відкрити будь-яку сторінку https://www.olx.ua/ у Chrome;
//   2) виконати весь цей файл у консолі сторінки (або через javascript_tool агента);
//   3) g24olx.start()            — запускає збір у фоні (кілька хвилин);
//   4) g24olx.status()           — прогрес; чекати, доки done=true;
//   5) g24olx.export(0, 60) ...  — забрати результат частинами (JSON-рядок).
// Використовує лише публічний JSON-API, яким користується сам сайт OLX. Номер за кнопкою «показати» НЕ відкриваємо
// (захист від ботів), але номери, які власник написав прямо в тексті оголошення, беремо.

window.g24olx = (() => {
  const CONFIG = {
    version: '1.3',
    category_id: 3440, // Транспорт → Прокат авто
    // city_id отримано з /api/v1/friendly-links/query-params/<slug>/ і перевірено по location.city.name
    // Київ + обласні центри. Виключено: Донецьк, Луганськ, Сімферополь (окупація).
    // Херсон (61) на 2026-11-17 має 0 оголошень у категорії — лишаємо, щоб ловити появу.
    cities: {
      'Київ': 268, 'Львів': 176, 'Одеса': 62, 'Дніпро': 121, 'Харків': 280,
      'Вінниця': 313, 'Запоріжжя': 194, 'Миколаїв': 106, 'Івано-Франківськ': 132,
      'Тернопіль': 362, 'Луцьк': 72, 'Чернівці': 369, 'Рівне': 124, 'Черкаси': 145,
      'Ужгород': 247, 'Житомир': 324, 'Кропивницький': 69, 'Чернігів': 178,
      'Суми': 47, 'Хмельницький': 101, 'Херсон': 61, 'Полтава': 284,
    },
    scanCap: 1000,          // API віддає максимум 1000 оголошень на запит-фільтр
    pageSize: 50,
    minAdsForProfile: 2,    // профіль продавця тягнемо, якщо в скані в нього ≥2 оголошень
    delayMs: 800,           // пауза між запитами, щоб не навантажувати сайт
  };
  const TAXI_RE = /такс|taxi|uklon|уклон|bolt|болт|uber|убер/i;
  // «Chevrolet Bolt» — модель авто, а не агрегатор Bolt: вирізаємо перед перевіркою (додано після прогону 2026-11-17)
  const TAXI = { test: s => TAXI_RE.test(String(s).replace(/(chevrolet|chevy|шевроле)\s*(bolt|болт)|bolt\s*e?u?v\b/gi, '')) };
  const BUYOUT = /викуп|выкуп|розстрочк|рассрочк/i;
  const PHONE_RE = /(?:\+?38)?[\s(]*0\d{2}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}(?!\d)/g;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const strip = s => (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const getJ = async url => { for (let i = 0; i < 3; i++) { try { const r = await fetch(url); if (r.ok) return await r.json(); } catch (e) {} await sleep(2000); } return null; };

  const S = { started: null, done: false, log: [], sellers: {}, results: [] };

  async function scanCity(city, cid) {
    let n = 0;
    for (let off = 0; off < CONFIG.scanCap; off += CONFIG.pageSize) {
      const r = await getJ(`/api/v1/offers/?offset=${off}&limit=${CONFIG.pageSize}&category_id=${CONFIG.category_id}&city_id=${cid}`);
      if (!r || !r.data || !r.data.length) break;
      for (const o of r.data) {
        if (!o.user || !o.user.id) continue;
        const k = o.user.id;
        const s = S.sellers[k] || (S.sellers[k] = { id: k, name: o.user.name, company: o.user.company_name || '', business: !!o.business, cities: {}, scanAds: new Set() });
        s.scanAds.add(o.id);
        s.cities[city] = (s.cities[city] || 0) + 1;
      }
      n += r.data.length;
      await sleep(CONFIG.delayMs);
    }
    S.log.push(`scan ${city}: ${n} ads`);
  }

  async function profile(s) {
    const r = await getJ(`/api/v1/offers/?user_id=${s.id}&limit=50`);
    if (!r) { S.log.push(`profile fail ${s.id}`); return; }
    const offers = r.data || [];
    const rent = offers.filter(o => o.category && o.category.id === CONFIG.category_id);
    const text = rent.map(o => o.title + ' ' + strip(o.description)).join(' ');
    const city = Object.entries(s.cities).sort((a, b) => b[1] - a[1])[0][0];
    S.results.push({
      key: `olx:${s.id}`,
      name: s.name, company: s.company, business: s.business,
      city,
      districts: [...new Set(rent.map(o => o.location && o.location.district && o.location.district.name).filter(Boolean))].join(', '),
      total_ads: r.metadata ? r.metadata.total_elements : offers.length,
      rent_ads: rent.length,
      taxi_hits: rent.filter(o => TAXI.test(o.title + ' ' + strip(o.description))).length,
      buyout: BUYOUT.test(text),
      titles: rent.slice(0, 8).map(o => o.title),
      phones: [...new Set((text.match(PHONE_RE) || []).map(t => t.replace(/\D/g, '')))],
      url: (rent[0] || offers[0] || {}).url || '',
      profile_url: `https://www.olx.ua/uk/list/user/${s.id}/`,
    });
  }

  async function start(cities) {
    if (S.started && !S.done) return 'already running';
    Object.assign(S, { started: new Date().toISOString(), done: false, log: [], sellers: {}, results: [] });
    (async () => {
      const list = cities || Object.keys(CONFIG.cities);
      for (const c of list) await scanCity(c, CONFIG.cities[c]);
      const cand = Object.values(S.sellers).filter(s => s.scanAds.size >= CONFIG.minAdsForProfile);
      S.log.push(`sellers ${Object.keys(S.sellers).length}, profiling ${cand.length}`);
      for (const s of cand) { await profile(s); await sleep(CONFIG.delayMs); }
      S.done = true; S.log.push('done');
    })();
    return 'started';
  }

  const status = () => ({ started: S.started, done: S.done, sellers: Object.keys(S.sellers).length, profiled: S.results.length, log: S.log });
  const exportPart = (offset = 0, limit = 60) => JSON.stringify({ config: CONFIG, started: S.started, total: S.results.length, rows: S.results.slice(offset, offset + limit) });
  // усі продавці зі скану (включно з тими, кого не профілювали) — для журналу registry/seen.csv
  // формат рядка: "user_id|місто|к-сть_оголошень_у_скані|ім'я"
  const exportSellers = (offset = 0, limit = 400) => {
    const all = Object.values(S.sellers);
    return JSON.stringify({ total: all.length, rows: all.slice(offset, offset + limit).map(s =>
      [s.id, Object.entries(s.cities).sort((a, b) => b[1] - a[1])[0][0], s.scanAds.size, (s.company || s.name || '').replace(/\|/g, '/')].join('|')) });
  };
  // Повне вивантаження через буфер обміну: кладе весь JSON у textarea і виділяє його.
  // Далі: Ctrl+C на сторінці → у PowerShell: Get-Clipboard -Raw | Out-File -Encoding utf8 prospecting/_raw/<дата>_olx-prokat-avto.json
  // (fetch на 127.0.0.1 зі сторінки OLX блокується дозволом Chrome «доступ до локальної мережі», тому не використовуємо)
  const stage = () => {
    const payload = { config: CONFIG, started: S.started, finished: new Date().toISOString(), log: S.log, rows: S.results,
      sellers: JSON.parse(exportSellers(0, 1e9)).rows };
    let ta = document.getElementById('g24-export');
    if (!ta) { ta = document.createElement('textarea'); ta.id = 'g24-export'; ta.style.cssText = 'position:fixed;top:0;left:0;width:300px;height:80px;z-index:999999'; document.body.appendChild(ta); }
    ta.value = JSON.stringify(payload); ta.focus(); ta.select();
    return { chars: ta.value.length, rows: payload.rows.length, sellers: payload.sellers.length };
  };
  return { CONFIG, start, status, export: exportPart, exportSellers, stage, _state: S };
})();
'g24olx loaded';
