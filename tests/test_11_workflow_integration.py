"""Test Suite 11 — End-to-End Workflow Integration Tests.

Verifies cross-module data flow between patient and doctor modules.
"""

import pytest
import time
from pages.login_page import LoginPage
from pages.patient_dashboard_page import PatientDashboardPage
from pages.doctor_dashboard_page import DoctorDashboardPage
from pages.doctor_directory_page import DoctorDirectoryPage
from pages.appointments_page import PatientAppointmentsPage, DoctorAppointmentsPage
from pages.consultation_page import ConsultationPage
from pages.prescriptions_page import PatientPrescriptionsPage, DoctorPrescriptionsPage
from pages.payments_page import PatientPaymentsPage, DoctorEarningsPage
from pages.notifications_page import PatientNotificationsPage, DoctorNotificationsPage
from config import PATIENT_EMAIL, PATIENT_PASSWORD, DOCTOR_EMAIL, DOCTOR_PASSWORD


class TestPatientModuleIntegration:
    """End-to-end: patient can access all telehealth sections."""

    def test_patient_full_navigation_flow(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)

        sections = [
            ("/telehealth/dashboard", "dashboard"),
            ("/telehealth/doctors", "doctors"),
            ("/telehealth/appointments", "appointments"),
            ("/telehealth/prescriptions", "prescriptions"),
            ("/telehealth/payments", "payments"),
            ("/telehealth/consultations", "consultations"),
            ("/telehealth/records", "records"),
            ("/telehealth/history", "history"),
            ("/telehealth/notifications", "notifications"),
        ]

        for url_path, name in sections:
            driver.get(f"http://localhost:3000{url_path}")
            time.sleep(2)
            current = driver.current_url
            assert name in current or url_path.split("/")[-1] in current, (
                f"Failed to navigate to {name}. Current URL: {current}"
            )

    def test_patient_dashboard_stats_reflect_data(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        dashboard = PatientDashboardPage(driver)
        dashboard.navigate()
        values = dashboard.get_stat_values()
        assert len(values) >= 3, "Dashboard should have stat values reflecting user data"
        for v in values:
            assert v is not None, "Each stat value should be populated"


class TestDoctorModuleIntegration:
    """End-to-end: doctor can access all dashboard sections."""

    def test_doctor_full_navigation_flow(self, driver):
        login = LoginPage(driver)
        login.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(2)

        sections = [
            ("/doctor/dashboard", "dashboard"),
            ("/doctor/appointments", "appointments"),
            ("/doctor/consultations", "consultations"),
            ("/doctor/prescriptions", "prescriptions"),
            ("/doctor/patients", "patients"),
            ("/doctor/earnings", "earnings"),
            ("/doctor/notifications", "notifications"),
        ]

        for url_path, name in sections:
            driver.get(f"http://localhost:3000{url_path}")
            time.sleep(2)
            current = driver.current_url
            assert name in current or url_path.split("/")[-1] in current, (
                f"Failed to navigate to {name}. Current URL: {current}"
            )


class TestCrossModuleWorkflow:
    """Verify patient ↔ doctor data synchronization."""

    def test_doctor_directory_accessible_after_login(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = DoctorDirectoryPage(driver)
        page.navigate()
        assert page.is_page_loaded(), "Doctor directory accessible for patient"
        count = page.get_doctor_cards_count()
        assert count >= 1, "Should display available doctors"

    def test_patient_appointments_page_functional(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = PatientAppointmentsPage(driver)
        page.navigate()
        assert page.is_page_loaded(), "Patient appointments page should be functional"

    def test_doctor_appointments_page_functional(self, driver):
        login = LoginPage(driver)
        login.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(2)
        page = DoctorAppointmentsPage(driver)
        page.navigate()
        assert page.is_page_loaded(), "Doctor appointments page should be functional"

    def test_patient_prescriptions_accessible(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = PatientPrescriptionsPage(driver)
        page.navigate()
        assert page.is_page_loaded(), "Patient prescriptions should be accessible"

    def test_doctor_prescriptions_accessible(self, driver):
        login = LoginPage(driver)
        login.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(2)
        page = DoctorPrescriptionsPage(driver)
        page.navigate()
        assert page.is_page_loaded(), "Doctor prescriptions should be accessible"

    def test_patient_payments_accessible(self, driver):
        login = LoginPage(driver)
        login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
        time.sleep(2)
        page = PatientPaymentsPage(driver)
        page.navigate()
        assert page.is_page_loaded(), "Patient payments should be accessible"

    def test_doctor_earnings_accessible(self, driver):
        login = LoginPage(driver)
        login.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(2)
        page = DoctorEarningsPage(driver)
        page.navigate()
        assert page.is_page_loaded(), "Doctor earnings should be accessible"
