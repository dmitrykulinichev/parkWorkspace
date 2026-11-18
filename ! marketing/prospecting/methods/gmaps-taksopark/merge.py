"""Merge Google Maps (collector.js) into registry/clients.csv and registry/seen.csv.

Usage (з папки `! marketing`):
    python -I prospecting/methods/gmaps-taksopark/merge.py prospecting/_raw/<date>_gmaps-taksopark.json [--dry-run]

Правила (версія 1.0) — реєстр один, нікого не відсіюємо, крім явно чужого:
  - вантажне таксі / евакуатор / перевезення вантажів → лише seen «не наше (вантажне)»; автобуси/пасажирські перевезення — так само;
    звичайний прокат авто без таксі/Uklon/Bolt/Uber/«водієм»/автопарку → лише seen (рішення власника g24: потрібні саме парки)
  - старі АТП (ВАТ/ПАТ/ПРАТ/ОАО/ТДВ) → C «АТП / колишній держ. таксопарк»
  - тип за назвою і категорією:
      ПАРК (автопарк/таксопарк/park/оренда/аренда/прокат/«робота водієм»/партнер Uklon|Bolt|Uber) → «парк під таксі (Google Maps)»;
      «Служба таксі» без ознак парку → «служба таксі (диспетчерська)» — пріоритет C (орієнтир/інший сегмент), але в реєстрі;
      бренди агрегаторів (Uklon, Bolt, Uber, OnTaxi як офіс) → C «офіс агрегатора»
  - ключ_джерела gmaps:<place-id>; склейка: телефон → назва (не загальна) у тому ж місті
  - вже в реєстрі → «де_рекламується» += «Google Maps (місто)», відмітка з рейтингом/відгуками
  - пріоритет: ПАРК з ≤ 30 відгуків → A (малий/середній), ПАРК з > 30 відгуків → B (уточнити розмір), служби/офіси → C
    (к-сть відгуків — грубий проксі розміру: великі мережі мають сотні відгуків)
"""
import csv, json, sys, datetime, pathlib, re, subprocess

ROOT = pathlib.Path(__file__).resolve().parents[3]
REG = ROOT / "registry" / "clients.csv"
SEEN = ROOT / "registry" / "seen.csv"
METHOD = "gmaps-taksopark"
SEEN_FIELDS = ["ключ_джерела", "метод", "місто", "назва", "вперше", "востаннє", "оголошень_востаннє", "рішення", "client_id"]
CARGO = re.compile(r"вантаж|грузов|евакуат|эвакуат|перевезен.{0,10}вантаж|грузчик|вантажник|переїзд|переезд|газел", re.I)
PARK = re.compile(r"автопарк|таксопарк|taxopark|park|парк|оренд|аренд|прокат|rent|робота водієм|работа водител|водієм|партнер|"
                  r"підключення|подключение|fleet|флот", re.I)
AGGR = re.compile(r"^\s*(uklon|уклон|bolt|болт|uber|убер|ontaxi|он такси|он таксі|opti)\b", re.I)
TAXI_WORD = re.compile(r"такс|taxi|uklon|уклон|bolt|болт|uber|убер|водієм|водител|водій|автопарк|таксопарк|taxopark|fleet", re.I)
RENTAL = re.compile(r"прокат|rent|оренд|аренд", re.I)
BUS = re.compile(r"автобус|bus|пасажирськ|пассажирск|маршрут", re.I)
OLD_ATP = re.compile(r"(ват|пат|прат|оао|зао|тдв)|атп|атп-|автотранспортне підприємство", re.I)
GENERIC = set("таксі такси taxi автопарк таксопарк оренда аренда авто під под служба київ львів одеса дніпро харків полтава".split())


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


def add_list(row, field, items, sep):
    cur = [x.strip() for x in (row.get(field) or "").split(sep.strip()) if x.strip()]
    for x in items:
        if x and x not in cur:
            cur.append(x)
    row[field] = sep.join(cur)


def norm_phone(t):
    d = re.sub(r"\D", "", t or "")
    if len(d) == 10 and d.startswith("0"):
        d = "38" + d
    return "+" + d if len(d) == 12 and d.startswith("380") else ""


def norm(s):
    s = re.sub(r"\b(тов|фоп|флп|пп|llc|ооо)\b|[«»\"'.,()|—–-]", " ", (s or "").lower())
    return re.sub(r"\s+", " ", s).strip()


