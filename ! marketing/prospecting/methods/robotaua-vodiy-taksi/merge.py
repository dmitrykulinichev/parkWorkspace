"""Merge Robota.ua «водій таксі» collector output into registry/clients.csv and registry/seen.csv.

Usage (з папки `! marketing`):
    python -I prospecting/methods/robotaua-vodiy-taksi/merge.py prospecting/_raw/<date>_robotaua-vodiy-taksi.json [--dry-run]

Вхід: {"config", "started", "log", "jobs": [{id, city, title, cid, company, salary, date, short, desc, contactPerson, isAgency, address}],
       "employers": {cid: {name, countEmployeeId, site, verified, address, description, vacancies}}}

Правила (версія 1.1: + телефони з вакансій, склейка за телефоном) — ті самі, що в workua-vodiy-taksi (реєстр один, нікого не відсіюємо):
  - один рядок = один роботодавець; ключ_джерела = robotaua:<notebookId>; без компанії → robotaua-job:<vacancy_id>
  - розмір: countEmployeeId → текст за SIZE (розшифровано зі сторінок компаній robota.ua, див. method.md)
  - к-сть_авто = найбільше «N авто/автомобілів/машин» з опису компанії та вакансій
  - пріоритет C = великий парк / орієнтир (авто > 15, від 50 співробітників, > 20 вакансій, кадрова агенція),
    служба таксі з водіями на власних авто, або взагалі не таксі; A = 2–15 авто, менше 10 співробітників, ФОП; B = решта
  - вже в реєстрі (ключ або та сама назва) → не пропускаємо: «де_рекламується» += Robota.ua (міста), відмітка в нотатках.
    Та сама назва: склеюємо, якщо те саме місто АБО наявний запис — теж компанія з сайту вакансій (workua:/robotaua:);
    інакше (напр. ім'я з OLX в іншому місті) — новий рядок і «можливо той самий» в обох
  - контактна особа з вакансії → `контактна_особа` (допомагає склеювати з OLX, де вказано лише ім'я)
  - 🚩 Полтава + Володимир/Владимир у назві, контактній особі чи тексті → позначка
"""
import csv, json, sys, datetime, pathlib, re, subprocess

ROOT = pathlib.Path(__file__).resolve().parents[3]  # ! marketing
REG = ROOT / "registry" / "clients.csv"
SEEN = ROOT / "registry" / "seen.csv"
METHOD = "robotaua-vodiy-taksi"
SITE = "Robota.ua"
SEEN_FIELDS = ["ключ_джерела", "метод", "місто", "назва", "вперше", "востаннє", "оголошень_востаннє", "рішення", "client_id"]
TAXI = re.compile(r"такс|taxi|uklon|уклон|bolt|болт|uber|убер|ontaxi", re.I)
VOLOD = re.compile(r"волод|владимир|вова\b", re.I)
# countEmployeeId → розмір; перевірено на сторінках robota.ua/company<id> (2026-11-17)
SIZE = {0: "", 1: "до 20 співробітників", 2: "20–50 співробітників", 5: "50–100 співробітників",
        3: "100–250 співробітників", 6: "250–500 співробітників", 4: "більше 500 співробітників"}  # невідомий код → "код N"
FLEET_RE = re.compile(r"(\d[\d\s]{0,5})\s?\+?\s*(?:авто(?:мобіл\w*)?|машин\w*)(?!\w)", re.I)


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


def add_platform(row, label):
    cur = [x.strip() for x in (row.get("де_рекламується") or "").split(";") if x.strip()]
    if label not in cur:
        cur.append(label)
    row["де_рекламується"] = "; ".join(cur)


def norm_phone(t):
    """Цифри → +380XXXXXXXXX; некоректні відкидаємо."""
    d = re.sub(r"\D", "", t or "")
    if len(d) == 10 and d.startswith("0"):
        d = "38" + d
    if len(d) == 11 and d.startswith("80"):
        d = "3" + d
    return "+" + d if len(d) == 12 and d.startswith("380") else ""


def add_phones(row, phones):
    cur = [p.strip() for p in (row.get("телефон") or "").split(",") if p.strip()]
    for p in phones:
        if p and p not in cur:
            cur.append(p)
    row["телефон"] = ", ".join(cur)


def norm(s):
    s = re.sub(r"\b(тов|фоп|флп|пп|llc|ооо)\b|[«»\"'.,()]", " ", (s or "").lower())
    return re.sub(r"\s+", " ", s).strip()


