import os
import re
import sys
import time
from datetime import date

from playwright.sync_api import sync_playwright

IT_MONTHS = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"]

EMAIL = os.environ["E2E_EMAIL"]
PASSWORD = os.environ["E2E_PASSWORD"]
BASE = os.environ.get("E2E_BASE", "https://duosync-xxx.web.app")

CONSOLE_ISSUES = []


def on_console(msg):
    if msg.type in ("error", "warning"):
        CONSOLE_ISSUES.append(f"[{msg.type}] {msg.text}")


def on_response(resp):
    url = resp.url
    if "appcheck" in url or "recaptcha" in url:
        try:
            if resp.status >= 400:
                body = resp.text()[:600]
                print(f"BODY: {body}")
        except Exception as e:
            print(f"BODY-ERR: {e}")


def main():
    ts = time.strftime("%H%M%S")
    event_title = f"E2E evento {ts}"
    item_title = f"E2E oggetto {ts}"
    failures = []

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            executable_path=r"C:\Users\Lorenzo\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe",
        )
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        page.on("console", on_console)
        page.on("pageerror", lambda e: CONSOLE_ISSUES.append(f"[pageerror] {e}"))
        page.on("response", on_response)

        # --- login ---
        page.goto(BASE, wait_until="load", timeout=90000)
        print("pagina di login caricata")
        page.fill("#email", EMAIL)
        page.fill("#password", PASSWORD)
        page.get_by_role("button", name="Accedi").click()
        page.wait_for_url(lambda u: "/login" not in u or u.endswith("/login"), timeout=60000)
        page.wait_for_timeout(4000)
        if page.get_by_role("button", name="Periodo successivo").count() == 0:
            failures.append("calendario non caricato dopo login")
            print("!!! calendario non visibile dopo login")

        # --- quick-add evento (oggi) ---
        if not failures:
            today = date.today()
            label = f"Aggiungi evento il {today.day} {IT_MONTHS[today.month - 1]}"
            btns = page.get_by_role("button", name=re.compile(r"^Aggiungi evento il "))
            hit = None
            for i in range(btns.count()):
                if btns.nth(i).get_attribute("aria-label") == label:
                    hit = btns.nth(i)
                    break
            if hit is None:
                failures.append(f"pulsante quick-add per oggi ({label}) non trovato")
            else:
                hit.click()
                page.wait_for_timeout(1500)
                page.get_by_placeholder("Es. Cena romantica").fill(event_title)
                page.get_by_role("button", name="Crea evento").click()
                page.wait_for_timeout(3000)
                page.reload(wait_until="load")
                page.wait_for_timeout(3000)
                if page.get_by_text(event_title, exact=False).count() == 0:
                    failures.append("evento creato non visibile dopo reload")

        # --- wishlist: aggiungi oggetto ---
        page.goto(BASE + "/wishlist/", wait_until="load", timeout=60000)
        page.wait_for_timeout(3000)
        btn = page.get_by_role("button", name="Aggiungi Oggetto")
        if btn.count() == 0:
            failures.append("pulsante Aggiungi Oggetto non trovato")
        else:
            btn.first.click()
            page.wait_for_timeout(1500)
            page.get_by_placeholder("Es. Un nuovo libro").fill(item_title)
            page.get_by_role("button", name="Aggiungi oggetto").click()
            page.wait_for_timeout(3000)
            page.reload(wait_until="load")
            page.wait_for_timeout(3000)
            if page.get_by_text(item_title, exact=False).count() == 0:
                failures.append("oggetto wishlist non visibile dopo reload")

        browser.close()

    print("Titoli di test: ", event_title, "|", item_title)
    if CONSOLE_ISSUES:
        print("---- console issues ----")
        for issue in CONSOLE_ISSUES:
            print(issue)
    else:
        print("nessuna issue in console")

    print("RISULTATO:", "FAIL: " + "; ".join(failures) if failures else "OK")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
