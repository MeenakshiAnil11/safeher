import React, { useMemo, useState } from "react";
import "./AppointmentCalendar.css";

export default function AppointmentCalendar({ appointments = [] }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const eventsByDate = useMemo(() => {
    const map = {};
    appointments.forEach((appt) => {
      const dt = new Date(appt.time || appt.date);
      if (Number.isNaN(dt.getTime())) return;
      const key = dt.toISOString().split("T")[0];
      if (!map[key]) map[key] = [];
      map[key].push(appt);
    });
    return map;
  }, [appointments]);

  const calendarCells = useMemo(() => {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const leading = start.getDay();
    const daysInMonth = end.getDate();

    const cells = [];
    for (let i = 0; i < leading; i += 1) {
      cells.push({ key: `blank-start-${i}`, blank: true });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), day);
      const dateKey = date.toISOString().split("T")[0];
      cells.push({
        key: dateKey,
        blank: false,
        day,
        dateKey,
        events: eventsByDate[dateKey] || [],
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ key: `blank-end-${cells.length}`, blank: true });
    }

    return cells;
  }, [cursor, eventsByDate]);

  const goPrevMonth = () => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <article className="appointment-calendar-card">
      <div className="appointment-calendar-head">
        <h3>Appointment Calendar</h3>
        <div className="appointment-calendar-nav">
          <button type="button" onClick={goPrevMonth}>←</button>
          <span>{monthLabel}</span>
          <button type="button" onClick={goNextMonth}>→</button>
        </div>
      </div>

      <div className="appointment-calendar-weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="appointment-calendar-grid">
        {calendarCells.map((cell) =>
          cell.blank ? (
            <div className="calendar-cell blank" key={cell.key} />
          ) : (
            <div className="calendar-cell" key={cell.key}>
              <strong>{cell.day}</strong>
              <div className="calendar-events">
                {cell.events.slice(0, 2).map((event) => (
                  <span key={event._id || event.id || `${cell.key}-${event.title}`}>{event.title}</span>
                ))}
                {cell.events.length > 2 ? <small>+{cell.events.length - 2} more</small> : null}
              </div>
            </div>
          )
        )}
      </div>
    </article>
  );
}
