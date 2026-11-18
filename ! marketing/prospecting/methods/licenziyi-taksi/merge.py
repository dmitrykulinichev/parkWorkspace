"""Злиття реєстру ліцензій на таксі (Укртрансбезпека) у registry/clients.csv і registry/seen.csv — версія 1.0 (2026-11-18).

Usage (з папки `! marketing`):
    python -I prospecting/methods/licenziyi-taksi/merge.py prospecting/_raw/<дата>_licenses [--dry-run]

Дані (див. collect.py):
  - api_pages/*.json — ЖИВІ ліцензії (entityName, entityId = ЄДРПОУ/ІПН, entityActivities, status);
    беремо ті, де є вид діяльності з «таксі» і status = «Чинна»;
  - vehicles_2022-02-18.zip — авто ліцензіатів (стан на 18.02.2022): легкові (Легковий/_Легковий/Таксі), рахуємо унікальні номери;
    регіон — за літерами номера (AA/KA = Київ, BC/HC = Львів …);
  - reestr-taksi_2024-08-02.xlsx — запасне джерело назв (для склейки з авто за назвою, коли коду немає).

Правила (реєстр один; відсіюємо лише явних водіїв-одинаків):
  - авто (2022) 3–15 → A «ліцензований перевізник таксі (реєстр)»; 16–30 → B; > 30 → C (орієнтир);
  - 2 авто → B (мікропарк, може рости);
  - ТОВ/підприємство без даних про авто (ліцензія після 2022) → B «розмір невідомий»;
  - 1 авто або ФОП без даних про авто → лише seen «водій-одинак / розмір невідомий»;
  - телефонів у реєстрі немає → стадія «не перевірено», наступна дія «знайти контакт»;
  - ключ_джерела lic:<ЄДРПОУ/ІПН>; склейка з наявними: ФОП — прізвище + ініціали (і та сама область, якщо відома),
    ТОВ — нормалізована назва; знайденим дописуємо ключ, к-сть авто (якщо порожня) і відмітку в нотатки.
"""
import collections, csv, datetime, json, pathlib, re, subprocess, sys, zipfile

ROOT = pathlib.Path(__file__).resolve().parents[3]
REG, SEEN = ROOT / "registry" / "clients.csv", ROOT / "registry" / "seen.csv"
METHOD = "licenziyi-taksi"
SEEN_FIELDS = ["ключ_джерела", "метод", "місто", "назва", "вперше", "востаннє", "оголошень_востаннє", "рішення", "client_id"]
CAR_TYPES = {"Легковий", "_Легковий", "Таксі"}
LAT2CYR = str.maketrans("ABCEHIKMOPTX", "АВСЕНІКМОРТХ")
REGION = {  # літери номера → обласний центр (для колонки «місто») і назва області
    "АА": ("Київ", "м. Київ"), "КА": ("Київ", "м. Київ"), "АІ": ("Київ", "Київська обл."), "КІ": ("Київ", "Київська обл."),
    "АВ": ("Вінниця", "Вінницька"), "КВ": ("Вінниця", "Вінницька"), "АС": ("Луцьк", "Волинська"), "КС": ("Луцьк", "Волинська"),
    "АЕ": ("Дніпро", "Дніпропетровська"), "КЕ": ("Дніпро", "Дніпропетровська"), "АН": ("Донецьк", "Донецька"), "КН": ("Донецьк", "Донецька"),
    "АМ": ("Житомир", "Житомирська"), "КМ": ("Житомир", "Житомирська"), "АО": ("Ужгород", "Закарпатська"), "КО": ("Ужгород", "Закарпатська"),
    "АР": ("Запоріжжя", "Запорізька"), "КР": ("Запоріжжя", "Запорізька"), "АТ": ("Івано-Франківськ", "Івано-Франківська"),
    "КТ": ("Івано-Франківськ", "Івано-Франківська"), "ВА": ("Кропивницький", "Кіровоградська"), "НА": ("Кропивницький", "Кіровоградська"),
    "ВВ": ("Луганськ", "Луганська"), "НВ": ("Луганськ", "Луганська"), "ВС": ("Львів", "Львівська"), "НС": ("Львів", "Львівська"),
    "ВЕ": ("Миколаїв", "Миколаївська"), "НЕ": ("Миколаїв", "Миколаївська"), "ВН": ("Одеса", "Одеська"), "НН": ("Одеса", "Одеська"),
    "ВІ": ("Полтава", "Полтавська"), "НІ": ("Полтава", "Полтавська"), "ВК": ("Рівне", "Рівненська"), "НК": ("Рівне", "Рівненська"),
    "ВМ": ("Суми", "Сумська"), "НМ": ("Суми", "Сумська"), "ВО": ("Тернопіль", "Тернопільська"), "НО": ("Тернопіль", "Тернопільська"),
    "АХ": ("Харків", "Харківська"), "КХ": ("Харків", "Харківська"), "ВТ": ("Херсон", "Херсонська"), "НТ": ("Херсон", "Херсонська"),
    "ВХ": ("Хмельницький", "Хмельницька"), "НХ": ("Хмельницький", "Хмельницька"), "СА": ("Черкаси", "Черкаська"), "ІА": ("Черкаси", "Черкаська"),
    "СВ": ("Чернігів", "Чернігівська"), "ІВ": ("Чернігів", "Чернігівська"), "СЕ": ("Чернівці", "Чернівецька"), "ІЕ": ("Чернівці", "Чернівецька"),
    "АК": ("Сімферополь", "АР Крим"), "КК": ("Сімферополь", "АР Крим"),
}
CITY2REGION = {c: r for c, r in REGION.values()}
CITY2REGION["Київ"] = "м. Київ"
GENERIC = set("таксі такси taxi авто автопарк таксопарк сервіс служба плюс груп group нове старе".split())
COMPANY = re.compile(r"\b(тов|пп|прат|пат|ват|тдв|кп|дп|товариство|підприємство|компанія|асоціація)\b|\"", re.I)


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
    s = (s or "").lower().replace("товариство з обмеженою відповідальністю", "тов").replace("фізична особа-підприємець", "")
    s = re.sub(r"\b(тов|фоп|флп|пп|ооо|llc|прат|пат)\b", " ", s)
    return re.sub(r"[^0-9a-zа-яіїєґ]+", " ", s).strip()


