"""Локальна таблиця реєстру ліцензій на таксі: registry/licenses_taxi.csv — версія 1.0 (2026-11-18).

Зберігаємо ВЕСЬ реєстр (усі чинні ліцензіати таксі, і водіїв-одинаків теж), щоб повертатися до нього без повторного завантаження:
фільтрувати, шукати контакти, відстежувати новачків. Перегенеровується з сирих даних `_raw/<дата>_licenses/`.

Usage (з папки `! marketing`; запускати ПІСЛЯ merge.py, щоб підтягнулися client_id):
    python -I prospecting/methods/licenziyi-taksi/build_table.py prospecting/_raw/<дата>_licenses

Колонки: код (ЄДРПОУ/ІПН) · назва · тип (ФОП/ТОВ) · перша_ліцензія_таксі · новачок (так, якщо перша ліцензія з 2025) ·
дати_ліцензій_таксі · інші_види (на замовлення, автобуси…) · рішення_останнє · авто_2022 · місто_за_номерами · область ·
моделі · роки_випуску · client_id (точний збіг: ключ lic:<код> у clients.csv) ·
можливий_збіг (кандидати для РУЧНОЇ перевірки: «id назва — підстава») · дані_станом_на.

Можливий збіг (не склеюємо автоматично):
  - ФОП: у реєстрі клієнтів запис «Прізвище, ФОП» без ініціалів або з одним ініціалом, той самий регіон (або регіон невідомий),
    і прізвище унікальне серед ліцензіатів цього регіону;
  - ТОВ: нормалізована назва клієнта ⊂ назви ліцензіата або навпаки (≥ 5 літер, не загальні слова), той самий регіон.
"""
import collections, csv, importlib.util, json, pathlib, re, sys, zipfile

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[2]
spec = importlib.util.spec_from_file_location("lm", HERE / "merge.py")
lm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lm)
OUT = ROOT / "registry" / "licenses_taxi.csv"
FIELDS = ["код", "назва", "тип", "перша_ліцензія_таксі", "новачок", "дати_ліцензій_таксі", "інші_види", "рішення_останнє",
          "авто_2022", "місто_за_номерами", "область", "моделі", "роки_випуску", "client_id", "можливий_збіг", "дані_станом_на"]


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    src = pathlib.Path(sys.argv[1])
    meta = json.loads((src / "api_meta.json").read_text(encoding="utf-8")) if (src / "api_meta.json").exists() else {}
    lic = {}
    for f in sorted((src / "api_pages").glob("*.json")):
        for x in json.loads(f.read_text(encoding="utf-8")):
            acts = x.get("entityActivities") or []
            if x.get("status") != "Чинна" or not any("таксі" in a["name"] for a in acts):
                continue
            e = lic.setdefault(x["entityId"], {"name": (x["entityName"] or "").strip(), "dates": set(), "other": set(), "dec": set()})
            e["dates"].update(a.get("dateFrom") or "" for a in acts if "таксі" in a["name"])
            e["other"].update(a["name"] for a in acts if "таксі" not in a["name"])
            if x.get("decisionDate"):
                e["dec"].add(x["decisionDate"])
    cars = collections.defaultdict(dict)
    for v in json.load(zipfile.ZipFile(src / "vehicles_2022-02-18.zip").open("vehicle.json")):
        if v["vhclType"] in lm.CAR_TYPES and v.get("vhclNum"):
            cars[v["OKPOCode"]][v["vhclNum"]] = v

    clients = lm.read(lm.REG)
    by_key = {k: r for r in clients for k in (r.get("ключ_джерела") or "").split()}
    # кандидати для ручної перевірки
    fop_loose = collections.defaultdict(list)   # прізвище → записи «Прізвище, ФОП» без повних ініціалів
    co_names = []
    for r in clients:
        if re.search(r"фоп|флп", r["назва"], re.I):
            k = lm.fop_key_short(r["назва"])
            if k and not (k[1] and k[2]):
                fop_loose[k[0]].append(r)
        elif r["назва"] and not r.get("джерело", "").startswith("Реєстр ліцензій"):
            nm = lm.norm(r["назва"])
            # лише назви компаній: ≥ 2 слів або цифри/латиниця (а не ім'я людини з OLX «Олександр»)
            if len(nm) >= 5 and not all(w in lm.GENERIC for w in nm.split()) and                     (len(nm.split()) >= 2 or re.search(r"[0-9a-z]", nm)) and not lm.is_person(r["назва"]):
                co_names.append((nm, r))

    rows, surname_reg = [], collections.Counter()
    for code, e in lic.items():
        vs = list(cars.get(code, {}).values())
        regs = collections.Counter(lm.plate_region(v["vhclNum"]) for v in vs if lm.plate_region(v["vhclNum"]))
        city, oblast = regs.most_common(1)[0][0] if regs else ("", "")
        is_co = not lm.is_person(e["name"]) and (bool(lm.COMPANY.search(e["name"])) or len(code) == 8)
        if not is_co:
            fk = lm.fop_key_full(e["name"])
            if fk:
                surname_reg[(fk[0], oblast)] += 1
        first = lm.first_date(e["dates"])
        models = collections.Counter(f"{(v.get('vhclVendorID') or '').strip()} {(v.get('vhclModel') or '').strip()}".strip() for v in vs)
        years = sorted(y for y in (v.get("vchlManufYear") for v in vs) if isinstance(y, int) and y > 1950)
        hit = by_key.get(f"lic:{code}")
        rows.append({"код": code, "назва": e["name"], "тип": "ТОВ/підприємство" if is_co else "ФОП",
                     "перша_ліцензія_таксі": first.isoformat() if first else "", "новачок": "так" if first and first >= lm.NOVICE_FROM else "",
                     "дати_ліцензій_таксі": ", ".join(sorted(d for d in e["dates"] if d)), "інші_види": "; ".join(sorted(e["other"])),
                     "рішення_останнє": max(e["dec"], key=lambda s: s[-4:] + s[3:5] + s[:2]) if e["dec"] else "",
                     "авто_2022": len(vs) or "", "місто_за_номерами": city, "область": oblast,
                     "моделі": ", ".join(f"{m} ×{k}" for m, k in models.most_common(5)),
                     "роки_випуску": f"{years[0]}–{years[-1]}" if years else "", "client_id": hit["id"] if hit else "",
                     "можливий_збіг": "", "дані_станом_на": meta.get("fetched", "")[:10] + " (ліцензії) / 2022-02-18 (авто)",
                     "_is_co": is_co, "_oblast": oblast})

    n_cand = 0
    for r in rows:
        if r["client_id"]:
            continue
        cands = []
        if not r["_is_co"]:
            fk = lm.fop_key_full(r["назва"])
            if fk and surname_reg[(fk[0], r["_oblast"])] == 1:
                for c in fop_loose.get(fk[0], []):
                    k = lm.fop_key_short(c["назва"])
                    reg_ok = not r["_oblast"] or not c["місто"] or lm.CITY2REGION.get(c["місто"]) in (r["_oblast"], None)
                    if reg_ok and (not k[1] or k[1] == fk[1]):
                        cands.append(f"{c['id']} {c['назва'][:30]} ({c['місто']}) — прізвище{' + ініціал' if k[1] else ''}, регіон")
        else:
            ln = lm.norm(r["назва"])
            if len(ln) >= 5 and not all(w in lm.GENERIC for w in ln.split()):
                for nm, c in co_names:
                    if (nm in ln or ln in nm) and (not r["_oblast"] or not c["місто"] or lm.CITY2REGION.get(c["місто"]) in (r["_oblast"], None)):
                        cands.append(f"{c['id']} {c['назва'][:30]} ({c['місто']}) — назва")
        if cands:
            r["можливий_збіг"] = "; ".join(cands[:3])
            n_cand += 1

    rows.sort(key=lambda r: (r["новачок"] != "так", -(r["авто_2022"] or 0), r["назва"]))
    with open(OUT, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS, delimiter=";", extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    print(f"licenses_taxi.csv: {len(rows)} ліцензіатів; новачків {sum(1 for r in rows if r['новачок'])}; "
          f"точно в реєстрі клієнтів {sum(1 for r in rows if r['client_id'])}; можливих збігів для перевірки {n_cand}")


if __name__ == "__main__":
    main()