def fleet_from(text):
    nums = [int(re.sub(r"\s", "", m)) for m in FLEET_RE.findall(text or "")]
    nums = [n for n in nums if 2 <= n < 100000]
    return max(nums) if nums else None


def size_bounds(size):
    nums = [int(n) for n in re.findall(r"\d+", size or "")]
    if not nums:
        return None, None
    if len(nums) >= 2:
        return nums[0], nums[-1]
    if re.search(r"менше|до\b", size, re.I):
        return 0, nums[0]
    if re.search(r"більше|від\b", size, re.I):
        return nums[0], None
    return nums[0], nums[-1]


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    src, dry = sys.argv[1], "--dry-run" in sys.argv
    data = json.load(open(src, encoding="utf-8"))
    today = datetime.date.today().isoformat()
    rows = read(REG)
    fields = list(rows[0].keys())
    by_key = {k: r for r in rows for k in (r.get("ключ_джерела") or "").split()}
    by_name = {norm(r["назва"]): r for r in rows if norm(r["назва"])}
    by_phone = {p.strip(): r for r in rows for p in (r.get("телефон") or "").split(",") if p.strip()}
    next_id = max(int(r["id"]) for r in rows) + 1

    groups = {}
    for j in data["jobs"]:
        key = f"robotaua:{j['cid']}" if j.get("cid") else f"robotaua-job:{j['id']}"
        groups.setdefault(key, []).append(j)

    seen = {s["ключ_джерела"]: s for s in read(SEEN)}
    stats = {"додано": 0, "у реєстрі": 0, "A": 0, "B": 0, "C": 0}
    for key, jobs in sorted(groups.items(), key=lambda kv: kv[1][0]["city"]):
        cid = key.split(":")[1] if key.startswith("robotaua:") else ""
        emp = data["employers"].get(cid, {}) if cid else {}
        name = emp.get("name") or jobs[0].get("company") or jobs[0]["title"]
        cities = sorted({j["city"] for j in jobs})
        city = max(cities, key=lambda c: sum(j["city"] == c for j in jobs))
        titles = [j["title"] for j in jobs]
        phones = sorted({norm_phone(p) for j in jobs for p in j.get("phones", [])} - {""})
        contacts = sorted({j.get("contactPerson", "").strip() for j in jobs if j.get("contactPerson", "").strip()})
        texts = [emp.get("description", "")] + [j.get("desc", "") for j in jobs]
        fleet = fleet_from(" ".join(texts))
        ce = emp.get("countEmployeeId")
        size = SIZE[ce] if ce in SIZE else (f"код {ce}" if ce is not None else "")
        lo, hi = size_bounds(size if not size.startswith("код") else "")
        vac = emp.get("vacancies") or 0
        agency = any(j.get("isAgency") for j in jobs)
        own_car = all(re.search(r"власн\S* авто|своїм авто|своє авто", t, re.I) for t in titles)
        big = (fleet and fleet > 15) or (lo is not None and lo >= 50) or vac > 20
        small = (fleet and 2 <= fleet <= 15) or (hi is not None and hi <= 10) or re.search(r"\bфоп\b|\bфлп\b", name, re.I)
        not_taxi = not TAXI.search(" ".join(titles + texts))
        prio = "C" if (big or own_car or not_taxi or agency) else ("A" if small else "B")
        seg = ("не таксі (вакансія водія з видачі)" if not_taxi else
               "кадрова агенція" if agency else
               "служба таксі (водії на власних авто)" if own_car else
               "великий парк (орієнтир)" if big else "парк під таксі (наймає водіїв)")
        label = f"{SITE} ({', '.join(cities)})"
        url = f"https://robota.ua/vacancy{jobs[0]['id']}" + (f"/company{cid}" if cid else "")
        volod = city == "Полтава" and VOLOD.search(" ".join([name] + contacts + texts))
        flag = "🚩 Володимир/Полтава? " if volod else ""

        pm = next((by_phone[p] for p in phones if p in by_phone), None)
        if key not in by_key and pm:
            # той самий телефон = той самий власник (найнадійніша склейка між майданчиками)
            pm["ключ_джерела"] = (pm.get("ключ_джерела", "") + " " + key).strip()
            by_key[key] = pm
            print(f"  склеєно за телефоном: «{name}» ({city}) → №{pm['id']} {pm['назва']} ({pm['місто']}) (+{key})")
        hint = by_name.get(norm(name))
        if key not in by_key and hint and (hint["місто"] == city or re.search(r"\b(workua|robotaua):", hint.get("ключ_джерела", ""))):
            hint["ключ_джерела"] = (hint.get("ключ_джерела", "") + " " + key).strip()
            by_key[key] = hint
            print(f"  склеєно: «{name}» ({city}) → №{hint['id']} {hint['назва']} ({hint['місто']}) (+{key})")
        if key in by_key:
            r0 = by_key[key]
            mark = f"[{today} {SITE}: {len(jobs)} ваканс., співробітників {size or '?'}, авто {fleet or '?'}, {url}]"
            if f"[{today} {SITE}" not in r0.get("нотатки", ""):
                r0["нотатки"] = (flag + mark + " " + r0.get("нотатки", "")).strip()
            add_platform(r0, label)
            add_phones(r0, phones)
            for p in phones:
                by_phone.setdefault(p, r0)
            if contacts and not r0.get("контактна_особа"):
                r0["контактна_особа"] = ", ".join(contacts)[:60]
            if r0.get("стадія") == "не перевірено":
                r0.update({"стадія": "перевірено", "перевірено": "так", "url_оголошення": url,
                           "наступна_дія": "перше повідомлення (телефон з вакансії)", "дата_наступної": today})
            if fleet and not r0.get("к-сть_авто"):
                r0["к-сть_авто"] = str(fleet)
            stats["у реєстрі"] += 1
            dec, cid_reg = "у реєстрі (позначено)", r0["id"]
        else:
            maybe = ""
            if hint:
                print(f"  можливо той самий: «{name}» ({city}) ↔ №{hint['id']} {hint['назва']} ({hint['місто']})")
                hint["нотатки"] = f"[можливо той самий, що {key} ({city})] " + hint.get("нотатки", "")
                maybe = f"можливо той самий, що №{hint['id']} ({hint['місто']}) | "
            cid_reg = f"{next_id:03d}"
            next_id += 1
            salaries = "; ".join(sorted({j.get("salary", "")[:80] for j in jobs if j.get("salary")}))[:200]
            notes = flag + maybe + (f"компанія: https://robota.ua/company{cid} | " if cid else "") + \
                f"співробітників: {size or '?'} | вакансій у компанії: {vac or '?'} | авто (з опису): {fleet or '?'} | " \
                f"міста: {', '.join(cities)} | сайт: {emp.get('site') or '—'} | ЗП: {salaries} | " + " ; ".join(titles[:4])
            row = {k: "" for k in fields}
            row.update({
                "id": cid_reg, "назва": name, "місто": city, "контактна_особа": ", ".join(contacts)[:60],
                "url_оголошення": url, "ключ_джерела": key, "перевірено": "так", "сегмент": seg,
                "к-сть_авто": str(fleet) if fleet else "", "джерело": f"{SITE} водій таксі", "де_рекламується": label,
                "пріоритет": prio, "стадія": "перевірено",
                "наступна_дія": "орієнтир, не писати (фільтр за к-стю авто пізніше)" if prio == "C"
                                else "перше повідомлення (телефон з вакансії)",
                "дата_наступної": "" if prio == "C" else today,
                "нотатки": notes,
            })
            add_phones(row, phones)
            for p in phones:
                by_phone.setdefault(p, row)
            rows.append(row)
            by_key[key] = row
            by_name.setdefault(norm(name), row)
            stats["додано"] += 1
            stats[prio] += 1
            dec = f"додано ({prio})"
        if volod:
            print(f"  🚩 {name} ({city}), контакт: {', '.join(contacts) or '—'} — згадка Володимира, №{cid_reg}")
        s = seen.get(key) or {"ключ_джерела": key, "метод": METHOD, "вперше": today}
        s.update({"місто": city, "назва": name, "востаннє": today, "оголошень_востаннє": len(jobs), "рішення": dec, "client_id": cid_reg})
        seen[key] = s

    print(f"вакансій: {len(data['jobs'])}; роботодавців: {len(groups)}; " + "; ".join(f"{k}: {v}" for k, v in stats.items()))
    if not dry:
        write(REG, rows, fields)
        write(SEEN, list(seen.values()), SEEN_FIELDS)
        subprocess.run([sys.executable, "-I", str(ROOT / "registry" / "render_md.py")], check=True)


if __name__ == "__main__":
    main()
