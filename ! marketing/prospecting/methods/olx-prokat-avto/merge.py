"""Merge OLX «Прокат авто» collector output into registry/clients.csv and registry/seen.csv.

Usage (з папки `! marketing`):
    python -I prospecting/methods/olx-prokat-avto/merge.py prospecting/_raw/<date>_olx-prokat-avto.json [--dry-run]

Вхідний JSON: {"config":..., "started":..., "rows":[профілі з g24olx.export], "sellers":["id|місто|n|ім'я", ...]}

Правила відбору (версія 1.3: + телефони, написані в тексті оголошень; 1.2; 1.2 — великі таксі-парки (>15) теж у реєстр як C «орієнтир», колонка «де_рекламується»):
  - кандидат: taxi_hits >= 1 (хоч одне оголошення згадує таксі/Uklon/Bolt/Uber) І rent_ads >= 2 (понад 15 → C, орієнтир)
    rent_ads = кількість активних оголошень продавця в категорії «Прокат авто» ≈ кількість авто
    (верхня межа 15, а не 10: одне авто інколи має 2 оголошення)
    без згадки таксі — переважно весільні/VIP/туристичні прокати → не додаємо, але пишемо в seen.csv
  - пріоритет A: 3 <= rent_ads <= 10; B: rent_ads == 2 або 11..15; C: > 15 і згадує таксі (великий парк, орієнтир, без дати)
  - вже в реєстрі → дописуємо «OLX прокат (<місто>)» у «де_рекламується»
  - дубль: якщо `ключ_джерела` (olx:<user_id>) вже є в clients.csv → не додаємо

seen.csv — журнал УСІХ переглянутих власників (і доданих, і відсіяних), ключ = ключ_джерела.
Для власника, що вже є в журналі, оновлюємо `востаннє`, `оголошень_востаннє`, `рішення`; поле `вперше` не змінюється.
Відсіяних раніше переоцінюємо щоразу (власник міг вирости).
"""
import csv, json, sys, datetime, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[3]  # ! marketing
REG = ROOT / "registry" / "clients.csv"
SEEN = ROOT / "registry" / "seen.csv"
METHOD = "olx-prokat-avto"
FIELDS = ["id", "назва", "місто", "телефон", "контактна_особа", "url_оголошення", "ключ_джерела",
          "перевірено", "сегмент", "к-сть_авто", "район", "джерело", "де_рекламується", "пріоритет", "стадія",
          "наступна_дія", "дата_наступної", "нотатки"]
SEEN_FIELDS = ["ключ_джерела", "метод", "місто", "назва", "вперше", "востаннє", "оголошень_востаннє", "рішення", "client_id"]


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
    """Дописує майданчик у «де_рекламується» (без повторів): так видно, де рекламується кожен лід/парк."""
    cur = [x.strip() for x in (row.get("де_рекламується") or "").split(";") if x.strip()]
    if label not in cur:
        cur.append(label)
    row["де_рекламується"] = "; ".join(cur)


def norm_phone(t):
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


def reject_reason(r):
    if r["rent_ads"] > 15 and not r["taxi_hits"]:
        return f"завеликий, таксі не згадано (rent_ads={r['rent_ads']})"
    if r["rent_ads"] < 2:
        return f"замалий (rent_ads={r['rent_ads']})"
    if not r["taxi_hits"]:
        return f"таксі не згадано (rent_ads={r['rent_ads']})"
    return None


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    src, dry = sys.argv[1], "--dry-run" in sys.argv
    data = json.load(open(src, encoding="utf-8"))
    today = datetime.date.today().isoformat()
    rows = read(REG)
    # ключ_джерела може містити кілька ключів через пробіл (один власник у різних джерелах)
    by_key = {k: r for r in rows for k in (r.get("ключ_джерела") or "").split()}
    next_id = max([int(r["id"]) for r in rows] or [0]) + 1
    decision = {}  # key -> (рішення, client_id, к-сть)
    added = dup = skipped = 0

    for r in sorted(data["rows"], key=lambda r: (r["city"], -r["rent_ads"])):
        k = r["key"]
        label = f"OLX прокат ({r['city']})"
        phones = sorted({norm_phone(p) for p in r.get("phones", [])} - {""})
        if k in by_key:
            dup += 1
            add_platform(by_key[k], label)
            add_phones(by_key[k], phones)
            decision[k] = ("у реєстрі", by_key[k]["id"], r["rent_ads"])
            continue
        why = reject_reason(r)
        if why:
            skipped += 1
            decision[k] = (f"не підійшов: {why}", "", r["rent_ads"])
            continue
        big = r["rent_ads"] > 15
        seg = "великий парк (орієнтир)" if big else "оренда під таксі"
        if r["buyout"]:
            seg += " + викуп"
        cid = f"{next_id:03d}"
        row = {
            "id": cid,
            "назва": r["company"] or r["name"],
            "місто": r["city"],
            "контактна_особа": r["name"],
            "url_оголошення": r["url"],
            "ключ_джерела": k,
            "перевірено": "так",
            "сегмент": seg,
            "к-сть_авто": f"~{r['rent_ads']}",
            "район": r["districts"],
            "джерело": "OLX прокат авто",
            "де_рекламується": label,
            "пріоритет": "C" if big else ("A" if 3 <= r["rent_ads"] <= 10 else "B"),
            "стадія": "перевірено",
            "наступна_дія": "орієнтир, не писати (фільтр за к-стю авто пізніше)" if big
                            else "перше повідомлення (чат OLX або телефон з оголошення)",
            "дата_наступної": "" if big else today,
            "нотатки": f"профіль: {r['profile_url']} | оголошень з таксі: {r['taxi_hits']}/{r['rent_ads']} | "
                       + " ; ".join(r["titles"][:4]),
        }
        add_phones(row, phones)
        rows.append(row)
        by_key[k] = row
        decision[k] = ("додано", cid, r["rent_ads"])
        next_id += 1
        added += 1

    # журнал переглянутих
    seen = {s["ключ_джерела"]: s for s in read(SEEN)}
    for line in data.get("sellers", []):
        uid, city, n, name = line.split("|", 3)
        k = f"olx:{uid}"
        dec, cid, cnt = decision.get(k, ("не підійшов: замалий (1 оголошення у скані)", by_key.get(k, {}).get("id", ""), n))
        if k in by_key and not cid:
            dec, cid = "у реєстрі", by_key[k]["id"]
        s = seen.get(k) or {"ключ_джерела": k, "метод": METHOD, "вперше": today}
        s.update({"місто": city, "назва": name, "востаннє": today, "оголошень_востаннє": cnt, "рішення": dec, "client_id": cid})
        seen[k] = s

    print(f"профілів: {len(data['rows'])}; додано: {added}; вже в реєстрі: {dup}; не підійшли: {skipped}; "
          f"переглянуто власників усього: {len(data.get('sellers', []))}; у журналі seen: {len(seen)}")
    if not dry:
        write(REG, rows, FIELDS)
        write(SEEN, list(seen.values()), SEEN_FIELDS)
        import subprocess  # оновлюємо людську MD-версію реєстру
        subprocess.run([sys.executable, "-I", str(ROOT / "registry" / "render_md.py")], check=True)


if __name__ == "__main__":
    main()
