// Bolt vehicle marketplace (vehicle.bolt.eu) — версія 1.0 (2026-11-18)
// Читаємо лише те, що сторінка показує людині (прямі запити до API Bolt НЕ робимо).
// Для КОЖНОГО міста: відкрити https://vehicle.bolt.eu/city/<Місто> (Kyiv, Lviv, Dnipro, Uzhhorod, Ivano-Frankivsk, Rivne,
// Chernivtsi, Cherkasy, Kharkiv, Vinnytsia, Lutsk, Odesa, Ternopil, Poltava, Zhytomyr, Khmelnytskyi, Sumy, Chernihiv;
// невідомий slug перенаправляє на Kyiv), почекати 3 с, виконати цей файл → g24bolt('<Місто>').
// Скрипт прокручує список, по черзі відкриває картки, читає «Owner details» (власник, місто), ціну, тип, авто, і повертається назад.
// Результати накопичуються в sessionStorage['g24bolt'] (переживає переходи між містами).
// Наприкінці: g24boltStage() → textarea → Ctrl+A, Ctrl+C → prospecting/_raw/<дата>_bolt-marketplace.json
window.g24bolt = async (city) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const store = JSON.parse(sessionStorage.getItem('g24bolt') || '[]');
  const loadAll = async () => { for (let k = 0; k < 6; k++) { window.scrollTo(0, document.body.scrollHeight); await sleep(500); } window.scrollTo(0, 0); };
  await sleep(1500); await loadAll();
  const n = (document.body.innerText.match(/₴\/(week|month)/g) || []).length;
  for (let i = 0; i < n; i++) {
    await loadAll();
    const imgs = [...document.querySelectorAll('img')];
    if (i >= imgs.length) break;
    imgs[i].scrollIntoView(); await sleep(300); imgs[i].click();
    let t = '';
    for (let w = 0; w < 20; w++) { await sleep(400); t = document.body.innerText; if (/Owner details/i.test(t)) break; }
    const lines = (t.split(/Owner details:?/i)[1] || '').split('\n').map(s => s.trim()).filter(Boolean);
    const head = t.match(/(\d[\d\s]*₴)\s*\n\s*([^\n]*)/);
    store.push({ city, url: location.href, owner: lines[0] || '', ownerCity: lines[1] || '',
      price: head ? head[1] + ' ' + head[2] : '', title: (t.match(/\n([A-Z][^\n]+, (19|20)\d\d)\n/) || [])[1] || '',
      type: /Rent-to-buy/i.test(t) ? 'rent-to-buy' : 'rent' });
    sessionStorage.setItem('g24bolt', JSON.stringify(store));
    history.back(); await sleep(1500);
  }
  return { city, listings: n, total: store.length };
};
window.g24boltStage = () => {
  const rows = JSON.parse(sessionStorage.getItem('g24bolt') || '[]');
  let ta = document.getElementById('g24-export');
  if (!ta) { ta = document.createElement('textarea'); ta.id = 'g24-export'; ta.style.cssText = 'position:fixed;top:0;left:0;width:300px;height:80px;z-index:999999'; document.body.appendChild(ta); }
  ta.value = JSON.stringify({ version: '1.0', fetched: new Date().toISOString(), listings: rows }); ta.focus(); ta.select();
  return rows.length;
};
'g24bolt loaded';
