"""Pytest configuration — fixtures, hooks, HTML report integration."""

import os
import time
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "reports")
SCREENSHOTS_DIR = os.path.join(REPORTS_DIR, "screenshots")


def pytest_configure(config):
    os.makedirs(REPORTS_DIR, exist_ok=True)
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)


# ── browser fixture ──────────────────────────────────────────────────

@pytest.fixture(scope="session")
def browser():
    """Create a shared Chrome WebDriver for the entire test session."""
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-notifications")
    chrome_options.add_argument("--disable-popup-blocking")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--ignore-certificate-errors")
    # Use fake media streams so getUserMedia succeeds without a camera
    chrome_options.add_argument("--use-fake-ui-for-media-stream")
    chrome_options.add_argument("--use-fake-device-for-media-stream")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.implicitly_wait(10)
    driver.set_page_load_timeout(30)

    yield driver

    driver.quit()


# ── per-test fresh driver (for isolated tests) ──────────────────────

@pytest.fixture
def driver():
    """Per-test Chrome driver for isolation."""
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-notifications")
    chrome_options.add_argument("--disable-popup-blocking")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--ignore-certificate-errors")
    chrome_options.add_argument("--use-fake-ui-for-media-stream")
    chrome_options.add_argument("--use-fake-device-for-media-stream")

    service = Service(ChromeDriverManager().install())
    d = webdriver.Chrome(service=service, options=chrome_options)
    d.implicitly_wait(10)
    d.set_page_load_timeout(30)

    yield d

    d.quit()


# ── screenshot on failure (pytest-html integration) ─────────────────

@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()

    if report.when == "call" and (report.failed or (report.passed and "success_screenshot" in item.keywords)):
        driver_inst = None
        if "driver" in item.funcargs:
            driver_inst = item.funcargs["driver"]
        elif "browser" in item.funcargs:
            driver_inst = item.funcargs["browser"]

        if driver_inst:
            ts = int(time.time())
            name = item.name.replace("[", "_").replace("]", "")
            prefix = "PASS" if report.passed else "FAIL"
            screenshot_path = os.path.join(SCREENSHOTS_DIR, f"{prefix}_{name}_{ts}.png")
            driver_inst.save_screenshot(screenshot_path)

            if hasattr(report, "extra"):
                extra = report.extra
            else:
                extra = []

            rel_path = os.path.relpath(screenshot_path, REPORTS_DIR)
            extra.append(_make_html_extra_image(rel_path))
            report.extra = extra


def _make_html_extra_image(path):
    """Return an html-extra compatible image dict (works with pytest-html >= 4)."""
    try:
        from pytest_html import extras
        return extras.image(path)
    except Exception:
        return {"type": "image", "content": path}


# ── helpers ──────────────────────────────────────────────────────────

def login_as_patient(page):
    from config import PATIENT_EMAIL, PATIENT_PASSWORD
    page.login(PATIENT_EMAIL, PATIENT_PASSWORD)


def login_as_doctor(page):
    from config import DOCTOR_EMAIL, DOCTOR_PASSWORD
    page.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
