import React, { useEffect, useMemo, useState } from "react";
import "./TelehealthCalendar.css";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const toDateKey = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const normalizeAvailableDateMap = (availableDates = []) => {
  const map = new Map();
  availableDates.forEach((entry) => {
    if (typeof entry === "string") {
      map.set(entry, { slotCount: 1 });
      return;
    }
    if (entry?.date) {
      map.set(entry.date, {
        slotCount:
          typeof entry.slotCount === "number"
            ? entry.slotCount
            : Array.isArray(entry.slots)
            ? entry.slots.length
            : 0,
      });
    }
  });
  return map;
};

export default function TelehealthCalendar({
  availableDates = [],
  appointments = {},
  onDateSelect,
  selectedDate,
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewDate, setViewDate] = useState(() => selectedDate || new Date());
  const [focusedDate, setFocusedDate] = useState(() => selectedDate || new Date());

  useEffect(() => {
    if (selectedDate) {
      setViewDate(new Date(selectedDate));
      setFocusedDate(new Date(selectedDate));
    }
  }, [selectedDate]);

  const availableMap = useMemo(
    () => normalizeAvailableDateMap(availableDates),
    [availableDates]
  );

  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const leading = firstDay.getDay();

    const cells = [];
    for (let i = 0; i < leading; i += 1) cells.push(null);

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      const current = new Date(year, month, day);
      const dateKey = toDateKey(current);
      const slotInfo = availableMap.get(dateKey);
      const appointmentSlots = appointments[dateKey] || [];
      const slotCount =
        appointmentSlots.length > 0
          ? appointmentSlots.length
          : slotInfo?.slotCount || 0;
      cells.push({
        date: current,
        dateKey,
        isPast: current < today,
        hasSlots: slotCount > 0,
        slotCount,
      });
    }
    return cells;
  }, [appointments, availableMap, today, viewDate]);

  const selectedKey = selectedDate ? toDateKey(selectedDate) : "";
  const focusedKey = focusedDate ? toDateKey(focusedDate) : "";

  const jumpMonth = (direction) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const handleDayClick = (cell) => {
    if (!cell || cell.isPast || !cell.hasSlots) return;
    setFocusedDate(cell.date);
    onDateSelect?.(cell.date);
  };

  const moveFocusBy = (deltaDays) => {
    const base = focusedDate || selectedDate || new Date(viewDate);
    const next = new Date(base);
    next.setDate(base.getDate() + deltaDays);
    setFocusedDate(next);
    if (
      next.getFullYear() !== viewDate.getFullYear() ||
      next.getMonth() !== viewDate.getMonth()
    ) {
      setViewDate(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  const handleGridKeyDown = (event) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        moveFocusBy(1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        moveFocusBy(-1);
        break;
      case "ArrowDown":
        event.preventDefault();
        moveFocusBy(7);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocusBy(-7);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (!focusedDate) return;
        onDateSelect?.(focusedDate);
        break;
      default:
        break;
    }
  };

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, i) => current - 1 + i);
  }, []);

  return (
    <div className="th-calendar-wrap">
      <div className="th-calendar-controls">
        <button
          type="button"
          className="th-nav-btn"
          onClick={() => jumpMonth(-1)}
          aria-label="Previous month"
        >
          ‹
        </button>

        <div className="th-calendar-selectors">
          <select
            value={viewDate.getMonth()}
            onChange={(e) =>
              setViewDate(
                new Date(viewDate.getFullYear(), Number(e.target.value), 1)
              )
            }
            aria-label="Select month"
          >
            {MONTHS.map((m, idx) => (
              <option key={m} value={idx}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={viewDate.getFullYear()}
            onChange={(e) =>
              setViewDate(
                new Date(Number(e.target.value), viewDate.getMonth(), 1)
              )
            }
            aria-label="Select year"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="th-nav-btn"
          onClick={() => jumpMonth(1)}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="th-calendar-topbar">
        <h4>
          {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </h4>
        <button
          type="button"
          className="th-today-btn"
          onClick={() => {
            setViewDate(new Date());
            setFocusedDate(new Date());
            onDateSelect?.(new Date());
          }}
        >
          Today
        </button>
      </div>

      <div className="th-week-head">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="th-week-cell">
            {day}
          </div>
        ))}
      </div>

      <div
        className="th-day-grid"
        onKeyDown={handleGridKeyDown}
        tabIndex={0}
        aria-label="Appointment calendar. Use arrow keys to navigate dates."
      >
        {calendarCells.map((cell, idx) => {
          if (!cell) return <div key={`empty-${idx}`} className="th-day empty" />;
          const isToday = cell.dateKey === toDateKey(today);
          const isSelected = cell.dateKey === selectedKey;
          const isFocused = cell.dateKey === focusedKey;
          const unavailable = cell.isPast || !cell.hasSlots;

          const ariaLabel = `${cell.date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}, ${isSelected ? "selected" : "not selected"}, ${
            unavailable ? "unavailable" : "available"
          }`;

          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => handleDayClick(cell)}
              className={[
                "th-day",
                isToday ? "today" : "",
                isSelected ? "selected" : "",
                unavailable ? "unavailable" : "",
                isFocused ? "focused" : "",
              ].join(" ")}
              aria-label={ariaLabel}
              aria-selected={isSelected}
              disabled={unavailable}
            >
              <span className="th-day-number">{cell.date.getDate()}</span>
              {cell.hasSlots ? <span className="th-slot-dot" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
