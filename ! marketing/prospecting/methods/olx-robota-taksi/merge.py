"""Злиття OLX «Робота» (вакансії водіїв таксі, collector.js) у registry/clients.csv і registry/seen.csv — версія 1.0 (2026-11-18).

Usage (з папки `! marketing`):
    python -I prospecting/methods/olx-robota-taksi/merge.py prospecting/_raw/<дата>_olx-robota-taksi.json [--dry-run]

Правила (реєстр один; відсіюємо лише явно чуже):
  - роботодавець = OLX user_id, ключ olx:<user_id> (той самий, що в olx-prokat-avto → власники з «Прокату» склеюються);
  - НЕ наше → лише seen: резюме/«шукаю роботу», вантажні/далекобій/автобус/особистий водій/доставка без таксі, закордон;
  - C (орієнтир): у роботодавця > 10 вакансій або > 15 оголошень прокату, або агенція/сервіс підключення (Lito, «підключення до Uber»…);
  - A: малий роботодавець (1–3 таксі-вакансії, ≤ 10 оголошень прокату) з ознаками власного парку
       («авто компанії», «наш автопарк», «оренда», «викуп», марки авто, Uklon/Bolt/Uber);
  - B: решта (розмір незрозумілий);
  - уже в реєстрі (ключ або телефон) → «де_рекламується» += «OLX робота (місто)», телефони, відмітка в нотатки;
  - контакт: телефон із тексту вакансії або чат OLX → стадія «перевірено».
"""
import collections, csv, datetime, json, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
REG, SEEN = ROOT / "registry" / "clients.csv", ROOT / "registry" / "seen.csv"
METHOD = "olx-robota-taksi"
SEEN_FIELDS = ["ключ_джерела", "метод", "місто", "назва", "вперше", "востаннє", "оголошень_востаннє", "рішення", "client_id"]
NOT_JOB = re.compile(r"шукаю роботу|ищу работу|резюме|шукаю підробіток|ищу подработку|водій шукає|водитель ищет|"
                     r"готовий працювати|готов работать|досвід водія \d+ р", re.I)
NOT_OURS = re.compile(r"вантаж|грузов|далекобі|дальнобо|фур[аиу]|тягач|автобус|маршрутк|бус\b|особист\w* водi?ій|"
                      r"личн\w* водител|евакуат|эвакуат|польщ|польш|polska|чехі|германі|німеччин|литв|europe|європ", re.I)
AGENCY = re.compile(r"кадров|агенц|агентств|lito|u-drivers|підключ\w* до (uber|bolt|uklon)|подключ\w* к (uber|bolt)|"
                    r"реєстрац\w* водіїв|регистрац\w* водител|партнер uber|офіційний партнер", re.I)
OWN_PARK = re.compile(r"авто компанії|автомобіл\w* компанії|авто компании|автомобил\w* компании|корпоративн\w* авто|"
                      r"наш\w* (авто)?парк|автопарк|таксопарк|оренд|аренд|викуп|выкуп", re.I)
# служба таксі (диспетчерська) шукає водіїв з власним авто або операторів — це не парк
SERVICE = re.compile(r"власн\w* авто|своїм авто|свое?м авто|со своим|з особистим авто|оператор|диспетчер", re.I)


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
    if len(d) == 11 and d.startswith("80"):
        d = "3" + d
    return "+" + d if len(d) == 12 and d.startswith("380") else ""


