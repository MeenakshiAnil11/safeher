"""Page Object for Notifications pages."""

from selenium.webdriver.common.by import By
from .base_page import BasePage
import time


class PatientNotificationsPage(BasePage):
    URL = "http://localhost:3000/telehealth/notifications"

    NOTIFICATION_LIST = (By.CSS_SELECTOR, ".notification-list, .notifications-container")
    NOTIFICATION_ITEMS = (By.CSS_SELECTOR, ".notification-item, .notif-item")
    MARK_ALL_READ = (By.XPATH, "//button[contains(text(),'Mark') and contains(text(),'Read')]")
    EMPTY_STATE = (By.CSS_SELECTOR, ".empty-state, .no-notifications")
    PAGE_CONTAINER = (By.CSS_SELECTOR, ".notifications-page, .telehealth-container")

    def navigate(self):
        self.open(self.URL)
        self.wait_page_load()
        time.sleep(2)

    def is_page_loaded(self):
        return self.is_element_visible(*self.PAGE_CONTAINER, timeout=10)

    def get_notification_count(self):
        try:
            items = self.find_all(*self.NOTIFICATION_ITEMS, timeout=5)
            return len(items)
        except Exception:
            return 0


class DoctorNotificationsPage(BasePage):
    URL = "http://localhost:3000/doctor/notifications"

    NOTIFICATION_ITEMS = (By.CSS_SELECTOR, ".notification-item, .notif-item")
    PAGE_CONTAINER = (By.CSS_SELECTOR, ".doctor-notifications, .doctor-notifications-loading, .doctor-layout")

    def navigate(self):
        self.open(self.URL)
        self.wait_page_load()
        time.sleep(2)

    def is_page_loaded(self):
        return self.is_element_visible(*self.PAGE_CONTAINER, timeout=10)

    def get_notification_count(self):
        try:
            items = self.find_all(*self.NOTIFICATION_ITEMS, timeout=5)
            return len(items)
        except Exception:
            return 0
