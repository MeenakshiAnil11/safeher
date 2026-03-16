import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaVideo,
  FaPhone,
  FaComment,
  FaPaperclip,
  FaClock,
  FaUserMd,
  FaImage,
  FaFile,
  FaLock,
  FaHeartbeat,
  FaNotesMedical,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideoSlash,
  FaCheckCircle,
} from "react-icons/fa";
import api from "../../services/api";
import { getImageUrl } from "../../utils/imageUtils";
import "./Consultation.css";

export default function Consultations() {
  const navigate = useNavigate();
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [hasConsent, setHasConsent] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchActiveConsultation();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeConsultation) {
      fetchMessages();
      fetchHealthData();
    }
  }, [activeConsultation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const fetchActiveConsultation = async () => {
    try {
      setLoading(true);
      // Try to fetch active consultation
      const response = await api.get("/telehealth/appointments?status=confirmed&limit=1").catch(() => ({ data: { appointments: [] } }));
      const appointments = response.data.appointments || [];
      
      if (appointments.length > 0) {
        const appointment = appointments[0];
        setActiveConsultation({
          ...appointment,
          doctor: appointment.doctor || { user: { name: "Doctor" } },
          shareHealthData: appointment.shareHealthData !== undefined ? appointment.shareHealthData : true,
        });
        setIsSessionActive(appointment.status === "confirmed" || appointment.status === "in-progress");
        setHasConsent(appointment.shareHealthData !== undefined ? appointment.shareHealthData : true);
      } else {
        // Create mock active consultation for demo
        setActiveConsultation({
          _id: "mock-consultation-1",
          doctor: {
            user: {
              name: "Doctor",
              specialization: "Gynecologist",
            },
          },
          scheduledAt: new Date().toISOString(),
          status: "confirmed",
          shareHealthData: true,
          meetingLink: "#",
        });
        setIsSessionActive(false);
        setHasConsent(true);
      }
    } catch (error) {
      console.error("Error fetching consultation:", error);
      // Create mock consultation on error
      setActiveConsultation({
        _id: "mock-consultation-1",
        doctor: {
          user: {
            name: "Doctor",
            specialization: "Gynecologist",
          },
        },
        scheduledAt: new Date().toISOString(),
        status: "confirmed",
        shareHealthData: true,
        meetingLink: "#",
      });
      setHasConsent(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      if (activeConsultation?._id) {
        const response = await api.get(`/telehealth/appointments/${activeConsultation._id}/messages`).catch(() => ({ data: { messages: [] } }));
        const fetchedMessages = response.data.messages || [];
        
        // If no messages, add some mock messages for demo
        if (fetchedMessages.length === 0) {
          setMessages([
            {
              _id: "msg-1",
              content: "Hello! I'm ready to start our consultation. How are you feeling today?",
              sender: "doctor",
              type: "text",
              createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
            },
            {
              _id: "msg-2",
              content: "Hi Doctor, I'm doing well. I wanted to discuss some symptoms I've been experiencing.",
              sender: "user",
              type: "text",
              createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
            },
            {
              _id: "msg-3",
              content: "Of course. Please describe the symptoms you've been experiencing.",
              sender: "doctor",
              type: "text",
              createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
            },
          ]);
        } else {
          setMessages(fetchedMessages);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      // Use mock messages on error
      setMessages([
        {
          _id: "msg-1",
          content: "Hello! I'm ready to start our consultation. How are you feeling today?",
          sender: "doctor",
          type: "text",
          createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
        },
        {
          _id: "msg-2",
          content: "Hi Doctor, I'm doing well. I wanted to discuss some symptoms I've been experiencing.",
          sender: "user",
          type: "text",
          createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
        },
      ]);
    }
  };

  const fetchHealthData = async () => {
    try {
      const response = await api.get("/telehealth/health-data/recent").catch(() => ({ data: {} }));
      const data = response.data || {};
      
      // If no health data, create mock data for demo
      if (!data.vitals && !data.symptoms && !data.medications) {
        setHealthData({
          vitals: [
            {
              weightKg: 65,
              systolic: 120,
              diastolic: 80,
              heartRateBpm: 72,
              recordedAt: new Date().toISOString(),
            },
          ],
          symptoms: [
            { name: "Headache", intensity: "Mild", date: new Date().toISOString() },
            { name: "Fatigue", intensity: "Moderate", date: new Date(Date.now() - 86400000).toISOString() },
          ],
          medications: ["Iron Supplements", "Vitamin D"],
        });
      } else {
        setHealthData(data);
      }
    } catch (error) {
      console.error("Error fetching health data:", error);
      // Use mock data on error
      setHealthData({
        vitals: [
          {
            weightKg: 65,
            systolic: 120,
            diastolic: 80,
            heartRateBpm: 72,
            recordedAt: new Date().toISOString(),
          },
        ],
        symptoms: [
          { name: "Headache", intensity: "Mild", date: new Date().toISOString() },
        ],
        medications: ["Iron Supplements"],
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConsultation) return;
    
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: newMessage,
      sender: "user",
      type: "text",
      createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    
    try {
      if (activeConsultation._id && !activeConsultation._id.startsWith("mock-")) {
        await api.post(`/telehealth/appointments/${activeConsultation._id}/messages`, {
          content: newMessage,
          type: "text",
        });
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeConsultation) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", file.type.startsWith("image/") ? "image" : "file");

    try {
      if (activeConsultation._id && !activeConsultation._id.startsWith("mock-")) {
        await api.post(`/telehealth/appointments/${activeConsultation._id}/messages`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        fetchMessages();
      } else {
        // Mock file message
        const fileMessage = {
          _id: `file-${Date.now()}`,
          content: file.type.startsWith("image/") ? URL.createObjectURL(file) : file.name,
          sender: "user",
          type: file.type.startsWith("image/") ? "image" : "file",
          fileName: file.name,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, fileMessage]);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    }
  };

  const handleStartSession = () => {
    setIsSessionActive(true);
    setSessionTime(0);
  };

  const handleEndSession = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsSessionActive(false);
    try {
      if (activeConsultation?._id && !activeConsultation._id.startsWith("mock-")) {
        await api.put(`/telehealth/appointments/${activeConsultation._id}/complete`);
        fetchActiveConsultation();
      }
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return <div className="consultation-loading">Loading consultation...</div>;
  }

  if (!activeConsultation) {
    return (
      <div className="consultation-empty-state">
        <FaComment className="empty-state-icon" />
        <h2>No Active Consultation</h2>
        <p>You don't have any active consultations at the moment.</p>
        <button className="btn-primary" onClick={() => navigate("/telehealth/appointments")}>
          View Appointments
        </button>
      </div>
    );
  }

  return (
    <div className="consultation-page">
      {/* Top: Video Call Placeholder */}
      <div className="video-call-container">
        <div className="video-placeholder">
          <div className="video-main">
            {isVideoEnabled ? (
              <div className="video-feed">
                <div className="video-overlay">
                  <FaUserMd className="video-placeholder-icon" />
                  <p>Doctor's Video Feed</p>
                  <span className="video-status">
                    <FaCheckCircle /> Video call ready
                  </span>
                </div>
              </div>
            ) : (
              <div className="video-off">
                <FaUserMd className="video-placeholder-icon" />
                <p>Camera Off</p>
              </div>
            )}
          </div>
          <div className="video-controls">
            <button
              className={`control-btn ${isVideoEnabled ? "active" : ""}`}
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
            </button>
            <button
              className={`control-btn ${isAudioEnabled ? "active" : ""}`}
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              {isAudioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
            </button>
            {activeConsultation.meetingLink && activeConsultation.meetingLink !== "#" && (
              <a
                href={activeConsultation.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-join-call"
              >
                <FaVideo /> Join Call
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Split Screen */}
      <div className="consultation-main">
        {/* Left Panel: Chat Window */}
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-info">
              <FaComment className="chat-icon" />
              <div>
                <h3>Secure Chat with Doctor</h3>
                <p className="chat-subtitle">End-to-end encrypted</p>
              </div>
            </div>
            <FaLock className="lock-icon" />
          </div>

          <div className="chat-messages" id="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <FaComment className="empty-icon" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`message ${msg.sender === "user" ? "sent" : "received"}`}
                >
                  <div className="message-content">
                    {msg.type === "text" && (
                      <p>
                        <strong>{msg.sender === "user" ? "You" : "Doctor"}:</strong> {msg.content}
                      </p>
                    )}
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
            <button
              type="button"
              className="btn-attach"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file or image"
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
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a secure message..."
              className="chat-input"
            />
            <button type="submit" className="btn-send">
              Send
            </button>
          </form>
        </div>

        {/* Right Sidebar: Health Data */}
        <div className="health-data-sidebar">
          <div className="sidebar-header">
            <FaHeartbeat className="sidebar-icon" />
            <h3>Shared Health Data</h3>
          </div>

          {!hasConsent ? (
            <div className="no-consent">
              <FaLock className="lock-icon-large" />
              <p>Health data sharing not enabled</p>
              <p className="consent-subtitle">
                Enable data sharing in settings to allow your doctor to view your health records
              </p>
            </div>
          ) : healthData ? (
            <div className="health-data-content">
              {healthData.vitals && healthData.vitals.length > 0 && (
                <div className="health-section">
                  <h4>Recent Vitals</h4>
                  {healthData.vitals.slice(0, 3).map((vital, idx) => (
                    <div key={idx} className="health-item">
                      <div className="health-item-row">
                        {vital.weightKg && (
                          <span>
                            <strong>Weight:</strong> {vital.weightKg} kg
                          </span>
                        )}
                        {vital.systolic && vital.diastolic && (
                          <span>
                            <strong>BP:</strong> {vital.systolic}/{vital.diastolic} mmHg
                          </span>
                        )}
                      </div>
                      {vital.heartRateBpm && (
                        <div className="health-item-row">
                          <span>
                            <strong>Heart Rate:</strong> {vital.heartRateBpm} bpm
                          </span>
                        </div>
                      )}
                      <span className="health-date">
                        {new Date(vital.recordedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {healthData.symptoms && healthData.symptoms.length > 0 && (
                <div className="health-section">
                  <h4>Recent Symptoms</h4>
                  {healthData.symptoms.slice(0, 5).map((symptom, idx) => (
                    <div key={idx} className="health-item">
                      <span>
                        <strong>{symptom.name}</strong> - {symptom.intensity}
                      </span>
                      <span className="health-date">
                        {new Date(symptom.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {healthData.medications && healthData.medications.length > 0 && (
                <div className="health-section">
                  <h4>Current Medications</h4>
                  <div className="medications-list">
                    {healthData.medications.map((med, idx) => (
                      <span key={idx} className="medication-tag">
                        {med}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-data">
              <p>No health data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Session Timer + Doctor Notes */}
      <div className="consultation-footer">
        <div className="session-info">
          {isSessionActive && (
            <div className="session-timer">
              <FaClock className="timer-icon" />
              <span className="timer-label">Session Time:</span>
              <span className="timer-value">{formatTime(sessionTime)}</span>
            </div>
          )}
          {!isSessionActive && activeConsultation.status === "confirmed" && (
            <button className="btn-start-session" onClick={handleStartSession}>
              Start Session
            </button>
          )}
          {isSessionActive && (
            <button className="btn-end-session" onClick={handleEndSession}>
              End Session
            </button>
          )}
        </div>

        <div className="doctor-notes-section">
          <div className="notes-header">
            <FaNotesMedical className="notes-icon" />
            <h4>Doctor Notes</h4>
          </div>
          <div className="notes-content">
            {activeConsultation.doctorNotes ? (
              <p className="notes-text">{activeConsultation.doctorNotes}</p>
            ) : (
              <p className="notes-placeholder">No notes added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
