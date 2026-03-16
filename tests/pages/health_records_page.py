"""Page Object for Health Records pages."""

from selenium.webdriver.common.by import By
from .base_page import BasePage
import time


class PatientHealthRecordsPage(BasePage):
    URL = "http://localhost:3000/telehealth/records"

    RECORD_CARDS = (By.CSS_SELECTOR, ".record-card, .health-record")
    UPLOAD_BTN = (By.XPATH, "//button[contains(text(),'Upload')]")
    FILE_INPUT = (By.CSS_SELECTOR, "input[type='file']")
    EMPTY_STATE = (By.CSS_SELECTOR, ".empty-state, .no-records")
    PAGE_CONTAINER = (By.CSS_SELECTOR, ".records-page, .health-data-page, .telehealth-container, .user-telehealth-layout")

    def navigate(self):
        self.open(self.URL)
        self.wait_page_load()
        time.sleep(2)

    def is_page_loaded(self):
        return self.is_element_visible(*self.PAGE_CONTAINER, timeout=10)

    def get_record_count(self):
        try:
            cards = self.find_all(*self.RECORD_CARDS, timeout=5)
            return len(cards)
        except Exception:
            return 0


class DoctorPatientRecordsPage(BasePage):
    URL = "http://localhost:3000/doctor/patients"

    PATIENT_CARDS = (By.CSS_SELECTOR, ".patient-card, .patient-row")
    VIEW_RECORDS_BTN = (By.XPATH, "//button[contains(text(),'View') or contains(text(),'Records')]")
    PAGE_CONTAINER = (By.CSS_SELECTOR, ".doctor-patients, .doctor-patients-loading, .doctor-layout")

    def navigate(self):
        self.open(self.URL)
        self.wait_page_load()
        time.sleep(2)

    def is_page_loaded(self):
        return self.is_element_visible(*self.PAGE_CONTAINER, timeout=10)

    def get_patient_count(self):
        try:
            cards = self.find_all(*self.PATIENT_CARDS, timeout=5)
            return len(cards)
        except Exception:
            return 0
