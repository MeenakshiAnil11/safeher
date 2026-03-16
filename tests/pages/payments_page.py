"""Page Object for Payments / Earnings pages."""

from selenium.webdriver.common.by import By
from .base_page import BasePage
import time


class PatientPaymentsPage(BasePage):
    URL = "http://localhost:3000/telehealth/payments"

    SUMMARY_CARDS = (By.CSS_SELECTOR, ".summary-card, .payment-summary")
    PAYMENT_ROWS = (By.CSS_SELECTOR, ".payment-row, .payment-card, tr")
    INVOICE_BTN = (By.XPATH, "//button[contains(text(),'Invoice') or contains(text(),'Download')]")
    REFUND_BTN = (By.XPATH, "//button[contains(text(),'Refund')]")
    EMPTY_STATE = (By.CSS_SELECTOR, ".empty-state, .no-payments")
    PAGE_CONTAINER = (By.CSS_SELECTOR, ".payments-page, .telehealth-container")

    def navigate(self):
        self.open(self.URL)
        self.wait_page_load()
        time.sleep(2)

    def is_page_loaded(self):
        return self.is_element_visible(*self.PAGE_CONTAINER, timeout=10)

    def get_payment_count(self):
        try:
            rows = self.find_all(*self.PAYMENT_ROWS, timeout=5)
            return len(rows)
        except Exception:
            return 0


class DoctorEarningsPage(BasePage):
    URL = "http://localhost:3000/doctor/earnings"

    EARNINGS_CARDS = (By.CSS_SELECTOR, ".earnings-card, .summary-card")
    TRANSACTION_ROWS = (By.CSS_SELECTOR, ".transaction-row, .earning-row, tr")
    PAGE_CONTAINER = (By.CSS_SELECTOR, ".doctor-earnings, .doctor-earnings-loading, .doctor-layout")

    def navigate(self):
        self.open(self.URL)
        self.wait_page_load()
        time.sleep(2)

    def is_page_loaded(self):
        return self.is_element_visible(*self.PAGE_CONTAINER, timeout=10)
