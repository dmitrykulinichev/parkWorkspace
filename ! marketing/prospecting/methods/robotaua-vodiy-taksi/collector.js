// Robota.ua «водій таксі» collector — версія 1.1 (2026-11-17: 1.1 телефон контактної особи; кількість вакансій через /company/<id>/vacancies)
// Як запускати: див. method.md поруч. Коротко:
//   1) відкрити будь-яку сторінку https://robota.ua/ у Chrome;
//   2) виконати весь цей файл у консолі сторінки (або через javascript_tool агента);
//   3) g24rua.start() — збір у фоні; g24rua.status() — чекати done=true;
//   4) g24rua.stage() — повний JSON у textarea вгорі зліва, виділений → Ctrl+C.
// Використовує публічний JSON-API, яким користується сам сайт (api.robota.ua). Телефон контактної особи API віддає відкрито — беремо.

window.g24rua = (() => {
  const API = 'https://api.robota.ua';
  const CONFIG = {
    version: '1.1',
    query: 'водій таксі',
    // id з https://ua-api.robota.ua/dictionary/cities-with-regions (поле ua), перевірено 2026-11-17
    cities: {
      'Київ': 1, 'Львів': 2, 'Одеса': 3, 'Дніпро': 4, 'Харків': 21, 'Вінниця': 5, 'Запоріжжя': 9, 'Миколаїв': 15,
      'Івано-Франківськ': 10, 'Тернопіль': 20, 'Луцьк': 14, 'Чернівці': 26, 'Рівне': 18, 'Черкаси': 24, 'Ужгород': 28,
      'Житомир': 7, 'Кропивницький': 11, 'Чернігів': 25, 'Суми': 19, 'Хмельницький': 23, 'Херсон': 22, 'Полтава': 17,
    },
    pageSize: 40,
    maxPages: 25,
    delayMs: 600,
  };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const strip = s => (s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  const getJ = async url => { for (let i = 0; i < 3; i++) { try { const r = await fetch(url); if (r.ok) return await r.json(); } catch (e) {} await sleep(2000); } return null; };
  const S = { started: null, done: false, log: [], jobs: {}, employers: {} };

  async function scanCity(city, cid) {
    let n = 0;
    for (let p = 0; p < CONFIG.maxPages; p++) {
      const r = await getJ(`${API}/vacancy/search?keyWords=${encodeURIComponent(CONFIG.query)}&cityId=${cid}&page=${p}&count=${CONFIG.pageSize}`);
      if (!r || !r.documents || !r.documents.length) break;
      for (const d of r.documents) {
        if (d.cityId !== cid) continue;            // пошук підмішує інші міста/«вся Україна» — беремо тільки своє місто
        if (!S.jobs[d.id]) S.jobs[d.id] = { id: d.id, city, title: d.name, cid: d.notebookId || 0, company: d.companyName || '',
          salary: [d.salaryFrom, d.salaryTo].filter(Boolean).join('–') + (d.salaryComment ? ' ' + d.salaryComment : ''),
          date: d.date, short: strip(d.shortDescription).slice(0, 400) };
      }
      n += r.documents.length;
      await sleep(CONFIG.delayMs);
      if ((p + 1) * CONFIG.pageSize >= r.total) break;
    }
    S.log.push(`scan ${city}: ${n} docs`);
  }

  async function job(j) {
    const v = await getJ(`${API}/vacancy?id=${j.id}`);
    if (!v) { S.log.push(`job fail ${j.id}`); return; }
    j.desc = strip(v.description).slice(0, 1500);
    j.contactPerson = v.contactPerson || '';
    j.phones = [v.contactPhone].concat((strip(v.description).match(/(?:\+?38)?\s?\(?0\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g) || [])).filter(Boolean).map(t => t.replace(/\D/g, ''));       // ім'я контактної особи (для склейки з іншими джерелами і 🚩)
    j.isAgency = !!v.isAgency;
    j.address = strip(v.vacancyAddress || '').slice(0, 150);
  }

  async function company(cid) {
    const c = await getJ(`${API}/company/${cid}`);
    // увага: /vacancy/search?notebookId=… фільтр ІГНОРУЄ (віддає total усього сайту) — тому окремий ендпоінт компанії
    const s = await getJ(`${API}/company/${cid}/vacancies?page=0&count=1`);
    if (!c) return { fail: true };
    return { name: c.name, countEmployeeId: c.countEmployeeId, site: c.site || '', verified: !!c.verified,
      address: c.fullAddress || '', description: strip(c.description).slice(0, 1200), vacancies: s ? s.total : null };
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
    jobsDetailed: Object.values(S.jobs).filter(j => 'desc' in j).length, companies: Object.keys(S.employers).length, log: S.log });
  const stage = () => {
    const payload = { config: CONFIG, started: S.started, finished: new Date().toISOString(), log: S.log, jobs: Object.values(S.jobs), employers: S.employers };
    let ta = document.getElementById('g24-export');
    if (!ta) { ta = document.createElement('textarea'); ta.id = 'g24-export'; ta.style.cssText = 'position:fixed;top:0;left:0;width:300px;height:80px;z-index:999999'; document.body.appendChild(ta); }
    ta.value = JSON.stringify(payload); ta.focus(); ta.select();
    return { chars: ta.value.length, jobs: payload.jobs.length, employers: Object.keys(S.employers).length };
  };
  return { CONFIG, start, status, stage, _state: S };
})();
'g24rua loaded';
