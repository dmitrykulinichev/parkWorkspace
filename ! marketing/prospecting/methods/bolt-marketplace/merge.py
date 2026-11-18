"""Злиття маркетплейсу оренди авто Bolt (collector.js) у registry/clients.csv і seen.csv — версія 1.0 (2026-11-18).

Usage (з папки `! marketing`):
    python -I prospecting/methods/bolt-marketplace/merge.py prospecting/_raw/<дата>_bolt-marketplace.json [--dry-run]

Правила:
  - власник = підпис у Bolt «<City> Fleet <бренд/прізвище>» (або назва юрособи); ключ boltfleet:<місто>:<бренд>;
  - G-Car (мережа) → C; ≥ 2 оголошення → A (малий парк здає авто через Bolt); 1 оголошення → B;
  - склейка з реєстром: ключ → бренд ⊂ назви запису в тому ж місті (≥ 4 літер, не загальне) → для відомих мереж/брендів у
    будь-якому місті; уже відомим дописуємо «Bolt маркетплейс (місто)»;
  - якщо бренд — прізвище латиницею (Tihonov, Kuznietsov…), шукаємо в registry/licenses_taxi.csv ФОП з таким прізвищем
    (транслітерація) у тій самій області → пишемо «можливо: <ПІБ>, ліцензія …» у нотатки (НЕ склеюємо автоматично);
  - телефонів немає (контакт лише через «Request vehicle» у Bolt; ми його НЕ натискаємо) → стадія «не перевірено».
"""
import collections, csv, datetime, json, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
REG, SEEN, LIC = ROOT / "registry" / "clients.csv", ROOT / "registry" / "seen.csv", ROOT / "registry" / "licenses_taxi.csv"
METHOD = "bolt-marketplace"
SEEN_FIELDS = ["ключ_джерела", "метод", "місто", "назва", "вперше", "востаннє", "оголошень_востаннє", "рішення", "client_id"]
NETWORK = {"g car", "gcar", "g-car"}
GENERIC = set("fleet park taxi auto avto car cars rent driver boltdriver prius tesla lexus delta miami".split())
CITY_REGION = {"Київ": ("м. Київ", "Київська обл."), "Львів": ("Львівська",), "Дніпро": ("Дніпропетровська",), "Ужгород": ("Закарпатська",),
               "Рівне": ("Рівненська",), "Чернівці": ("Чернівецька",), "Черкаси": ("Черкаська",), "Івано-Франківськ": ("Івано-Франківська",),
               "Харків": ("Харківська",), "Вінниця": ("Вінницька",), "Луцьк": ("Волинська",), "Одеса": ("Одеська",),
               "Тернопіль": ("Тернопільська",), "Полтава": ("Полтавська",), "Житомир": ("Житомирська",), "Хмельницький": ("Хмельницька",),
               "Суми": ("Сумська",), "Чернігів": ("Чернігівська",)}
TR = {"а": "a", "б": "b", "в": "v", "г": "h", "ґ": "g", "д": "d", "е": "e", "є": "ie", "ж": "zh", "з": "z", "и": "y", "і": "i", "ї": "i",
      "й": "i", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f", "х": "kh",
      "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch", "ь": "", "ю": "iu", "я": "ia", "'": "", "’": ""}


def translit(s):
    return "".join(TR.get(ch, ch) for ch in (s or "").lower())