def fop_key_full(name):
    """«ПАЛЮХ БОГДАН АНДРІЙОВИЧ» → ('палюх', 'б', 'а')"""
    w = norm(name).split()
    return (w[0], w[1][:1], w[2][:1]) if len(w) >= 3 else None


def fop_key_short(name):
    """«Палюх Б.А., ФОП» / «Гордієнко М. В., ФОП» / «Романів, ФОП» → ('палюх', 'б', 'а') або ('романів', '', '')"""
    s = re.sub(r",?\s*(фоп|флп)\b.*$", "", name or "", flags=re.I).strip()
    m = re.match(r"^([А-ЯІЇЄҐA-Z][а-яіїєґ'’a-z-]+)\s*([А-ЯІЇЄҐ])?\.?\s*([А-ЯІЇЄҐ])?\.?$", s)
    if not m:
        m2 = re.match(r"^(?:фоп\s+)?([А-ЯІЇЄҐ][а-яіїєґ'’-]+)\s+([А-ЯІЇЄҐ][а-яіїєґ'’-]+)\s+([А-ЯІЇЄҐ][а-яіїєґ'’-]+)", name or "", re.I)
        return (m2.group(1).lower(), m2.group(2)[:1].lower(), m2.group(3)[:1].lower()) if m2 else None
    return (m.group(1).lower(), (m.group(2) or "").lower(), (m.group(3) or "").lower())


NOVICE_FROM = datetime.date(2025, 1, 1)
NOT_CAR_BIZ = re.compile(r"автобус|вантаж|небезпечн|залізнич|міжнародні перевезення вантаж", re.I)


def is_person(name):
    """«ПП БІГУН СЕРГІЙ ВІКТОРОВИЧ» / «СОПІН ЄВГЕН ВАЛЕРІЙОВИЧ» — фізособа-підприємець, а не компанія."""
    s = re.sub(r"^\s*(пп|фоп|флп|фізична особа[- ]підприємець)\s+", "", name or "", flags=re.I).strip()
    w = s.split()
    return '"' not in s and "«" not in s and 2 <= len(w) <= 4 and bool(re.search(r"(вич|вна|ична|ович|івна|ївна)$", w[-1], re.I))


def first_date(dates):
    ds = []
    for s in dates:
        try:
            ds.append(datetime.datetime.strptime(s, "%d.%m.%Y").date())
        except (TypeError, ValueError):
            pass
    return min(ds) if ds else None


