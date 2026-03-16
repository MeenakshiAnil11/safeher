"""Page Object for Doctor Dashboard."""

from selenium.webdriver.common.by import By
from .base_page import BasePage
import time


class DoctorDashboardPage(BasePage):
    URL = "http://localhost:3000/doctor/dashboard"

    # Locators – match actual class names from DoctorDashboard.jsx
    DASHBOARD = (By.CSS_SELECTOR, ".doctor-dashboard, .doctor-dashboard-loading, .doctor-layout")
    PROFILE_BANNER = (By.CSS_SELECTOR, ".doctor-profile-banner")
    METRICS_GRID = (By.CSS_SELECTOR, ".metrics-grid")
    METRIC_CARDS = (By.CSS_SELECTOR, ".metric-card")
    METRIC_VALUES = (By.CSS_SELECTOR, ".metric-value")
    METRIC_LABELS = (By.CSS_SELECTOR, ".metric-label")
    SCHEDULE_SECTION = (By.CSS_SELECTOR, ".doctor-dashboard .schedule-section, .schedule-list")
    SCHEDULE_ITEMS = (By.CSS_SELECTOR, ".schedule-item")
    NOTIFICATIONS_SECTION = (By.CSS_SELECTOR, ".doctor-dashboard .notifications-section, .notifications-list")
    NOTIFICATION_ITEMS = (By.CSS_SELECTOR, ".doctor-dashboard .notification-item")
    APPOINTMENTS_TODAY = (By.CSS_SELECTOR, ".appointments-today-card")
    VIEW_ALL_LINK = (By.CSS_SELECTOR, ".view-all-link")

    def navigate(self):
        self.open(self.URL)
        self.wait_page_load()
        time.sleep(2)

    def is_dashboard_loaded(self):
        return self.is_element_visible(*self.DASHBOARD, timeout=10)

    def has_profile_banner(self):
        return self.is_element_present(*self.PROFILE_BANNER)

    def get_metric_cards_count(self):
        cards = self.find_all(*self.METRIC_CARDS, timeout=10)
        return len(cards)

    def get_metric_values(self):
        elements = self.find_all(*self.METRIC_VALUES, timeout=10)
        return [el.text for el in elements]

    def has_schedule_section(self):
        return self.is_element_present(*self.SCHEDULE_SECTION)

    def has_notifications_section(self):
        return self.is_element_present(*self.NOTIFICATIONS_SECTION)

    def get_schedule_items_count(self):
        items = self.find_all(*self.SCHEDULE_ITEMS, timeout=5)
        return len(items)

    def get_notification_items_count(self):
        items = self.find_all(*self.NOTIFICATION_ITEMS, timeout=5)
        return len(items)

    def navigate_to_section(self, section_name):
        section_map = {
            "appointments": "/doctor/appointments",
            "consultations": "/doctor/consultations",
            "prescriptions": "/doctor/prescriptions",
            "patients": "/doctor/patients",
            "earnings": "/doctor/earnings",
            "notifications": "/doctor/notifications",
            "profile": "/doctor/profile",
            "settings": "/doctor/settings",
        }
        url = section_map.get(section_name, f"/doctor/{section_name}")
        self.open(f"http://localhost:3000{url}")
        self.wait_page_load()
        time.sleep(1)
