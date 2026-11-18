"""Каталог Uklon «Пропозиції автопарків» (https://fleet-drivers.uklon.com.ua) — версія 1.0 (2026-11-18).

Офіційний сайт Uklon, де автопарки-партнери публікують вакансії для водіїв. Кожна вакансія = окрема сторінка /vakansiyi/<slug>.
Скрипт лише читає публічні сторінки (GET, пауза 1 с), нічого не надсилає (форми заявок не чіпаємо).

Usage (з папки `! marketing`):
    python -I prospecting/methods/uklon-fleets/collect.py prospecting/_raw/<YYYY-MM-DD>_uklon-fleets.json

Вихід: {"fetched", "source", "fleets": [{slug, url, name, text (очищений текст сторінки, ≤ 6000 симв.), phones, links}]}
"""
import html, json, re, sys, time, urllib.parse, urllib.request

ROOT_URL = "https://fleet-drivers.uklon.com.ua/"
UA = {"User-Agent": "Mozilla/5.0 (research; g24 market study)"}
PHONE_RE = re.compile(r"(?:\+?38)?[\s(]*0\d{2}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}(?!\d)")


def get(url):
    for i in range(3):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read().decode("utf-8", "ignore")
        except Exception as e:
            print("  повтор", url, repr(e)[:120], flush=True)
            time.sleep(5)
    return ""


def text_of(h):
    h = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", h)
    t = html.unescape(re.sub(r"(?s)<[^>]+>", "\n", h))
    lines = [re.sub(r"\s+", " ", l).strip() for l in t.split("\n")]
    out = []
    for l in lines:
        if l and (not out or out[-1] != l):
            out.append(l)
    return "\n".join(out)


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    out = sys.argv[1]
    root = get(ROOT_URL)
    links = sorted(set(html.unescape(l) for l in re.findall(r"https://fleet-drivers\.uklon\.com\.ua/vakansiyi/[^\"'\s<>\\]+", root)))
    # апостроф у slug («кам'янське») приходить як &#x27; — розкодовуємо й кодуємо назад, інакше 404
    links = [urllib.parse.quote(urllib.parse.unquote(l), safe=":/") for l in links]
    print("вакансій у каталозі:", len(links), flush=True)
    fleets = []
    for u in links:
        h = get(u)
        title = html.unescape((re.search(r"<title>(.*?)</title>", h, re.S) or [None, ""])[1]).strip()
        t = text_of(h)
        fleets.append({"slug": urllib.parse.unquote(u.rsplit("/", 1)[-1]), "url": urllib.parse.unquote(u),
                       "name": re.split(r"\s*[|–-]\s*Uklon|\s*\|\s*", title)[0].strip() or title, "title": title,
                       "text": t[:6000], "phones": sorted({re.sub(r"\D", "", p) for p in PHONE_RE.findall(t)}),
                       "links": sorted({l for l in re.findall(r"https?://[^\"'\s<>\\]+", h)
                                        if not re.search(r"wix|uklon|google|facebook\.com/tr|parastorage|sentry|w3\.org|schema\.org", l)})[:20]})
        time.sleep(1)
    json.dump({"fetched": time.strftime("%Y-%m-%dT%H:%M:%S"), "source": ROOT_URL, "fleets": fleets},
              open(out, "w", encoding="utf-8"), ensure_ascii=False)
    print("готово:", len(fleets), flush=True)


if __name__ == "__main__":
    main()
