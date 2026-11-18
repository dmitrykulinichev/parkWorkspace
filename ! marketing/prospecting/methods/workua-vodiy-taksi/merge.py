"""Merge Work.ua «водій таксі» collector output into registry/clients.csv and registry/seen.csv.

Usage (з папки `! marketing`):
    python -I prospecting/methods/workua-vodiy-taksi/merge.py prospecting/_raw/<date>_workua-vodiy-taksi.json [--dry-run]

Вхід: {"config", "started", "log", "jobs": [{href, city, title, card, cid, desc, date, salary}],
       "employers": {cid: {name, size, vacancies, fleet, about}}}

Правила (версія 1.1: + телефони з вакансій, склейка за телефоном) — реєстр один, НІКОГО не відсіюємо; фільтр за к-стю авто/водіїв робиться пізніше:
  - один рядок = один роботодавець; ключ_джерела = workua:<company_id>
    (вакансія без сторінки компанії → workua-job:<job_id>)
  - к-сть_авто = найбільше число «N авто/автомобілів/машин» з опису компанії та вакансій (рахується тут, у Python);
    кількість співробітників і вакансій — у нотатках
  - пріоритет: C = великий парк / орієнтир (авто > 15, або від 50 співробітників, або > 20 вакансій)
               або служба таксі, де водії на власних авто (не парк), або взагалі не таксі (шум пошуку);
               A = ознаки малого парку (2–15 авто, «менше 10 співробітників», ФОП);
               B = решта (розмір невідомий — уточнити)
    C: стадія «перевірено», але наступна_дія «орієнтир, не писати» і без дати — у справи на сьогодні не потрапляє
  - вже були в реєстрі → НЕ пропускаємо мовчки, а відмічаємо в їхньому рядку:
      * ключ_джерела вже є → у нотатки дописуємо «[дата Work.ua: N ваканс., співробітників, авто, url]»;
      * та сама назва (без ТОВ/ФОП, лапок) у тому ж місті з іншого джерела → той самий власник:
        дописуємо workua:<id> у ключ_джерела + та сама відмітка;
      * та сама назва, інше місто → новий рядок, а в обох нотатках «можливо той самий» (перевірити вручну)
  - 🚩 «Володимир / Полтава» (цікавить власника g24): якщо роботодавець з Полтави і в тексті є Володимир/Владимир —
    позначка в нотатках і в консолі
"""
import csv, json, sys, datetime, pathlib, re, subprocess

ROOT = pathlib.Path(__file__).resolve().parents[3]  # ! marketing
REG = ROOT / "registry" / "clients.csv"
SEEN = ROOT / "registry" / "seen.csv"
METHOD = "workua-vodiy-taksi"
SEEN_FIELDS = ["ключ_джерела", "метод", "місто", "назва", "вперше", "востаннє", "оголошень_востаннє", "рішення", "client_id"]
TAXI = re.compile(r"такс|taxi|uklon|уклон|bolt|болт|uber|убер|ontaxi", re.I)
VOLOD = re.compile(r"волод|владимир|вова\b", re.I)


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
    s = re.sub(r"\b(тов|фоп|пп|llc|ооо)\b|[«»\"'.,()]", " ", (s or "").lower())
    return re.sub(r"\s+", " ", s).strip()


FLEET_RE = re.compile(r"(\d[\d\s]{0,5})\s?\+?\s*(?:авто(?:мобіл\w*)?|машин\w*)(?!\w)", re.I)


def fleet_from(text):
    """Найбільше число «N авто/автомобілів/машин» у тексті (≈ розмір парку); None, якщо немає."""
    nums = [int(re.sub(r"\s", "", m)) for m in FLEET_RE.findall(text or "")]
    nums = [n for n in nums if 2 <= n < 100000]
    return max(nums) if nums else None


