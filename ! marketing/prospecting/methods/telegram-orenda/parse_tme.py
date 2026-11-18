"""Читає публічні сторінки Telegram для знайдених чатів: https://t.me/s/<username> (канали: опис + останні ~20 постів)
і https://t.me/<username> (групи: назва, опис, к-сть учасників; повідомлення груп без логіна не видно).

Usage (з папки `! marketing`):
    python -I prospecting/methods/telegram-orenda/parse_tme.py prospecting/_raw/<date>_telegram-discover.json prospecting/_raw/<date>_telegram-tme.json

Нічого не пише в Telegram, логін не потрібен. Пауза 1,5 с між запитами.
Вихід: {"fetched": ISO, "chats": [{username, kind, title, count, description, posts: [text], phones: [+380…],
         mentions: [@user], links: [url], cities: [..], foreign: bool}]}
"""
import html, json, re, sys, time, datetime, urllib.request

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"
PHONE_RE = re.compile(r"(?:\+?38)?[\s(]*0\d{2}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}(?!\d)")
CITIES = {
    "Київ": r"київ|киев|kyiv|kiev", "Львів": r"львів|львов|lviv", "Одеса": r"одес|odes", "Дніпро": r"дніпр|днепр|dnipr",
    "Харків": r"харків|харьков|kharkiv", "Вінниця": r"вінниц|винниц|vinn", "Запоріжжя": r"запоріж|запорож|zapor",
    "Миколаїв": r"миколаїв|николаев|mykola", "Івано-Франківськ": r"франківськ|франковск|frankivsk|\bіф\b",
    "Тернопіль": r"тернопіл|тернопол|ternopil", "Луцьк": r"луцьк|луцк|lutsk", "Чернівці": r"чернівц|черновц|chernivt",
    "Рівне": r"рівне|ровно|rivne", "Черкаси": r"черкас|cherkas", "Ужгород": r"ужгород|uzhhorod", "Житомир": r"житомир|zhytomyr",
    "Кропивницький": r"кропивницьк|кропивницк|kropyvn", "Чернігів": r"чернігів|чернигов|chernihiv", "Суми": r"\bсуми\b|\bсумы\b|sumy",
    "Хмельницький": r"хмельницьк|хмельницк|khmeln", "Херсон": r"херсон|kherson", "Полтава": r"полтав|poltav",
}
FOREIGN = re.compile(r"москв|moscow|спб|петербург|питер|варшав|warsz|вроцлав|wroc|прага|praha|praga|krak|краков|польщ|польш|polsk|"
                     r"чехі|чехи|germany|німеччин|minsk|мінськ|минск|казахстан|алмат|ташкент|баку|тбілісі|тбилиси|рига|вільнюс", re.I)


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "uk,ru;q=0.8,en;q=0.5"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", "replace")


def text_of(fragment):
    t = re.sub(r"<br\s*/?>", "\n", fragment)
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"[ \t]+", " ", html.unescape(t)).strip()


def norm_phone(t):
    d = re.sub(r"\D", "", t)
    if len(d) == 10 and d.startswith("0"):
        d = "38" + d
    return "+" + d if len(d) == 12 and d.startswith("380") else ""


def parse(username, kind):
    page = get(f"https://t.me/s/{username}") if kind != "group" else ""
    if not page or "tgme_channel_info" not in page:
        page = get(f"https://t.me/{username}")
    title = text_of((re.search(r'(?:tgme_channel_info_header_title|tgme_page_title)[^>]*>(.*?)</div>', page, re.S) or [None, ""])[1])
    desc = text_of((re.search(r'(?:tgme_channel_info_description|tgme_page_description)[^>]*>(.*?)</div>', page, re.S) or [None, ""])[1])
    cnt = re.search(r'(?:counter_value">([\d.,\sKkM]+)</span>\s*<span class="counter_type">(subscribers|members)|tgme_page_extra">([\d\s]+)\s*(subscribers|members))', page)
    posts = [text_of(p) for p in re.findall(r'<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>', page, re.S)]
    blob = " \n".join([title, desc] + posts)
    phones = sorted({norm_phone(m) for m in PHONE_RE.findall(blob)} - {""})
    mentions = sorted({m for m in re.findall(r"@([A-Za-z0-9_]{5,})", blob)} - {username})
    links = sorted(set(re.findall(r'href="(https?://(?!t\.me/s/)[^"]+)"', page)))[:30]
    cities = [c for c, rx in CITIES.items() if re.search(rx, blob, re.I)]
    return {"username": username, "kind": kind, "title": title, "count_raw": " ".join(x for x in (cnt.groups() if cnt else []) if x),
            "description": desc[:1500], "posts": [p[:800] for p in posts[-20:]], "phones": phones,
            "mentions": ["@" + m for m in mentions], "links": [l for l in links if "telegram.org" not in l and "t.me/" not in l],
            "cities": cities, "foreign": bool(FOREIGN.search(title + " " + desc)) and not cities}


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    src, out = sys.argv[1], sys.argv[2]
    chats = [c for c in json.load(open(src, encoding="utf-8"))["chats"] if c.get("username")]
    res = []
    for i, c in enumerate(chats, 1):
        try:
            r = parse(c["username"], c.get("kind", ""))
            r.update({"peer": c.get("peer"), "count": c.get("count"), "search_title": c.get("title"), "queries": c.get("queries", [])})
            res.append(r)
        except Exception as e:  # недоступний/видалений чат — фіксуємо і йдемо далі
            res.append({"username": c["username"], "error": str(e)[:200], "queries": c.get("queries", [])})
        if i % 20 == 0:
            print(f"  {i}/{len(chats)}")
        time.sleep(1.5)
    json.dump({"fetched": datetime.datetime.now().isoformat(timespec="seconds"), "chats": res},
              open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    ok = [r for r in res if "error" not in r]
    print(f"чатів: {len(res)}; прочитано: {len(ok)}; з телефонами: {sum(1 for r in ok if r['phones'])}; "
          f"українських (місто згадано): {sum(1 for r in ok if r['cities'])}; іноземних: {sum(1 for r in ok if r['foreign'])}")


if __name__ == "__main__":
    main()
