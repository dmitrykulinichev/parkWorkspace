"""Склеює записи реєстру, що мають спільний телефон, в одного власника: колонка `власник_id` = найменший id групи.

Запуск (з папки `! marketing`): python -I registry/link_owners.py
Викликається автоматично з render_md.py (тобто після кожного merge). Рядки НЕ видаляються і id не змінюються:
кожен запис лишається (у нього своє джерело/оголошення), а `власник_id` показує, що це той самий власник
(напр. одна мережа під різними вивісками чи в різних містах). Для одиночних записів власник_id = власний id.
Номери 0800 (гарячі лінії) теж склеюють — це однозначно одна компанія.
"""
import csv, pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent
REG = HERE / "clients.csv"


def main():
    with open(REG, encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f, delimiter=";"))
    fields = list(rows[0].keys())
    if "власник_id" not in fields:
        fields.insert(fields.index("id") + 1, "власник_id")
    parent = {r["id"]: r["id"] for r in rows}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    first = {}
    for r in rows:
        for p in (r.get("телефон") or "").split(","):
            p = p.strip()
            if not p:
                continue
            if p in first:
                a, b = find(first[p]), find(r["id"])
                if a != b:
                    parent[max(a, b)] = min(a, b)
            else:
                first[p] = r["id"]
    groups = 0
    for r in rows:
        r["власник_id"] = find(r["id"])
    sizes = {}
    for r in rows:
        sizes[r["власник_id"]] = sizes.get(r["власник_id"], 0) + 1
    groups = sum(1 for v in sizes.values() if v > 1)
    with open(REG, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, delimiter=";", extrasaction="ignore")
        w.writeheader()
        w.writerows({k: r.get(k, "") for k in fields} for r in rows)
    print(f"link_owners: записів {len(rows)}, власників {len(sizes)}, груп зі спільним телефоном {groups}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
