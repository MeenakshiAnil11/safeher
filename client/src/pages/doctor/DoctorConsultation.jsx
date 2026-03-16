import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaCalendar,
  FaCheckCircle,
  FaComment,
  FaFile,
  FaHeartbeat,
  FaImage,
  FaPaperclip,
  FaPlus,
  FaPrescriptionBottle,
  FaSave,
  FaTrash,
  FaTint,
  FaUser,
} from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../services/api";
import { getImageUrl } from "../../utils/imageUtils";
import DoctorProfileGate from "../../components/doctor/DoctorProfileGate";
import useDoctorProfileStatus from "../../hooks/useDoctorProfileStatus";
import { endSession, getSessionStatus, joinSession, startSession } from "../../services/sessionService";
import {
  connectSocket,
  getSocket,
  joinConsultation,
  leaveConsultation,
  sendChatMessage,
} from "../../services/socket";
import "./DoctorConsultation.css";

export default function DoctorConsultation() {
  const emptyMedication = {
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  };

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get("appointment");
  const [appointment, setAppointment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sessionStatus, setSessionStatus] = useState("scheduled");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [hasConsent, setHasConsent] = useState(true);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [sessionTime, setSessionTime] = useState(0);
  const [loadingSessionAction, setLoadingSessionAction] = useState(false);
  const [intake, setIntake] = useState(null);
  const [loadingIntake, setLoadingIntake] = useState(false);
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: "",
    instructions: "",
    followUpDate: "",
    notes: "",
    medications: [{ ...emptyMedication }],
  });
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const { profileLoading, profileCompleted, doctorName } = useDoctorProfileStatus();

  useEffect(() => {
    if (!profileLoading && !profileCompleted) return;
    if (appointmentId) {
      fetchAppointment();
    } else {
      fetchActiveAppointment();
    }
    if (appointmentId) {
      fetchSessionState();
    }
  }, [appointmentId, profileLoading, profileCompleted]);

  useEffect(() => {
    if (appointment) {
      fetchMessages();
      fetchPatientData();
      fetchIntake();
    }
  }, [appointment]);

  useEffect(() => {
    if (!appointment?.prescription) return;
    const meds = Array.isArray(appointment.prescription.medications) && appointment.prescription.medications.length > 0
      ? appointment.prescription.medications.map((med) => ({
          name: med.name || "",
          dosage: med.dosage || "",
          frequency: med.frequency || "",
          duration: med.duration || "",
          instructions: med.instructions || "",
        }))
      : [{ ...emptyMedication }];

    setPrescriptionForm({
      diagnosis: appointment.prescription.diagnosis || "",
      instructions: appointment.prescription.instructions || "",
      followUpDate: appointment.prescription.followUpDate
        ? new Date(appointment.prescription.followUpDate).toISOString().slice(0, 10)
        : "",
      notes: appointment.prescription.notes || "",
      medications: meds,
    });
  }, [appointment?.prescription?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!appointment?._id) return;
    const socket = connectSocket();
    if (!socket) return;
    joinConsultation(appointment._id);
    const onIncomingMessage = (msg) => {
      if (String(msg?.appointment) !== String(appointment._id)) return;
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });
    };
    const onPeerJoined = (peer) => {
      const patientId = appointment?.user?._id?.toString();
      if (!patientId) return;
      if (String(peer?.userId) === String(patientId)) {
        toast.success("Patient joined the consultation.");
      }
    };
    socket.on("new_message", onIncomingMessage);
    socket.on("peer_joined", onPeerJoined);
    return () => {
      socket.off("new_message", onIncomingMessage);
      socket.off("peer_joined", onPeerJoined);
      leaveConsultation(appointment._id);
    };
  }, [appointment?._id]);

  useEffect(() => {
    if (!appointment?._id) return undefined;
    const t = setInterval(() => {
      fetchSessionState();
    }, 4000);
    return () => clearInterval(t);
  }, [appointment?._id]);

  useEffect(() => {
    if (isSessionActive) {
      intervalRef.current = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSessionActive]);

  const fetchActiveAppointment = async () => {
    try {
      const response = await api.get("/telehealth/appointments?status=confirmed&limit=1&view=doctor").catch(() => ({
        data: { appointments: [] },
      }));
      if (response.data.appointments && response.data.appointments.length > 0) {
        const activeAppointment = response.data.appointments[0];
        setAppointment(activeAppointment);
        fetchSessionState(activeAppointment._id);
      } else {
        setAppointment(null);
        setHasConsent(false);
        setIsSessionActive(false);
        setSessionStatus("scheduled");
      }
    } catch (error) {
      console.error("Error fetching active appointment:", error);
    }
  };

  const fetchAppointment = async () => {
    try {
      const response = await api.get(`/telehealth/appointments/${appointmentId}?view=doctor`).catch(() => ({
        data: { appointment: null },
      }));
      const apt = response.data.appointment;
      if (!apt) {
        setAppointment(null);
        setHasConsent(false);
        setIsSessionActive(false);
        return;
      }
      setAppointment(apt);
      setHasConsent(apt.shareHealthData || false);
      fetchSessionState(apt._id);
    } catch (error) {
      console.error("Error fetching appointment:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const id = appointment?._id || appointmentId;
      if (!id) {
        setMessages([]);
        return;
      }

      const response = await api.get(`/telehealth/appointments/${id}/messages`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  const fetchPatientData = async () => {
    try {
      const patientId = appointment?.user?._id || appointment?.patient?._id;
      if (!patientId) {
        setPatientData(null);
        return;
      }

      const response = await api.get(`/telehealth/health-data/${patientId}`);
      setPatientData(response.data || null);
    } catch (error) {
      console.error("Error fetching patient data:", error);
      setPatientData(null);
    }
  };

  const fetchSessionState = async (idOverride) => {
    try {
      const id = idOverride || appointment?._id || appointmentId;
      if (!id) return;
      const data = await getSessionStatus(id);
      const status = data?.session?.status || "scheduled";
      setSessionStatus(status);
      setIsSessionActive(["active", "ongoing"].includes(status));
      if (["active", "ongoing"].includes(status) && data?.session?.startTime) {
        const start = new Date(data.session.startTime).getTime();
        const now = Date.now();
        setSessionTime(Math.max(0, Math.floor((now - start) / 1000)));
      }
      if (["ended", "completed"].includes(status)) setIsJoined(false);
    } catch (_error) {
      setSessionStatus("scheduled");
      setIsSessionActive(false);
    }
  };

  const fetchIntake = async () => {
    try {
      const id = appointment?._id || appointmentId;
      if (!id) {
        setIntake(null);
        return;
      }
      setLoadingIntake(true);
      const response = await api.get(`/telehealth/appointments/${id}/intake`);
      setIntake(response.data?.intake || null);
    } catch (error) {
      console.error("Error fetching intake:", error);
      setIntake(null);
    } finally {
      setLoadingIntake(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !appointment || !isSessionActive || !isJoined) return;
    const content = newMessage.trim();
    setNewMessage("");

    try {
      const id = appointment._id || appointmentId;
      const socket = getSocket();
      if (socket?.connected) {
        sendChatMessage(id, content, "text");
      } else if (id && !id.startsWith("mock-")) {
        await api.post(`/telehealth/appointments/${id}/messages`, { content, type: "text" });
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setNewMessage(content);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !appointment || !isSessionActive || !isJoined) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", file.type.startsWith("image/") ? "image" : "file");

    try {
      const id = appointment._id || appointmentId;
      if (!id || id.startsWith("mock-")) {
        alert("File upload is unavailable for this consultation.");
        return;
      }

      await api.post(`/telehealth/appointments/${id}/messages`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchMessages();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    }
  };

  const handleStartSession = async () => {
    try {
      const id = appointment?._id || appointmentId;
      if (!id) return;
      setLoadingSessionAction(true);
      await startSession(id);
      await joinSession(id);
      setIsJoined(true);
      await fetchSessionState(id);
      toast.success("Session started. Patient can join now.");
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error(error?.message || "Failed to start session");
    } finally {
      setLoadingSessionAction(false);
    }
  };

  const handleJoinSession = async () => {
    try {
      const id = appointment?._id || appointmentId;
      if (!id) {
        return;
      }
      await joinSession(id);
      setIsJoined(true);
      toast.success("Joined active session");
    } catch (error) {
      toast.error(error?.message || "Failed to join session");
    }
  };

  const handleEndSession = async () => {
    try {
      const id = appointment._id || appointmentId;
      if (id) {
        await endSession(id);
        await fetchSessionState(id);
      }
      toast.success("Consultation ended");
      navigate("/doctor/appointments");
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error(error?.message || "Failed to end session");
    }
  };

  const handleSaveNotes = async () => {
    try {
      const id = appointment._id || appointmentId;
      if (id && !id.startsWith("mock-")) {
        await api.put(`/telehealth/appointments/${id}/notes`, { notes: doctorNotes });
        alert("Notes saved successfully!");
      } else {
        alert("Notes saved (mock)");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Failed to save notes");
    }
  };

  const updatePrescriptionField = (key, value) => {
    setPrescriptionForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateMedicationField = (index, key, value) => {
    setPrescriptionForm((prev) => {
      const nextMeds = [...prev.medications];
      nextMeds[index] = { ...nextMeds[index], [key]: value };
      return { ...prev, medications: nextMeds };
    });
  };

  const addMedication = () => {
    setPrescriptionForm((prev) => ({
      ...prev,
      medications: [...prev.medications, { ...emptyMedication }],
    }));
  };

  const removeMedication = (index) => {
    setPrescriptionForm((prev) => {
      if (prev.medications.length <= 1) return prev;
      const nextMeds = prev.medications.filter((_, medIndex) => medIndex !== index);
      return { ...prev, medications: nextMeds };
    });
  };

  const handleCreatePrescription = async () => {
    try {
      const patientId = appointment?.user?._id || appointment?.patient?._id;
      const id = appointment?._id || appointmentId;
      const medications = (prescriptionForm.medications || []).filter(
        (med) => med.name && med.dosage && med.frequency && med.duration
      );

      if (!patientId || !id) {
        toast.error("Patient or appointment details are missing.");
        return;
      }
      if (!prescriptionForm.diagnosis.trim()) {
        toast.error("Diagnosis is required.");
        return;
      }
      if (medications.length === 0) {
        toast.error("Add at least one complete medication.");
        return;
      }

      setSavingPrescription(true);
      await api.post("/telehealth/prescriptions", {
        patient: patientId,
        appointment: id,
        diagnosis: prescriptionForm.diagnosis.trim(),
        medications,
        instructions: prescriptionForm.instructions.trim(),
        followUpDate: prescriptionForm.followUpDate || undefined,
        notes: prescriptionForm.notes.trim(),
      });

      toast.success("Prescription issued successfully.");
      if (appointmentId) {
        await fetchAppointment();
      } else {
        await fetchActiveAppointment();
      }
    } catch (error) {
      console.error("Error creating prescription:", error);
      toast.error(error?.response?.data?.message || "Failed to create prescription.");
    } finally {
      setSavingPrescription(false);
    }
  };

  const handleDownloadPrescription = async () => {
    try {
      const prescriptionId = appointment?.prescription?._id;
      if (!prescriptionId) return;
      const response = await api.get(`/telehealth/prescriptions/${prescriptionId}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prescription-${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading prescription:", error);
      toast.error("Failed to download prescription.");
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Mild: "#10b981",
      Moderate: "#eab308",
      Severe: "#ef4444",
    };
    return colors[severity] || "#64748b";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!appointment) {
    if (profileLoading) {
      return <div className="consultation-empty">Loading consultation...</div>;
    }
    if (!profileCompleted) {
      return (
        <DoctorProfileGate
          doctorName={doctorName}
          sectionTitle="consultations"
          description="Complete your profile to unlock Consultations."
        />
      );
    }
    return (
      <div className="consultation-empty">
        <FaComment className="empty-icon" />
        <h2>No Active Consultation</h2>
        <p>Select an appointment to start a consultation</p>
        <button className="btn-primary" onClick={() => navigate("/doctor/appointments")}>
          View Appointments
        </button>
      </div>
    );
  }

  const patientName =
    appointment.user?.name ||
    appointment.patient?.user?.name ||
    "Patient";
  const appointmentDateTime = appointment?.scheduledAt
    ? new Date(appointment.scheduledAt).toLocaleString()
    : "N/A";
  const specialization = appointment?.doctor?.specialization || "General";
  const canStartSessionNow =
    !appointment?.scheduledAt || new Date() >= new Date(appointment.scheduledAt);

  return (
    <div className="doctor-consultation">
      {/* Header Section */}
      <div className="consultation-header">
        <div className="header-left">
          <h1>Active Consultation</h1>
          <p className="consultation-subtitle">Chat consultation with {patientName}.</p>
          <p className="consultation-subtitle">
            {appointmentDateTime} • {specialization}
          </p>
        </div>
        <div className="header-right">
          {!isSessionActive ? (
            <button
              className="btn-end-session-header"
              onClick={handleStartSession}
              disabled={loadingSessionAction || !canStartSessionNow}
              title={!canStartSessionNow ? "Session can be started at scheduled appointment time" : "Start Session"}
            >
              {loadingSessionAction ? "Starting..." : "Start Session"}
            </button>
          ) : (
            <>
              {!isJoined && (
                <button className="btn-accept-small" onClick={handleJoinSession} title="Join Session">
                  Join
                </button>
              )}
              <button className="btn-end-session-header" onClick={handleEndSession}>
                End Session
              </button>
            </>
          )}
        </div>
      </div>

      <div className="consultation-main">
        <div className="consultation-center">
          <div className="chat-section">
            <div className="chat-header">
              <h3>Chat</h3>
            </div>
            {!isSessionActive && (
              <div className="empty-chat">
                <p>Waiting to start consultation session.</p>
              </div>
            )}
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="empty-chat">
                  <FaComment className="empty-icon" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`message ${msg.senderRole === "doctor" ? "sent" : "received"}`}
                  >
                    <div className="message-content">
                      {msg.type === "text" && <p>{msg.content}</p>}
                      {msg.type === "image" && (
                        <div className="message-image-container">
                          <img
                            src={typeof msg.content === "string" && msg.content.startsWith("http") ? msg.content : getImageUrl(msg.content)}
                            alt="Shared"
                            className="message-image"
                          />
                        </div>
                      )}
                      {msg.type === "file" && (
                        <div className="message-file">
                          <FaFile className="file-icon" />
                          <span>{msg.fileName || "File"}</span>
                        </div>
                      )}
                      <span className="message-time">{formatMessageTime(msg.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isSessionActive && isJoined ? "Type your message..." : "Start and join session to enable chat"}
                className="chat-input"
                disabled={!isSessionActive || !isJoined}
              />
              <button
                type="button"
                className="btn-attach"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
              >
                <FaPaperclip />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx"
                style={{ display: "none" }}
              />
              <button
                type="button"
                className="btn-attach"
                onClick={() => fileInputRef.current?.click()}
                title="Attach image"
              >
                <FaImage />
              </button>
              <button type="submit" className="btn-send">
                <FaComment />
              </button>
            </form>
          </div>

          <div className="session-notes-section">
            <div className="notes-header">
              <h3>Session Notes</h3>
            </div>
            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Add notes about this consultation..."
              className="notes-textarea"
              rows="4"
            />
            <button className="btn-save-notes" onClick={handleSaveNotes}>
              <FaSave /> Save Notes
            </button>
          </div>

          <div className="session-notes-section">
            <div className="notes-header prescription-header">
              <h3>Prescription Composer</h3>
              {appointment?.prescription?._id && (
                <button className="btn-download-prescription" onClick={handleDownloadPrescription}>
                  <FaPrescriptionBottle /> Download Latest PDF
                </button>
              )}
            </div>

            <div className="prescription-grid">
              <input
                type="text"
                className="notes-textarea prescription-input"
                placeholder="Diagnosis"
                value={prescriptionForm.diagnosis}
                onChange={(e) => updatePrescriptionField("diagnosis", e.target.value)}
              />
              <input
                type="date"
                className="notes-textarea prescription-input"
                value={prescriptionForm.followUpDate}
                onChange={(e) => updatePrescriptionField("followUpDate", e.target.value)}
              />
            </div>

            <textarea
              value={prescriptionForm.instructions}
              onChange={(e) => updatePrescriptionField("instructions", e.target.value)}
              placeholder="General Instructions"
              className="notes-textarea"
              rows="3"
            />

            <div className="medications-header">
              <h4>Medications</h4>
              <button type="button" className="btn-add-medication" onClick={addMedication}>
                <FaPlus /> Add
              </button>
            </div>
            <div className="medications-list">
              {prescriptionForm.medications.map((medication, index) => (
                <div key={`med-${index}`} className="medication-row">
                  <input
                    type="text"
                    placeholder="Medicine"
                    value={medication.name}
                    onChange={(e) => updateMedicationField(index, "name", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Dosage"
                    value={medication.dosage}
                    onChange={(e) => updateMedicationField(index, "dosage", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Frequency"
                    value={medication.frequency}
                    onChange={(e) => updateMedicationField(index, "frequency", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={medication.duration}
                    onChange={(e) => updateMedicationField(index, "duration", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Instructions"
                    value={medication.instructions}
                    onChange={(e) => updateMedicationField(index, "instructions", e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-remove-medication"
                    onClick={() => removeMedication(index)}
                    title="Remove medication"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            <textarea
              value={prescriptionForm.notes}
              onChange={(e) => updatePrescriptionField("notes", e.target.value)}
              placeholder="Additional prescription notes"
              className="notes-textarea"
              rows="2"
            />
            <button className="btn-save-notes" onClick={handleCreatePrescription} disabled={savingPrescription}>
              {savingPrescription ? "Issuing..." : "Issue Prescription"}
            </button>
          </div>
        </div>

        <div className="patient-info-sidebar">
          <div className="patient-info-card">
            <div className="patient-avatar-large">
              <FaUser className="patient-avatar-icon" />
            </div>
            <h3 className="patient-name">{patientData?.patientInfo?.name || patientName}</h3>
            <p className="patient-details">
              {patientData?.patientInfo?.age || 32} years • {patientData?.patientInfo?.gender || "Female"}
            </p>
          </div>

          <div className="vitals-section">
            <h4>Consultation Intake</h4>
            {loadingIntake ? (
              <p className="patient-details">Loading intake...</p>
            ) : !intake ? (
              <p className="patient-details">Patient has not submitted intake yet.</p>
            ) : (
              <div className="intake-list">
                <div className="intake-item">
                  <strong>Symptoms</strong>
                  <p>{intake.symptoms || "-"}</p>
                </div>
                <div className="intake-item">
                  <strong>Duration</strong>
                  <p>{intake.duration || "-"}</p>
                </div>
                <div className="intake-item">
                  <strong>Current Medications</strong>
                  <p>{intake.currentMedications || "-"}</p>
                </div>
                <div className="intake-item">
                  <strong>Patient Notes</strong>
                  <p>{intake.notes || "-"}</p>
                </div>
                <div className="intake-consent">
                  <FaCheckCircle />
                  <span>
                    {intake.consentToShareHealthData
                      ? "Consent to share health data: Yes"
                      : "Consent to share health data: No"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {hasConsent && patientData?.vitals && patientData.vitals.length > 0 && (
            <div className="vitals-section">
              <h4>Current Vitals</h4>
              <div className="vitals-list">
                {patientData.vitals[0].systolic && patientData.vitals[0].diastolic && (
                  <div className="vital-item">
                    <FaHeartbeat className="vital-icon" />
                    <div className="vital-info">
                      <span className="vital-label">Blood Pressure</span>
                      <span className="vital-value">
                        {patientData.vitals[0].systolic}/{patientData.vitals[0].diastolic} mmHg
                      </span>
                    </div>
                  </div>
                )}
                {patientData.vitals[0].heartRateBpm && (
                  <div className="vital-item">
                    <FaHeartbeat className="vital-icon" />
                    <div className="vital-info">
                      <span className="vital-label">Heart Rate</span>
                      <span className="vital-value">{patientData.vitals[0].heartRateBpm} bpm</span>
                    </div>
                  </div>
                )}
                {patientData.vitals[0].glucose && (
                  <div className="vital-item">
                    <FaTint className="vital-icon" />
                    <div className="vital-info">
                      <span className="vital-label">Glucose</span>
                      <span className="vital-value">{patientData.vitals[0].glucose} mg/dL</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {hasConsent && patientData?.symptoms && patientData.symptoms.length > 0 && (
            <div className="symptom-journal-section">
              <h4>Symptom Journal</h4>
              <div className="symptom-list">
                {patientData.symptoms.map((symptom, idx) => (
                  <div key={idx} className="symptom-item">
                    <div className="symptom-date">
                      <FaCalendar className="symptom-date-icon" />
                      <span>{symptom.date}</span>
                    </div>
                    <div className="symptom-details">
                      <span className="symptom-name">{symptom.name}</span>
                      <span
                        className="symptom-severity"
                        style={{ backgroundColor: getSeverityColor(symptom.intensity) }}
                      >
                        {symptom.intensity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
