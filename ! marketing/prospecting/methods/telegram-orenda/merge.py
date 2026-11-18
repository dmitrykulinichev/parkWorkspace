"""Merge Telegram (discover.js + parse_tme.py) into registry/clients.csv, registry/seen.csv і telegram_places.csv.

Usage (з папки `! marketing`):
    python -I prospecting/methods/telegram-orenda/merge.py prospecting/_raw/<date>_telegram-tme.json [--dry-run]

Правила (версія 1.0):
  - беремо тільки прочитані чати з username; іноземні (Москва, Польща… і жодного міста України) → seen «іноземний»
  - нерелевантні (немає ні оренди/авто/таксі/викупу в назві, описі, постах) → seen «не про оренду авто»
  - ГРУПА або КАНАЛ-ДОШКА (≥ 4 різних телефонів у постах = пишуть різні власники) → це МАЙДАНЧИК, а не власник:
      пишемо в prospecting/methods/telegram-orenda/telegram_places.csv (дослідження ринку: де рекламуються);
      телефони з постів, що збігаються з реєстром → у «де_рекламується» власника дописуємо «Telegram (@майданчик)»
  - КАНАЛ ПАРКУ (решта каналів) → лід у реєстрі, ключ tg:<username>:
      склейка спершу за телефоном, потім за назвою (як у workua/robotaua); уже є → відмітка + «де_рекламується»
      тільки якщо згадано місто України (інакше seen «переглянути вручну»: часто московські/польські канали);
      к-сть_авто = «N авто» з тексту; пріоритет C: авто > 15 або таксі/викуп не згадано (звичайний прокат);
      A: 2–15 авто; B: розмір невідомий
  - 🚩 Полтава + Володимир/Владимир/Вова (назва, опис, @контакти) → позначка
"""
import csv, json, sys, datetime, pathlib, re, subprocess

ROOT = pathlib.Path(__file__).resolve().parents[3]  # ! marketing
REG = ROOT / "registry" / "clients.csv"
SEEN = ROOT / "registry" / "seen.csv"
PLACES = pathlib.Path(__file__).resolve().parent / "telegram_places.csv"
METHOD = "telegram-orenda"
SEEN_FIELDS = ["ключ_джерела", "метод", "місто", "назва", "вперше", "востаннє", "оголошень_востаннє", "рішення", "client_id"]
PLACE_FIELDS = ["username", "тип", "назва", "учасників", "міста", "телефонів_у_постах", "збіги_з_реєстром", "адмін_контакти", "опис", "вперше", "востаннє"]
TAXI = re.compile(r"такс|taxi|uklon|уклон|bolt|болт|uber|убер|ontaxi|викуп|выкуп", re.I)
RELEVANT = re.compile(r"оренд|аренд|прокат|викуп|выкуп|таксі|такси|taxi|uklon|bolt|uber|автопарк|авто", re.I)
VOLOD = re.compile(r"волод|владимир|вова|vova|volod|vladimir", re.I)
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


def add_phones(row, phones):
    cur = [p.strip() for p in (row.get("телефон") or "").split(",") if p.strip()]
    for p in phones:
        if p and p not in cur:
            cur.append(p)
    row["телефон"] = ", ".join(cur)


def norm(s):
    s = re.sub(r"\b(тов|фоп|флп|пп|llc|ооо)\b|[«»\"'.,()|🚕🚖🚗]", " ", (s or "").lower())
    return re.sub(r"\s+", " ", s).strip()


GENERIC = set("оренда аренда прокат авто автомобілів автомобилей автопарк таксі такси taxi rent car cars під под в на для і и з с "
               "київ киев львів одеса дніпро харків україна украина uklon bolt uber викуп выкуп".split())


def generic(nm):
    """Назва лише із загальних слів («Оренда авто», «Аренда авто под такси») — за нею склеювати не можна."""
    return all(w in GENERIC or w.isdigit() for w in nm.split())


