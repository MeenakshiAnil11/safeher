"""
SafeHer Telehealth — Selenium Test Runner

Usage:
    python run_tests.py                          # Run all tests
    python run_tests.py --suite patient          # Patient module only
    python run_tests.py --suite doctor           # Doctor module only
    python run_tests.py --suite integration      # Integration tests only
    python run_tests.py --suite login            # Login tests only
    python run_tests.py --parallel               # Parallel execution
"""

import sys
import os
import subprocess
import argparse
from datetime import datetime


def main():
    parser = argparse.ArgumentParser(description="SafeHer Telehealth Test Runner")
    parser.add_argument(
        "--suite",
        choices=["all", "login", "patient", "doctor", "integration",
                 "appointments", "consultations", "prescriptions",
                 "payments", "notifications", "history", "records"],
        default="all",
        help="Test suite to run",
    )
    parser.add_argument("--parallel", action="store_true", help="Run tests in parallel")
    parser.add_argument("--headed", action="store_true", help="Run with visible browser (default)")
    parser.add_argument("--headless", action="store_true", help="Run headless")
    args = parser.parse_args()

    os.makedirs("reports", exist_ok=True)
    os.makedirs("reports/screenshots", exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_file = f"reports/test_report_{timestamp}.html"

    suite_map = {
        "all": ".",
        "login": "test_01_login.py",
        "patient": "test_02_patient_dashboard.py test_04_appointment_booking.py test_06_prescription_sync.py test_08_payments.py",
        "doctor": "test_03_doctor_dashboard.py",
        "integration": "test_11_workflow_integration.py",
        "appointments": "test_04_appointment_booking.py",
        "consultations": "test_05_consultation.py",
        "prescriptions": "test_06_prescription_sync.py",
        "payments": "test_08_payments.py",
        "notifications": "test_09_notifications.py",
        "history": "test_10_history.py",
        "records": "test_07_health_records.py",
    }

    test_target = suite_map.get(args.suite, ".")

    cmd = [
        sys.executable, "-m", "pytest",
        *test_target.split(),
        f"--html={report_file}",
        "--self-contained-html",
        "-v",
        "--tb=short",
    ]

    if args.parallel:
        cmd.extend(["-n", "auto"])

    print(f"\n{'='*60}")
    print(f"  SafeHer Telehealth — Selenium Test Suite")
    print(f"  Suite   : {args.suite}")
    print(f"  Report  : {report_file}")
    print(f"  Time    : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    result = subprocess.run(cmd, cwd=os.path.dirname(os.path.abspath(__file__)))

    print(f"\n{'='*60}")
    print(f"  Tests finished — exit code: {result.returncode}")
    print(f"  HTML report: {report_file}")
    print(f"{'='*60}\n")

    return result.returncode


if __name__ == "__main__":
    sys.exit(main())