def loose(s):
    """грубе порівняння латиниці: tihonov ≈ tykhonov ≈ tikhonov"""
    s = s.lower().replace("kh", "h").replace("y", "i").replace("ie", "e").replace("ii", "i")
    return re.sub(r"[^a-z]", "", s)


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
    return re.sub(r"[^0-9a-zа-яіїєґ]+", "", (s or "").lower())


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
    owners = collections.defaultdict(list)
    for l in data["listings"]:
        owners[(l["owner"].strip(), l["ownerCity"].strip())].append(l)

    rows = read(REG)
    fields = list(rows[0].keys())
    by_key = {k: r for r in rows for k in (r.get("ключ_джерела") or "").split()}
    lic = [t for t in read(LIC) if t["тип"] == "ФОП"]
    lic_by_sur = collections.defaultdict(list)
    for t in lic:
        lic_by_sur[loose(translit(t["назва"].split()[0]))].append(t)
    next_id = max(int(r["id"]) for r in rows) + 1
    seen = {s["ключ_джерела"]: s for s in read(SEEN)}
    st = collections.Counter()

    for (owner, city), ls in owners.items():
        brand = re.sub(r"^\S+(\s\S+)?\s+Fleet\s+", "", owner).strip() if " Fleet " in owner else owner
        b = norm(brand)
        key = f"boltfleet:{norm(city)}:{b}"
        label = f"Bolt маркетплейс ({city})"
        types = sorted({l["type"] for l in ls})
        cars = ", ".join(sorted({l["title"] for l in ls if l["title"]}))[:200]
        prices = ", ".join(sorted({l["price"] for l in ls}))[:120]
        note = f"Bolt маркетплейс: «{owner}», оголошень {len(ls)} ({'/'.join(types)}), {cars}; ціни: {prices} | {ls[0]['url']}"
        network = b.replace("-", "") in {n.replace("-", "").replace(" ", "") for n in NETWORK} or b.startswith("gcar")
        hit = by_key.get(key)
        if not hit and len(b) >= 4 and b not in GENERIC:
            same_city = [r for r in rows if r["місто"] == city and b in norm(r["назва"]) and r.get("стадія") != "не цільовий"]
            any_city = [r for r in rows if b in norm(r["назва"]) and r.get("стадія") != "не цільовий"] if (network or len(b) >= 6) else []
            hit = (same_city or any_city or [None])[0]
        # прізвище → кандидати з реєстру ліцензій
        cand = ""
        if not hit and re.fullmatch(r"[A-Za-z]+", brand or "") and brand[0].isupper() and brand.lower() not in GENERIC:
            regs = CITY_REGION.get(city, ())
            cs = [t for t in lic_by_sur.get(loose(brand), []) if not t["область"] or t["область"] in regs]
            if cs:
                cand = " | можливо (реєстр ліцензій, перевірити): " + "; ".join(
                    f"{t['назва']} (ІПН {t['код']}, ліцензія з {t['перша_ліцензія_таксі']}, авто 2022: {t['авто_2022'] or '—'}, {t['область'] or 'область ?'})" for t in cs[:3])
        if hit:
            if key not in (hit.get("ключ_джерела") or "").split():
                hit["ключ_джерела"] = (hit.get("ключ_джерела", "") + " " + key).strip()
            add_list(hit, "де_рекламується", [label], "; ")
            if f"[{today} Bolt маркетплейс: «{owner}»" not in hit.get("нотатки", ""):
                hit["нотатки"] = f"[{today} {note}] " + hit.get("нотатки", "")
            dec, cid = "у реєстрі (позначено)", hit["id"]
            st["уже були"] += 1
        else:
            prio = "C" if network else ("A" if len(ls) >= 2 else "B")
            cid = f"{next_id:03d}"
            next_id += 1
            row = {k: "" for k in fields}
            row.update({"id": cid, "назва": brand[:80], "місто": city, "url_оголошення": ls[0]["url"], "ключ_джерела": key,
                        "перевірено": "ні", "к-сть_авто": f"~{len(ls)}",
                        "сегмент": "мережа (орієнтир)" if network else "оренда авто через Bolt (парк-партнер Bolt)",
                        "джерело": "Bolt маркетплейс оренди", "де_рекламується": label, "пріоритет": prio, "стадія": "не перевірено",
                        "наступна_дія": "орієнтир, не писати (фільтр пізніше)" if prio == "C" else "знайти контакт (за назвою / прізвищем)",
                        "дата_наступної": "", "нотатки": note + cand})
            rows.append(row)
            by_key[key] = row
            dec = f"додано ({prio})"
            st[f"додано {prio}"] += 1
            if cand:
                st["з кандидатом у реєстрі ліцензій"] += 1
        s = seen.get(key) or {"ключ_джерела": key, "метод": METHOD, "вперше": today}
        s.update({"місто": city, "назва": owner[:80], "востаннє": today, "оголошень_востаннє": len(ls), "рішення": dec, "client_id": cid})
        seen[key] = s

    print(f"оголошень: {len(data['listings'])}; власників: {len(owners)}; " + "; ".join(f"{k}: {v}" for k, v in sorted(st.items())))
    if not dry:
        write(REG, rows, fields)
        write(SEEN, list(seen.values()), SEEN_FIELDS)
        subprocess.run([sys.executable, "-I", str(ROOT / "registry" / "render_md.py")], check=True)


if __name__ == "__main__":
    main()