def fleet_from(text):
    nums = [int(re.sub(r"\s", "", m)) for m in FLEET_RE.findall(text or "")]
    nums = [n for n in nums if 2 <= n < 100000]
    return max(nums) if nums else None


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
    seen = {s["ключ_джерела"]: s for s in read(SEEN)}
    places = {p["username"]: p for p in read(PLACES)}
    st = {"канал-лід додано": 0, "канал-лід уже був": 0, "майданчиків": 0, "відмічено через майданчики": 0, "іноземних": 0, "нерелевантних": 0, "без міста": 0, "помилок": 0}

    for c in data["chats"]:
        if "error" in c:
            st["помилок"] += 1
            continue
        u = c["username"]
        key = f"tg:{u}"
        blob = " ".join([c.get("title", ""), c.get("description", "")] + c.get("posts", []))
        city = c["cities"][0] if c.get("cities") else ""
        dec, cid_reg = "", ""
        if c.get("foreign"):
            dec = "не підійшов: іноземний"
            st["іноземних"] += 1
        elif not RELEVANT.search(c.get("title", "") + " " + c.get("description", "")) and not RELEVANT.search(" ".join(c.get("posts", []))):
            dec = "не підійшов: не про оренду авто"
            st["нерелевантних"] += 1
        elif c.get("kind") == "group" or len(c.get("phones", [])) >= 4:
            # МАЙДАНЧИК: де рекламуються різні власники
            matched = []
            for p in c.get("phones", []):
                r0 = by_phone.get(p)
                if r0:
                    add_platform(r0, f"Telegram (@{u})")
                    matched.append(r0["id"])
            st["відмічено через майданчики"] += len(set(matched))
            pl = places.get(u) or {"username": u, "вперше": today}
            pl.update({"тип": "група" if c.get("kind") == "group" else "канал-дошка", "назва": c.get("title", ""),
                       "учасників": c.get("count") or c.get("count_raw", ""), "міста": ", ".join(c.get("cities", [])),
                       "телефонів_у_постах": len(c.get("phones", [])), "збіги_з_реєстром": " ".join(sorted(set(matched))),
                       "адмін_контакти": " ".join(c.get("mentions", [])[:5]), "опис": (c.get("description") or "")[:300], "востаннє": today})
            places[u] = pl
            dec = "майданчик (telegram_places.csv)"
            st["майданчиків"] += 1
        elif not c.get("cities"):
            dec = "не підійшов: місто України не згадано (можливо іноземний) — переглянути вручну"
            st["без міста"] += 1
        else:
            # КАНАЛ ПАРКУ → лід
            phones = c.get("phones", [])
            fleet = fleet_from(blob)
            taxi = TAXI.search(blob)
            prio = "C" if (fleet and fleet > 15) or not taxi else ("A" if fleet and fleet >= 2 else "B")
            label = f"Telegram (@{u})"
            volod = city == "Полтава" and VOLOD.search(" ".join([c.get("title", ""), c.get("description", "")] + c.get("mentions", [])))
            flag = "🚩 Володимир/Полтава? " if volod else ""
            nm = norm(c.get("title", ""))
            name_hit = by_name.get(nm) if nm and not generic(nm) else None
            if name_hit and name_hit.get("місто") != city:   # за назвою склеюємо лише в тому самому місті
                name_hit = None
            r0 = by_key.get(key) or next((by_phone[p] for p in phones if p in by_phone), None) or name_hit
            if r0:
                if key not in (r0.get("ключ_джерела") or "").split():
                    r0["ключ_джерела"] = (r0.get("ключ_джерела", "") + " " + key).strip()
                    print(f"  склеєно: @{u} «{c.get('title','')[:40]}» → №{r0['id']} {r0['назва']} ({r0['місто']})")
                add_platform(r0, label)
                add_phones(r0, phones)
                mark = f"[{today} Telegram @{u}: {c.get('count_raw','')}, авто {fleet or '?'}, контакти {' '.join(c.get('mentions', [])[:3]) or '—'}]"
                if f"Telegram @{u}" not in r0.get("нотатки", ""):
                    r0["нотатки"] = (flag + mark + " " + r0.get("нотатки", "")).strip()
                by_key[key] = r0
                dec, cid_reg = "у реєстрі (позначено)", r0["id"]
                st["канал-лід уже був"] += 1
            else:
                cid_reg = f"{next_id:03d}"
                next_id += 1
                row = {k: "" for k in fields}
                row.update({
                    "id": cid_reg, "назва": c.get("title", "")[:80] or u, "місто": city,
                    "контактна_особа": " ".join(c.get("mentions", [])[:3]), "url_оголошення": f"https://t.me/{u}",
                    "ключ_джерела": key, "перевірено": "так" if (phones or c.get("mentions")) else "ні",
                    "сегмент": ("прокат авто (таксі не згадано)" if not taxi else
                                "великий парк (орієнтир)" if prio == "C" else "парк під таксі (Telegram-канал)"),
                    "к-сть_авто": str(fleet) if fleet else "", "джерело": "Telegram канал", "де_рекламується": label,
                    "пріоритет": prio, "стадія": "перевірено",
                    "наступна_дія": "орієнтир, не писати (фільтр за к-стю авто пізніше)" if prio == "C" else "перше повідомлення (телефон / Telegram з каналу)",
                    "дата_наступної": "" if prio == "C" else today,
                    "нотатки": f"{flag}{c.get('count_raw','')} | міста: {', '.join(c.get('cities', [])) or '?'} | авто (з тексту): {fleet or '?'} | "
                               f"посилання: {' '.join(c.get('links', [])[:3])} | {(c.get('description') or '')[:200]}",
                })
                add_phones(row, phones)
                rows.append(row)
                by_key[key] = row
                for p in phones:
                    by_phone.setdefault(p, row)
                dec = f"додано ({prio})"
                st["канал-лід додано"] += 1
            if volod:
                print(f"  🚩 @{u} {c.get('title','')} — Полтава + Володимир, №{cid_reg}")
        s = seen.get(key) or {"ключ_джерела": key, "метод": METHOD, "вперше": today}
        s.update({"місто": city, "назва": c.get("title", "")[:80], "востаннє": today, "оголошень_востаннє": len(c.get("posts", [])),
                  "рішення": dec, "client_id": cid_reg})
        seen[key] = s

    print("; ".join(f"{k}: {v}" for k, v in st.items()))
    if not dry:
        write(REG, rows, fields)
        write(SEEN, list(seen.values()), SEEN_FIELDS)
        write(PLACES, sorted(places.values(), key=lambda p: -int(re.sub(r"\D", "", str(p.get("учасників") or 0)) or 0)), PLACE_FIELDS)
        subprocess.run([sys.executable, "-I", str(ROOT / "registry" / "render_md.py")], check=True)


if __name__ == "__main__":
    main()
