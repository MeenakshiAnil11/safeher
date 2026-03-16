import React, { useEffect, useMemo, useState } from "react";

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_DAY = {
  enabled: false,
  startTime: "09:00",
  endTime: "17:00",
};

const generateTimeOptions = (intervalMinutes = 30) => {
  const options = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const hour12 = hour % 12 || 12;
      options.push(
        `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
      );
    }
  }
  return Array.from(new Set(options));
};

const convert24To12 = (time24 = "09:00") => {
  const [h, m] = String(time24).split(":").map((v) => Number(v));
  const hour = Number.isFinite(h) ? h : 9;
  const minute = Number.isFinite(m) ? m : 0;
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return {
    time: `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    period,
  };
};

const convert12To24 = (time12 = "09:00", period = "AM") => {
  const [h, m] = String(time12).split(":").map((v) => Number(v));
  let hour = Number.isFinite(h) ? h : 9;
  const minute = Number.isFinite(m) ? m : 0;
  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const normalizeRows = (availability) => {
  const sourceMap = new Map();
  if (Array.isArray(availability)) {
    availability.forEach((row) => {
      if (!row?.day) return;
      sourceMap.set(row.day, {
        enabled: Boolean(row.enabled),
        startTime: row.startTime || "09:00",
        endTime: row.endTime || "17:00",
      });
    });
  }
  if (availability && !Array.isArray(availability) && typeof availability === "object") {
    Object.entries(availability).forEach(([day, row]) => {
      sourceMap.set(day, {
        enabled: Boolean(row?.enabled),
        startTime: row?.startTime || "09:00",
        endTime: row?.endTime || "17:00",
      });
    });
  }

  return DAY_ORDER.map((day) => ({
    day,
    ...(sourceMap.get(day) || DEFAULT_DAY),
  }));
};

export default function WeeklyAvailability({
  availability = [],
  onChange,
  onSave,
  saving = false,
  onDateOverridesChange,
  showCancel = false,
  onCancel,
}) {
  const [rows, setRows] = useState(() => normalizeRows(availability));
  const [specificDateMode, setSpecificDateMode] = useState(false);
  const [dateOverrides, setDateOverrides] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("09:00");
  const [selectedStartPeriod, setSelectedStartPeriod] = useState("AM");
  const [selectedEndTime, setSelectedEndTime] = useState("05:00");
  const [selectedEndPeriod, setSelectedEndPeriod] = useState("PM");
  const [blockDate, setBlockDate] = useState(false);
  const timeOptions = useMemo(() => generateTimeOptions(30), []);

  useEffect(() => {
    setRows(normalizeRows(availability));
  }, [availability]);

  const normalizedRows = useMemo(() => normalizeRows(rows), [rows]);

  const updateRows = (updater) => {
    setRows((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const merged = normalizeRows(next);
      onChange?.(merged);
      return merged;
    });
  };

  const handleToggle = (day) => {
    updateRows((prev) =>
      prev.map((row) =>
        row.day === day ? { ...row, enabled: !row.enabled } : row
      )
    );
  };

  const handleTimeChange = (day, field, value) => {
    updateRows((prev) =>
      prev.map((row) => (row.day === day ? { ...row, [field]: value } : row))
    );
  };

  const handleAddDateOverride = () => {
    if (!selectedDate) return;
    const next = [
      ...dateOverrides.filter((entry) => entry.date !== selectedDate),
      {
        date: selectedDate,
        startTime: convert12To24(selectedStartTime, selectedStartPeriod),
        endTime: convert12To24(selectedEndTime, selectedEndPeriod),
        blocked: blockDate,
      },
    ].sort((a, b) => a.date.localeCompare(b.date));
    setDateOverrides(next);
    onDateOverridesChange?.(next);
  };

  const handleRemoveDateOverride = (date) => {
    const next = dateOverrides.filter((entry) => entry.date !== date);
    setDateOverrides(next);
    onDateOverridesChange?.(next);
  };

  return (
    <div className="w-full">
      <div
        className="border border-gray-200 rounded-xl bg-white p-4 md:p-6"
        role="group"
        aria-label="Weekly availability"
      >
        <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-4 text-left">
          Weekly Schedule
        </h3>

        <div className="space-y-3">
          {normalizedRows.map((row) => (
            <div
              key={row.day}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:space-x-4 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
              role="group"
              aria-labelledby={`availability-${row.day}`}
            >
              <label id={`availability-${row.day}`} className="inline-flex items-center space-x-3 text-sm font-medium text-gray-800">
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={() => handleToggle(row.day)}
                  aria-label={`Enable ${row.day} availability`}
                />
                <span>{row.day}</span>
              </label>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-4 sm:gap-0 w-full md:w-auto">
                {(() => {
                  const start = convert24To12(row.startTime || "09:00");
                  const end = convert24To12(row.endTime || "17:00");
                  return (
                    <>
                <select
                  value={start.time}
                  onChange={(e) =>
                    handleTimeChange(
                      row.day,
                      "startTime",
                      convert12To24(e.target.value || "09:00", start.period)
                    )
                  }
                  disabled={!row.enabled}
                  className="form-input min-w-[130px] w-full sm:w-auto"
                  aria-label={`${row.day} start time`}
                >
                  {timeOptions.map((time) => (
                    <option key={`start-${row.day}-${time}`} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <select
                  value={start.period}
                  onChange={(e) =>
                    handleTimeChange(
                      row.day,
                      "startTime",
                      convert12To24(start.time, e.target.value)
                    )
                  }
                  disabled={!row.enabled}
                  className="form-input min-w-[84px] w-full sm:w-auto"
                  aria-label={`${row.day} start period`}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
                <span className="text-sm text-gray-500">to</span>
                <select
                  value={end.time}
                  onChange={(e) =>
                    handleTimeChange(
                      row.day,
                      "endTime",
                      convert12To24(e.target.value || "05:00", end.period)
                    )
                  }
                  disabled={!row.enabled}
                  className="form-input min-w-[130px] w-full sm:w-auto"
                  aria-label={`${row.day} end time`}
                >
                  {timeOptions.map((time) => (
                    <option key={`end-${row.day}-${time}`} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <select
                  value={end.period}
                  onChange={(e) =>
                    handleTimeChange(
                      row.day,
                      "endTime",
                      convert12To24(end.time, e.target.value)
                    )
                  }
                  disabled={!row.enabled}
                  className="form-input min-w-[84px] w-full sm:w-auto"
                  aria-label={`${row.day} end period`}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100">
          <label className="inline-flex items-center space-x-3 text-sm font-medium text-gray-800">
            <input
              type="checkbox"
              checked={specificDateMode}
              onChange={(e) => setSpecificDateMode(e.target.checked)}
              aria-label="Set availability for specific dates"
            />
            <span>Set availability for specific dates</span>
          </label>

          {specificDateMode ? (
            <div className="mt-4 space-y-3" role="group" aria-label="Specific date overrides">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input"
                  aria-label="Override date"
                />
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedStartTime}
                    onChange={(e) => setSelectedStartTime(e.target.value)}
                    disabled={blockDate}
                    className="form-input min-w-[120px]"
                    aria-label="Override start time"
                  >
                    {timeOptions.map((time) => (
                      <option key={`override-start-${time}`} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedStartPeriod}
                    onChange={(e) => setSelectedStartPeriod(e.target.value)}
                    disabled={blockDate}
                    className="form-input min-w-[80px]"
                    aria-label="Override start period"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                  <span className="text-sm text-gray-500">to</span>
                  <select
                    value={selectedEndTime}
                    onChange={(e) => setSelectedEndTime(e.target.value)}
                    disabled={blockDate}
                    className="form-input min-w-[120px]"
                    aria-label="Override end time"
                  >
                    {timeOptions.map((time) => (
                      <option key={`override-end-${time}`} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedEndPeriod}
                    onChange={(e) => setSelectedEndPeriod(e.target.value)}
                    disabled={blockDate}
                    className="form-input min-w-[80px]"
                    aria-label="Override end period"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={blockDate}
                    onChange={(e) => setBlockDate(e.target.checked)}
                    aria-label="Block this date"
                  />
                  <span>Block date</span>
                </label>
                <button
                  type="button"
                  className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
                  onClick={handleAddDateOverride}
                >
                  Add
                </button>
              </div>

              {dateOverrides.length > 0 ? (
                <div className="space-y-2">
                  {dateOverrides.map((entry) => (
                    <div key={entry.date} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                      <span>
                        {entry.date} - {entry.blocked
                          ? "Blocked"
                          : `${convert24To12(entry.startTime).time} ${convert24To12(entry.startTime).period} to ${convert24To12(entry.endTime).time} ${convert24To12(entry.endTime).period}`}
                      </span>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRemoveDateOverride(entry.date)}
                        aria-label={`Remove override for ${entry.date}`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
          onClick={() => onSave?.(normalizedRows)}
          disabled={saving}
          aria-label="Save weekly availability changes"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {showCancel ? (
          <button
            type="button"
            className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
            onClick={() => onCancel?.()}
            disabled={saving}
            aria-label="Cancel editing profile"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}
