"""Генерує registry/REGISTRY.md з clients.csv + contacts.csv + seen.csv (тільки для читання людиною).

Запуск (з папки `! marketing`):  python -I registry/render_md.py
Викликається автоматично в кінці кожного merge.py. MD вручну не редагуємо: дані живуть у CSV.
"""
import csv, collections, datetime, pathlib, re, sys

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / "REGISTRY.md"
FINAL = {"відмова", "не цільовий", "платить"}
STAGES = ["не перевірено", "перевірено", "написав", "відповів", "розмова", "онбординг", "активний", "платить", "відмова", "не цільовий"]


def read(name):
    p = HERE / name
    if not p.exists():
        return []
    with open(p, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f, delimiter=";"))


def cell(s, n=None):
    s = (s or "").replace("|", "/").replace("\n", " ").strip()
    return s if not n or len(s) <= n else s[: n - 1] + "…"


def render_map(clients, by_id, today):
    """KARTA.md — «карта бойових дій»: лише ліди, з якими працюємо (є хоч один запис у contacts.csv), воронка, справи
    на сьогодні й повна історія кожного ліда (усі спроби, способи, результати, коментарі, тексти повідомлень)."""
    work = [c for c in clients if by_id.get(c["id"])]
    st = collections.Counter(c["стадія"] for c in work)
    L = ["# Карта бойових дій: ведення лідів", "",
         f"> Згенеровано {datetime.datetime.now():%Y-%m-%d %H:%M} з `clients.csv` і `contacts.csv`. Не редагувати вручну.",
         "> Записати дію: `python -I registry/log_contact.py <id> <тип> <канал> <результат> --text \"коментар\"` "
         "(тип: чернетка / перше / follow-up / спроба / відповідь / розмова / демо / відмова).", "",
         "## Воронка", "", "| " + " | ".join(s for s in STAGES if s != "не перевірено") + " |",
         "|" + "---|" * (len(STAGES) - 1),
         "| " + " | ".join(str(st[s]) for s in STAGES if s != "не перевірено") + " |", ""]
    due = sorted([c for c in work if c.get("дата_наступної") and c["дата_наступної"] <= today and c["стадія"] not in FINAL],
                 key=lambda c: c["дата_наступної"])
    soon = sorted([c for c in work if c.get("дата_наступної") and c["дата_наступної"] > today and c["стадія"] not in FINAL],
                  key=lambda c: c["дата_наступної"])
    for title, lst in (("## Сьогодні (і прострочене)", due), ("## Найближчі дні", soon)):
        L += [title, ""]
        if lst:
            L += ["| id | лід | контакт | стадія | що робити | коли |", "|---|---|---|---|---|---|"]
            L += [f"| [{c['id']}](#{c['id']}) | {cell(c['назва'], 40)} ({c['місто']}) | {cell(c.get('контактна_особа'), 20)} {cell(c['телефон'], 30)} "
                  f"| {c['стадія']} | {cell(c['наступна_дія'], 70)} | {c['дата_наступної']} |" for c in lst]
        else:
            L.append("—")
        L.append("")
    L += ["## Ліди в роботі", ""]
    for c in sorted(work, key=lambda c: (c["стадія"] in FINAL, c.get("дата_наступної") or "9999", c["id"])):
        hist = by_id[c["id"]]
        tries = [h for h in hist if h["тип"] != "чернетка"]
        L += [f'<a id="{c["id"]}"></a>', f"### {c['id']} · {cell(c['назва'])} · {c['місто']} · **{c['стадія']}**", "",
              f"- Контакт: {cell(c.get('контактна_особа')) or '—'} · {cell(c['телефон']) or '—'}",
              f"- Пріоритет {c['пріоритет'] or '—'} · авто: {c.get('к-сть_авто') or '?'} · де рекламується: {cell(c.get('де_рекламується'), 200) or '—'}",
              f"- Оголошення: {c.get('url_оголошення') or '—'}",
              f"- Далі: **{cell(c['наступна_дія'])}** {c['дата_наступної'] or ''}",
              f"- Спроб контакту: {len([h for h in tries if h['напрям'] == 'вих'])} · відповідей: {len([h for h in tries if h['напрям'] == 'вх'])}",
              f"- Нотатки: {cell(c.get('нотатки'), 400)}", "", "| дата | хто | тип | канал | результат | коментар / зміст | наступний крок |",
              "|---|---|---|---|---|---|---|"]
        for h in hist:
            who = "ми →" if h["напрям"] == "вих" else "← вони"
            L.append(f"| {h['дата']} | {who} | {h['тип']} | {cell(h['канал'], 40)} | {cell(h['результат'], 40)} | {cell(h['зміст'], 900)} | {cell(h['наступний_крок'], 80)} |")
        L.append("")
    if not work:
        L.append("Поки немає жодного ліда з записами в журналі.")
    (HERE / "KARTA.md").write_text("\n".join(L) + "\n", encoding="utf-8")
    print(f"KARTA.md: лідів у роботі {len(work)}, на сьогодні {len(due)}")


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    import subprocess  # спершу склеюємо записи зі спільним телефоном (колонка власник_id)
    subprocess.run([sys.executable, "-I", str(HERE / "link_owners.py")], check=True)
    clients, contacts, seen = read("clients.csv"), read("contacts.csv"), read("seen.csv")
    today = datetime.date.today().isoformat()
    last = {}
    for c in contacts:
        if c.get("тип") != "чернетка":
            last[c["client_id"]] = c
    by_id = collections.defaultdict(list)
    for c in contacts:
        by_id[c["client_id"]].append(c)

    L = [f"# Реєстр клієнтів g24", "",
         f"> Згенеровано {datetime.datetime.now():%Y-%m-%d %H:%M} з `clients.csv`, `contacts.csv`, `seen.csv`. "
         "Не редагувати вручну, правки вносимо в CSV.", ""]

    # --- зведення
    st = collections.Counter(c["стадія"] for c in clients)
    owners = len({c.get("власник_id") or c["id"] for c in clients})
    L += ["## Зведення", "", f"Усього в реєстрі: **{len(clients)}** записів · унікальних власників (за спільним телефоном): **{owners}** · переглянуто власників (seen): **{len(seen)}** · контактів записано: **{len([c for c in contacts if c.get('тип') != 'чернетка'])}**", "",
          "| стадія | к-сть |", "|---|---|"]
    L += [f"| {s} | {st[s]} |" for s in STAGES if st[s]]
    pr = collections.Counter(c["пріоритет"] or "—" for c in clients)
    L += ["", "Пріоритет: " + " · ".join(f"**{k}**: {v}" for k, v in sorted(pr.items())), ""]

    # --- де рекламуються (дослідження ринку): майданчик → скільки лідів (A/B) і великих парків-орієнтирів (C)
    plat = collections.defaultdict(collections.Counter)
    multi = []
    for c in clients:
        ps = [x.strip() for x in (c.get("де_рекламується") or "").split(";") if x.strip()]
        for x in ps:
            name = x.split(" (")[0]
            plat[name][c["пріоритет"] or "—"] += 1
        if len({x.split(" (")[0] for x in ps}) > 1:
            multi.append(c)
    if plat:
        L += ["## Де рекламуються", "", "C = великий парк / орієнтир (не наш клієнт, але показує ринок).", "",
              "| майданчик | A | B | C | усього |", "|---|---|---|---|---|"]
        for name, cnt in sorted(plat.items(), key=lambda kv: -sum(kv[1].values())):
            L.append(f"| {name} | {cnt['A']} | {cnt['B']} | {cnt['C']} | {sum(cnt.values())} |")
        L += ["", f"На кількох майданчиках одночасно: **{len(multi)}**" + (": " + ", ".join(f"{c['id']} {cell(c['назва'], 25)}" for c in multi) if multi else ""), ""]

    # --- один власник під кількома записами (спільний телефон)
    grp = collections.defaultdict(list)
    for c in clients:
        grp[c.get("власник_id") or c["id"]].append(c)
    multi_o = sorted([g for g in grp.values() if len(g) > 1], key=lambda g: -len(g))
    if multi_o:
        L += ["## Один власник — кілька записів", "", "Спільний телефон: мережа під різними вивісками, кілька міст або кілька майданчиків.", "",
              "| власник_id | записів | назви (місто) | телефон |", "|---|---|---|---|"]
        for g in multi_o:
            common = set.intersection(*[{p.strip() for p in c["телефон"].split(",") if p.strip()} for c in g]) or {g[0]["телефон"].split(",")[0]}
            names = "; ".join(f"{c['id']} {c['назва'][:22]} ({c['місто']})" for c in g)
            L.append(f"| {g[0].get('власник_id')} | {len(g)} | {cell(names, 300)} | {cell(', '.join(sorted(common))[:40])} |")
        L.append("")

    # --- на сьогодні
    due = [c for c in clients if c["стадія"] not in FINAL and c["стадія"] != "не перевірено"
           and c.get("дата_наступної") and c["дата_наступної"] <= today]
    in_work = [c for c in due if c["стадія"] != "перевірено"]
    L += ["## Сьогодні", "",
          f"Follow-up і відповіді в роботі: **{len(in_work)}** · нових лідів, готових до першого повідомлення: **{len([c for c in due if c['стадія'] == 'перевірено'])}**", ""]
    if in_work:
        L += ["| id | назва | місто | стадія | наступна дія | дата |", "|---|---|---|---|---|---|"]
        L += [f"| {c['id']} | {cell(c['назва'], 40)} | {c['місто']} | {c['стадія']} | {cell(c['наступна_дія'], 60)} | {c['дата_наступної']} |"
              for c in sorted(in_work, key=lambda c: c["дата_наступної"])]
        L.append("")

    # --- в роботі (з історією)
    active = [c for c in clients if by_id.get(c["id"])]
    if active:
        L += ["## В роботі: історія контактів", ""]
        for c in sorted(active, key=lambda c: c["id"]):
            L += [f"### {c['id']} · {cell(c['назва'])} ({c['місто']}) · {c['стадія']}", ""]
            if c.get("url_оголошення"):
                L.append(f"[оголошення]({c['url_оголошення']}) · наступне: {cell(c['наступна_дія'])} {c['дата_наступної']}")
                L.append("")
            for h in by_id[c["id"]]:
                L.append(f"- {h['дата']} · {h['канал']} · {h['напрям']} · {h['тип']}: {cell(h['зміст'], 200)} → {cell(h['результат'])}")
            L.append("")

    render_map(clients, by_id, today)
    # список парків, що працюють з Bolt (BOLT.md + bolt_parks.csv) — для партнерства з Bolt
    import importlib.util
    spec = importlib.util.spec_from_file_location("bolt_list", HERE / "bolt_list.py")
    bolt_list = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(bolt_list)
    bolt_list.build(clients, HERE)

    # --- усі ліди по містах
    L += ["## Усі ліди за містами", ""]
    cities = collections.defaultdict(list)
    for c in clients:
        cities[c["місто"] or "—"].append(c)
    order = sorted(cities, key=lambda k: -len(cities[k]))
    L.append(" · ".join(f"[{k} ({len(cities[k])})](#{re.sub(r'[^\w-]', '', k.lower().replace(' ', '-'))})" for k in order))
    L.append("")
    for city in order:
        rows = sorted(cities[city], key=lambda c: (c["пріоритет"] or "Z", STAGES.index(c["стадія"]) if c["стадія"] in STAGES else 99, c["id"]))
        L += [f"### {city}", "", "| id | пр. | назва / контакт | авто | стадія | де рекламується | оголошення | профіль | деталі |", "|---|---|---|---|---|---|---|---|---|"]
        for c in rows:
            m = re.search(r"профіль: (\S+)", c.get("нотатки", ""))
            titles = c.get("нотатки", "").split("|")[-1] if m else c.get("нотатки", "")
            name = cell(c["назва"], 35) + (f" / {cell(c['контактна_особа'], 20)}" if c.get("контактна_особа") and c["контактна_особа"] != c["назва"] else "")
            ad = f"[→]({c['url_оголошення']})" if c.get("url_оголошення") else ""
            prof = f"[→]({m.group(1)})" if m else ""
            m2 = re.search(r"компанія: (\S+)", c.get("нотатки", ""))
            prof = prof or (f"[→]({m2.group(1)})" if m2 else "")
            L.append(f"| {c['id']} | {c['пріоритет']} | {name} | {c['к-сть_авто']} | {c['стадія']} | {cell(c.get('де_рекламується'), 50)} | {ad} | {prof} | {cell(titles, 90)} |")
        L.append("")

    OUT.write_text("\n".join(L), encoding="utf-8")
    print(f"REGISTRY.md: {len(clients)} лідів, {len(order)} міст")


if __name__ == "__main__":
    main()
