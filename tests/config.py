"""Test configuration for SafeHer Telehealth module."""

BASE_URL = "http://localhost:3000"
API_URL = "http://localhost:5000/api"

# Test credentials (from backend seed scripts)
PATIENT_EMAIL = "user@example.com"
PATIENT_PASSWORD = "User123!"

DOCTOR_EMAIL = "doctor@example.com"
DOCTOR_PASSWORD = "Doctor123!"

ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "Admin123!"

# Timeouts (seconds)
IMPLICIT_WAIT = 10
EXPLICIT_WAIT = 15
PAGE_LOAD_TIMEOUT = 30

# Paths
REPORTS_DIR = "reports"
SCREENSHOTS_DIR = "reports/screenshots"
