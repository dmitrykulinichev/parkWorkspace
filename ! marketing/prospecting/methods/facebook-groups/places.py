"""Facebook: знайдені групи → список майданчиків facebook_places.csv (дослідження ринку: де рекламуються оренду авто під таксі).

Usage (з папки `! marketing`):
    python -I prospecting/methods/facebook-groups/places.py prospecting/_raw/<date>_facebook-discover.json

Відбір (версія 1.0): потрібні саме ПАРКИ під таксі — група релевантна, якщо в назві є таксі/taxi/Uklon/Bolt/Uber/автопарк/викуп;
продаж авто (продаж/продам/куплю/авторинок/автобазар) відкидаємо, якщо в назві немає таксі/оренди; загальна «оренда авто» без таксі — ні
(рішення власника g24, 2026-11-17).
Місто — за назвою (ті самі шаблони, що в telegram parse_tme.py); іноземні (Москва, Польща…) відкидаємо.
Групи не є власниками, тому в реєстр не йдуть. Власників з постів витягає наступний крок (read_fb.js → merge_posts.py).
"""
import csv, json, re, sys, pathlib, datetime

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "telegram-orenda"))
from parse_tme import CITIES, FOREIGN  # noqa: E402  (спільні шаблони міст)

OUT = HERE / "facebook_places.csv"
FIELDS = ["id", "назва", "доступ", "учасників", "активність", "міста", "тип", "запити", "url", "вперше", "востаннє"]
# лише ПАРКИ / таксі: Uklon, Bolt, Uber, таксі, таксопарк, автопарк, викуп під таксі. Загальна «оренда авто» без таксі — ні.
REL = re.compile(r"такс|taxi|uklon|уклон|bolt|болт|uber|убер|автопарк|(під|под|з правом|с правом|с)\s+в[иы]куп", re.I)
# скупка авто («автовикуп», «викуп авто в Європі»), вантажне таксі, Молдова — не наше
NOT_OURS = re.compile(r"автов[иы]куп|в[иы]куп (авто|вашого|ваших)|терміновий викуп|вантаж|грузов|gazel|газел|молдов|moldov|șofer", re.I)
SALE = re.compile(r"продаж|продам|продаю|куплю|купівл|авторин|авторын|автобазар|базар|розборк|запчаст", re.I)
RENT = re.compile(r"оренд|аренд|прокат|викуп|выкуп|такс|taxi", re.I)


def members(raw):
    m = re.match(r"([\d.,]+)\s*([KkMm]?)", raw or "")
    if not m:
        return 0
    n = float(m.group(1).replace(",", "."))
    return int(n * (1000 if m.group(2).lower() == "k" else 1_000_000 if m.group(2).lower() == "m" else 1))


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    data = json.load(open(sys.argv[1], encoding="utf-8"))
    today = datetime.date.today().isoformat()
    old = {}
    if OUT.exists():
        with open(OUT, encoding="utf-8-sig", newline="") as f:
            old = {r["id"]: r for r in csv.DictReader(f, delimiter=";")}
    keep, drop = [], 0
    for g in data["groups"]:
        name = g["name"]
        if not REL.search(name) or NOT_OURS.search(name) or (SALE.search(name) and not re.search(r"такс|taxi|оренд|аренд", name, re.I)) or FOREIGN.search(name):
            drop += 1
            continue
        cities = [c for c, rx in CITIES.items() if re.search(rx, name, re.I)]
        kind = ("оренда/викуп" if re.search(r"оренд|аренд|прокат|викуп|выкуп", name, re.I) else
                "водії/робота" if re.search(r"водії|водій|водител|робот|работ", name, re.I) else "таксі/автопарк")
        r = old.get(g["id"], {"id": g["id"], "вперше": today})
        r.update({"назва": name, "доступ": g.get("privacy", ""), "учасників": members(g.get("members_raw")),
                  "активність": g.get("activity", ""), "міста": ", ".join(cities), "тип": kind,
                  "запити": " | ".join(g.get("queries", [])[:4]), "url": f"https://www.facebook.com/groups/{g['id']}/", "востаннє": today})
        keep.append(r)
    keep.sort(key=lambda r: -int(r["учасників"] or 0))
    with open(OUT, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS, delimiter=";", extrasaction="ignore")
        w.writeheader()
        w.writerows(keep)
    print(f"груп знайдено: {len(data['groups'])}; релевантних: {len(keep)} (відкритих {sum(1 for r in keep if r['доступ'] == 'public')}); відкинуто: {drop}")
    for r in keep[:25]:
        print(f"  {r['учасників']:>7} {r['доступ']:<7} {r['тип']:<14} {r['міста'][:20]:<20} {r['назва'][:60]}")


if __name__ == "__main__":
    main()
