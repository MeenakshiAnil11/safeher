"""Test Suite 1 — Login Tests (Patient & Doctor)."""

import pytest
import time
from pages.login_page import LoginPage
from config import (
    PATIENT_EMAIL, PATIENT_PASSWORD,
    DOCTOR_EMAIL, DOCTOR_PASSWORD,
    BASE_URL,
)


class TestPatientLogin:
    """Tests for patient login workflow."""

    def test_login_page_loads(self, driver):
        page = LoginPage(driver)
        page.navigate()
        assert page.is_login_page(), "Login page did not load"

    def test_login_page_has_form_elements(self, driver):
        page = LoginPage(driver)
        page.navigate()
        assert page.is_element_visible(*LoginPage.EMAIL_INPUT), "Email input missing"
        assert page.is_element_visible(*LoginPage.PASSWORD_INPUT), "Password input missing"
        assert page.is_element_visible(*LoginPage.SUBMIT_BTN), "Submit button missing"

    def test_patient_valid_login(self, driver):
        page = LoginPage(driver)
        page.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(3)
        assert page.is_logged_in(), "Patient should be logged in after valid credentials"

    def test_patient_redirected_after_login(self, driver):
        page = LoginPage(driver)
        page.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(3)
        url = page.get_current_url()
        assert "/login" not in url, f"Should redirect away from login. Current URL: {url}"

    def test_invalid_email_login(self, driver):
        page = LoginPage(driver)
        page.login("nonexistent_user@fake.com", "WrongPass123!")
        time.sleep(2)
        is_error = page.is_error_displayed()
        still_on_login = "/login" in page.get_current_url()
        assert is_error or still_on_login, "Invalid login should show error or stay on login page"

    def test_wrong_password_login(self, driver):
        page = LoginPage(driver)
        page.login(PATIENT_EMAIL, "TotallyWrongPassword999!")
        time.sleep(2)
        is_error = page.is_error_displayed()
        still_on_login = "/login" in page.get_current_url()
        assert is_error or still_on_login, "Wrong password should show error or stay on login page"

    def test_empty_fields_login(self, driver):
        page = LoginPage(driver)
        page.navigate()
        page.click_login()
        time.sleep(1)
        still_on_login = "/login" in page.get_current_url()
        assert still_on_login, "Empty fields should not allow login"


class TestDoctorLogin:
    """Tests for doctor login workflow."""

    def test_doctor_valid_login(self, driver):
        page = LoginPage(driver)
        page.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(3)
        assert page.is_logged_in(), "Doctor should be logged in after valid credentials"

    def test_doctor_redirected_after_login(self, driver):
        page = LoginPage(driver)
        page.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(3)
        url = page.get_current_url()
        assert "/login" not in url, f"Doctor should redirect away from login. URL: {url}"
