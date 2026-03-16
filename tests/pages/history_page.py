"""Page Object for History / Logs pages."""

from selenium.webdriver.common.by import By
from .base_page import BasePage
import time


class PatientHistoryPage(BasePage):
    URL = "http://localhost:3000/telehealth/history"

    HISTORY_CARDS = (By.CSS_SELECTOR, ".history-card, .appointment-card, .history-item")
    LINKED_PRESCRIPTIONS = (By.XPATH, "//a[contains(text(),'Prescription')] | //button[contains(text(),'Prescription')]")
    EMPTY_STATE = (By.CSS_SELECTOR, ".empty-state, .no-history")
    PAGE_CONTAINER = (By.CSS_SELECTOR, ".history-page, .telehealth-container")

    def navigate(self):
        self.open(self.URL)
        self.wait_page_load()
        time.sleep(2)

    def is_page_loaded(self):
        return self.is_element_visible(*self.PAGE_CONTAINER, timeout=10)

    def get_history_count(self):
        try:
            cards = self.find_all(*self.HISTORY_CARDS, timeout=5)
            return len(cards)
        except Exception:
            return 0
