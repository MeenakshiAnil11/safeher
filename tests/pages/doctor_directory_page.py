"""Page Object for Doctor Directory and Booking Modal."""

from selenium.webdriver.common.by import By
from .base_page import BasePage
import time


class DoctorDirectoryPage(BasePage):
    URL = "http://localhost:3000/telehealth/doctors"

    DOCTOR_CARDS = (By.CSS_SELECTOR, ".doctor-card")
    SEARCH_INPUT = (By.CSS_SELECTOR, "input[placeholder*='Search'], .search-input")
    FILTER_SECTION = (By.CSS_SELECTOR, ".filter-section, .filter-bar")
    BOOK_BUTTONS = (By.XPATH, "//button[contains(text(),'Book')]")
    SPECIALIZATION_FILTER = (By.CSS_SELECTOR, "select, .spec-filter")
    PAGE_CONTAINER = (By.CSS_SELECTOR, ".doctor-directory, .telehealth-container")

    # Booking Modal
    MODAL_OVERLAY = (By.CSS_SELECTOR, ".modal-overlay")
    BOOKING_MODAL = (By.CSS_SELECTOR, ".booking-modal")
    DATE_INPUT = (By.CSS_SELECTOR, ".date-input-field")
    TIME_SLOTS = (By.CSS_SELECTOR, ".time-slot-btn")
    CONTINUE_BTN = (By.CSS_SELECTOR, ".btn-continue")
    BACK_BTN = (By.CSS_SELECTOR, ".btn-back")
    CONSULT_TYPE_CARDS = (By.CSS_SELECTOR, ".consultation-type-card")
    CONFIRM_PAY_BTN = (By.CSS_SELECTOR, ".btn-confirm-pay")
    PAYMENT_SUCCESS = (By.CSS_SELECTOR, ".payment-success")
    GO_DASHBOARD_BTN = (By.CSS_SELECTOR, ".btn-go-dashboard")

    def navigate(self):
        self.open(self.URL)
        self.wait_page_load()
        time.sleep(2)

    def is_page_loaded(self):
        return self.is_element_visible(*self.PAGE_CONTAINER, timeout=10)

    def get_doctor_cards_count(self):
        try:
            cards = self.find_all(*self.DOCTOR_CARDS, timeout=5)
            return len(cards)
        except Exception:
            return 0

    def click_first_book_button(self):
        buttons = self.find_all(*self.BOOK_BUTTONS, timeout=10)
        if buttons:
            self.scroll_to(buttons[0])
            time.sleep(0.5)
            self.js_click(buttons[0])
            time.sleep(1)

    def is_booking_modal_open(self):
        return self.is_element_visible(*self.BOOKING_MODAL, timeout=5)

    def select_first_available_time(self):
        slots = self.find_all(*self.TIME_SLOTS, timeout=5)
        for slot in slots:
            if slot.is_enabled():
                self.scroll_to(slot)
                self.js_click(slot)
                time.sleep(0.5)
                return True
        return False

    def click_continue(self):
        self.click(*self.CONTINUE_BTN)
        time.sleep(1)

    def select_first_consult_type(self):
        cards = self.find_all(*self.CONSULT_TYPE_CARDS, timeout=5)
        if cards:
            self.js_click(cards[0])
            time.sleep(0.5)

    def click_confirm_pay(self):
        self.click(*self.CONFIRM_PAY_BTN)
        time.sleep(2)

    def is_payment_success(self):
        return self.is_element_visible(*self.PAYMENT_SUCCESS, timeout=15)
