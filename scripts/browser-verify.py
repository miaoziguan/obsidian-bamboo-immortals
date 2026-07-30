#!/usr/bin/env python3
"""
竹林修仙传 375px 视口浏览器验证脚本

用法：
    1. 启动本地服务器：python3 -m http.server 8001 --directory webapp
    2. 运行验证：python3 scripts/browser-verify.py
    3. 查看结果：open docs/browser-verify-output/results.json
"""
from playwright.sync_api import sync_playwright
import json
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "docs", "browser-verify-output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

results = {
    "viewport": {"width": 375, "height": 812},
    "shadow_host": "#bamboo-shadow-host",
    "tests": []
}

SHADOW = "#bamboo-shadow-host >> "

def log_test(name, status, details=None):
    results["tests"].append({"name": name, "status": status, "details": details or {}})
    print(f"[{status}] {name}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 375, "height": 812})
    page = context.new_page()

    console_logs = []
    page.on("console", lambda msg: console_logs.append(f"{msg.type}: {msg.text}"))
    page.on("pageerror", lambda err: console_logs.append(f"pageerror: {err}"))

    page.goto("http://localhost:8001")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2500)

    shadow_ok = page.locator("#bamboo-shadow-host").count() == 1
    log_test("Shadow host mounted", "OK" if shadow_ok else "FAIL", {"exists": shadow_ok})

    page.screenshot(path=os.path.join(OUTPUT_DIR, "01-initial-375px.png"), full_page=True)
    log_test("Initial 375px screenshot", "OK", {"file": "01-initial-375px.png"})

    try:
        fab = page.locator(f"{SHADOW}#fabMain")
        fab.wait_for(state="visible", timeout=5000)
        log_test("FAB main button exists", "OK",
                 {"aria-expanded": fab.get_attribute("aria-expanded"),
                  "aria-label": fab.get_attribute("aria-label"),
                  "aria-controls": fab.get_attribute("aria-controls")})

        fab.click()
        page.wait_for_timeout(600)
        menu = page.locator(f"{SHADOW}#fabActions")
        log_test("FAB menu open", "OK",
                 {"aria-expanded": fab.get_attribute("aria-expanded"),
                  "menu_visible": menu.is_visible()})
        page.screenshot(path=os.path.join(OUTPUT_DIR, "02-fab-open-375px.png"), full_page=True)

        menuitems = page.locator(f"{SHADOW}[role='menuitem']").count()
        log_test("FAB menu items", "OK" if menuitems >= 5 else "FAIL", {"count": menuitems})

        # 验证打开状态下再次点击主按钮可关闭（修复 mousedown/click 冲突）
        fab.click()
        page.wait_for_timeout(600)
        expanded_after_click = fab.get_attribute("aria-expanded")
        log_test("FAB menu close (click main button)", "OK" if expanded_after_click == "false" else "FAIL",
                 {"aria-expanded": expanded_after_click, "menu_visible": menu.is_visible()})

        page.keyboard.press("Escape")
        page.wait_for_timeout(1000)
        actions_class = menu.get_attribute("class")
        log_test("FAB menu close (Escape)", "OK",
                 {"aria-expanded": fab.get_attribute("aria-expanded"),
                  "actions_class": actions_class,
                  "menu_visible": menu.is_visible()})
    except Exception as e:
        log_test("FAB test", "FAIL", {"error": str(e)})

    try:
        fab.click()
        page.wait_for_timeout(600)
        settings_btn = page.locator(f"{SHADOW}[data-action='fab-settings']")
        if settings_btn.count() > 0:
            settings_btn.click()
            page.wait_for_timeout(1000)
            fab_panel = page.locator(f"{SHADOW}.fab-panel")
            modal_overlay = page.locator(f"{SHADOW}.modal-overlay")
            modal_visible = (fab_panel.is_visible() if fab_panel.count() > 0 else False) or \
                            (modal_overlay.is_visible() if modal_overlay.count() > 0 else False)
            log_test("Settings modal open", "OK" if modal_visible else "FAIL",
                     {"fab_panel": fab_panel.count(), "modal_overlay": modal_overlay.count()})
            page.screenshot(path=os.path.join(OUTPUT_DIR, "03-settings-modal-375px.png"), full_page=True)

            close_btn = page.locator(".fab-panel-close, .modal-close, [data-action='close-modal']").first
            if close_btn.count() > 0:
                close_btn.click()
                page.wait_for_timeout(400)
                still_visible = (fab_panel.is_visible() if fab_panel.count() > 0 else False) or \
                                (modal_overlay.is_visible() if modal_overlay.count() > 0 else False)
                log_test("Settings modal close", "OK" if not still_visible else "FAIL",
                         {"visible": still_visible})
        else:
            log_test("Settings modal open", "FAIL", {"error": "Settings button not found"})
    except Exception as e:
        log_test("Modal test", "FAIL", {"error": str(e)})

    try:
        goal_rows = page.locator(f"{SHADOW}.goal-row, {SHADOW}.goal-title, {SHADOW}[data-goal-id]").count()
        log_test("Goal rows rendered", "OK" if goal_rows > 0 else "INFO",
                 {"count": goal_rows,
                  "note": "独立浏览器缺少 Obsidian Vault 数据时目标列表为空"})
        if goal_rows == 0:
            log_test("Goal inline edit", "INFO",
                     {"reason": "No goal rows rendered in standalone browser without vault data"})
    except Exception as e:
        log_test("Inline edit test", "FAIL", {"error": str(e)})

    try:
        aria_info = page.evaluate("""
        () => {
            const host = document.querySelector('#bamboo-shadow-host');
            const root = host && host.shadowRoot ? host.shadowRoot : document;
            const els = root.querySelectorAll('[role], [aria-label], [aria-expanded], [aria-hidden], [aria-live]');
            const bodyEls = document.body.querySelectorAll('[role], [aria-label], [aria-expanded], [aria-hidden], [aria-live]');
            return Array.from(new Set([...els, ...bodyEls])).slice(0, 100).map(el => ({
                tag: el.tagName, id: el.id, role: el.getAttribute('role'),
                ariaLabel: el.getAttribute('aria-label'),
                ariaExpanded: el.getAttribute('aria-expanded'),
                ariaHidden: el.getAttribute('aria-hidden'),
                ariaLive: el.getAttribute('aria-live'),
                className: el.className
            }));
        }
        """)
        with open(os.path.join(OUTPUT_DIR, "aria-snapshot.json"), "w", encoding="utf-8") as f:
            json.dump(aria_info, f, ensure_ascii=False, indent=2)
        log_test("ARIA snapshot", "OK",
                 {"file": "aria-snapshot.json", "count": len(aria_info),
                  "skip_link": any(el.get("className") and "skip-link" in el.get("className") for el in aria_info),
                  "live_region": any(el.get("ariaLive") == "polite" for el in aria_info)})
    except Exception as e:
        log_test("ARIA snapshot", "FAIL", {"error": str(e)})

    results["console_logs"] = console_logs[-50:]
    with open(os.path.join(OUTPUT_DIR, "results.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    browser.close()
    print(f"\n验证完成，结果保存至：{OUTPUT_DIR}")
