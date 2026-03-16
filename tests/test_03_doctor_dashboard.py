"""Test Suite 3 — Doctor Dashboard Tests."""

import pytest
import time
from selenium.webdriver.common.by import By
from pages.login_page import LoginPage
from pages.doctor_dashboard_page import DoctorDashboardPage
from config import DOCTOR_EMAIL, DOCTOR_PASSWORD


@pytest.fixture
def doctor_dashboard(driver):
    """Login as doctor and navigate to doctor dashboard."""
    login_page = LoginPage(driver)
    login_page.login(DOCTOR_EMAIL, DOCTOR_PASSWORD)
    time.sleep(3)
    dashboard = DoctorDashboardPage(driver)
    dashboard.navigate()
    time.sleep(3)
    return dashboard


class TestDoctorDashboard:
    """Validate doctor dashboard UI elements and sections."""

    def test_dashboard_loads(self, doctor_dashboard):
        assert doctor_dashboard.is_dashboard_loaded(), "Doctor dashboard should load"

    def test_dashboard_url(self, doctor_dashboard):
        url = doctor_dashboard.get_current_url()
        assert "/doctor" in url, f"URL should contain /doctor. Got: {url}"

    def test_metric_cards_present(self, doctor_dashboard):
        has_metrics = doctor_dashboard.is_element_present(
            By.CSS_SELECTOR, ".metric-card, .metrics-grid", timeout=10
        )
        assert has_metrics, "Metric cards or grid should be present"

    def test_profile_banner_present(self, doctor_dashboard):
        has_banner = doctor_dashboard.has_profile_banner() or doctor_dashboard.is_element_present(
            By.CSS_SELECTOR, ".appointments-today-card, .dashboard-top-section", timeout=5
        )
        assert has_banner, "Profile banner or top section should be present"

    def test_dashboard_has_content(self, doctor_dashboard):
        """Check that the dashboard rendered meaningful content beyond the loading state."""
        has_content = doctor_dashboard.is_element_present(
            By.CSS_SELECTOR, ".doctor-dashboard, .metrics-grid, .doctor-profile-banner", timeout=10
        )
        assert has_content, "Dashboard should render content after loading"

    def test_navigate_to_appointments(self, doctor_dashboard):
        doctor_dashboard.navigate_to_section("appointments")
        time.sleep(2)
        assert "/appointments" in doctor_dashboard.get_current_url()

    def test_navigate_to_consultations(self, doctor_dashboard):
        doctor_dashboard.navigate_to_section("consultations")
        time.sleep(2)
        assert "/consultations" in doctor_dashboard.get_current_url()

    def test_navigate_to_prescriptions(self, doctor_dashboard):
        doctor_dashboard.navigate_to_section("prescriptions")
        time.sleep(2)
        assert "/prescriptions" in doctor_dashboard.get_current_url()

    def test_navigate_to_earnings(self, doctor_dashboard):
        doctor_dashboard.navigate_to_section("earnings")
        time.sleep(2)
        assert "/earnings" in doctor_dashboard.get_current_url()

    def test_navigate_to_patients(self, doctor_dashboard):
        doctor_dashboard.navigate_to_section("patients")
        time.sleep(2)
        assert "/patients" in doctor_dashboard.get_current_url()
