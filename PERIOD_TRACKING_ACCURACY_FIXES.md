# Period Tracking Module - Accuracy Fixes Required

## Summary of Issues Found

Based on the accurate menstrual cycle data provided, the following corrections are needed:

## 🔴 Critical Issues

### 1. **Phase Detection Logic** (`backend/controllers/periodController.js`)

**Current Issues:**
- Follicular phase incorrectly starts at day 6 (should start at day 1, overlapping with menstruation)
- Ovulation phase uses fixed day 14 instead of dynamic calculation
- Phase boundaries don't account for variable cycle lengths

**Required Changes:**
```javascript
// Lines 287-311 need complete rewrite:

// Calculate ovulation day (14 days before next period)
const ovulationDay = avgCycleLength - 14;

// Determine phase based on days since last period
let phase;
let note;
const dayInCycle = daysSinceLastPeriod + 1;

if (dayInCycle >= 1 && dayInCycle <= avgPeriodLength) {
  // Menstrual Phase (Days 1-5, typically)
  phase = "menstrual";
  note = `Day ${dayInCycle} of your menstrual phase.`;
} else if (dayInCycle > avgPeriodLength && dayInCycle < ovulationDay - 5) {
  // Follicular Phase (Days 1-13, overlaps with menstruation)
  // After period ends until 5 days before ovulation
  phase = "follicular";
  note = `Day ${dayInCycle} of your follicular phase.`;
} else if (dayInCycle >= ovulationDay - 5 && dayInCycle <= ovulationDay + 1) {
  // Ovulation Phase + Fertile Window (Around Day 14, typically days 9-15)
  if (dayInCycle === ovulationDay) {
    phase = "ovulation";
    note = `Day ${dayInCycle} - Ovulation day (peak fertility).`;
  } else {
    phase = "ovulation"; // Or "fertile" if you want separate phase
    note = `Day ${dayInCycle} - Fertile window.`;
  }
} else if (dayInCycle > ovulationDay + 1 && dayInCycle <= avgCycleLength) {
  // Luteal Phase (Days 15-28)
  phase = "luteal";
  note = `Day ${dayInCycle} of your luteal phase.`;
} else {
  // Beyond average cycle length
  phase = "menstrual";
  note = "Potential start of new menstrual phase.";
}
```

### 2. **Ovulation Calculation** (`backend/controllers/periodController.js`)

**Current Issue (Line 185):**
```javascript
const ovulation = new Date(lastStart.getTime() + Math.round(avgCycleLength / 2) * msDay);
```

**Should be:**
```javascript
// Ovulation occurs 14 days BEFORE next period
const ovulationDay = avgCycleLength - 14;
const ovulation = new Date(lastStart.getTime() + ovulationDay * msDay);
```

### 3. **Fertile Window Calculation** (`backend/controllers/periodController.js`)

**Current (Lines 186-187):**
```javascript
const fertileStart = new Date(ovulation.getTime() - 5 * msDay);
const fertileEnd = new Date(ovulation.getTime() + 1 * msDay);
```

**Should be (after fixing ovulation):**
```javascript
// Fertile window: 5 days before ovulation to 1 day after
const fertileStart = new Date(ovulation.getTime() - 5 * msDay);
const fertileEnd = new Date(ovulation.getTime() + 1 * msDay);
// This is correct IF ovulation is calculated correctly
```

### 4. **Frontend Phase Detection** (`client/src/pages/PeriodTracker/ExerciseRecommendations.jsx`)

**Current Issue (Lines 69-77):**
- Uses hardcoded day ranges instead of dynamic cycle length

**Required Changes:**
```javascript
// Replace lines 67-77 with:
const ovulationDay = avgLength - 14;

let phase;
if (currentDay <= avgPeriodLength) { // Use actual period length, not hardcoded 5
  phase = "menstrual";
} else if (currentDay < ovulationDay - 5) {
  phase = "follicular";
} else if (currentDay >= ovulationDay - 5 && currentDay <= ovulationDay + 1) {
  phase = "ovulation"; // Or "fertile"
} else {
  phase = "luteal";
}
```

### 5. **Python Phase Detection** (`backend/python/ml_models/phase_utils.py`)

**Current Issue:**
- Phase detection doesn't account for follicular phase overlapping with menstruation

**Required Changes (Lines 73-81):**
```python
# Determine phase
if 1 <= day_in_cycle <= avg_period:
    return "menstruation", day_in_cycle
elif fertile_start <= day_in_cycle <= fertile_end:
    # Ovulation phase (includes fertile window)
    if day_in_cycle == ovulation_day:
        return "ovulation", day_in_cycle
    else:
        return "ovulation", day_in_cycle  # Or "fertile" if separate
elif day_in_cycle > ovulation_day:
    return "luteal", day_in_cycle
else:
    # Follicular phase (after period, before fertile window)
    return "follicular", day_in_cycle
```

### 6. **Cycle Length Validation**

**Current Issue:**
- Filters may exclude valid cycles (21-35 days is normal range)

**Required Changes:**
- Update validation to accept cycles 21-45 days (more lenient)
- Filter only unrealistic cycles (< 15 days or > 50 days)

## 📋 Phase Definitions (Correct)

Based on your data:

1. **Menstrual Phase (Days 1-5)**
   - Hormones: Low estrogen and progesterone
   - Symptoms: Cramps, fatigue, mood changes, bloating

2. **Follicular Phase (Days 1-13)**
   - Overlaps with menstruation (Days 1-5)
   - Hormones: Estrogen begins to rise
   - Symptoms: Increased energy, clearer skin, improved mood

3. **Ovulation Phase (Around Day 14, or cycleLength - 14)**
   - Single day (not 3-day window)
   - Hormones: LH surge, peak estrogen
   - Symptoms: Mild cramps, increased libido, clear discharge

4. **Luteal Phase (Days 15-28)**
   - After ovulation until next period
   - Hormones: Progesterone rises, estrogen moderate
   - Symptoms: PMS, mood swings, breast tenderness

5. **Fertile Window (Days 9-15 for 28-day cycle)**
   - 5 days before ovulation to 1 day after
   - Most fertile period for conception

## ✅ Implementation Priority

1. **HIGH**: Fix ovulation calculation (affects all predictions)
2. **HIGH**: Fix phase detection logic (affects current phase display)
3. **MEDIUM**: Update fertile window calculation
4. **MEDIUM**: Fix frontend phase detection
5. **LOW**: Update Python phase detection (if used)

## 🧪 Testing Recommendations

Test with:
- 28-day cycle (standard)
- 30-day cycle (ovulation on day 16)
- 25-day cycle (ovulation on day 11)
- 35-day cycle (ovulation on day 21)

Verify:
- Ovulation always occurs 14 days before next period
- Fertile window is 5 days before to 1 day after ovulation
- Phase detection correctly identifies all phases
- Follicular phase overlaps with menstruation correctly
