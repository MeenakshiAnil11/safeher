"""Base Page Object with common helpers for all pages."""

import os
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains


class BasePage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 15)

    def open(self, url):
        self.driver.get(url)
        time.sleep(1)

    def find(self, by, value, timeout=15):
        return WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located((by, value))
        )

    def find_visible(self, by, value, timeout=15):
        return WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located((by, value))
        )

    def find_clickable(self, by, value, timeout=15):
        return WebDriverWait(self.driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )

    def find_all(self, by, value, timeout=10):
        WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located((by, value))
        )
        return self.driver.find_elements(by, value)

    def click(self, by, value, timeout=15):
        self.dismiss_webpack_overlay()
        el = self.find_clickable(by, value, timeout)
        try:
            el.click()
        except Exception:
            self.js_click(el)
        return el

    def type_text(self, by, value, text, clear=True):
        self.dismiss_webpack_overlay()
        el = self.find_visible(by, value)
        if clear:
            el.clear()
        el.send_keys(text)
        return el

    def get_text(self, by, value, timeout=15):
        return self.find_visible(by, value, timeout).text

    def is_element_present(self, by, value, timeout=5):
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return True
        except Exception:
            return False

    def is_element_visible(self, by, value, timeout=5):
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located((by, value))
            )
            return True
        except Exception:
            return False

    def wait_for_url_contains(self, text, timeout=15):
        WebDriverWait(self.driver, timeout).until(EC.url_contains(text))

    def wait_for_text(self, by, value, text, timeout=15):
        WebDriverWait(self.driver, timeout).until(
            EC.text_to_be_present_in_element((by, value), text)
        )

    def scroll_to(self, element):
        self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
        time.sleep(0.3)

    def take_screenshot(self, name):
        os.makedirs("reports/screenshots", exist_ok=True)
        path = f"reports/screenshots/{name}_{int(time.time())}.png"
        self.driver.save_screenshot(path)
        return path

    def get_current_url(self):
        return self.driver.current_url

    def get_title(self):
        return self.driver.title

    def get_local_storage(self, key):
        return self.driver.execute_script(f"return localStorage.getItem('{key}');")

    def set_local_storage(self, key, value):
        self.driver.execute_script(f"localStorage.setItem('{key}', arguments[0]);", value)

    def clear_local_storage(self):
        self.driver.execute_script("localStorage.clear();")

    def js_click(self, element):
        self.driver.execute_script("arguments[0].click();", element)

    def dismiss_webpack_overlay(self):
        """Remove the webpack-dev-server error/warning overlay if present."""
        try:
            self.driver.execute_script("""
                var overlay = document.getElementById('webpack-dev-server-client-overlay');
                if (overlay) overlay.remove();
                var overlayDiv = document.getElementById('webpack-dev-server-client-overlay-div');
                if (overlayDiv) overlayDiv.remove();
            """)
        except Exception:
            pass

    def wait_page_load(self, timeout=10):
        time.sleep(1)
        WebDriverWait(self.driver, timeout).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        self.dismiss_webpack_overlay()
