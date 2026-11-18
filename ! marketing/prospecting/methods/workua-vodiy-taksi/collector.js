// Work.ua «водій таксі» collector — версія 1.2 (2026-11-17: 1.1 fleet-regex з кирилицею; 1.2 телефони і контактна особа з вакансії)
// Як запускати: див. method.md поруч. Коротко:
//   1) відкрити будь-яку сторінку https://www.work.ua/ у Chrome;
//   2) виконати весь цей файл у консолі сторінки (або через javascript_tool агента);
//   3) g24wua.start()   — збір у фоні; g24wua.status() — прогрес, чекати done=true;
//   4) g24wua.stage()   — кладе повний JSON у textarea вгорі зліва і виділяє → Ctrl+C.
// Читає лише публічні HTML-сторінки, які бачить будь-який відвідувач. Телефони беремо з посилань tel: у HTML вакансії
// (вони вже є в сторінці, кнопка «Показати телефон» лише розкриває їх).

window.g24wua = (() => {
  const CONFIG = {
    version: '1.2',
    query: 'водій таксі',
    // slug перевірено по h1 сторінки «Водій таксі у <місті>» (2026-11-17).
    // Миколаїв, Чернівці, Херсон: Work.ua на 2026-11-17 не має вакансій за запитом (slug mykolayiv/chernivtsy/kherson → «немає»).
    cities: {
      'Київ': 'kyiv', 'Львів': 'lviv', 'Одеса': 'odesa', 'Дніпро': 'dnipro', 'Харків': 'kharkiv',
      'Вінниця': 'vinnytsya', 'Запоріжжя': 'zaporizhzhya', 'Миколаїв': 'mykolayiv', 'Івано-Франківськ': 'ivano-frankivsk',
      'Тернопіль': 'ternopil', 'Луцьк': 'lutsk', 'Чернівці': 'chernivtsy', 'Рівне': 'rivne', 'Черкаси': 'cherkasy',
      'Ужгород': 'uzhhorod', 'Житомир': 'zhytomyr', 'Кропивницький': 'kropyvnytskyi', 'Чернігів': 'chernihiv',
      'Суми': 'sumy', 'Хмельницький': 'khmelnytskyi', 'Херсон': 'kherson', 'Полтава': 'poltava',
    },
    maxPages: 20,
    delayMs: 2500,          // 2026-11-17: при 700 мс другий прогін поспіль отримав 403 + Cloudflare-перевірку
  };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const clean = s => (s || '').replace(/\s+/g, ' ').trim();
  const getDoc = async url => {
    for (let i = 0; i < 3; i++) {
      try { const r = await fetch(url); if (r.ok) { const t = await r.text(); return { t, d: new DOMParser().parseFromString(t, 'text/html') }; } } catch (e) {}
      await sleep(2000);
    }
    return null;
  };
  const q = encodeURIComponent('водій') + '+' + encodeURIComponent('таксі');
  const S = { started: null, done: false, log: [], jobs: {}, employers: {} };

  async function scanCity(city, slug) {
    let n = 0;
    for (let p = 1; p <= CONFIG.maxPages; p++) {
      const g = await getDoc(`/jobs-${slug}-${q}/?page=${p}`);
      if (!g) break;
      const h1 = clean(g.d.querySelector('h1')?.innerText);
      if (!/у |в /.test(h1)) break;               // невірний slug або порожня видача
      const cards = [...g.d.querySelectorAll('div.job-link')];
      if (!cards.length) break;
      let fresh = 0;
      for (const c of cards) {
        const a = c.querySelector('h2 a'); if (!a) continue;
        const href = a.getAttribute('href').split('?')[0];
        if (!/^\/jobs\/\d+\/$/.test(href)) continue;
        if (!S.jobs[href]) { S.jobs[href] = { href, city, title: clean(a.innerText), card: clean(c.innerText).slice(0, 400) }; fresh++; }
      }
      n += cards.length;
      await sleep(CONFIG.delayMs);
      if (!fresh) break;
    }
    S.log.push(`scan ${city}: ${n} cards`);
  }

  async function job(j) {
    const g = await getDoc(j.href);
    if (!g) { S.log.push(`job fail ${j.href}`); return; }
    j.cid = (g.t.match(/\/jobs\/by-company\/(\d+)\//) || [])[1] || '';
    j.desc = clean(g.d.querySelector('#job-description')?.innerText).slice(0, 1500);
    j.date = (clean(g.d.body.innerText).match(/Вакансія від ([^·]+)/) || [])[1] || '';
    const tels = [...g.d.querySelectorAll('a[href^="tel:"]')].map(a => a.getAttribute('href').replace(/\D/g, '')).filter(t => t.length >= 10);
    j.phones = [...new Set(tels)];
    const cp = g.d.getElementById('contact-phone');
    const li = cp && (cp.closest('li') || cp.parentElement);
    j.contactPerson = li ? clean(li.innerText.replace(/Показати телефон|Контакти|[+\d()\s-]{7,}/g, ' ')).replace(/[,\s]+$/, '').slice(0, 60) : '';
    j.salary = clean([...g.d.querySelectorAll('main li')].map(e => e.innerText).find(s => /грн/.test(s))).slice(0, 300);
  }

  async function company(cid) {
    const g = await getDoc(`/jobs/by-company/${cid}/`);
    if (!g) return { fail: true };
    const txt = clean((g.d.querySelector('main') || g.d.body).innerText);
    const size = (txt.match(/(?:менше|більше|до|від)?\s?\d+(?:\s?[–-]\s?\d+)?\s?співробітник\S*/i) || [''])[0].trim();
    const vac = +((txt.match(/Вакансії\s*(\d+)/) || [])[1] || 0);
    const fleetNums = [...txt.matchAll(/(\d[\d\s]{0,5})\+?\s*(?:авто(?:мобіл\S*)?|машин\S*)(?!\p{L})/giu)].map(m => +m[1].replace(/\s/g, '')).filter(n => n > 1 && n < 100000);
    return {
      name: clean(g.d.querySelector('h1')?.innerText),
      size, vacancies: vac, fleet: fleetNums.length ? Math.max(...fleetNums) : null,
      about: (txt.split('Про компанію')[1] || '').slice(0, 1000).trim(),
    };
  }

  async function start(cities) {
    if (S.started && !S.done) return 'already running';
    Object.assign(S, { started: new Date().toISOString(), done: false, log: [], jobs: {}, employers: {} });
    (async () => {
      const list = cities || Object.keys(CONFIG.cities);
      for (const c of list) await scanCity(c, CONFIG.cities[c]);
      const jobs = Object.values(S.jobs);
      S.log.push(`jobs ${jobs.length}`);
      for (const j of jobs) { await job(j); await sleep(CONFIG.delayMs); }
      const cids = [...new Set(jobs.map(j => j.cid).filter(Boolean))];
      S.log.push(`companies ${cids.length}`);
      for (const cid of cids) { S.employers[cid] = await company(cid); await sleep(CONFIG.delayMs); }
      S.done = true; S.log.push('done');
    })();
    return 'started';
  }

  const status = () => ({ started: S.started, done: S.done, jobs: Object.keys(S.jobs).length,
    jobsDetailed: Object.values(S.jobs).filter(j => 'cid' in j).length, companies: Object.keys(S.employers).length, log: S.log });
  const stage = () => {
    const payload = { config: CONFIG, started: S.started, finished: new Date().toISOString(), log: S.log,
      jobs: Object.values(S.jobs), employers: S.employers };
    let ta = document.getElementById('g24-export');
    if (!ta) { ta = document.createElement('textarea'); ta.id = 'g24-export'; ta.style.cssText = 'position:fixed;top:0;left:0;width:300px;height:80px;z-index:999999'; document.body.appendChild(ta); }
    ta.value = JSON.stringify(payload); ta.focus(); ta.select();
    return { chars: ta.value.length, jobs: payload.jobs.length, employers: Object.keys(S.employers).length };
  };
  return { CONFIG, start, status, stage, _state: S };
})();
'g24wua loaded';
