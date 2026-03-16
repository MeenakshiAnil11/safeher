"""Page Object for Login page."""

from selenium.webdriver.common.by import By
from .base_page import BasePage
import time


class LoginPage(BasePage):
    URL = "http://localhost:3000/login"

    EMAIL_INPUT = (By.CSS_SELECTOR, "input[name='email']")
    PASSWORD_INPUT = (By.CSS_SELECTOR, "input[name='password']")
    SUBMIT_BTN = (By.CSS_SELECTOR, "button[type='submit']")
    ERROR_MSG = (By.CSS_SELECTOR, ".error")
    SUCCESS_MSG = (By.CSS_SELECTOR, ".success")
    AUTH_CARD = (By.CSS_SELECTOR, ".auth-card")
    GOOGLE_BTN = (By.CSS_SELECTOR, ".btn-google")

    def navigate(self):
        self.open(self.URL)
        self.wait_page_load()

    def enter_email(self, email):
        self.type_text(*self.EMAIL_INPUT, email)

    def enter_password(self, password):
        self.type_text(*self.PASSWORD_INPUT, password)

    def click_login(self):
        self.click(*self.SUBMIT_BTN)

    def login(self, email, password):
        self.navigate()
        self.enter_email(email)
        self.enter_password(password)
        self.click_login()
        time.sleep(3)
        # Wait for redirect or error
        for _ in range(10):
            if "/login" not in self.get_current_url():
                return
            if self.is_element_visible(*self.ERROR_MSG, timeout=0.5):
                return
            if self.is_element_visible(*self.SUCCESS_MSG, timeout=0.5):
                time.sleep(2)
                return
            time.sleep(1)

    def get_error_message(self):
        return self.get_text(*self.ERROR_MSG, timeout=10)

    def is_error_displayed(self):
        return self.is_element_visible(*self.ERROR_MSG, timeout=5)

    def is_success_displayed(self):
        return self.is_element_visible(*self.SUCCESS_MSG, timeout=5)

    def is_login_page(self):
        return self.is_element_visible(*self.AUTH_CARD, timeout=5)

    def is_logged_in(self):
        time.sleep(1)
        url = self.get_current_url()
        if "/login" not in url and "/register" not in url:
            return True
        token = self.get_local_storage("token")
        return token is not None and token != ""
