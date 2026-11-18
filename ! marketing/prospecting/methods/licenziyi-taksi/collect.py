"""Збір ліцензій Укртрансбезпеки (відкритий API) + довідкові файли data.gov.ua — версія 1.0 (2026-11-18).

Usage (з папки `! marketing`):
    python -I prospecting/methods/licenziyi-taksi/collect.py prospecting/_raw/<YYYY-MM-DD>_licenses

Що робить (нічого не пише на сервер, лише GET; пауза 0,7 с між сторінками; можна перезапускати — продовжить з місця обриву):
  1. https://middleware.dsbt.gov.ua/api/opendata/lc_licenses?page=N (усі сторінки, по 100 ліцензій) → api_pages/NNNN.json
     Поля: entityName (перевізник), entityId (ЄДРПОУ або ІПН), entityActivities[] (вид діяльності + dateFrom),
     decisionDate, status. Це ЖИВІ дані (на 2026-11-18 рішення до 13.11.2026), але БЕЗ авто й регіону.
  2. (якщо ще немає) data.gov.ua «Транспортні засоби, як засоби провадження господарської діяльності», останній файл
     за 18.02.2022 → vehicles_2022-02-18.zip (vehicle.json: OKPOCode, carrierName, vhclNum, vhclType, марка, рік).
     Набір «не оновлюється», але це єдине відкрите джерело к-сті авто по перевізнику; регіон — з літер номера авто.
  3. (якщо ще немає) data.gov.ua «Реєстр ліцензій на … таксі», останній файл за 02.08.2024 → reestr-taksi_2024-08-02.xlsx
     (лише назва, дата, вид діяльності, стан).
"""
import json, pathlib, sys, time, urllib.request

API = "https://middleware.dsbt.gov.ua/api/opendata/lc_licenses?page={}"
FILES = {
    "vehicles_2022-02-18.zip": "https://data.gov.ua/dataset/3f5c6632-cef0-409e-a526-a9a4edebd110/resource/cbc14730-8e1f-4030-a1a5-cd69f2b682f1/download/vehicles-16.zip",
    "reestr-taksi_2024-08-02.xlsx": "https://data.gov.ua/dataset/f3f367fe-ead3-47b1-8208-98546e348727/resource/3dc29630-6077-4c7b-b0e5-8d52888de541/download/reestr-taksi.xlsx",
}
UA = {"User-Agent": "Mozilla/5.0 (research; g24 market study)"}


def get(url, timeout=90):
    for attempt in range(4):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout).read()
        except Exception as e:
            print(f"  повтор {attempt + 1}: {url} — {e!r}"[:200], flush=True)
            time.sleep(5 * (attempt + 1))
    raise RuntimeError(f"не вдалося: {url}")


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    out = pathlib.Path(sys.argv[1])
    pages = out / "api_pages"
    pages.mkdir(parents=True, exist_ok=True)
    for name, url in FILES.items():
        if not (out / name).exists():
            (out / name).write_bytes(get(url, 300))
            print("завантажено", name, flush=True)
    first = json.loads(get(API.format(1)))
    last = first["meta"]["last_page"]
    (pages / "0001.json").write_text(json.dumps(first["data"], ensure_ascii=False), encoding="utf-8")
    print(f"сторінок: {last}, ліцензій: {first['meta']['total']}", flush=True)
    for p in range(2, last + 1):
        f = pages / f"{p:04d}.json"
        if f.exists():
            continue
        d = json.loads(get(API.format(p)))
        f.write_text(json.dumps(d["data"], ensure_ascii=False), encoding="utf-8")
        if p % 50 == 0:
            print(f"  {p}/{last}", flush=True)
        time.sleep(0.7)
    (out / "api_meta.json").write_text(json.dumps({"fetched": time.strftime("%Y-%m-%dT%H:%M:%S"), "pages": last,
                                                   "total": first["meta"]["total"]}, ensure_ascii=False), encoding="utf-8")
    print("готово", flush=True)


if __name__ == "__main__":
    main()
