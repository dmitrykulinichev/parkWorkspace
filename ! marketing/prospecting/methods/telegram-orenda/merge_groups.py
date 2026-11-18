"""Злиття повідомлень з Telegram-груп (read_groups.js) у реєстр: хто з власників пише «здам авто» в групах.

Usage (з папки `! marketing`):
    python -I prospecting/methods/telegram-orenda/merge_groups.py prospecting/_raw/<date>_telegram-groups.json [--dry-run]
    python -I prospecting/methods/telegram-orenda/merge_groups.py prospecting/_raw/<date>_facebook-posts.json --site facebook [--dry-run]

Правила (версія 1.0):
  - оголошення = повідомлення зі словом оренда/здам/викуп/прокат І ціною (грн/$/тиждень/доба) або телефоном,
    але НЕ попит (куплю/візьму/шукаю) і НЕ іноземне (злоті, крони, лв, євро; Варшава, Прага…)
  - автор оголошення = телефон з тексту (+380…) → інакше перший @контакт з тексту (пости каналів-дошок без автора)
    → інакше відправник у групі (fromPeer + ім'я)
  - один автор у кількох групах = один запис; к-сть оголошень і різних авто (за моделями) рахуємо
  - є в реєстрі (за телефоном) → «де_рекламується» += «Telegram (@група)» + відмітка; немає → новий лід, ключ
    tgph:<+380…> або tgu:<peer>; пріоритет A якщо різних авто ≥ 3, B — 1–2 авто, C — > 15 оголошень-авто
  - 🚩 Полтава + Володимир/Вова в імені автора → позначка
"""
import csv, json, sys, datetime, pathlib, re, subprocess, collections

ROOT = pathlib.Path(__file__).resolve().parents[3]
REG = ROOT / "registry" / "clients.csv"
SEEN = ROOT / "registry" / "seen.csv"
PLACES = pathlib.Path(__file__).resolve().parent / "telegram_places.csv"
METHOD = "telegram-orenda/groups"
SEEN_FIELDS = ["ключ_джерела", "метод", "місто", "назва", "вперше", "востаннє", "оголошень_востаннє", "рішення", "client_id"]
# оголошення = слово про оренду/викуп І (ціна або телефон); у чатах водіїв просто «Bolt/Uklon» — це балачки, не оголошення
AD_WORD = re.compile(r"оренд|аренд|здам|здаю|сдам|сдаю|викуп|выкуп|прокат", re.I)
AD_TERMS = re.compile(r"\d[\d\s]*\s*(грн|uah|₴|\$|usd|дол)|(тиж|нед|доб|сут|міс|мес)\w*.{0,20}\d|\d.{0,20}(тиж|нед|доб|сут)", re.I)


# попит («куплю/візьму/шукаю/интересует») та іноземні оголошення (злоті, крони, лв, євро) — не наші
NOT_AD = re.compile(r"куплю|візьму|возьму|интересует|цікавить|шукаю (авто|машин)|ищу (авто|машин)|орендую|арендую|"
                    r"зл|злот|zł|крон|лв|евро|євро|€|eur|варшав|warsz|краков|вроцлав|praha|прага|софи", re.I)


class _Ad:
    @staticmethod
    def search(t):
        return (bool(AD_WORD.search(t)) and (bool(AD_TERMS.search(t)) or bool(PHONE_RE.search(t)))
                and not NOT_AD.search(t))


AD = _Ad()
PHONE_RE = re.compile(r"(?:\+?38)?[\s(]*0\d{2}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}(?!\d)")
MODEL = re.compile(r"\b(toyota|тойота|prius|пріус|приус|camry|corolla|kia|кіа|киа|hyundai|хюндай|хендай|skoda|шкода|octavia|октавія|"
                   r"renault|рено|logan|логан|megane|nissan|ніссан|leaf|ліф|lif|volkswagen|vw|фольксваген|passat|golf|ford|форд|focus|"
                   r"chevrolet|шевроле|bolt|болт|tesla|тесла|byd|mitsubishi|lancer|mazda|мазда|honda|хонда|ioniq|elantra|sonata|"
                   r"cerato|rio|ceed|optima|k5|zoe|зое|peugeot|пежо|citroen|ситроен|opel|опель|daewoo|lanos|ланос|chery|geely)\b", re.I)
