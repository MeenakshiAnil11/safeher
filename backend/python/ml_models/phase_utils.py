"""
Phase Detection Utility for Menstrual Cycle Tracking
Detects current menstrual phase based on period start dates and cycle statistics.
"""

from datetime import date, datetime, timedelta
from typing import List, Tuple, Optional
import numpy as np


def avg_cycle_and_period(start_dates: List[date], period_lengths: List[int]) -> Tuple[int, int]:
    """
    Calculate average cycle length and period length from historical data.
    
    Args:
        start_dates: List of period start dates sorted ascending
        period_lengths: List of bleeding days for each cycle
        
    Returns:
        Tuple of (avg_cycle_length, avg_period_length)
    """
    if len(start_dates) < 2:
        # Default values if insufficient data
        return 28, 5
    
    # Calculate cycle lengths (days between consecutive start dates)
    cycle_lengths = [(start_dates[i+1] - start_dates[i]).days for i in range(len(start_dates)-1)]
    
    # Filter out unrealistic cycle lengths (15-45 days)
    valid_cycles = [c for c in cycle_lengths if 15 <= c <= 45]
    
    if not valid_cycles:
        return 28, 5
    
    avg_cycle = int(np.round(np.mean(valid_cycles)))
    avg_period = int(np.round(np.mean(period_lengths))) if period_lengths else 5
    
    return avg_cycle, avg_period


def get_phase(today: date, start_dates: List[date], period_lengths: List[int]) -> Tuple[str, int]:
    """
    Determine current menstrual phase and day in cycle.
    
    Args:
        today: Current date
        start_dates: List of period start dates sorted ascending
        period_lengths: List of bleeding days for each cycle
        
    Returns:
        Tuple of (phase_name, day_in_cycle)
    """
    if not start_dates:
        return "unknown", 0
    
    avg_cycle, avg_period = avg_cycle_and_period(start_dates, period_lengths)
    
    # Find the most recent period start date
    last_start = max(d for d in start_dates if d <= today)
    day_in_cycle = (today - last_start).days + 1
    
    # Normalize if we're past the average cycle length
    if day_in_cycle > avg_cycle:
        day_in_cycle = ((day_in_cycle - 1) % avg_cycle) + 1
    
    # Estimate ovulation day (typically 14 days before next period)
    ovulation_day = max(1, avg_cycle - 14)
    
    # Define phase boundaries
    fertile_start = max(1, ovulation_day - 5)
    fertile_end = min(avg_cycle, ovulation_day + 1)
    
    # Determine phase
    if 1 <= day_in_cycle <= avg_period:
        # Menstrual phase (Days 1–avg_period)
        return "menstruation", day_in_cycle
    elif fertile_start <= day_in_cycle <= fertile_end:
        # Ovulation phase including fertile window
        if day_in_cycle == ovulation_day:
            return "ovulation", day_in_cycle
        else:
            return "ovulation", day_in_cycle  # or \"fertile\" if separated
    elif day_in_cycle > ovulation_day:
        # Luteal phase (post‑ovulation)
        return "luteal", day_in_cycle
    else:
        # Follicular phase (after bleeding, before fertile window)
        return "follicular", day_in_cycle


def get_phase_info(today: date, start_dates: List[date], period_lengths: List[int]) -> dict:
    """
    Get comprehensive phase information including next period prediction.
    
    Args:
        today: Current date
        start_dates: List of period start dates sorted ascending
        period_lengths: List of bleeding days for each cycle
        
    Returns:
        Dictionary with phase information
    """
    phase, day_in_cycle = get_phase(today, start_dates, period_lengths)
    avg_cycle, avg_period = avg_cycle_and_period(start_dates, period_lengths)
    
    # Predict next period start
    last_start = max(start_dates) if start_dates else today
    next_period_start = last_start + timedelta(days=avg_cycle)
    
    # Calculate days until next period
    days_until_period = (next_period_start - today).days
    
    return {
        "phase": phase,
        "day_in_cycle": day_in_cycle,
        "avg_cycle_length": avg_cycle,
        "avg_period_length": avg_period,
        "next_period_start": next_period_start.isoformat(),
        "days_until_period": days_until_period,
        "ovulation_day": avg_cycle - 14,
        "fertile_window": {
            "start": max(1, avg_cycle - 19),  # 5 days before ovulation
            "end": min(avg_cycle, avg_cycle - 9)  # 1 day after ovulation
        }
    }


# Unit Tests
def test_phase_detection():
    """Test phase detection with various scenarios."""
    
    # Test case 1: Normal cycle
    start_dates = [
        date(2024, 1, 1),
        date(2024, 1, 29),
        date(2024, 2, 26),
        date(2024, 3, 25)
    ]
    period_lengths = [5, 5, 4, 5]
    
    # Test during menstruation
    test_date = date(2024, 1, 3)
    phase, day = get_phase(test_date, start_dates, period_lengths)
    assert phase == "menstruation"
    assert day == 3
    
    # Test during follicular phase
    test_date = date(2024, 1, 10)
    phase, day = get_phase(test_date, start_dates, period_lengths)
    assert phase == "follicular"
    
    # Test during ovulation
    test_date = date(2024, 1, 15)  # Day 15 of 28-day cycle
    phase, day = get_phase(test_date, start_dates, period_lengths)
    assert phase == "ovulation"
    
    # Test during luteal phase
    test_date = date(2024, 1, 20)
    phase, day = get_phase(test_date, start_dates, period_lengths)
    assert phase == "luteal"
    
    print("✅ All phase detection tests passed!")


def test_edge_cases():
    """Test edge cases for phase detection."""
    
    # Test with insufficient data
    start_dates = [date(2024, 1, 1)]
    period_lengths = [5]
    phase, day = get_phase(date(2024, 1, 3), start_dates, period_lengths)
    assert phase == "menstruation"
    
    # Test with no data
    phase, day = get_phase(date(2024, 1, 3), [], [])
    assert phase == "unknown"
    
    # Test cycle longer than average
    start_dates = [date(2024, 1, 1), date(2024, 2, 1)]
    period_lengths = [5]
    test_date = date(2024, 1, 35)  # Day 35 of 31-day cycle
    phase, day = get_phase(test_date, start_dates, period_lengths)
    assert day == 4  # Should wrap to day 4
    
    print("✅ All edge case tests passed!")


if __name__ == "__main__":
    # Run tests
    test_phase_detection()
    test_edge_cases()
    
    # Example usage
    start_dates = [date(2024, 7, 1), date(2024, 8, 1), date(2024, 8, 29), date(2024, 9, 26)]
    period_lengths = [5, 5, 4, 5]
    today = date.today()
    
    phase_info = get_phase_info(today, start_dates, period_lengths)
    print(f"\n📅 Phase Information for {today}:")
    print(f"Phase: {phase_info['phase']}")
    print(f"Day in cycle: {phase_info['day_in_cycle']}")
    print(f"Days until next period: {phase_info['days_until_period']}")
    print(f"Next period start: {phase_info['next_period_start']}")
