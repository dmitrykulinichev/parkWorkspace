"""Злиття каталогу Uklon «Пропозиції автопарків» у registry/clients.csv і seen.csv — версія 1.0 (2026-11-18).

Usage (з папки `! marketing`):
    python -I prospecting/methods/uklon-fleets/merge.py prospecting/_raw/<дата>_uklon-fleets.json [--dry-run]

Правила:
  - одна сторінка каталогу = одна вакансія парку; ключ uklonfleet:<slug>;
  - бренд = назва без міста («DriveMe Львів» → «driveme»); бренд на ≥ 3 сторінках каталогу або вже C у реєстрі → C (мережа, орієнтир);
  - склейка: ключ → бренд (нормалізована назва, будь-яке місто: це назви брендів, не загальні слова) → нічого;
  - уже в реєстрі → «де_рекламується» += «Uklon каталог автопарків (місто)», відмітка з умовами в нотатки;
  - новий → B «парк-партнер Uklon (каталог)»: розмір невідомий, але парк платить Uklon за розміщення; телефону немає
    (контакт — лише форма заявки на сторінці; ми її НЕ заповнюємо) → стадія «не перевірено», наступна дія «знайти контакт».
"""
import collections, csv, datetime, json, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
REG, SEEN = ROOT / "registry" / "clients.csv", ROOT / "registry" / "seen.csv"
METHOD = "uklon-fleets"
SEEN_FIELDS = ["ключ_джерела", "метод", "місто", "назва", "вперше", "востаннє", "оголошень_востаннє", "рішення", "client_id"]
CITIES = {"Київ": r"київ|kyiv", "Львів": r"львів|lviv", "Одеса": r"одес", "Дніпро": r"дніпр", "Харків": r"харків",
          "Вінниця": r"вінниц", "Запоріжжя": r"запоріж", "Миколаїв": r"миколаїв", "Івано-Франківськ": r"франківськ",
          "Тернопіль": r"тернопіл", "Луцьк": r"луцьк|lutsk", "Чернівці": r"чернівц", "Рівне": r"рівне|рівного", "Черкаси": r"черкас",
          "Ужгород": r"ужгород", "Мукачево": r"мукачев", "Житомир": r"житомир", "Кропивницький": r"кропивницьк", "Чернігів": r"чернігів",
          "Суми": r"\bсуми\b|\bсум\b|сумах", "Хмельницький": r"хмельницьк", "Херсон": r"херсон", "Полтава": r"полтав",
          "Кривий Ріг": r"кривий ріг|кривого рогу|кривому розі", "Кам'янське": r"кам.янськ", "Кам'янець-Подільський": r"кам.янець"}
CITY_WORDS = re.compile(r"\b(" + "|".join(CITIES) + r"|на пр\.?поля|на підстанції|lutsk|lviv|kyiv)\b", re.I)
GENERIC = set("taxi таксі park парк auto авто avtopark автопарк car cars drive".split())


def read(p):
    if not p.exists():
        return []
    with open(p, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f, delimiter=";"))


def write(p, rows, fields):
    with open(p, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, delimiter=";", extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in fields})


