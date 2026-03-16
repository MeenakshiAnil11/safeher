"""Test Suite 5 — Consultation Workflow Tests."""

import pytest
import time
from pages.login_page import LoginPage
from pages.consultation_page import ConsultationPage
from config import PATIENT_EMAIL, PATIENT_PASSWORD, DOCTOR_EMAIL, DOCTOR_PASSWORD


class TestPatientConsultation:
    """Verify patient consultation page."""

    def test_consultations_page_loads_patient(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = ConsultationPage(driver)
        page.navigate_patient()
        assert page.is_page_loaded(), "Patient consultations page should load"

    def test_consultations_page_url(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = ConsultationPage(driver)
        page.navigate_patient()
        assert "/consultations" in page.get_current_url(), "URL should contain /consultations"


class TestDoctorConsultation:
    """Verify doctor consultation page."""

    def test_consultations_page_loads_doctor(self, driver):
        login = LoginPage(driver)
        login.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(2)
        page = ConsultationPage(driver)
        page.navigate_doctor()
        assert page.is_page_loaded(), "Doctor consultations page should load"

    def test_consultations_page_url_doctor(self, driver):
        login = LoginPage(driver)
        login.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(2)
        page = ConsultationPage(driver)
        page.navigate_doctor()
        assert "/consultations" in page.get_current_url(), "URL should contain /consultations"
