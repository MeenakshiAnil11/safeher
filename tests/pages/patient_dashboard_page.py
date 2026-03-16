"""Page Object for Patient Telehealth Dashboard."""

from selenium.webdriver.common.by import By
from .base_page import BasePage
import time


class PatientDashboardPage(BasePage):
    URL = "http://localhost:3000/telehealth"

    # Locators
    WELCOME_CARD = (By.CSS_SELECTOR, ".welcome-card")
    STATS_GRID = (By.CSS_SELECTOR, ".stats-grid")
    STAT_CARDS = (By.CSS_SELECTOR, ".stat-card")
    STAT_VALUES = (By.CSS_SELECTOR, ".stat-content h3")
    STAT_LABELS = (By.CSS_SELECTOR, ".stat-label")
    NOTIFICATION_PANEL = (By.CSS_SELECTOR, ".notifications-panel")
    SCHEDULE_BANNER = (By.CSS_SELECTOR, ".td-schedule-banner")
    TOP_DOCTORS = (By.CSS_SELECTOR, ".td-doctors-list")
    HEALTH_TIPS = (By.CSS_SELECTOR, ".td-tips-list")
    WELLNESS_SCORE = (By.CSS_SELECTOR, ".td-wellness-score")
    ACTIVITY_LIST = (By.CSS_SELECTOR, ".td-activity-list")
    BOOK_BTN = (By.CSS_SELECTOR, ".btn-book-appointment")

    # Sidebar
    SIDEBAR = (By.CSS_SELECTOR, ".user-telehealth-sidebar, .telehealth-sidebar")
    SIDEBAR_LINKS = (By.CSS_SELECTOR, ".sidebar-nav a, .sidebar-link")

    def navigate(self):
        self.open(self.URL)
        self.wait_page_load()
        time.sleep(2)

    def is_dashboard_loaded(self):
        return self.is_element_visible(*self.WELCOME_CARD, timeout=10)

    def get_stat_cards_count(self):
        cards = self.find_all(*self.STAT_CARDS, timeout=10)
        return len(cards)

    def get_stat_values(self):
        elements = self.find_all(*self.STAT_VALUES, timeout=10)
        return [el.text for el in elements]

    def has_notification_panel(self):
        return self.is_element_present(*self.NOTIFICATION_PANEL)

    def has_top_doctors(self):
        return self.is_element_present(*self.TOP_DOCTORS)

    def has_health_tips(self):
        return self.is_element_present(*self.HEALTH_TIPS)

    def has_wellness_score(self):
        return self.is_element_present(*self.WELLNESS_SCORE)

    def has_activity_list(self):
        return self.is_element_present(*self.ACTIVITY_LIST)

    def has_schedule_banner(self):
        return self.is_element_present(*self.SCHEDULE_BANNER)

    def click_book_consultation(self):
        self.click(*self.BOOK_BTN)
        time.sleep(1)

    def navigate_to_section(self, section_name):
        """Navigate to a section via sidebar or URL."""
        section_map = {
            "doctors": "/telehealth/doctors",
            "appointments": "/telehealth/appointments",
            "prescriptions": "/telehealth/prescriptions",
            "payments": "/telehealth/payments",
            "consultations": "/telehealth/consultations",
            "history": "/telehealth/history",
            "records": "/telehealth/records",
            "notifications": "/telehealth/notifications",
            "settings": "/telehealth/settings",
        }
        url = section_map.get(section_name, f"/telehealth/{section_name}")
        self.open(f"http://localhost:3000{url}")
        self.wait_page_load()
        time.sleep(1)
