"""Записати спробу контакту / відповідь у журнал `registry/contacts.csv` і оновити ліда в `registry/clients.csv`.

Кожна дія з лідом = окремий рядок у contacts.csv: що зробили, яким способом, з яким результатом. Нічого не видаляємо й не
переписуємо — навіть невдалі спроби (не взяв слухавку, номера немає у Viber, повідомлення не доставлено) фіксуємо.

Usage (з папки `! marketing`):
    python -I registry/log_contact.py <client_id> <тип> <канал> <результат> [--text "зміст"] [--next "наступний крок"]
                                      [--date YYYY-MM-DD] [--in] [--stage <стадія>]

  тип:       чернетка | перше | follow-up | спроба | відповідь | розмова | демо | відмова
             (спроба = контакт не відбувся: не взяли слухавку, номера немає у Viber/Telegram, не доставлено)
  канал:     viber | telegram | дзвінок | sms | olx-чат | email | зустріч | інше (можна з номером: "viber +380…")
  результат: надіслано | доставлено | прочитано | без відповіді | не взяв | номер не у viber | не доставлено |
             відповів | цікаво | не цікаво | передзвонити | ...  (вільний текст)
  --in       вхідне (пишуть/дзвонять нам); за замовчуванням вихідне

Автоматично оновлює clients.csv (якщо не задано --stage):
  перше / follow-up (вих)  → стадія «написав», наступна дія follow-up: після першого +3 дні, після першого follow-up +4 дні
                              (тобто 7-й день), після другого follow-up — «закрити як мовчить» на +1 день
  спроба                   → стадія не змінюється; наступна дія «повторити спробу» +1 день
  відповідь / --in          → «відповів», наступна дія «відповісти / домовитись про розмову» сьогодні
  розмова / демо           → «розмова», наступна дія з --next або «наступний крок після розмови» +2 дні
  відмова                  → «відмова», дата порожня; причину пишемо в --text
  чернетка                 → стадія не змінюється; наступна дія «надіслати чернетку» сьогодні
Після запису перегенеровує REGISTRY.md.
"""
import argparse, csv, datetime, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
REG, CON = ROOT / "registry" / "clients.csv", ROOT / "registry" / "contacts.csv"
CON_FIELDS = ["дата", "client_id", "канал", "напрям", "тип", "зміст", "результат", "наступний_крок"]
TYPES = {"чернетка", "перше", "follow-up", "спроба", "відповідь", "розмова", "демо", "відмова"}


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("client_id"); ap.add_argument("тип", choices=sorted(TYPES)); ap.add_argument("канал"); ap.add_argument("результат")
    ap.add_argument("--text", default=""); ap.add_argument("--next", default=""); ap.add_argument("--date")
    ap.add_argument("--in", dest="inbound", action="store_true"); ap.add_argument("--stage")
    a = ap.parse_args()
    day = datetime.date.fromisoformat(a.date) if a.date else datetime.date.today()
    plus = lambda n: (day + datetime.timedelta(days=n)).isoformat()

    with open(REG, encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f, delimiter=";"))
    fields = list(rows[0].keys())
    lead = next((r for r in rows if r["id"] == a.client_id.zfill(3) or r["id"] == a.client_id), None)
    if not lead:
        sys.exit(f"немає клієнта з id {a.client_id}")

    with open(CON, encoding="utf-8-sig", newline="") as f:
        history = [c for c in csv.DictReader(f, delimiter=";") if c["client_id"] == lead["id"]]
    followups = sum(1 for c in history if c["тип"] == "follow-up" and c["напрям"] == "вих")

    t = a.тип
    stage, action, date = lead["стадія"], a.next, ""
    if a.inbound or t == "відповідь":
        stage, action, date = "відповів", a.next or "відповісти / домовитись про розмову", day.isoformat()
    elif t == "перше":
        stage, action, date = "написав", a.next or "follow-up №1 (день 3)", plus(3)
    elif t == "follow-up":
        if followups == 0:
            stage, action, date = "написав", a.next or "follow-up №2 (день 7), останній", plus(4)
        else:
            stage, action, date = "написав", a.next or "мовчить → закрити як «відмова: мовчить»", plus(1)
    elif t == "спроба":
        action, date = a.next or f"повторити спробу ({a.канал}: {a.результат})", plus(1)
    elif t in ("розмова", "демо"):
        stage, action, date = "розмова", a.next or "наступний крок після розмови", plus(2)
    elif t == "відмова":
        stage, action, date = "відмова", a.next or "—", ""
    elif t == "чернетка":
        action, date = a.next or "надіслати чернетку з contacts.csv", day.isoformat()
    if a.stage:
        stage = a.stage

    with open(CON, "a", encoding="utf-8", newline="") as f:
        csv.writer(f, delimiter=";").writerow([day.isoformat(), lead["id"], a.канал, "вх" if a.inbound else "вих", t, a.text,
                                               a.результат, action])
    lead.update({"стадія": stage, "наступна_дія": action, "дата_наступної": date})
    if t == "відмова" and a.text:
        lead["нотатки"] = f"[{day.isoformat()} відмова: {a.text}] " + lead.get("нотатки", "")
    with open(REG, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, delimiter=";")
        w.writeheader(); w.writerows(rows)
    print(f"№{lead['id']} {lead['назва']}: {t} / {a.канал} / {a.результат} → стадія «{stage}», далі: {action} {date}")
    subprocess.run([sys.executable, "-I", str(ROOT / "registry" / "render_md.py")], check=True, stdout=subprocess.DEVNULL)


if __name__ == "__main__":
    main()
