"""Page Object for Prescriptions pages."""

from selenium.webdriver.common.by import By
from .base_page import BasePage
import time


class PatientPrescriptionsPage(BasePage):
    URL = "http://localhost:3000/telehealth/prescriptions"

    PRESCRIPTION_CARDS = (By.CSS_SELECTOR, ".prescription-card, .pres-card")
    DOWNLOAD_BTN = (By.XPATH, "//button[contains(text(),'Download')]")
    FORWARD_BTN = (By.XPATH, "//button[contains(text(),'Forward')]")
    EMPTY_STATE = (By.CSS_SELECTOR, ".empty-state, .no-prescriptions")
    PAGE_CONTAINER = (By.CSS_SELECTOR, ".prescriptions-page, .telehealth-container")

    def navigate(self):
        self.open(self.URL)
        self.wait_page_load()
        time.sleep(2)

    def is_page_loaded(self):
        return self.is_element_visible(*self.PAGE_CONTAINER, timeout=10)

    def get_prescription_count(self):
        try:
            cards = self.find_all(*self.PRESCRIPTION_CARDS, timeout=5)
            return len(cards)
        except Exception:
            return 0


class DoctorPrescriptionsPage(BasePage):
    URL = "http://localhost:3000/doctor/prescriptions"

    PRESCRIPTION_FORM = (By.CSS_SELECTOR, ".prescription-form, form")
    PRESCRIPTION_LIST = (By.CSS_SELECTOR, ".prescription-list, .prescriptions-table")
    SUBMIT_BTN = (By.XPATH, "//button[contains(text(),'Save') or contains(text(),'Submit')]")
    PAGE_CONTAINER = (By.CSS_SELECTOR, ".doctor-prescriptions, .doctor-prescriptions-loading, .doctor-layout")

    def navigate(self):
        self.open(self.URL)
        self.wait_page_load()
        time.sleep(2)

    def is_page_loaded(self):
        return self.is_element_visible(*self.PAGE_CONTAINER, timeout=10)
