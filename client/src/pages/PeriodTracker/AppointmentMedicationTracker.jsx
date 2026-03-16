import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import AICarePrediction from "../../components/pregnancy/AICarePrediction";
import AppointmentCalendar from "../../components/pregnancy/AppointmentCalendar";
import AIAppointmentRecommendation from "../../components/pregnancy/AIAppointmentRecommendation";
import PregnancyAppointmentTimeline from "../../components/pregnancy/PregnancyAppointmentTimeline";
import "./AppointmentMedicationTracker.css";

const fallbackAppointments = [
  {
    _id: "a1",
    title: "Prenatal Checkup",
    type: "Routine",
    doctor: "Dr. Emily Johnson • Obstetrician",
    time: "2026-03-15T10:00:00.000Z",
    location: "Women's Health Center, Room 302",
    status: "completed",
    notes: "All vitals normal. Baby growing well.",
    telehealthLink: "https://meet.google.com/",
    reports: [],
  },
  {
    _id: "a2",
    title: "Ultrasound Scan",
    type: "Diagnostic",
    doctor: "Dr. Michael Chen • Radiologist",
    time: "2026-03-22T14:30:00.000Z",
    location: "Imaging Department, 2nd Floor",
    status: "scheduled",
    notes: "Bring previous scan reports.",
    telehealthLink: "",
    reports: [],
  },
  {
    _id: "a3",
    title: "Glucose Screening",
    type: "Lab Test",
    doctor: "Lab Technician • Laboratory",
    time: "2026-03-29T08:00:00.000Z",
    location: "Laboratory Services, Ground Floor",
    status: "scheduled",
    notes: "Fasting advised before test.",
    telehealthLink: "",
    reports: [],
  },
];

const fallbackMedications = [
  {
    _id: "m1",
    name: "Prenatal Vitamins",
    dosage: "1 tablet daily",
    frequency: "Morning with breakfast",
    reminder: true,
    reminderTime: "08:00",
  },
  {
    _id: "m2",
    name: "Iron Supplement",
    dosage: "65mg",
    frequency: "Twice daily",
    reminder: true,
    reminderTime: "14:00",
  },
  {
    _id: "m3",
    name: "Folic Acid",
    dosage: "400mcg",
    frequency: "Once daily",
    reminder: false,
    reminderTime: "20:00",
  },
];