def reviews(rating):
    m = re.search(r"\((\d[\d\s]*)\)", rating or "")
    return int(re.sub(r"\s", "", m.group(1))) if m else 0


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    src, dry = sys.argv[1], "--dry-run" in sys.argv
    data = json.load(open(src, encoding="utf-8"))
    today = datetime.date.today().isoformat()
    rows = read(REG)
    fields = list(rows[0].keys())
    by_key = {k: r for r in rows for k in (r.get("ключ_джерела") or "").split()}
    by_phone = {p.strip(): r for r in rows for p in (r.get("телефон") or "").split(",") if p.strip()}
    by_name = {}
    for r in rows:
        by_name.setdefault((norm(r["назва"]), r["місто"]), r)
    next_id = max(int(r["id"]) for r in rows) + 1
    seen = {s["ключ_джерела"]: s for s in read(SEEN)}
    st = {"додано A": 0, "додано B": 0, "додано C": 0, "уже були": 0, "вантажне": 0}

    for p in data["places"]:
        key = f"gmaps:{p['pid']}"
        name, cat = p["name"] or "", p.get("category", "")
        city = p["cities"][0] if p.get("cities") else ""
        label = f"Google Maps ({', '.join(p.get('cities', []))})"
        phone = norm_phone(p.get("phone"))
        rev = reviews(p.get("rating"))
        dec, cid = "", ""
        if CARGO.search(name + " " + cat):
            dec = "не наше: вантажне таксі/перевезення"
            st["вантажне"] += 1
        elif BUS.search(name + " " + cat):
            dec = "не наше: автобусні/пасажирські перевезення"
            st["вантажне"] += 1
        elif (RENTAL.search(name) or "Прокат" in cat) and not TAXI_WORD.search(name):
            dec = "не наше: звичайний прокат авто (таксі не згадано)"
            st["прокат"] = st.get("прокат", 0) + 1
        else:
            park = bool(PARK.search(name))
            aggr = bool(AGGR.search(name))
            old = bool(OLD_ATP.search(name))
            prio = "C" if (aggr or old or not park) else ("A" if rev <= 30 else "B")
            seg = ("офіс агрегатора" if aggr else "АТП / колишній держ. таксопарк" if old else
                   "парк під таксі (Google Maps)" if park else "служба таксі (диспетчерська)")
            nm = norm(name)
            hit = by_key.get(key) or (by_phone.get(phone) if phone else None) or \
                  (by_name.get((nm, city)) if nm and not all(w in GENERIC for w in nm.split()) else None)
            if hit:
                if key not in (hit.get("ключ_джерела") or "").split():
                    hit["ключ_джерела"] = (hit.get("ключ_джерела", "") + " " + key).strip()
                add_list(hit, "де_рекламується", [label], "; ")
                add_list(hit, "телефон", [phone], ", ")
                mark = f"[{today} Google Maps: {p.get('rating') or 'без відгуків'}, {p.get('address','')[:40]}, {p.get('site','')[:40]}]"
                if f"[{today} Google Maps" not in hit.get("нотатки", ""):
                    hit["нотатки"] = (mark + " " + hit.get("нотатки", "")).strip()
                dec, cid = "у реєстрі (позначено)", hit["id"]
                st["уже були"] += 1
            else:
                cid = f"{next_id:03d}"
                next_id += 1
                row = {k: "" for k in fields}
                row.update({
                    "id": cid, "назва": name[:80], "місто": city, "url_оголошення": p.get("url", ""), "ключ_джерела": key,
                    "перевірено": "так" if phone else "ні", "сегмент": seg, "джерело": "Google Maps",
                    "де_рекламується": label, "пріоритет": prio, "стадія": "перевірено" if phone else "не перевірено",
                    "наступна_дія": "орієнтир, не писати (фільтр пізніше)" if prio == "C" else "перше повідомлення / дзвінок (телефон з Карт)",
                    "дата_наступної": "" if prio == "C" else today,
                    "нотатки": f"рейтинг: {p.get('rating') or '—'} | категорія: {cat} | адреса: {p.get('address','')} | сайт: {p.get('site') or '—'}",
                })
                add_list(row, "телефон", [phone], ", ")
                rows.append(row)
                by_key[key] = row
                if phone:
                    by_phone.setdefault(phone, row)
                by_name.setdefault((nm, city), row)
                dec = f"додано ({prio})"
                st[f"додано {prio}"] += 1
        s = seen.get(key) or {"ключ_джерела": key, "метод": METHOD, "вперше": today}
        s.update({"місто": city, "назва": name[:80], "востаннє": today, "оголошень_востаннє": rev, "рішення": dec, "client_id": cid})
        seen[key] = s

    print(f"місць: {len(data['places'])}; " + "; ".join(f"{k}: {v}" for k, v in st.items()))
    if not dry:
        write(REG, rows, fields)
        write(SEEN, list(seen.values()), SEEN_FIELDS)
        subprocess.run([sys.executable, "-I", str(ROOT / "registry" / "render_md.py")], check=True)


if __name__ == "__main__":
    main()