VOLOD = re.compile(r"волод|владимир|вова|vova|volod|vladimir", re.I)


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


def norm_phone(t):
    d = re.sub(r"\D", "", t)
    if len(d) == 10 and d.startswith("0"):
        d = "38" + d
    return "+" + d if len(d) == 12 and d.startswith("380") else ""


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
    # --site facebook: той самий алгоритм для постів Facebook-груп (prospecting/methods/facebook-groups/read_fb.js)
    fb = "--site" in sys.argv and sys.argv[sys.argv.index("--site") + 1] == "facebook"
    global PLACES, METHOD
    if fb:
        PLACES = ROOT / "prospecting" / "methods" / "facebook-groups" / "facebook_places.csv"
        METHOD = "facebook-groups/posts"
        fbp = {p["id"]: p for p in read(PLACES)}
        for g in data["groups"]:
            g["username"] = g["group"]
            g["messages"] = [{"text": x["text"], "from": x["author"], "fromPeer": x["uid"], "ts": 0} for x in g["posts"]]
            g["_label"] = f"Facebook ({fbp.get(g['group'], {}).get('назва', g.get('name', ''))[:40]})"
    today = datetime.date.today().isoformat()
    rows = read(REG)
    fields = list(rows[0].keys())
    by_key = {k: r for r in rows for k in (r.get("ключ_джерела") or "").split()}
    by_phone = {p.strip(): r for r in rows for p in (r.get("телефон") or "").split(",") if p.strip()}
    places = ({p["id"]: dict(p, username=p["id"]) for p in read(PLACES)} if fb else {p["username"]: p for p in read(PLACES)})
    next_id = max(int(r["id"]) for r in rows) + 1

    # автори оголошень по всіх групах
    authors = {}
    for g in data["groups"]:
        gcity = (places.get(g["username"], {}).get("міста") or "").split(",")[0].strip()
        for m in g["messages"]:
            if not AD.search(m["text"]):
                continue
            phones = sorted({norm_phone(x) for x in PHONE_RE.findall(m["text"])} - {""})
            ats = [x for x in re.findall(r"@([A-Za-z][A-Za-z0-9_]{4,})", m["text"]) if not x.lower().endswith("bot")]
            # автор: телефон → @контакт з тексту (пости дошок) → відправник у групі
            akey = (f"tgph:{phones[0]}" if phones else f"tgat:{ats[0].lower()}" if ats else
                    (f"fbu:{m['fromPeer']}" if fb else f"tgu:{m['fromPeer']}") if m.get("fromPeer") else "")
            if not akey:
                continue
            a = authors.setdefault(akey, {"phones": set(), "names": set(), "groups": set(), "ads": 0, "models": set(), "texts": [], "city": gcity, "fwd": False})
            a["phones"].update(phones)
            a.setdefault("ats", set()).update("@" + x for x in ats)
            if m.get("from"):
                a["names"].add(re.sub(r"^Forwarded from\s*", "", m["from"]).strip())
            a["groups"].add(g.get("_label") or g["username"])
            a.setdefault("gids", set()).add(g["username"])
            a["ads"] += 1
            a["models"].update(x.lower() for x in MODEL.findall(m["text"]))
            a["fwd"] = a["fwd"] or m.get("fwd", False)
            if len(a["texts"]) < 3:
                a["texts"].append(re.sub(r"\s+", " ", m["text"])[:160])

    seen = {s["ключ_джерела"]: s for s in read(SEEN)}
    st = collections.Counter()
    for akey, a in sorted(authors.items(), key=lambda kv: -kv[1]["ads"]):
        labels = [g if g.startswith("Facebook (") else f"Telegram (@{g})" for g in sorted(a["groups"])]
        name = (", ".join(sorted(a["names"]))[:60] or " ".join(sorted(a.get("ats", set()))[:2]) or
                f"Власник з {'Facebook' if fb else 'Telegram'}-оголошення ({akey.split(':', 1)[1]})")
        cars = len(a["models"])
        volod = a["city"] == "Полтава" and VOLOD.search(name)
        r0 = by_key.get(akey) or next((by_phone[p] for p in a["phones"] if p in by_phone), None)
        if r0:
            for l in labels:
                add_list(r0, "де_рекламується", [l], "; ")
            add_list(r0, "телефон", sorted(a["phones"]), ", ")
            if akey not in (r0.get("ключ_джерела") or "").split():
                r0["ключ_джерела"] = (r0.get("ключ_джерела", "") + " " + akey).strip()
            site = "Facebook-групи" if fb else "Telegram-групи"
            mark = f"[{today} {site} {'; '.join(labels)}: {a['ads']} огол., моделей {cars}]"
            if f"[{today} {site}" not in r0.get("нотатки", ""):
                r0["нотатки"] = (mark + " " + r0.get("нотатки", "")).strip()
            dec, cid = "у реєстрі (позначено)", r0["id"]
            st["уже були"] += 1
        else:
            prio = "C" if cars > 15 else ("A" if cars >= 3 else "B")
            cid = f"{next_id:03d}"
            next_id += 1
            row = {k: "" for k in fields}
            row.update({
                "id": cid, "назва": name, "місто": a["city"], "контактна_особа": " ".join(sorted(a.get("ats", set()))[:3]) or name,
                "url_оголошення": (f"https://www.facebook.com/groups/{next(iter(a['gids']))}/" if fb else f"https://t.me/{sorted(a['groups'])[0]}"), "ключ_джерела": akey,
                "перевірено": "так" if (a["phones"] or a.get("ats")) else "ні", "сегмент": "власник, здає авто (" + ("Facebook" if fb else "Telegram") + "-група)",
                "к-сть_авто": f"~{cars}" if cars else "", "джерело": "Facebook групи" if fb else "Telegram групи", "де_рекламується": "; ".join(labels),
                "пріоритет": prio, "стадія": "перевірено" if (a["phones"] or a.get("ats")) else "не перевірено",
                "наступна_дія": "перше повідомлення (телефон з оголошення)" if a["phones"] else "знайти контакт (написати в групі/особисто)",
                "дата_наступної": today if prio != "C" else "",
                "нотатки": ("🚩 Володимир/Полтава? " if volod else "") +
                           f"{a['ads']} огол. у {len(a['groups'])} групах | моделі: {', '.join(sorted(a['models']))[:80]} | " + " ; ".join(a["texts"]),
            })
            add_list(row, "телефон", sorted(a["phones"]), ", ")
            rows.append(row)
            by_key[akey] = row
            for p in a["phones"]:
                by_phone.setdefault(p, row)
            dec = f"додано ({prio})"
            st[f"додано {prio}"] += 1
        if volod:
            print(f"  🚩 {name} ({a['city']}) — №{cid}")
        s = seen.get(akey) or {"ключ_джерела": akey, "метод": METHOD, "вперше": today}
        s.update({"місто": a["city"], "назва": name, "востаннє": today, "оголошень_востаннє": a["ads"], "рішення": dec, "client_id": cid})
        seen[akey] = s

    print(f"груп: {len(data['groups'])}; авторів оголошень: {len(authors)}; " + "; ".join(f"{k}: {v}" for k, v in st.items()))
    if not dry:
        write(REG, rows, fields)
        write(SEEN, list(seen.values()), SEEN_FIELDS)
        subprocess.run([sys.executable, "-I", str(ROOT / "registry" / "render_md.py")], check=True)


if __name__ == "__main__":
    main()
