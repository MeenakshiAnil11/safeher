import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaComment,
  FaFile,
  FaHeartbeat,
  FaLock,
  FaMicrophone,
  FaMicrophoneSlash,
  FaNotesMedical,
  FaPaperclip,
  FaPhoneSlash,
  FaUserMd,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Peer from "simple-peer";
import AgoraRTC from "agora-rtc-sdk-ng";
import api from "../../services/api";
import { getImageUrl } from "../../utils/imageUtils";
import { getSessionStatus, joinSession, endSession as endConsultationSession } from "../../services/sessionService";
import {
  connectSocket,
  getSocket,
  joinConsultation,
  leaveConsultation,
  sendChatMessage,
  emitTyping,
  emitStopTyping,
  sendWebRTCOffer,
  sendWebRTCAnswer,
  sendICECandidate,
  endCall,
} from "../../services/socket";
import "./Consultation.css";

export default function Consultation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sessionStatus, setSessionStatus] = useState("scheduled");
  const [isJoined, setIsJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [hasConsent, setHasConsent] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState(false);
  const [intake, setIntake] = useState({
    symptoms: "",
    duration: "",
    currentMedications: "",
    notes: "",
  });
  const [intakeSaved, setIntakeSaved] = useState(false);
  const [savingIntake, setSavingIntake] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [doctorConnected, setDoctorConnected] = useState(false);
  const [patientConnected, setPatientConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const messagesEndRef = useRef(null);
  const statusPollRef = useRef(null);
  const fileInputRef = useRef(null);
  const previousSessionStatusRef = useRef("scheduled");
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const agoraClientRef = useRef(null);
  const timerRef = useRef(null);
  const currentUserId = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user?._id || user?.id || "";
    } catch (error) {
      return "";
    }
  }, []);

  useEffect(() => {
    fetchAppointment();
    if (appointmentId) {
      fetchMessages();
      fetchHealthData();
      fetchIntake();
      fetchSessionStatus();
    }
    return () => {
      if (statusPollRef.current) clearInterval(statusPollRef.current);
    };
  }, [appointmentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!appointmentId) return;
    if (statusPollRef.current) clearInterval(statusPollRef.current);
    statusPollRef.current = setInterval(() => {
      fetchSessionStatus();
    }, 4000);
    return () => {
      if (statusPollRef.current) clearInterval(statusPollRef.current);
    };
  }, [appointmentId]);

  useEffect(() => {
    if (!isJoined || !["active", "ongoing"].includes(sessionStatus)) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isJoined, sessionStatus]);

  useEffect(() => {
    if (!appointmentId) return;
    const socket = connectSocket();
    if (!socket) return;
    joinConsultation(appointmentId);
    const onIncomingMessage = (msg) => {
      if (String(msg?.appointment) !== String(appointmentId)) return;
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });
    };
    socket.on("new_message", onIncomingMessage);
    const onTyping = () => setRemoteTyping(true);
    const onStopTyping = () => setRemoteTyping(false);
    const onPeerJoined = ({ role }) => {
      if (role === "doctor") setDoctorConnected(true);
      if (role === "patient") setPatientConnected(true);
    };
    const onPeerLeft = () => {
      setDoctorConnected(false);
      setPatientConnected(false);
    };
    const onOffer = ({ offer }) => {
      if (peerRef.current) {
        peerRef.current.signal(offer);
      }
    };
    const onAnswer = ({ answer }) => {
      if (peerRef.current) {
        peerRef.current.signal(answer);
      }
    };
    const onIce = ({ candidate }) => {
      if (peerRef.current && candidate) {
        peerRef.current.signal(candidate);
      }
    };
    const onCallEnd = () => {
      cleanupCall();
      toast("Call ended by participant.");
    };
    socket.on("user_typing", onTyping);
    socket.on("user_stop_typing", onStopTyping);
    socket.on("peer_joined", onPeerJoined);
    socket.on("peer_left", onPeerLeft);
    socket.on("webrtc_offer", onOffer);
    socket.on("webrtc_answer", onAnswer);
    socket.on("webrtc_ice_candidate", onIce);
    socket.on("webrtc_end_call", onCallEnd);
    return () => {
      socket.off("new_message", onIncomingMessage);
      socket.off("user_typing", onTyping);
      socket.off("user_stop_typing", onStopTyping);
      socket.off("peer_joined", onPeerJoined);
      socket.off("peer_left", onPeerLeft);
      socket.off("webrtc_offer", onOffer);
      socket.off("webrtc_answer", onAnswer);
      socket.off("webrtc_ice_candidate", onIce);
      socket.off("webrtc_end_call", onCallEnd);
      leaveConsultation(appointmentId);
    };
  }, [appointmentId]);

  useEffect(() => {
    return () => {
      cleanupCall();
    };
  }, []);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/telehealth/appointments/${appointmentId}`);
      setAppointment(response.data.appointment);
      setHasConsent(response.data.appointment?.shareHealthData || false);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      alert("Failed to load appointment. Redirecting...");
      navigate("/telehealth/appointments");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionStatus = async () => {
    try {
      const response = await getSessionStatus(appointmentId);
      const nextStatus = response?.session?.status || "scheduled";
      setSessionStatus(nextStatus);
      if (["ended", "completed"].includes(nextStatus)) {
        setIsJoined(false);
      }
      const wasStarted = ["active", "ongoing"].includes(previousSessionStatusRef.current);
      const isStarted = ["active", "ongoing"].includes(nextStatus);
      if (!wasStarted && isStarted) {
        toast.success("Doctor has started the consultation. You can join now.");
      }
      previousSessionStatusRef.current = nextStatus;
    } catch (error) {
      setSessionStatus("scheduled");
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/telehealth/appointments/${appointmentId}/messages`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchHealthData = async () => {
    try {
      const response = await api.get(`/telehealth/health-data/recent`);
      setHealthData(response.data);
    } catch (error) {
      console.error("Error fetching health data:", error);
    }
  };

  const fetchIntake = async () => {
    try {
      const response = await api.get(`/telehealth/appointments/${appointmentId}/intake`);
      const existing = response?.data?.intake;
      if (existing) {
        setIntake({
          symptoms: existing.symptoms || "",
          duration: existing.duration || "",
          currentMedications: existing.currentMedications || "",
          notes: existing.notes || "",
        });
        setHasConsent(existing.consentToShareHealthData !== false);
        setIntakeSaved(true);
      }
    } catch (error) {
      // Intake is optional prior to first submission.
    }
  };

  const saveIntake = async () => {
    if (!intake.symptoms.trim()) {
      toast.error("Please add symptoms before submitting intake.");
      return;
    }
    try {
      setSavingIntake(true);
      await api.post(`/telehealth/appointments/${appointmentId}/intake`, intake);
      setIntakeSaved(true);
      toast.success("Consultation intake submitted.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to save intake.");
    } finally {
      setSavingIntake(false);
    }
  };

  const cleanupCall = () => {
    if (peerRef.current) {
      try {
        peerRef.current.destroy();
      } catch (error) {
        // ignore peer cleanup errors
      }
      peerRef.current = null;
    }
    if (localStream?.agora) {
      try {
        localStream.micTrack?.stop();
        localStream.micTrack?.close();
        localStream.camTrack?.stop();
        localStream.camTrack?.close();
      } catch (error) {
        // ignore cleanup issues
      }
    } else if (localStream?.getTracks) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (agoraClientRef.current) {
      try {
        agoraClientRef.current.leave();
      } catch (error) {
        // ignore cleanup issues
      }
      agoraClientRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setLocalStream(null);
    setCallDuration(0);
  };

  const startVideoCall = async () => {
    if (appointment?.consultationType !== "video") return;
    try {
      const agoraAppId = process.env.REACT_APP_AGORA_APP_ID;
      if (agoraAppId) {
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        agoraClientRef.current = client;

        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "video" && remoteVideoRef.current) {
            user.videoTrack.play(remoteVideoRef.current);
            setDoctorConnected(true);
          }
          if (mediaType === "audio") {
            user.audioTrack.play();
          }
        });

        client.on("user-unpublished", () => {
          setDoctorConnected(false);
        });

        await client.join(
          agoraAppId,
          `safeher-${appointmentId}`,
          process.env.REACT_APP_AGORA_TOKEN || null,
          currentUserId || null
        );

        const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        camTrack.play(localVideoRef.current);
        await client.publish([micTrack, camTrack]);
        setLocalStream({ agora: true, micTrack, camTrack });
        setPatientConnected(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const socket = getSocket();
      const appointmentPatientId = appointment?.user?._id || appointment?.user;
      const isInitiator = String(currentUserId) === String(appointmentPatientId);
      const peer = new Peer({
        initiator: isInitiator,
        trickle: false,
        stream,
      });

      peer.on("signal", (signalData) => {
        if (signalData.type === "offer") {
          sendWebRTCOffer(appointmentId, signalData);
        } else if (signalData.type === "answer") {
          sendWebRTCAnswer(appointmentId, signalData);
        } else {
          sendICECandidate(appointmentId, signalData);
        }
      });

      peer.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      peer.on("error", () => {
        toast.error("Video connection error.");
      });

      if (!socket?.connected) {
        toast.error("Socket not connected. Please refresh.");
      }

      peerRef.current = peer;
    } catch (error) {
      toast.error("Unable to access camera/microphone.");
    }
  };

  const toggleMute = () => {
    if (!localStream) return;
    if (localStream.agora) {
      localStream.micTrack?.setEnabled(isMuted);
    } else {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setIsMuted((prev) => !prev);
  };

  const toggleCamera = () => {
    if (!localStream) return;
    if (localStream.agora) {
      localStream.camTrack?.setEnabled(!cameraEnabled);
    } else {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setCameraEnabled((prev) => !prev);
  };

  const shareScreen = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast.error("Screen sharing is not supported.");
      return;
    }
    try {
      if (localStream?.agora && agoraClientRef.current) {
        const screenVideoTrack = await AgoraRTC.createScreenVideoTrack();
        await agoraClientRef.current.unpublish(localStream.camTrack);
        await agoraClientRef.current.publish(screenVideoTrack);
        screenVideoTrack.play(localVideoRef.current);
        screenVideoTrack.on("track-ended", async () => {
          await agoraClientRef.current.unpublish(screenVideoTrack);
          await agoraClientRef.current.publish(localStream.camTrack);
          localStream.camTrack.play(localVideoRef.current);
        });
        toast.success("Screen sharing started.");
        return;
      }
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = displayStream.getVideoTracks()[0];
      const sender = peerRef.current?._pc?.getSenders?.().find((s) => s.track && s.track.kind === "video");
      if (sender && screenTrack) {
        sender.replaceTrack(screenTrack);
        screenTrack.onended = async () => {
          const camTrack = localStream?.getVideoTracks()?.[0];
          if (camTrack) sender.replaceTrack(camTrack);
        };
      }
      toast.success("Screen sharing started.");
    } catch (error) {
      toast.error("Unable to share screen.");
    }
  };

  const handleEndCall = async () => {
    endCall(appointmentId);
    const appointmentDoctorUserId = appointment?.doctor?.user?._id || appointment?.doctor?.user;
    const isDoctorUser = String(currentUserId) === String(appointmentDoctorUserId);
    if (isDoctorUser) {
      try {
        await endConsultationSession(appointmentId);
      } catch (error) {
        // keep local call teardown even on API failure
      }
    }
    cleanupCall();
    setIsJoined(false);
    setDoctorConnected(false);
    setPatientConnected(false);
    toast("Call ended.");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !["active", "ongoing"].includes(sessionStatus) || !isJoined) return;
    const content = newMessage.trim();
    setNewMessage("");
    emitStopTyping(appointmentId);
    try {
      const socket = getSocket();
      if (socket?.connected) {
        sendChatMessage(appointmentId, content, "text");
      } else {
        await api.post(`/telehealth/appointments/${appointmentId}/messages`, {
          content,
          type: "text",
        });
        fetchMessages();
      }
    } catch (error) {
      toast.error("Failed to send message");
      setNewMessage(content);
    }
  };

  const handleJoinSession = async () => {
    try {
      setJoining(true);
      await joinSession(appointmentId);
      setIsJoined(true);
      if (appointment?.consultationType === "video") {
        await startVideoCall();
      }
      toast.success("Joined consultation");
    } catch (error) {
      toast.error(error?.message || "Unable to join consultation");
    } finally {
      setJoining(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !["active", "ongoing"].includes(sessionStatus) || !isJoined) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", file.type.startsWith("image/") ? "image" : "file");
    try {
      await api.post(`/telehealth/appointments/${appointmentId}/messages`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchMessages();
    } catch (error) {
      toast.error("Failed to upload file");
    }
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

  if (loading || !appointment) {
    return <div className="consultation-loading">Loading consultation...</div>;
  }

  return (
    <div className="consultation-page">
      <div className="video-call-container">
        <div className="video-placeholder">
          <video ref={remoteVideoRef} autoPlay playsInline className="remote-video-feed" />
          {!isJoined && (
            <div className="video-off">
              <FaUserMd className="video-placeholder-icon" />
              <p>{sessionStatus === "scheduled" ? "Waiting for Doctor" : "Join to start consultation"}</p>
              <p className="chat-subtitle">Session unlocks when doctor starts consultation.</p>
            </div>
          )}
        </div>
        <div className="video-placeholder local-feed">
          <video ref={localVideoRef} autoPlay muted playsInline className="local-video-feed" />
        </div>
        <div className="video-status-strip">
          <span>Doctor connected: {doctorConnected ? "Yes" : "No"}</span>
          <span>Patient connected: {patientConnected ? "Yes" : "No"}</span>
          <span>Call duration: {Math.floor(callDuration / 60)}:{String(callDuration % 60).padStart(2, "0")}</span>
        </div>
        <div className="video-controls-strip">
          <button type="button" onClick={toggleMute}>{isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />} {isMuted ? "Unmute" : "Mute"}</button>
          <button type="button" onClick={toggleCamera}>{cameraEnabled ? <FaVideo /> : <FaVideoSlash />} {cameraEnabled ? "Camera On" : "Camera Off"}</button>
          <button type="button" onClick={shareScreen}>Share Screen</button>
          <button type="button" className="end-call-btn" onClick={handleEndCall}><FaPhoneSlash /> End Call</button>
        </div>
      </div>

      {sessionStatus === "scheduled" && (
        <div className="consultation-intake-card">
          <h3>Consultation Intake Form</h3>
          <p>Share symptoms and context before consultation starts.</p>
          <div className="intake-grid">
            <textarea
              placeholder="Symptoms"
              value={intake.symptoms}
              onChange={(e) => setIntake((prev) => ({ ...prev, symptoms: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Duration (e.g., 3 days)"
              value={intake.duration}
              onChange={(e) => setIntake((prev) => ({ ...prev, duration: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Current medications"
              value={intake.currentMedications}
              onChange={(e) => setIntake((prev) => ({ ...prev, currentMedications: e.target.value }))}
            />
            <textarea
              placeholder="Additional notes"
              value={intake.notes}
              onChange={(e) => setIntake((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          <button type="button" className="btn-start-session" onClick={saveIntake} disabled={savingIntake}>
            {savingIntake ? "Saving..." : intakeSaved ? "Update Intake" : "Submit Intake"}
          </button>
        </div>
      )}

      {/* Main Content: Split Screen */}
      <div className="consultation-main">
        {/* Left Panel: Chat Window */}
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-info">
              <FaComment className="chat-icon" />
              <div>
                <h3>Secure Chat</h3>
                <p className="chat-subtitle">End-to-end encrypted</p>
              </div>
            </div>
            <FaLock className="lock-icon" />
          </div>

          {!isJoined && ["active", "ongoing"].includes(sessionStatus) && (
            <div className="no-consent">
              <p>Doctor started session. Click join to enable chat.</p>
              <button
                type="button"
                className="btn-start-session"
                onClick={handleJoinSession}
                disabled={joining}
              >
                {joining ? "Joining..." : "Join Session"}
              </button>
            </div>
          )}

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
                  className={`message ${msg.senderRole === "patient" ? "sent" : "received"}`}
                >
                  <div className="message-content">
                    {msg.type === "text" && (
                      <p>
                        <strong>{msg.senderRole === "patient" ? "You" : "Doctor"}:</strong> {msg.content}
                      </p>
                    )}
                    {msg.type === "image" && (
                      <div className="message-image-container">
                        <img
                          src={getImageUrl(msg.content)}
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
            {remoteTyping && <p className="chat-subtitle">Doctor is typing...</p>}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <button
              type="button"
              className="btn-attach"
              onClick={() => fileInputRef.current?.click()}
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
              onChange={(e) => {
                setNewMessage(e.target.value);
                if (e.target.value.trim()) emitTyping(appointmentId);
                else emitStopTyping(appointmentId);
              }}
              placeholder={
                ["active", "ongoing"].includes(sessionStatus) && isJoined
                  ? "Type a secure message..."
                  : "Chat is disabled until doctor starts and you join."
              }
              className="chat-input"
              disabled={!["active", "ongoing"].includes(sessionStatus) || !isJoined}
            />
            <button type="submit" className="btn-send" disabled={!["active", "ongoing"].includes(sessionStatus) || !isJoined}>
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

              {healthData.cycleLogs && healthData.cycleLogs.length > 0 && (
                <div className="health-section">
                  <h4>Recent Cycle Logs</h4>
                  {healthData.cycleLogs.slice(0, 3).map((cycle, idx) => (
                    <div key={idx} className="health-item">
                      <span>
                        <strong>Start:</strong> {new Date(cycle.startDate).toLocaleDateString()}
                      </span>
                      {cycle.cycleLength && (
                        <span>
                          <strong>Length:</strong> {cycle.cycleLength} days
                        </span>
                      )}
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
          <button
            type="button"
            className="btn-start-session"
            onClick={() => navigate("/telehealth/records")}
          >
            View Full Health Record
          </button>
        </div>
      </div>

      {/* Bottom: Status + Doctor Notes */}
      <div className="consultation-footer">
        <div className="session-info">
          <p className="chat-subtitle">
            {sessionStatus === "scheduled"
              ? "Waiting for doctor to start session..."
              : ["active", "ongoing"].includes(sessionStatus)
                ? isJoined
                  ? "Session active. Chat enabled."
                  : "Session active. Please join to chat."
                : "Consultation ended."}
          </p>
        </div>

        <div className="doctor-notes-section">
          <div className="notes-header">
            <FaNotesMedical className="notes-icon" />
            <h4>Doctor Notes</h4>
          </div>
          <div className="notes-content">
            {appointment.doctorNotes ? (
              <p className="notes-text">{appointment.doctorNotes}</p>
            ) : (
              <p className="notes-placeholder">No notes added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
