"""Test Suite 8 — Payment & Earnings Tests."""

import pytest
import time
from pages.login_page import LoginPage
from pages.payments_page import PatientPaymentsPage, DoctorEarningsPage
from config import PATIENT_EMAIL, PATIENT_PASSWORD, DOCTOR_EMAIL, DOCTOR_PASSWORD


class TestPatientPayments:
    """Verify patient payments page."""

    def test_payments_page_loads(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = PatientPaymentsPage(driver)
        page.navigate()
        assert page.is_page_loaded(), "Patient payments page should load"

    def test_payments_page_url(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = PatientPaymentsPage(driver)
        page.navigate()
        assert "/payments" in page.get_current_url()

    def test_payments_content_or_empty(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = PatientPaymentsPage(driver)
        page.navigate()
        has_content = page.get_payment_count() > 0 or page.is_page_loaded()
        assert has_content, "Should show payments or empty state"


class TestDoctorEarnings:
    """Verify doctor earnings page."""

    def test_earnings_page_loads(self, driver):
        login = LoginPage(driver)
        login.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(2)
        page = DoctorEarningsPage(driver)
        page.navigate()
        assert page.is_page_loaded(), "Doctor earnings page should load"

    def test_earnings_page_url(self, driver):
        login = LoginPage(driver)
        login.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(2)
        page = DoctorEarningsPage(driver)
        page.navigate()
        assert "/earnings" in page.get_current_url()
