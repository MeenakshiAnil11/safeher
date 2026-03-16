"""Page Object for Appointments pages (patient + doctor)."""

from selenium.webdriver.common.by import By
from .base_page import BasePage
import time


class PatientAppointmentsPage(BasePage):
    URL = "http://localhost:3000/telehealth/appointments"

    TAB_UPCOMING = (By.XPATH, "//button[contains(text(),'Upcoming')]")
    TAB_PAST = (By.XPATH, "//button[contains(text(),'Past')]")
    TAB_CANCELLED = (By.XPATH, "//button[contains(text(),'Cancelled')]")
    APPOINTMENT_CARDS = (By.CSS_SELECTOR, ".appointment-card, .apt-card")
    EMPTY_STATE = (By.CSS_SELECTOR, ".empty-state, .no-appointments")
    JOIN_BTN = (By.XPATH, "//button[contains(text(),'Join')]")
    CANCEL_BTN = (By.XPATH, "//button[contains(text(),'Cancel')]")
    PAGE_CONTAINER = (By.CSS_SELECTOR, ".appointments-page, .telehealth-container")

    def navigate(self):
        self.open(self.URL)
        self.wait_page_load()
        time.sleep(2)

    def is_page_loaded(self):
        return self.is_element_visible(*self.PAGE_CONTAINER, timeout=10)

    def get_appointment_count(self):
        try:
            cards = self.find_all(*self.APPOINTMENT_CARDS, timeout=5)
            return len(cards)
        except Exception:
            return 0

    def click_upcoming_tab(self):
        self.click(*self.TAB_UPCOMING)
        time.sleep(1)

    def click_past_tab(self):
        self.click(*self.TAB_PAST)
        time.sleep(1)

    def is_empty_state(self):
        return self.is_element_visible(*self.EMPTY_STATE, timeout=5)


class DoctorAppointmentsPage(BasePage):
    URL = "http://localhost:3000/doctor/appointments"

    APPOINTMENTS_TABLE = (By.CSS_SELECTOR, ".appointments-table, .doctor-appointments")
    APPOINTMENT_ROWS = (By.CSS_SELECTOR, ".appointment-row, .apt-row, tr")
    ACCEPT_BTN = (By.XPATH, "//button[contains(text(),'Accept')]")
    REJECT_BTN = (By.XPATH, "//button[contains(text(),'Reject')]")
    FILTER_SELECT = (By.CSS_SELECTOR, "select, .filter-select")
    PAGE_CONTAINER = (By.CSS_SELECTOR, ".doctor-appointments, .doctor-appointments-loading, .doctor-layout")

    def navigate(self):
        self.open(self.URL)
        self.wait_page_load()
        time.sleep(2)

    def is_page_loaded(self):
        return self.is_element_visible(*self.PAGE_CONTAINER, timeout=10)

    def get_appointment_count(self):
        try:
            rows = self.find_all(*self.APPOINTMENT_ROWS, timeout=5)
            return len(rows)
        except Exception:
            return 0