const formatDateTime = (dateValue) => {
  const d = new Date(dateValue);
  return {
    date: d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
};

const appointmentStatus = (item) => {
  if (item.status) return String(item.status).toLowerCase();
  const dt = new Date(item.time || item.date);
  if (dt < new Date()) return "completed";
  return "scheduled";
};

export default function AppointmentMedicationTracker({ currentWeek = 20 }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointmentView, setAppointmentView] = useState("list");
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [uploadedReports, setUploadedReports] = useState({});
  const [rescheduleState, setRescheduleState] = useState({
    open: false,
    appointmentId: "",
    date: "",
    time: "",
  });
  const [notified, setNotified] = useState({});
  const [createState, setCreateState] = useState({
    open: false,
    title: "",
    type: "Routine",
    doctor: "",
    date: "",
    time: "",
    location: "",
    notes: "",
    telehealthLink: "",
  });
  const [detailsState, setDetailsState] = useState({ open: false, appointment: null });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [apptsRes, medsRes] = await Promise.allSettled([
          api.get("/pregnancy/appointments"),
          api.get("/pregnancy/medications"),
        ]);

        const appts =
          apptsRes.status === "fulfilled" && Array.isArray(apptsRes.value.data?.appointments)
            ? apptsRes.value.data.appointments
            : fallbackAppointments;
        const meds =
          medsRes.status === "fulfilled" && Array.isArray(medsRes.value.data?.medications)
            ? medsRes.value.data.medications
            : fallbackMedications;

        setAppointments(appts.length ? appts : fallbackAppointments);
        setMedications(meds.length ? meds : fallbackMedications);
      } catch (e) {
        console.error("Failed loading appointment tracker data:", e);
        setAppointments(fallbackAppointments);
        setMedications(fallbackMedications);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(uploadedReports)
        .flat()
        .forEach((report) => {
          if (report.url) URL.revokeObjectURL(report.url);
        });
    };
  }, [uploadedReports]);

  useEffect(() => {
    if (!("Notification" in window)) return undefined;
    const timer = setInterval(() => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const dayKey = now.toISOString().split("T")[0];
      medications.forEach((med) => {
        if (!med.reminder || !med.reminderTime || Notification.permission !== "granted") return;
        const key = `${med._id}-${dayKey}`;
        if (med.reminderTime === hhmm && !notified[key]) {
          new Notification(`Medication Reminder: ${med.name}`, {
            body: `${med.dosage} • ${med.frequency}`,
          });
          setNotified((prev) => ({ ...prev, [key]: true }));
        }
      });
    }, 60000);
    return () => clearInterval(timer);
  }, [medications, notified]);

  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((item) => new Date(item.time || item.date) >= new Date())
        .sort((a, b) => new Date(a.time || a.date) - new Date(b.time || b.date)),
    [appointments]
  );

  const pastAppointments = useMemo(
    () =>
      appointments
        .filter((item) => new Date(item.time || item.date) < new Date())
        .sort((a, b) => new Date(b.time || b.date) - new Date(a.time || a.date)),
    [appointments]
  );

  const nextAppointment = upcomingAppointments[0] || null;
  const reminderInfo = useMemo(() => {
    if (!nextAppointment) return null;
    const now = new Date();
    const target = new Date(nextAppointment.time || nextAppointment.date);
    const diffDays = (target - now) / (1000 * 60 * 60 * 24);
    if (diffDays <= 1 && diffDays >= 0) {
      return { appointment: nextAppointment, daysRemaining: diffDays };
    }
    return null;
  }, [nextAppointment]);

  const appointmentIconClass = (title = "") => {
    if (/glucose|lab/i.test(title)) return "teal";
    if (/ultra|scan/i.test(title)) return "purple";
    return "pink";
  };

  const statusClass = (status) => {
    if (status === "completed") return "completed";
    if (status === "missed") return "missed";
    return "scheduled";
  };

  const handleJoinTelehealth = (link) => {
    if (!link) return;
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleReportUpload = (appointmentId, files) => {
    const fileList = Array.from(files || []);
    if (!fileList.length) return;
    const parsed = fileList.map((file) => ({
      id: `${appointmentId}-${Date.now()}-${file.name}`,
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    setUploadedReports((prev) => ({
      ...prev,
      [appointmentId]: [...(prev[appointmentId] || []), ...parsed],
    }));
  };

  const handleRequestNotifications = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") return;
    try {
      await Notification.requestPermission();
    } catch (err) {
      console.error("Notification permission request failed:", err);
    }
  };

  const toggleMedicationReminder = (medId) => {
    setMedications((prev) =>
      prev.map((med) =>
        med._id === medId ? { ...med, reminder: !med.reminder } : med
      )
    );
    handleRequestNotifications();
  };

  const updateMedicationReminderTime = (medId, value) => {
    setMedications((prev) =>
      prev.map((med) => (med._id === medId ? { ...med, reminderTime: value } : med))
    );
  };

  const openReschedule = (item) => {
    const dt = new Date(item.time || item.date);
    setRescheduleState({
      open: true,
      appointmentId: item._id,
      date: dt.toISOString().split("T")[0],
      time: `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`,
    });
  };

  const openCreateAppointment = (prefillType = "") => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 3);
    setCreateState({
      open: true,
      title: prefillType || "",
      type: prefillType ? "Recommended Checkup" : "Routine",
      doctor: "",
      date: baseDate.toISOString().split("T")[0],
      time: "10:00",
      location: "",
      notes: "",
      telehealthLink: "",
    });
  };

  const saveCreatedAppointment = () => {
    if (!createState.title || !createState.doctor || !createState.date || !createState.time) {
      alert("Please fill appointment type, doctor, date, and time.");
      return;
    }
    const isoTime = new Date(`${createState.date}T${createState.time}:00`).toISOString();
    const newAppointment = {
      _id: `local-${Date.now()}`,
      title: createState.title,
      type: createState.type || "Routine",
      doctor: createState.doctor,
      time: isoTime,
      location: createState.location || "Location not specified",
      notes: createState.notes || "",
      telehealthLink: createState.telehealthLink || "",
      status: "scheduled",
      reports: [],
    };
    setAppointments((prev) => [newAppointment, ...prev]);
    setActiveTab("upcoming");
    setAppointmentView("list");
    setCreateState({
      open: false,
      title: "",
      type: "Routine",
      doctor: "",
      date: "",
      time: "",
      location: "",
      notes: "",
      telehealthLink: "",
    });
  };

  const openDetails = (appointment) => {
    setDetailsState({ open: true, appointment });
  };

  const applyReschedule = () => {
    if (!rescheduleState.appointmentId || !rescheduleState.date || !rescheduleState.time) return;
    const nextDate = new Date(`${rescheduleState.date}T${rescheduleState.time}:00`);
    setAppointments((prev) =>
      prev.map((item) =>
        item._id === rescheduleState.appointmentId
          ? { ...item, time: nextDate.toISOString(), status: "scheduled" }
          : item
      )
    );
    setRescheduleState({ open: false, appointmentId: "", date: "", time: "" });
  };

  const renderReportSection = (item) => {
    const extra = uploadedReports[item._id] || [];
    const reports = [...(Array.isArray(item.reports) ? item.reports : []), ...extra];
    return (
      <div className="report-upload">
        <label className="report-upload-label">
          Upload Reports
          <input
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.pdf,.dcm,.dicom"
            onChange={(e) => handleReportUpload(item._id, e.target.files)}
          />
        </label>
        {reports.length ? (
          <div className="report-list">
            {reports.map((report, idx) => (
              <div className="report-item" key={report.id || `${item._id}-${idx}`}>
                <span>{report.name || `Report ${idx + 1}`}</span>
                <div className="report-actions">
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => report.url && window.open(report.url, "_blank")}
                  >
                    Preview
                  </button>
                  <a
                    className="ghost-btn"
                    href={report.url || "#"}
                    download={report.name || `report-${idx + 1}`}
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  const listSource = activeTab === "upcoming" ? upcomingAppointments : pastAppointments;

  return (
    <section className="preg-apm-page">
      <header className="preg-apm-head">
        <div>
          <h1>Appointments & Medication</h1>
          <p>Manage your appointments and medication schedule</p>
        </div>
        <button className="primary-btn" onClick={() => openCreateAppointment()}>
          ＋ New Appointment
        </button>
      </header>

      <AICarePrediction
        currentWeek={currentWeek}
        onSchedule={(recommendedType) => {
          setActiveTab("upcoming");
          openCreateAppointment(recommendedType);
        }}
      />

      <PregnancyAppointmentTimeline currentWeek={currentWeek} appointments={appointments} />
      <AIAppointmentRecommendation currentWeek={currentWeek} />

      {reminderInfo ? (
        <article className="upcoming-alert-card">
          <strong>Upcoming Appointment Tomorrow</strong>
          <p>{reminderInfo.appointment.title}</p>
          <p>
            {formatDateTime(reminderInfo.appointment.time || reminderInfo.appointment.date).date} at{" "}
            {formatDateTime(reminderInfo.appointment.time || reminderInfo.appointment.date).time}
          </p>
          <p>{reminderInfo.appointment.doctor}</p>
        </article>
      ) : null}

      <div className="preg-apm-tabs">
        <button className={activeTab === "upcoming" ? "active" : ""} onClick={() => setActiveTab("upcoming")}>
          Upcoming
        </button>
        <button className={activeTab === "past" ? "active" : ""} onClick={() => setActiveTab("past")}>
          Past Appointments
        </button>
        <button className={activeTab === "medication" ? "active" : ""} onClick={() => setActiveTab("medication")}>
          Medication
        </button>
      </div>

      {(activeTab === "upcoming" || activeTab === "past") ? (
        <div className="view-toggle">
          <button
            type="button"
            className={appointmentView === "list" ? "active" : ""}
            onClick={() => setAppointmentView("list")}
          >
            List View
          </button>
          <button
            type="button"
            className={appointmentView === "calendar" ? "active" : ""}
            onClick={() => setAppointmentView("calendar")}
          >
            Calendar View
          </button>
        </div>
      ) : null}

      {activeTab === "upcoming" && appointmentView === "list" ? (
        <div className="card-stack">
          {(upcomingAppointments.length ? upcomingAppointments : fallbackAppointments).map((item) => {
            const dt = formatDateTime(item.time || item.date);
            const status = appointmentStatus(item);
            return (
              <article className="appt-card" key={item._id}>
                <div className={`appt-icon ${appointmentIconClass(item.title)}`}>🗓</div>
                <div className="appt-main">
                  <div className="appt-title-row">
                    <h3>{item.title}</h3>
                    <span>{item.type || "Routine"}</span>
                    <span className={`status-badge ${statusClass(status)}`}>{status}</span>
                  </div>
                  <p>👤 {item.doctor}</p>
                  <p>
                    ◷ {dt.date} at {dt.time}
                  </p>
                  <p>⌖ {item.location}</p>
                  {renderReportSection(item)}
                </div>
                <div className="appt-actions">
                  <button className="ghost-btn" onClick={() => openReschedule(item)}>
                    Reschedule
                  </button>
                  {item.telehealthLink ? (
                    <button className="ghost-btn" onClick={() => handleJoinTelehealth(item.telehealthLink)}>
                      Join Video Consultation
                    </button>
                  ) : null}
                  <button className="gradient-btn" onClick={() => openDetails(item)}>
                    View Details
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {activeTab === "past" && appointmentView === "list" ? (
        <div className="card-stack">
          {(pastAppointments.length ? pastAppointments : fallbackAppointments.slice(0, 2)).map((item) => {
            const dt = formatDateTime(item.time || item.date);
            const status = appointmentStatus(item);
            return (
              <article className="appt-card past" key={item._id}>
                <div className="appt-main">
                  <div className="appt-title-row">
                    <h3>{item.title}</h3>
                    <span className={`status-badge ${statusClass(status)}`}>{status}</span>
                  </div>
                  <p>{item.doctor?.split("•")[0]?.trim()}</p>
                  <p>{dt.date}</p>
                  <div className="doctor-notes-box">
                    <strong>Doctor Notes</strong>
                    <p>{item.notes || "All vitals normal. Baby growing well."}</p>
                  </div>
                  {renderReportSection(item)}
                </div>
                <div className="appt-actions">
                  <button className="ghost-btn" onClick={() => openDetails(item)}>
                    View Records
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {(activeTab === "upcoming" || activeTab === "past") && appointmentView === "calendar" ? (
        <AppointmentCalendar appointments={appointments} />
      ) : null}

      {activeTab === "medication" ? (
        <>
          <div className="med-actions-row">
            <button className="primary-btn">＋ Add Medication</button>
          </div>
          <div className="card-stack">
            {(medications.length ? medications : fallbackMedications).map((med) => (
              <article className="appt-card med" key={med._id}>
                <div className={`appt-icon ${med.reminder ? "pink" : "teal"}`}>💊</div>
                <div className="appt-main">
                  <div className="appt-title-row">
                    <h3>{med.name}</h3>
                  </div>
                  <p>
                    <strong>Dosage:</strong> {med.dosage}
                  </p>
                  <p>
                    <strong>Schedule:</strong> {med.frequency}
                  </p>
                  <div className="med-reminder-controls">
                    <label className="switch-row">
                      <span>Reminder {med.reminder ? "ON" : "OFF"}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(med.reminder)}
                        onChange={() => toggleMedicationReminder(med._id)}
                      />
                    </label>
                    <label className="time-row">
                      Reminder Time
                      <input
                        type="time"
                        value={med.reminderTime || "08:00"}
                        onChange={(e) => updateMedicationReminderTime(med._id, e.target.value)}
                      />
                    </label>
                  </div>
                  <p className="reminder-row">
                    🔔 Reminder: {med.reminder ? "ON" : "OFF"}{" "}
                    {med.reminder ? <span className="active-pill">Active</span> : null}
                  </p>
                </div>
                <div className="appt-actions">
                  <button className="ghost-btn">Edit</button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}

      <div className="contact-emergency-row">
        <article className="calendar-strip">
          <div>
            <strong>🗓 Calendar Integration</strong>
            <p>Sync appointments with your calendar app</p>
          </div>
          <button className="gradient-btn">Connect Calendar</button>
        </article>
        <article className="emergency-card">
          <strong>Emergency Contact</strong>
          <div className="emergency-actions">
            <a href="tel:+911234567890" className="gradient-btn">
              Call Doctor
            </a>
            <a href="tel:+919876543210" className="ghost-btn">
              Call Hospital
            </a>
          </div>
        </article>
      </div>

      {rescheduleState.open ? (
        <div className="apm-modal-overlay">
          <div className="apm-modal">
            <h3>Reschedule Appointment</h3>
            <label>
              New Date
              <input
                type="date"
                value={rescheduleState.date}
                onChange={(e) => setRescheduleState((prev) => ({ ...prev, date: e.target.value }))}
              />
            </label>
            <label>
              New Time
              <input
                type="time"
                value={rescheduleState.time}
                onChange={(e) => setRescheduleState((prev) => ({ ...prev, time: e.target.value }))}
              />
            </label>
            <div className="apm-modal-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setRescheduleState({ open: false, appointmentId: "", date: "", time: "" })}
              >
                Cancel
              </button>
              <button type="button" className="gradient-btn" onClick={applyReschedule}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {createState.open ? (
        <div className="apm-modal-overlay">
          <div className="apm-modal">
            <h3>Create Appointment</h3>
            <label>
              Appointment Type
              <input
                type="text"
                value={createState.title}
                onChange={(e) => setCreateState((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Glucose Screening"
              />
            </label>
            <label>
              Appointment Category
              <input
                type="text"
                value={createState.type}
                onChange={(e) => setCreateState((prev) => ({ ...prev, type: e.target.value }))}
                placeholder="Routine / Diagnostic / Lab Test"
              />
            </label>
            <label>
              Doctor Name
              <input
                type="text"
                value={createState.doctor}
                onChange={(e) => setCreateState((prev) => ({ ...prev, doctor: e.target.value }))}
                placeholder="Dr. Name • Specialty"
              />
            </label>
            <label>
              Date
              <input
                type="date"
                value={createState.date}
                onChange={(e) => setCreateState((prev) => ({ ...prev, date: e.target.value }))}
              />
            </label>
            <label>
              Time
              <input
                type="time"
                value={createState.time}
                onChange={(e) => setCreateState((prev) => ({ ...prev, time: e.target.value }))}
              />
            </label>
            <label>
              Location
              <input
                type="text"
                value={createState.location}
                onChange={(e) => setCreateState((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Hospital / Clinic"
              />
            </label>
            <label>
              Notes
              <input
                type="text"
                value={createState.notes}
                onChange={(e) => setCreateState((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Add doctor instructions"
              />
            </label>
            <label>
              Optional Telehealth Link
              <input
                type="url"
                value={createState.telehealthLink}
                onChange={(e) => setCreateState((prev) => ({ ...prev, telehealthLink: e.target.value }))}
                placeholder="https://..."
              />
            </label>

            <div className="apm-modal-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() =>
                  setCreateState({
                    open: false,
                    title: "",
                    type: "Routine",
                    doctor: "",
                    date: "",
                    time: "",
                    location: "",
                    notes: "",
                    telehealthLink: "",
                  })
                }
              >
                Cancel
              </button>
              <button type="button" className="gradient-btn" onClick={saveCreatedAppointment}>
                Save Appointment
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {detailsState.open && detailsState.appointment ? (
        <div className="apm-modal-overlay">
          <div className="apm-modal">
            <h3>Appointment Details</h3>
            <div className="appt-detail-list">
              <p>
                <strong>Type:</strong> {detailsState.appointment.title}
              </p>
              <p>
                <strong>Doctor:</strong> {detailsState.appointment.doctor}
              </p>
              <p>
                <strong>Date & Time:</strong>{" "}
                {formatDateTime(
                  detailsState.appointment.time || detailsState.appointment.date
                ).date}{" "}
                at{" "}
                {formatDateTime(
                  detailsState.appointment.time || detailsState.appointment.date
                ).time}
              </p>
              <p>
                <strong>Location:</strong> {detailsState.appointment.location || "--"}
              </p>
              <p>
                <strong>Notes:</strong> {detailsState.appointment.notes || "--"}
              </p>
            </div>
            {renderReportSection(detailsState.appointment)}

            <div className="apm-modal-actions">
              {detailsState.appointment.telehealthLink ? (
                <button
                  type="button"
                  className="gradient-btn"
                  onClick={() => handleJoinTelehealth(detailsState.appointment.telehealthLink)}
                >
                  Join Video Consultation
                </button>
              ) : null}
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setDetailsState({ open: false, appointment: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="apm-loading-overlay">
          <div className="loader" />
          <span>Loading appointments...</span>
        </div>
      ) : null}
    </section>
  );
}
