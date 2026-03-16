"""Critical smoke tests for newly added modules.

Modules covered:
- Telehealth
- E-commerce
- Community Forum
- Subscription
"""

import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

from config import BASE_URL, PATIENT_EMAIL, PATIENT_PASSWORD
from pages.login_page import LoginPage


def _wait_any(driver, locators, timeout=15):
    """Wait until at least one locator is present in DOM."""
    WebDriverWait(driver, timeout).until(
        lambda d: any(d.find_elements(by, value) for by, value in locators)
    )


@pytest.fixture
def patient_logged_in(driver):
    login = LoginPage(driver)
    login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
    assert "/login" not in driver.current_url, "Patient login failed"
    return driver


@pytest.mark.patient
class TestTelehealthCritical:
    def test_telehealth_dashboard_loads(self, patient_logged_in):
        patient_logged_in.get(f"{BASE_URL}/telehealth/dashboard")
        _wait_any(
            patient_logged_in,
            [
                (By.CSS_SELECTOR, ".telehealth-dashboard-user"),
                (By.XPATH, "//*[contains(text(),'Telehealth Dashboard')]"),
            ],
        )
        assert "/telehealth" in patient_logged_in.current_url

    def test_telehealth_doctor_directory_has_booking_cta(self, patient_logged_in):
        patient_logged_in.get(f"{BASE_URL}/telehealth/doctors")
        _wait_any(
            patient_logged_in,
            [
                (By.CSS_SELECTOR, ".doctor-directory"),
                (By.CSS_SELECTOR, ".doctor-card"),
            ],
        )
        _wait_any(
            patient_logged_in,
            [
                (By.CSS_SELECTOR, ".book-btn"),
                (By.CSS_SELECTOR, ".book-appointment-btn"),
                (By.XPATH, "//button[contains(., 'Book')]"),
            ],
        )
        assert True


@pytest.mark.patient
class TestEcommerceCritical:
    def test_ecommerce_shop_home_loads(self, patient_logged_in):
        patient_logged_in.get(f"{BASE_URL}/shop")
        _wait_any(
            patient_logged_in,
            [
                (By.CSS_SELECTOR, ".shop-home"),
                (By.CSS_SELECTOR, ".shop-header"),
            ],
        )
        assert "/shop" in patient_logged_in.current_url

    def test_ecommerce_cart_page_loads(self, patient_logged_in):
        patient_logged_in.get(f"{BASE_URL}/shop/cart")
        _wait_any(
            patient_logged_in,
            [
                (By.CSS_SELECTOR, ".cart-page"),
                (By.CSS_SELECTOR, ".cart-empty"),
                (By.XPATH, "//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'cart')]"),
            ],
        )
        assert "/shop/cart" in patient_logged_in.current_url


@pytest.mark.patient
class TestForumCritical:
    def test_forum_home_loads(self, patient_logged_in):
        patient_logged_in.get(f"{BASE_URL}/forum")
        _wait_any(
            patient_logged_in,
            [
                (By.CSS_SELECTOR, ".forum-home"),
                (By.CSS_SELECTOR, ".forum-title"),
                (By.XPATH, "//*[contains(text(),'Community Forum')]"),
            ],
        )
        assert "/forum" in patient_logged_in.current_url

    def test_forum_create_post_page_loads(self, patient_logged_in):
        patient_logged_in.get(f"{BASE_URL}/forum/create")
        _wait_any(
            patient_logged_in,
            [
                (By.CSS_SELECTOR, ".create-post"),
                (By.CSS_SELECTOR, "input#title"),
                (By.CSS_SELECTOR, "textarea#content"),
            ],
        )
        assert "/forum/create" in patient_logged_in.current_url


@pytest.mark.patient
class TestSubscriptionCritical:
    def test_subscription_plans_page_loads(self, patient_logged_in):
        patient_logged_in.get(f"{BASE_URL}/subscription#plans")
        _wait_any(
            patient_logged_in,
            [
                (By.CSS_SELECTOR, ".sub-page"),
                (By.CSS_SELECTOR, ".sub-title"),
                (By.XPATH, "//*[contains(text(),'Subscription Plans')]"),
            ],
        )
        assert "/subscription" in patient_logged_in.current_url

    def test_subscription_live_chat_opens(self, patient_logged_in):
        patient_logged_in.get(f"{BASE_URL}/subscription#support")
        _wait_any(
            patient_logged_in,
            [
                (By.XPATH, "//button[contains(., 'Start Chat')]"),
                (By.CSS_SELECTOR, ".support-btn.purple"),
            ],
        )

        start_chat = patient_logged_in.find_element(By.XPATH, "//button[contains(., 'Start Chat')]")
        patient_logged_in.execute_script("arguments[0].click();", start_chat)
        time.sleep(1)

        _wait_any(
            patient_logged_in,
            [
                (By.CSS_SELECTOR, ".livechat-widget"),
                (By.CSS_SELECTOR, ".livechat-overlay"),
            ],
            timeout=10,
        )
        assert len(patient_logged_in.find_elements(By.CSS_SELECTOR, ".livechat-widget")) > 0