def salary(s):
    try:
        v = json.loads(s) if s and s.startswith("{") else None
    except ValueError:
        v = None
    if not v:
        return s or "—"
    return f"{v.get('from') or ''}–{v.get('to') or ''} {v.get('currency') or 'грн'}".strip("–") + (" (договірна)" if v.get("arranged") else "")


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    src, dry = sys.argv[1], "--dry-run" in sys.argv
    data = json.load(open(src, encoding="utf-8"))
    today = datetime.date.today().isoformat()
    users = {str(u["id"]): u for u in data.get("users", [])}
    emp = collections.defaultdict(list)
    for o in data["offers"]:
        if o.get("user_id"):
            emp[str(o["user_id"])].append(o)

    rows = read(REG)
    fields = list(rows[0].keys())
    by_key = {k: r for r in rows for k in (r.get("ключ_джерела") or "").split()}
    by_phone = {p.strip(): r for r in rows for p in (r.get("телефон") or "").split(",") if p.strip()}
    next_id = max(int(r["id"]) for r in rows) + 1
    seen = {s["ключ_джерела"]: s for s in read(SEEN)}
    st = collections.Counter()

    for uid, offs in emp.items():
        key = f"olx:{uid}"
        u = users.get(uid, {})
        text = " ".join(o["title"] + " " + (o.get("desc") or "") for o in offs)
        cities = list(dict.fromkeys(o.get("city") or "" for o in offs if o.get("city")))
        city = cities[0] if cities else ""
        label = f"OLX робота ({', '.join(cities[:3])})"
        phones = sorted({norm_phone(p) for o in offs for p in o.get("phones", [])} - {""})
        name = (offs[0].get("user_company") or offs[0].get("user_name") or "").strip()
        jobs, rentals = u.get("jobs", len(offs)), u.get("rentals", 0)
        dec, cid = "", ""

        if all(NOT_JOB.search(o["title"] + " " + (o.get("desc") or "")[:200]) for o in offs):
            dec = "не наше: резюме / шукає роботу"
        elif all(NOT_OURS.search(o["title"] + " " + (o.get("desc") or "")) and not re.search(r"такс|taxi|uklon|bolt|uber", o["title"], re.I)
                 for o in offs):
            dec = "не наше: вантажне/автобус/особистий водій/закордон"
        if dec:
            st["лише seen"] += 1
        else:
            hit = by_key.get(key) or next((by_phone[p] for p in phones if p in by_phone), None)
            big = jobs > 10 or rentals > 15
            agency = bool(AGENCY.search(text))
            own = bool(OWN_PARK.search(text))
            service = bool(SERVICE.search(text)) and not own
            prio = "C" if (big or agency or service) else ("A" if len(offs) <= 3 and rentals <= 10 and own else "B")
            seg = ("агенція / сервіс підключення водіїв" if agency else "великий роботодавець (орієнтир)" if big
                   else "служба таксі (водії з власним авто / оператори)" if service
                   else "парк під таксі (наймає водіїв, OLX)")
            note = (f"OLX робота: {len(offs)} таксі-ваканс. (усього оголошень у профілі {u.get('total_ads', '?')}, вакансій {jobs}, "
                    f"прокату {rentals}) | {' ; '.join(o['title'] for o in offs[:3])} | ЗП: {salary(offs[0].get('salary'))} | "
                    f"{offs[0]['url']}")
            if hit:
                if key not in (hit.get("ключ_джерела") or "").split():
                    hit["ключ_джерела"] = (hit.get("ключ_джерела", "") + " " + key).strip()
                add_list(hit, "де_рекламується", [label], "; ")
                add_list(hit, "телефон", phones, ", ")
                if f"[{today} OLX робота" not in hit.get("нотатки", ""):
                    hit["нотатки"] = f"[{today} {note}] " + hit.get("нотатки", "")
                dec, cid = "у реєстрі (позначено)", hit["id"]
                st["уже були"] += 1
            else:
                cid = f"{next_id:03d}"
                next_id += 1
                row = {k: "" for k in fields}
                row.update({"id": cid, "назва": (name or f"Роботодавець OLX {uid}")[:80], "місто": city,
                            "контактна_особа": offs[0].get("user_name") or "", "url_оголошення": offs[0]["url"], "ключ_джерела": key,
                            "перевірено": "так", "сегмент": seg, "к-сть_авто": f"~{rentals}" if rentals >= 2 else "",
                            "джерело": "OLX робота (водій таксі)", "де_рекламується": label, "пріоритет": prio,
                            "стадія": "перевірено",
                            "наступна_дія": "орієнтир, не писати (фільтр пізніше)" if prio == "C"
                                            else "перше повідомлення (телефон з тексту або чат OLX)",
                            "дата_наступної": "" if prio == "C" else today,
                            "нотатки": f"профіль: https://www.olx.ua/uk/list/user/{uid}/ | " + note})
                add_list(row, "телефон", phones, ", ")
                rows.append(row)
                by_key[key] = row
                for p in phones:
                    by_phone.setdefault(p, row)
                dec = f"додано ({prio})"
                st[f"додано {prio}"] += 1
        s = seen.get(key) or {"ключ_джерела": key, "метод": METHOD, "вперше": today}
        s.update({"місто": city, "назва": name[:80], "востаннє": today, "оголошень_востаннє": len(offs), "рішення": dec, "client_id": cid})
        seen[key] = s

    print(f"роботодавців: {len(emp)}; вакансій: {len(data['offers'])}; " + "; ".join(f"{k}: {v}" for k, v in sorted(st.items())))
    if not dry:
        write(REG, rows, fields)
        write(SEEN, list(seen.values()), SEEN_FIELDS)
        subprocess.run([sys.executable, "-I", str(ROOT / "registry" / "render_md.py")], check=True)


if __name__ == "__main__":
    main()
