"""Test Suite 9 — Notifications Tests."""

import pytest
import time
from pages.login_page import LoginPage
from pages.notifications_page import PatientNotificationsPage, DoctorNotificationsPage
from config import PATIENT_EMAIL, PATIENT_PASSWORD, DOCTOR_EMAIL, DOCTOR_PASSWORD


class TestPatientNotifications:
    """Verify patient notifications page."""

    def test_notifications_page_loads(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = PatientNotificationsPage(driver)
        page.navigate()
        assert page.is_page_loaded(), "Patient notifications page should load"

    def test_notifications_page_url(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = PatientNotificationsPage(driver)
        page.navigate()
        assert "/notifications" in page.get_current_url()


class TestDoctorNotifications:
    """Verify doctor notifications page."""

    def test_doctor_notifications_page_loads(self, driver):
        login = LoginPage(driver)
        login.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(2)
        page = DoctorNotificationsPage(driver)
        page.navigate()
        assert page.is_page_loaded(), "Doctor notifications page should load"

    def test_doctor_notifications_url(self, driver):
        login = LoginPage(driver)
        login.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(2)
        page = DoctorNotificationsPage(driver)
        page.navigate()
        assert "/notifications" in page.get_current_url()
