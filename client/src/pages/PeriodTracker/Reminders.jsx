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
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const motivationalMessages = [
    "Small consistent habits create big wellness wins.",
    "Your future self will thank you for today’s reminder.",
    "Hydrate, move gently, and listen to your body today.",
  ];

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
    const nextErrors = {};
    setStatusMessage("");

    if (settings.enablePeriodReminder) {
      const daysBeforePeriod = Number(settings.reminderDaysBeforePeriod);
      if (Number.isNaN(daysBeforePeriod) || daysBeforePeriod < 0 || daysBeforePeriod > 7) {
        nextErrors.reminderDaysBeforePeriod = "Enter a value from 0 to 7 days.";
      }
    }

    if (settings.enableOvulationReminder) {
      const daysBeforeOvulation = Number(settings.reminderDaysBeforeOvulation);
      if (Number.isNaN(daysBeforeOvulation) || daysBeforeOvulation < 0 || daysBeforeOvulation > 5) {
        nextErrors.reminderDaysBeforeOvulation = "Enter a value from 0 to 5 days.";
      }
    }

    if (settings.enableExerciseReminder) {
      if (!settings.exerciseReminderTime) {
        nextErrors.exerciseReminderTime = "Select a reminder time.";
      }
      if (!settings.exerciseReminderDays.length) {
        nextErrors.exerciseReminderDays = "Choose at least one reminder day.";
      }
    }

    if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (settings.phone && !/^\+?[0-9]{8,15}$/.test(settings.phone)) {
      nextErrors.phone = "Enter a valid phone number (8-15 digits).";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

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
      setStatusMessage("Reminders updated successfully.");
    } catch (err) {
      setStatusMessage("Failed to save: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestMotivation = () => {
    const message = motivationalMessages[new Date().getSeconds() % motivationalMessages.length];
    setStatusMessage(`Motivation: ${message}`);
  };

  return (
    <div className="reminders-settings">
      <p>Customize your reminders for periods, ovulation, and other cycle events.</p>

      <div className="pt-form">
        {statusMessage ? (
          <p className={`form-feedback ${statusMessage.startsWith("Failed") ? "error" : "success"}`}>
            {statusMessage}
          </p>
        ) : null}
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
          {errors.reminderDaysBeforePeriod ? <p className="form-error">{errors.reminderDaysBeforePeriod}</p> : null}
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
          {errors.reminderDaysBeforeOvulation ? <p className="form-error">{errors.reminderDaysBeforeOvulation}</p> : null}
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
          {errors.exerciseReminderTime ? <p className="form-error">{errors.exerciseReminderTime}</p> : null}
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
          {errors.exerciseReminderDays ? <p className="form-error">{errors.exerciseReminderDays}</p> : null}
        </div>

        <div>
          <label>Email for notifications:</label>
          <input
            type="email"
            placeholder="your-email@example.com"
            value={settings.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          {errors.email ? <p className="form-error">{errors.email}</p> : null}
        </div>

        <div>
          <label>Phone for SMS notifications:</label>
          <input
            type="tel"
            placeholder="+1234567890"
            value={settings.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
          {errors.phone ? <p className="form-error">{errors.phone}</p> : null}
        </div>

        <button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </button>
        <button type="button" onClick={handleTestMotivation} disabled={loading}>
          Test Motivation
        </button>

        <div className="smart-reminder-preview">
          <strong>Smart Schedule Preview</strong>
          <p>
            Exercise reminders are set for {settings.exerciseReminderDays.length || 0} day(s) at{" "}
            {settings.exerciseReminderTime || "--:--"}.
          </p>
          <p className="hi-muted">
            {settings.enableExerciseReminder
              ? "You will receive encouragement before your scheduled workout window."
              : "Enable exercise reminders to receive motivational nudges."}
          </p>
        </div>
      </div>
    </div>
  );
}