def norm(s):
    s = (s or "").lower().replace("ʼ", "'").replace("’", "'")
    s = re.sub(r"\b(тов|фоп|флп|ооо|llc)\b|[«»\"'.,()|•—–\-]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def brand(name):
    b = norm(CITY_WORDS.sub(" ", name or ""))
    return b


def add_list(row, field, items, sep):
    cur = [x.strip() for x in (row.get(field) or "").split(sep.strip()) if x.strip()]
    for x in items:
        if x and x not in cur:
            cur.append(x)
    row[field] = sep.join(cur)


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    src, dry = sys.argv[1], "--dry-run" in sys.argv
    data = json.load(open(src, encoding="utf-8"))
    today = datetime.date.today().isoformat()
    rows = read(REG)
    fields = list(rows[0].keys())
    by_key = {k: r for r in rows for k in (r.get("ключ_джерела") or "").split()}
    by_brand = collections.defaultdict(list)
    for r in rows:
        b = brand(r["назва"])
        if b and len(b) >= 3 and not all(w in GENERIC for w in b.split()):
            by_brand[b].append(r)
    pages_per_brand = collections.Counter(brand(f["name"]) for f in data["fleets"])
    next_id = max(int(r["id"]) for r in rows) + 1
    seen = {s["ключ_джерела"]: s for s in read(SEEN)}
    st = collections.Counter()

    for f in data["fleets"]:
        key = f"uklonfleet:{f['slug']}"
        body = f["text"].split("Подати заявку")[0]
        low = (f["name"] + " " + body).lower()
        cities = [c for c, rx in CITIES.items() if re.search(rx, low)]
        city = next((c for c in cities if re.search(CITIES[c], f["name"].lower())), cities[0] if cities else "")
        lines = [l for l in body.split("\n")[5:] if l and l not in ("Умови співпраці", "Вимоги до водія")]
        cond = " · ".join(lines[:6])[:300]
        b = brand(f["name"])
        hits = by_brand.get(b, [])
        if not hits and len(b.replace(" ", "")) >= 5:   # «HooCars» ⊂ «Hoocars Rent», «AutoHaven» ⊂ «Касьянова… (AutoHaven)» (2026-11-18)
            bb = b.replace(" ", "")
            hits = [r for r in rows if bb in norm(r["назва"]).replace(" ", "") and r.get("стадія") != "не цільовий"]
        hit = by_key.get(key) or (next((h for h in hits if h["місто"] == city), None) or (hits[0] if hits else None))
        label = f"Uklon каталог автопарків ({city or '?'})"
        network = pages_per_brand[b] >= 3 or any(h["пріоритет"] == "C" for h in hits)
        note = f"Uklon каталог: {f['name']} | {cond} | {f['url']}"
        if hit:
            if key not in (hit.get("ключ_джерела") or "").split():
                hit["ключ_джерела"] = (hit.get("ключ_джерела", "") + " " + key).strip()
            add_list(hit, "де_рекламується", [label], "; ")
            if f"[{today} Uklon каталог: {f['name']}" not in hit.get("нотатки", ""):
                hit["нотатки"] = f"[{today} {note}] " + hit.get("нотатки", "")
            dec, cid = "у реєстрі (позначено)", hit["id"]
            st["уже були"] += 1
        else:
            prio = "C" if network else "B"
            cid = f"{next_id:03d}"
            next_id += 1
            row = {k: "" for k in fields}
            row.update({"id": cid, "назва": f["name"][:80], "місто": city, "url_оголошення": f["url"], "ключ_джерела": key,
                        "перевірено": "ні", "сегмент": "мережа парків-партнерів Uklon (орієнтир)" if network else "парк-партнер Uklon (каталог)",
                        "джерело": "Uklon каталог автопарків", "де_рекламується": label, "пріоритет": prio, "стадія": "не перевірено",
                        "наступна_дія": "орієнтир, не писати (фільтр пізніше)" if prio == "C" else "знайти контакт (телефон) за назвою",
                        "дата_наступної": "", "нотатки": note})
            rows.append(row)
            by_key[key] = row
            if b:
                by_brand[b].append(row)
            dec = f"додано ({prio})"
            st[f"додано {prio}"] += 1
        s = seen.get(key) or {"ключ_джерела": key, "метод": METHOD, "вперше": today}
        s.update({"місто": city, "назва": f["name"][:80], "востаннє": today, "оголошень_востаннє": 1, "рішення": dec, "client_id": cid})
        seen[key] = s

    print(f"сторінок каталогу: {len(data['fleets'])}; " + "; ".join(f"{k}: {v}" for k, v in sorted(st.items())))
    if not dry:
        write(REG, rows, fields)
        write(SEEN, list(seen.values()), SEEN_FIELDS)
        subprocess.run([sys.executable, "-I", str(ROOT / "registry" / "render_md.py")], check=True)


if __name__ == "__main__":
    main()