def size_bounds(size):
    nums = [int(n) for n in re.findall(r"\d+", size or "")]
    if not nums:
        return None, None
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
    if "де_рекламується" not in fields:
        fields.insert(fields.index("джерело") + 1, "де_рекламується")
    by_key = {k: r for r in rows for k in (r.get("ключ_джерела") or "").split()}
    by_name = {norm(r["назва"]): r for r in rows if norm(r["назва"])}
    by_phone = {p.strip(): r for r in rows for p in (r.get("телефон") or "").split(",") if p.strip()}
    next_id = max(int(r["id"]) for r in rows) + 1

    groups = {}
    for j in data["jobs"]:
        key = f"workua:{j['cid']}" if j.get("cid") else f"workua-job:{re.sub(r'\\D', '', j['href'])}"
        groups.setdefault(key, []).append(j)

    seen = {s["ключ_джерела"]: s for s in read(SEEN)}
    stats = {"додано": 0, "у реєстрі": 0, "A": 0, "B": 0, "C": 0}
    for key, jobs in sorted(groups.items(), key=lambda kv: kv[1][0]["city"]):
        cid = key.split(":")[1] if key.startswith("workua:") else ""
        emp = data["employers"].get(cid, {}) if cid else {}
        name = emp.get("name") or jobs[0]["title"]
        cities = sorted({j["city"] for j in jobs})
        city = max(cities, key=lambda c: sum(j["city"] == c for j in jobs))
        titles = [j["title"] for j in jobs]
        phones = sorted({norm_phone(p) for j in jobs for p in j.get("phones", [])} - {""})
        text = " ".join([name, emp.get("about", "")] + [j.get("desc", "") for j in jobs])
        fleet = emp.get("fleet") or fleet_from(" ".join([emp.get("about", "")] + [j.get("desc", "") for j in jobs]))
        lo, hi = size_bounds(emp.get("size", ""))
        vac = emp.get("vacancies") or 0
        own_car = all(re.search(r"власн\S* авто|своїм авто|своє авто", t, re.I) for t in titles)
        big = (fleet and fleet > 15) or (lo is not None and lo >= 50) or vac > 20
        small = (fleet and 2 <= fleet <= 15) or (hi is not None and hi <= 10) or re.search(r"\bфоп\b", name, re.I)
        not_taxi = not TAXI.search(" ".join(titles + [j.get("desc", "") for j in jobs]))
        prio = "C" if (big or own_car or not_taxi) else ("A" if small else "B")
        seg = ("не таксі (вакансія водія з видачі)" if not_taxi else
               "служба таксі (водії на власних авто)" if own_car else
               "великий парк (орієнтир)" if big else "парк під таксі (наймає водіїв)")
        label = f"Work.ua ({', '.join(cities)})"
        flag = "🚩 Володимир/Полтава? " if city == "Полтава" and VOLOD.search(text) else ""

        pm = next((by_phone[p] for p in phones if p in by_phone), None)
        if key not in by_key and pm:
            # той самий телефон = той самий власник (найнадійніша склейка між майданчиками)
            pm["ключ_джерела"] = (pm.get("ключ_джерела", "") + " " + key).strip()
            by_key[key] = pm
            print(f"  склеєно за телефоном: «{name}» ({city}) → №{pm['id']} {pm['назва']} ({pm['місто']}) (+{key})")
        hint = by_name.get(norm(name))
        if key not in by_key and hint and hint["місто"] == city:
            # та сама назва в тому ж місті з іншого джерела → це той самий власник: дописуємо ключ
            hint["ключ_джерела"] = (hint.get("ключ_джерела", "") + " " + key).strip()
            by_key[key] = hint
            print(f"  склеєно: «{name}» ({city}) → №{hint['id']} (+{key})")
        if key in by_key:
            r0 = by_key[key]
            mark = f"[{today} Work.ua: {len(jobs)} ваканс., співробітників {emp.get('size') or '?'}, авто {fleet or '?'}, " \
                   f"https://www.work.ua{jobs[0]['href']}]"
            if f"[{today} Work.ua" not in r0.get("нотатки", ""):
                r0["нотатки"] = (mark + " " + r0.get("нотатки", "")).strip()
            add_platform(r0, label)
            add_phones(r0, phones)
            for p in phones:
                by_phone.setdefault(p, r0)
            if r0.get("стадія") == "не перевірено":  # гіпотеза (напр. з AI-списку) підтвердилась реальною вакансією
                r0.update({"стадія": "перевірено", "перевірено": "так", "url_оголошення": "https://www.work.ua" + jobs[0]["href"],
                           "наступна_дія": "перше повідомлення (телефон з вакансії)", "дата_наступної": today})
            if fleet and not r0.get("к-сть_авто"):
                r0["к-сть_авто"] = str(fleet)
            stats["у реєстрі"] += 1
            dec, cid_reg = "у реєстрі (позначено)", r0["id"]
        else:
            if hint:
                print(f"  можливо той самий: «{name}» ({city}) ↔ №{hint['id']} {hint['назва']} ({hint['місто']})")
                hint["нотатки"] = f"[можливо той самий, що {key} ({city})] " + hint.get("нотатки", "")
                flag += f"можливо той самий, що №{hint['id']} ({hint['місто']}) | "
            cid_reg = f"{next_id:03d}"
            next_id += 1
            salaries = "; ".join(sorted({j.get("salary", "")[:80] for j in jobs if j.get("salary")}))[:200]
            notes = (f"{flag}компанія: https://www.work.ua/jobs/by-company/{cid}/ | " if cid else flag) + \
                    f"співробітників: {emp.get('size') or '?'} | вакансій у компанії: {vac or '?'} | " \
                    f"авто (з опису): {fleet or '?'} | міста: {', '.join(cities)} | ЗП: {salaries} | " + " ; ".join(titles[:4])
            row = {k: "" for k in fields}
            row.update({
                "id": cid_reg, "назва": name, "місто": city,
                "контактна_особа": ", ".join(sorted({j.get("contactPerson", "") for j in jobs} - {""}))[:60],
                "url_оголошення": "https://www.work.ua" + jobs[0]["href"],
                "ключ_джерела": key, "перевірено": "так", "сегмент": seg,
                "к-сть_авто": str(fleet) if fleet else "", "джерело": "Work.ua водій таксі", "де_рекламується": label,
                "пріоритет": prio,
                "стадія": "перевірено",
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
            stats["додано"] += 1
            stats[prio] += 1
            dec = f"додано ({prio})"
        if flag:
            print(f"  🚩 {name} ({city}) — є згадка Володимира, №{cid_reg}")
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