def plate_region(num):
    p = (num or "").upper().translate(LAT2CYR)[:2]
    return REGION.get(p)


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    src, dry = pathlib.Path(sys.argv[1]), "--dry-run" in sys.argv
    today = datetime.date.today().isoformat()

    # 1) живі ліцензії на таксі
    lic = {}
    for f in sorted((src / "api_pages").glob("*.json")):
        for x in json.loads(f.read_text(encoding="utf-8")):
            acts = [a["name"] for a in x.get("entityActivities") or []]
            if x.get("status") != "Чинна" or not any("таксі" in a for a in acts):
                continue
            e = lic.setdefault(x["entityId"], {"id": x["entityId"], "name": (x["entityName"] or "").strip(), "acts": set(), "dates": set()})
            e["acts"].update(acts)
            e["dates"].update(a.get("dateFrom") or "" for a in x["entityActivities"] if "таксі" in a["name"])
    print(f"чинних ліцензіатів таксі (API): {len(lic)}")

    # 2) авто 2022
    cars = collections.defaultdict(dict)
    vj = json.load(zipfile.ZipFile(src / "vehicles_2022-02-18.zip").open("vehicle.json"))
    for v in vj:
        if v["vhclType"] in CAR_TYPES and v.get("vhclNum"):
            cars[v["OKPOCode"]][v["vhclNum"]] = v
    print(f"перевізників з легковими авто (2022): {len(cars)}")

    rows = read(REG)
    fields = list(rows[0].keys())
    by_key = {k: r for r in rows for k in (r.get("ключ_джерела") or "").split()}
    fop_idx = collections.defaultdict(list)
    co_idx = {}
    for r in rows:
        k = fop_key_short(r["назва"]) if re.search(r"фоп|флп", r["назва"], re.I) else None
        if k:
            fop_idx[k[0]].append((k, r))
        elif r["назва"]:
            co_idx.setdefault(norm(r["назва"]), r)
    next_id = max(int(r["id"]) for r in rows) + 1
    seen = {s["ключ_джерела"]: s for s in read(SEEN)}
    st = collections.Counter()

    for code, e in lic.items():
        key = f"lic:{code}"
        vs = list(cars.get(code, {}).values())
        n = len(vs)
        regs = collections.Counter(plate_region(v["vhclNum"]) for v in vs if plate_region(v["vhclNum"]))
        city, oblast = (regs.most_common(1)[0][0] if regs else ("", ""))
        models = collections.Counter(f"{(v.get('vhclVendorID') or '').strip()} {(v.get('vhclModel') or '').strip()}".strip() for v in vs)
        years = sorted(y for y in (v.get("vchlManufYear") for v in vs) if isinstance(y, int) and y > 1950)
        is_co = not is_person(e["name"]) and (bool(COMPANY.search(e["name"])) or len(code) == 8)
        first = first_date(e["dates"])
        novice = bool(first and first >= NOVICE_FROM)
        detail = ((f"НОВАЧОК (перша ліцензія таксі {first:%d.%m.%Y}) | " if novice else "")
                  + f"ЄДРПОУ/ІПН {code} | ліцензія таксі з {', '.join(sorted(d for d in e['dates'] if d))} | "
                  f"легкових авто (реєстр ТЗ 18.02.2022): {n or 'немає даних'}"
                  + (f" | область за номерами: {', '.join(f'{c[1]} ({k})' for c, k in regs.most_common(3))}" if regs else "")
                  + (f" | моделі: {', '.join(f'{m} ×{k}' for m, k in models.most_common(4))}" if models else "")
                  + (f" | роки випуску: {years[0]}–{years[-1]}" if years else "")
                  + (" | також: на замовлення легковими" if any("на замовлення" in a for a in e["acts"]) else ""))

        # склейка з наявними
        hit = by_key.get(key)
        if not hit and not is_co:
            fk = fop_key_full(e["name"])
            if fk:
                for k, r in fop_idx.get(fk[0], []):
                    same_init = (not k[1] or k[1] == fk[1]) and (not k[2] or k[2] == fk[2])
                    same_reg = not oblast or not r["місто"] or CITY2REGION.get(r["місто"]) in (oblast, None) or \
                        (r["місто"] == "Київ" and oblast in ("м. Київ", "Київська обл."))
                    if same_init and k[1] and same_reg:
                        hit = r
                        break
        if not hit and is_co:
            nm = norm(e["name"])
            generic = not nm or all(w in GENERIC for w in nm.split())   # «ТАКСІ +» ≠ будь-яке «Таксі» (хибна склейка 2026-11-18)
            hit = co_idx.get(nm) if not generic and len(nm) > 3 else None
            if hit and oblast and hit["місто"] and CITY2REGION.get(hit["місто"]) not in (oblast, None) and \
                    not (hit["місто"] == "Київ" and oblast in ("м. Київ", "Київська обл.")):
                hit = None

        if n == 0 and novice:   # v1.1: новачки (перша ліцензія таксі з 2025) — найімовірніше починають і ще без софту
            other_biz = any(NOT_CAR_BIZ.search(a) for a in e["acts"] if "таксі" not in a)
            prio, seg = (("B", "новачок-ТОВ, основний бізнес інший (автобуси/вантажі) + таксі") if other_biz
                         else ("A", "новий ліцензований перевізник (ТОВ, новачок)")) if is_co else \
                        ("B", "новачок-ФОП з ліцензією таксі (може бути водій сам на себе)")
        elif n == 1 or (n == 0 and not is_co):
            dec = "водій-одинак (1 авто)" if n == 1 else "ФОП, розмір невідомий (авто після 2022)"
            prio = None
        elif n == 0:
            prio, seg = "B", "ліцензований перевізник таксі (розмір невідомий)"
        elif n == 2:
            prio, seg = "B", "ліцензований перевізник таксі (2 авто)"
        elif n <= 15:
            prio, seg = "A", "ліцензований перевізник таксі (реєстр)"
        elif n <= 30:
            prio, seg = "B", "ліцензований перевізник таксі (16–30 авто)"
        else:
            prio, seg = "C", "великий ліцензований перевізник (орієнтир)"

        if prio == "A" and city in ("Донецьк", "Луганськ", "Сімферополь"):
            prio, seg = "B", seg + "; авто з номерами окупованої/прифронтової області (бізнес міг переїхати чи закритися)"
        cid = ""
        if hit:
            if key not in (hit.get("ключ_джерела") or "").split():
                hit["ключ_джерела"] = (hit.get("ключ_джерела", "") + " " + key).strip()
            if n and not hit.get("к-сть_авто"):
                hit["к-сть_авто"] = str(n)
            # відмітку за сьогодні переписуємо (повторний прогін з новими правилами оновлює її, а не дублює)
            notes = re.sub(rf"\[{today} реєстр ліцензій: [^\]]*\]\s*", "", hit.get("нотатки", ""))
            hit["нотатки"] = f"[{today} реєстр ліцензій: {e['name']} | {detail}] " + notes
            if hit.get("джерело", "").startswith("Реєстр ліцензій") and prio:   # власні записи методу — переоцінюємо
                hit.update({"пріоритет": prio, "сегмент": seg})
            dec, cid = "у реєстрі (позначено)", hit["id"]
            st["уже були"] += 1
        elif prio:
            cid = f"{next_id:03d}"
            next_id += 1
            row = {k: "" for k in fields}
            row.update({"id": cid, "назва": f"{e['name'].title() if not is_co else e['name']}{', ФОП' if not is_co else ''}"[:80],
                        "місто": city, "ключ_джерела": key, "перевірено": "ні", "сегмент": seg, "к-сть_авто": str(n) if n else "",
                        "джерело": "Реєстр ліцензій таксі (Укртрансбезпека)", "пріоритет": prio, "стадія": "не перевірено",
                        "наступна_дія": "орієнтир, не писати (фільтр пізніше)" if prio == "C" else "знайти контакт (телефон) за назвою / ЄДРПОУ",
                        "дата_наступної": "", "нотатки": detail})
            rows.append(row)
            by_key[key] = row
            dec = f"додано ({prio})"
            st[f"додано {prio}"] += 1
        else:
            st["лише seen"] += 1
        s = seen.get(key) or {"ключ_джерела": key, "метод": METHOD, "вперше": today}
        s.update({"місто": city, "назва": e["name"][:80], "востаннє": today, "оголошень_востаннє": n, "рішення": dec, "client_id": cid})
        seen[key] = s

    print("; ".join(f"{k}: {v}" for k, v in sorted(st.items())))
    if not dry:
        write(REG, rows, fields)
        write(SEEN, list(seen.values()), SEEN_FIELDS)
        subprocess.run([sys.executable, "-I", str(ROOT / "registry" / "render_md.py")], check=True)


if __name__ == "__main__":
    main()
