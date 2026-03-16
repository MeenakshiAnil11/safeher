"""Test Suite 7 — Health Records Sharing Tests."""

import pytest
import time
from pages.login_page import LoginPage
from pages.health_records_page import PatientHealthRecordsPage, DoctorPatientRecordsPage
from config import PATIENT_EMAIL, PATIENT_PASSWORD, DOCTOR_EMAIL, DOCTOR_PASSWORD


class TestPatientHealthRecords:
    """Verify patient health records page."""

    def test_records_page_loads(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = PatientHealthRecordsPage(driver)
        page.navigate()
        assert page.is_page_loaded(), "Patient health records page should load"

    def test_records_page_url(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = PatientHealthRecordsPage(driver)
        page.navigate()
        assert "/records" in page.get_current_url()

    def test_records_content_or_empty(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = PatientHealthRecordsPage(driver)
        page.navigate()
        has_content = page.get_record_count() > 0 or page.is_page_loaded()
        assert has_content, "Should show records or empty page"


class TestDoctorPatientRecords:
    """Verify doctor patient records page."""

    def test_patients_page_loads(self, driver):
        login = LoginPage(driver)
        login.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(2)
        page = DoctorPatientRecordsPage(driver)
        page.navigate()
        assert page.is_page_loaded(), "Doctor patients page should load"

    def test_patients_page_url(self, driver):
        login = LoginPage(driver)
        login.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(2)
        page = DoctorPatientRecordsPage(driver)
        page.navigate()
        assert "/patients" in page.get_current_url()
