"""Page Object for Consultation pages."""

from selenium.webdriver.common.by import By
from .base_page import BasePage
import time


class ConsultationPage(BasePage):
    """Shared consultation page for both patient and doctor."""

    CHAT_INPUT = (By.CSS_SELECTOR, "input[placeholder*='message'], textarea[placeholder*='message'], .chat-input input, .chat-input textarea")
    CHAT_SEND_BTN = (By.CSS_SELECTOR, ".send-btn, button[type='submit']")
    CHAT_MESSAGES = (By.CSS_SELECTOR, ".message, .chat-message")
    VIDEO_AREA = (By.CSS_SELECTOR, ".video-area, .video-container, .video-placeholder")
    START_SESSION_BTN = (By.XPATH, "//button[contains(text(),'Start')]")
    END_SESSION_BTN = (By.XPATH, "//button[contains(text(),'End')]")
    SESSION_TIMER = (By.CSS_SELECTOR, ".session-timer, .timer")
    HEALTH_SIDEBAR = (By.CSS_SELECTOR, ".health-sidebar, .patient-info")
    PAGE_CONTAINER = (By.CSS_SELECTOR, ".consultation-page, .doctor-consultation, .consultation-empty, .telehealth-container, .doctor-layout")

    def navigate_patient(self, appointment_id=""):
        url = f"http://localhost:3000/telehealth/consultations"
        self.open(url)
        self.wait_page_load()
        time.sleep(2)

    def navigate_doctor(self, appointment_id=""):
        url = f"http://localhost:3000/doctor/consultations"
        self.open(url)
        self.wait_page_load()
        time.sleep(2)

    def is_page_loaded(self):
        return self.is_element_visible(*self.PAGE_CONTAINER, timeout=10)

    def has_video_area(self):
        return self.is_element_present(*self.VIDEO_AREA, timeout=5)

    def has_chat_input(self):
        return self.is_element_present(*self.CHAT_INPUT, timeout=5)
