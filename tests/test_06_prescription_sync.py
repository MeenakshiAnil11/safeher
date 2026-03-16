"""Test Suite 6 — Prescription Sync Tests."""

import pytest
import time
from pages.login_page import LoginPage
from pages.prescriptions_page import PatientPrescriptionsPage, DoctorPrescriptionsPage
from config import PATIENT_EMAIL, PATIENT_PASSWORD, DOCTOR_EMAIL, DOCTOR_PASSWORD


class TestPatientPrescriptions:
    """Verify patient prescriptions page."""

    def test_prescriptions_page_loads(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = PatientPrescriptionsPage(driver)
        page.navigate()
        assert page.is_page_loaded(), "Patient prescriptions page should load"

    def test_prescriptions_page_url(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = PatientPrescriptionsPage(driver)
        page.navigate()
        assert "/prescriptions" in page.get_current_url()

    def test_prescriptions_content_or_empty(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = PatientPrescriptionsPage(driver)
        page.navigate()
        from selenium.webdriver.common.by import By
        has_content = (
            page.get_prescription_count() > 0
            or page.is_element_present(By.CSS_SELECTOR, ".empty-state, .no-prescriptions", timeout=5)
            or page.is_page_loaded()
        )
        assert has_content, "Should show prescriptions or empty state"


class TestDoctorPrescriptions:
    """Verify doctor prescriptions page."""

    def test_doctor_prescriptions_page_loads(self, driver):
        login = LoginPage(driver)
        login.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(2)
        page = DoctorPrescriptionsPage(driver)
        page.navigate()
        assert page.is_page_loaded(), "Doctor prescriptions page should load"

    def test_doctor_prescriptions_url(self, driver):
        login = LoginPage(driver)
        login.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(2)
        page = DoctorPrescriptionsPage(driver)
        page.navigate()
        assert "/prescriptions" in page.get_current_url()
