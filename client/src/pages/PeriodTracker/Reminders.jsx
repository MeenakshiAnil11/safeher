import React, { useState, useEffect } from "react";

export default function Reminders() {
  const [settings, setSettings] = useState({
    enablePeriodReminder: true,
    reminderDaysBeforePeriod: 2,
    enableOvulationReminder: true,
    reminderDaysBeforeOvulation: 1,
    enableExerciseReminder: true,
    exerciseReminderTime: "09:00",
    exerciseReminderDays: ["monday", "wednesday", "friday"],
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load current settings
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/auth/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.notifications) {
          setSettings(prev => ({ ...prev, ...data.notifications }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notifications: {
            enablePeriodReminder: settings.enablePeriodReminder,
            reminderDaysBeforePeriod: Number(settings.reminderDaysBeforePeriod),
            enableOvulationReminder: settings.enableOvulationReminder,
            reminderDaysBeforeOvulation: Number(settings.reminderDaysBeforeOvulation),
            enableExerciseReminder: settings.enableExerciseReminder,
            exerciseReminderTime: settings.exerciseReminderTime,
            exerciseReminderDays: settings.exerciseReminderDays,
            email: settings.email,
            phone: settings.phone,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");
      alert("Reminders updated successfully!");
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reminders-settings">
      <p>Customize your reminders for periods, ovulation, and other cycle events.</p>

      <div className="pt-form">
        <div>
          <label>
            <input
              type="checkbox"
              checked={settings.enablePeriodReminder}
              onChange={(e) => handleChange("enablePeriodReminder", e.target.checked)}
            />
            Enable Period Reminders
          </label>
        </div>
        <div>
          <label>Days before period to remind:</label>
          <input
            type="number"
            min="0"
            max="7"
            value={settings.reminderDaysBeforePeriod}
            onChange={(e) => handleChange("reminderDaysBeforePeriod", e.target.value)}
            disabled={!settings.enablePeriodReminder}
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={settings.enableOvulationReminder}
              onChange={(e) => handleChange("enableOvulationReminder", e.target.checked)}
            />
            Enable Ovulation Reminders
          </label>
        </div>
        <div>
          <label>Days before ovulation to remind:</label>
          <input
            type="number"
            min="0"
            max="5"
            value={settings.reminderDaysBeforeOvulation}
            onChange={(e) => handleChange("reminderDaysBeforeOvulation", e.target.value)}
            disabled={!settings.enableOvulationReminder}
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={settings.enableExerciseReminder}
              onChange={(e) => handleChange("enableExerciseReminder", e.target.checked)}
            />
            Enable Exercise Reminders
          </label>
        </div>
        <div>
          <label>Exercise reminder time:</label>
          <input
            type="time"
            value={settings.exerciseReminderTime}
            onChange={(e) => handleChange("exerciseReminderTime", e.target.value)}
            disabled={!settings.enableExerciseReminder}
          />
        </div>
        <div>
          <label>Exercise reminder days:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
              <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={settings.exerciseReminderDays.includes(day)}
                  onChange={(e) => {
                    const newDays = settings.exerciseReminderDays.includes(day)
                      ? settings.exerciseReminderDays.filter(d => d !== day)
                      : [...settings.exerciseReminderDays, day];
                    handleChange("exerciseReminderDays", newDays);
                  }}
                  disabled={!settings.enableExerciseReminder}
                />
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label>Email for notifications:</label>
          <input
            type="email"
            placeholder="your-email@example.com"
            value={settings.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>

        <div>
          <label>Phone for SMS notifications:</label>
          <input
            type="tel"
            placeholder="+1234567890"
            value={settings.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>

        <button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}