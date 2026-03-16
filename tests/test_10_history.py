"""Test Suite 10 — History & Logs Tests."""

import pytest
import time
from pages.login_page import LoginPage
from pages.history_page import PatientHistoryPage
from pages.doctor_dashboard_page import DoctorDashboardPage
from config import PATIENT_EMAIL, PATIENT_PASSWORD, DOCTOR_EMAIL, DOCTOR_PASSWORD


class TestPatientHistory:
    """Verify patient history page."""

    def test_history_page_loads(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = PatientHistoryPage(driver)
        page.navigate()
        assert page.is_page_loaded(), "Patient history page should load"

    def test_history_page_url(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = PatientHistoryPage(driver)
        page.navigate()
        assert "/history" in page.get_current_url()

    def test_history_content_or_empty(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = PatientHistoryPage(driver)
        page.navigate()
        has_content = page.get_history_count() > 0 or page.is_page_loaded()
        assert has_content, "Should show history or be a loaded page"


class TestDoctorConsultationLogs:
    """Verify doctor dashboard shows consultation logs."""

    def test_doctor_dashboard_has_schedule(self, driver):
        login = LoginPage(driver)
        login.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(2)
        dashboard = DoctorDashboardPage(driver)
        dashboard.navigate()
        assert dashboard.has_schedule_section(), "Doctor dashboard should show schedule / logs"

    def test_doctor_dashboard_has_notifications(self, driver):
        login = LoginPage(driver)
        login.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(2)
        dashboard = DoctorDashboardPage(driver)
        dashboard.navigate()
        assert dashboard.has_notifications_section(), "Doctor dashboard should show recent notifications"
