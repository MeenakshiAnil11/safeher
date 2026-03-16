"""Test Suite 2 — Patient Dashboard Tests."""

import pytest
import time
from pages.login_page import LoginPage
from pages.patient_dashboard_page import PatientDashboardPage
from config import PATIENT_EMAIL, PATIENT_PASSWORD


@pytest.fixture
def patient_dashboard(driver):
    """Login as patient and navigate to telehealth dashboard."""
    login_page = LoginPage(driver)
    login_page.login(PATIENT_EMAIL, PATIENT_PASSWORD)
    time.sleep(2)
    dashboard = PatientDashboardPage(driver)
    dashboard.navigate()
    return dashboard


class TestPatientDashboard:
    """Validate patient telehealth dashboard UI elements."""

    def test_dashboard_loads(self, patient_dashboard):
        assert patient_dashboard.is_dashboard_loaded(), "Patient dashboard should load"

    def test_stats_grid_present(self, patient_dashboard):
        assert patient_dashboard.is_element_present(
            *PatientDashboardPage.STATS_GRID
        ), "Stats grid should be visible"

    def test_stat_cards_count(self, patient_dashboard):
        count = patient_dashboard.get_stat_cards_count()
        assert count >= 3, f"Expected at least 3 stat cards, got {count}"

    def test_stat_cards_have_values(self, patient_dashboard):
        values = patient_dashboard.get_stat_values()
        assert len(values) >= 3, "Each stat card should have a value"

    def test_top_doctors_section(self, patient_dashboard):
        has = patient_dashboard.has_top_doctors()
        assert has, "Top Rated Doctors section should be visible"

    def test_health_tips_section(self, patient_dashboard):
        has = patient_dashboard.has_health_tips()
        assert has, "Health Tips section should be present"

    def test_wellness_score_section(self, patient_dashboard):
        has = patient_dashboard.has_wellness_score()
        assert has, "Wellness Score section should be present"

    def test_recent_activity_section(self, patient_dashboard):
        has = patient_dashboard.has_activity_list()
        assert has, "Recent Activity section should be visible"

    def test_schedule_banner(self, patient_dashboard):
        has = patient_dashboard.has_schedule_banner()
        assert has, "Schedule banner should be present"

    def test_navigate_to_doctors(self, patient_dashboard):
        patient_dashboard.navigate_to_section("doctors")
        time.sleep(1)
        assert "/doctors" in patient_dashboard.get_current_url()

    def test_navigate_to_appointments(self, patient_dashboard):
        patient_dashboard.navigate_to_section("appointments")
        time.sleep(1)
        assert "/appointments" in patient_dashboard.get_current_url()

    def test_navigate_to_prescriptions(self, patient_dashboard):
        patient_dashboard.navigate_to_section("prescriptions")
        time.sleep(1)
        assert "/prescriptions" in patient_dashboard.get_current_url()

    def test_navigate_to_payments(self, patient_dashboard):
        patient_dashboard.navigate_to_section("payments")
        time.sleep(1)
        assert "/payments" in patient_dashboard.get_current_url()
