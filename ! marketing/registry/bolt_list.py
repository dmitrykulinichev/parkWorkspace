"""Список парків, що працюють з Bolt (для партнерства з Bolt): registry/BOLT.md + registry/bolt_parks.csv.

Генерується з clients.csv автоматично (викликається з render_md.py), тож нові ліди з ознаками Bolt потрапляють сюди самі.
Вручну не редагувати — правки вносимо в clients.csv.

Групи (за силою зв'язку з Bolt):
  1. «маркетплейс Bolt» — здають авто через vehicle.bolt.eu (ключ boltfleet:…) — партнер Bolt напевно;
  2. «лише Bolt» — у назві / оголошеннях / нотатках є Bolt і немає Uklon/Uber (напр. «BOLT, автопарк»);
  3. «Bolt + Uklon/Uber» — згадують Bolt разом з іншими агрегаторами.
«Chevrolet Bolt» (модель авто) не рахується. Записи «не цільовий» пропускаємо. C (великі/мережі) — окремою таблицею як орієнтир.
"""
import csv, collections, datetime, pathlib, re

HERE = pathlib.Path(__file__).resolve().parent
FIELDS = ["група", "id", "власник_id", "назва", "місто", "пріоритет", "стадія", "телефон", "контактна_особа",
          "оголошень_у_Bolt", "ознака", "де_рекламується", "url_оголошення"]
GROUPS = ["маркетплейс Bolt", "лише Bolt", "Bolt + Uklon/Uber"]


def classify(r):
    t = re.sub(r"(chevrolet|chevy|шевроле)\s*(bolt|болт)", " ", f"{r['назва']} {r['сегмент']} {r['нотатки']}", flags=re.I)
    bolt = re.search(r"\bbolt\b|болт", t, re.I)
    other = re.search(r"uklon|уклон|uber|убер", t, re.I)
    if "boltfleet:" in (r.get("ключ_джерела") or ""):
        m = re.search(r"Bolt маркетплейс: «([^»]+)», оголошень (\d+)", r["нотатки"])
        return "маркетплейс Bolt", (m.group(2) if m else ""), (f"підпис у Bolt: {m.group(1)}" if m else "vehicle.bolt.eu")
    if bolt and not other:
        return "лише Bolt", "", "Bolt у назві" if re.search(r"bolt|болт", r["назва"], re.I) else "Bolt в оголошенні/нотатках"
    if bolt:
        return "Bolt + Uklon/Uber", "", "Bolt разом з Uklon/Uber"
    return None, "", ""


def build(clients, out_dir=HERE):
    rows = []
    for r in clients:
        if r.get("стадія") == "не цільовий":
            continue
        g, n, why = classify(r)
        if g:
            rows.append({"група": g, "id": r["id"], "власник_id": r.get("власник_id", ""), "назва": r["назва"], "місто": r["місто"],
                         "пріоритет": r["пріоритет"], "стадія": r["стадія"], "телефон": r["телефон"],
                         "контактна_особа": r.get("контактна_особа", ""), "оголошень_у_Bolt": n, "ознака": why,
                         "де_рекламується": r.get("де_рекламується", ""), "url_оголошення": r.get("url_оголошення", "")})
    order = {"A": 0, "B": 1, "": 2, "C": 3}
    rows.sort(key=lambda x: (GROUPS.index(x["група"]), order.get(x["пріоритет"], 2), x["місто"], x["назва"]))
    with open(out_dir / "bolt_parks.csv", "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS, delimiter=";")
        w.writeheader()
        w.writerows(rows)

    cell = lambda s, n=60: (s or "").replace("|", "/").replace("\n", " ")[:n]
    cnt = collections.Counter((x["група"], x["пріоритет"] == "C") for x in rows)
    owners = {x["власник_id"] or x["id"] for x in rows if x["пріоритет"] != "C"}
    L = ["# Парки, що працюють з Bolt", "",
         f"> Згенеровано {datetime.datetime.now():%Y-%m-%d %H:%M} з `clients.csv` (`registry/bolt_list.py`). Не редагувати вручну.",
         "> Навіщо: партнерство g24 з Bolt (список парків-партнерів Bolt — малих, наш сегмент) і пріоритет для контактів.", "",
         "| група | малі/середні (A/B) | великі (C) |", "|---|---|---|"]
    L += [f"| {g} | {cnt[(g, False)]} | {cnt[(g, True)]} |" for g in GROUPS]
    L += ["", f"Унікальних власників (A/B, за спільним телефоном): **{len(owners)}**. Повна таблиця: `registry/bolt_parks.csv`.", ""]
    for g in GROUPS:
        part = [x for x in rows if x["група"] == g and x["пріоритет"] != "C"]
        if not part:
            continue
        L += [f"## {g}", "", "| id | назва | місто | пр. | стадія | телефон | Bolt-оголошень | ознака | де ще рекламується |",
              "|---|---|---|---|---|---|---|---|---|"]
        L += [f"| {x['id']} | {cell(x['назва'], 40)} | {x['місто']} | {x['пріоритет']} | {x['стадія']} | {cell(x['телефон'], 30)} | "
              f"{x['оголошень_у_Bolt']} | {cell(x['ознака'], 40)} | {cell(x['де_рекламується'], 70)} |" for x in part]
        L.append("")
    big = [x for x in rows if x["пріоритет"] == "C"]
    if big:
        L += ["## Великі / мережі (C, орієнтир)", "", ", ".join(f"{x['id']} {cell(x['назва'], 30)} ({x['місто']})" for x in big), ""]
    (out_dir / "BOLT.md").write_text("\n".join(L) + "\n", encoding="utf-8")
    by_group = collections.Counter(x["група"] for x in rows)
    print(f"BOLT.md: {len(rows)} записів (" + ", ".join(f"{g}: {by_group[g]}" for g in GROUPS) + ")")


if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    with open(HERE / "clients.csv", encoding="utf-8-sig", newline="") as f:
        build(list(csv.DictReader(f, delimiter=";")))
