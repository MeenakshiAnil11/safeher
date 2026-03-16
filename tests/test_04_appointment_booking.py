"""Test Suite 4 — Appointment Booking Workflow."""

import pytest
import time
from pages.login_page import LoginPage
from pages.patient_dashboard_page import PatientDashboardPage
from pages.doctor_directory_page import DoctorDirectoryPage
from pages.appointments_page import PatientAppointmentsPage, DoctorAppointmentsPage
from config import PATIENT_EMAIL, PATIENT_PASSWORD, DOCTOR_EMAIL, DOCTOR_PASSWORD


@pytest.fixture
def patient_logged_in(driver):
    login = LoginPage(driver)
    login.login(PATIENT_EMAIL, PATIENT_PASSWORD)
    time.sleep(2)
    return driver


class TestDoctorDirectory:
    """Verify doctor directory and booking modal."""

    def test_directory_loads(self, patient_logged_in):
        page = DoctorDirectoryPage(patient_logged_in)
        page.navigate()
        assert page.is_page_loaded(), "Doctor directory should load"

    def test_doctor_cards_displayed(self, patient_logged_in):
        page = DoctorDirectoryPage(patient_logged_in)
        page.navigate()
        count = page.get_doctor_cards_count()
        assert count >= 1, f"Expected at least 1 doctor card, got {count}"

    def test_book_button_exists(self, patient_logged_in):
        page = DoctorDirectoryPage(patient_logged_in)
        page.navigate()
        from selenium.webdriver.common.by import By
        buttons = page.find_all(*DoctorDirectoryPage.BOOK_BUTTONS, timeout=10)
        assert len(buttons) >= 1, "Book buttons should be present on doctor cards"

    def test_booking_modal_opens(self, patient_logged_in):
        page = DoctorDirectoryPage(patient_logged_in)
        page.navigate()
        page.click_first_book_button()
        time.sleep(1)
        assert page.is_booking_modal_open(), "Booking modal should open after clicking Book"

    def test_booking_modal_has_time_slots(self, patient_logged_in):
        page = DoctorDirectoryPage(patient_logged_in)
        page.navigate()
        page.click_first_book_button()
        time.sleep(1)
        if page.is_booking_modal_open():
            from selenium.webdriver.common.by import By
            has_slots = page.is_element_present(By.CSS_SELECTOR, ".time-slot-btn", timeout=5)
            has_calendar = page.is_element_present(By.CSS_SELECTOR, ".date-input-field", timeout=5)
            assert has_slots or has_calendar, "Booking modal should show time slots or date picker"


class TestPatientAppointments:
    """Verify patient appointments page."""

    def test_appointments_page_loads(self, patient_logged_in):
        page = PatientAppointmentsPage(patient_logged_in)
        page.navigate()
        assert page.is_page_loaded(), "Patient appointments page should load"

    def test_appointments_has_tabs_or_content(self, patient_logged_in):
        page = PatientAppointmentsPage(patient_logged_in)
        page.navigate()
        from selenium.webdriver.common.by import By
        has_content = (
            page.get_appointment_count() > 0
            or page.is_empty_state()
            or page.is_element_present(By.XPATH, "//button[contains(text(),'Upcoming')]", timeout=3)
        )
        assert has_content, "Appointments page should show appointments or empty state"


class TestDoctorAppointments:
    """Verify doctor appointments page."""

    def test_doctor_appointments_page_loads(self, driver):
        login = LoginPage(driver)
        login.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
        time.sleep(2)
        page = DoctorAppointmentsPage(driver)
        page.navigate()
        assert page.is_page_loaded(), "Doctor appointments page should load"
